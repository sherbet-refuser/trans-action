const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config');
const { AidRequest } = require('./db');

// Global regex for extracting Request ID
const REQUEST_ID_REGEX = /(\*\*Request ID:\*\*\s*)(.*?)(?=\n|$)/;

const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});
discordClient.login(config.discord.botToken);

async function verifyDiscordPermissions(channel) {
  if (channel && channel.isTextBased && channel.isTextBased()) {
    const permissions = channel.permissionsFor(discordClient.user);
    const requiredPermissions = [
      'SendMessages',
      'CreatePublicThreads',
      'CreatePrivateThreads',
      'SendMessagesInThreads',
    ];
    requiredPermissions.forEach((perm) => {
      if (!permissions.has(perm)) {
        console.error(
          `Missing required Discord permission: ${perm} on channel ${channel.name}`
        );
      }
    });
    console.log(`Permissions verified for channel: ${channel.name}`);
  }
}

function buildMessageContent(request) {
  let nextActionMsg;
  switch (request.state) {
    case 'Submitted':
      nextActionMsg = 'React with 👀 to start vetting this request.';
      break;
    case 'Vetting':
      nextActionMsg =
        'Leave a comment documenting the vetting steps taken, then react with ✅ to verify this request, or ❌ to mark it as failed verification.';
      break;
    case 'In Review':
      nextActionMsg = `React with ${config.discord.majorityVote} 👍 to approve this request, or ${config.discord.majorityVote} 👎 to reject it.`;
      break;
    case 'Approved':
      nextActionMsg = 'React with 💵 to mark this request as paid.';
      break;
    default:
      nextActionMsg = 'None';
  }
  return `
**Name:** ${request.name}
**Trans or Nonbinary:** ${request.isTrans}
**Pronouns:** ${request.pronouns}
**Amount Requested:** $${request.amountRequested}
**Category:** ${request.category}
**Description:** ${request.description}
**Neighborhood:** ${request.neighborhood}
**Social Media:** ${request.socialMedia || ''}
**Contact Method:** ${request.contactMethod}
**Contact Info:** ${request.contactInfo}
**Receive Method:** ${request.receiveMethod}
**Receive Details:** ${request.receiveDetails || ''}
**References:** ${request.references || ''}

**Request ID:** ${request.id}
**IP Address:** ${request.ip}
**Approximate Location:** ${request.location || ''}
**Timestamp:** ${new Date(request.requestReceivedAt).toLocaleString()}

**State**: ${request.state}
**Next Step**: ${nextActionMsg}
`;
}

async function updateState(message) {
  const idMatch = message.content.match(REQUEST_ID_REGEX);
  if (!idMatch) {
    console.error('Request ID not found in message.');
    return;
  }
  const requestId = idMatch[2].trim();

  // Load corresponding AidRequest record from the database
  let requestRecord;
  try {
    requestRecord = await AidRequest.findOne({ where: { id: requestId } });
    if (!requestRecord) {
      console.error(`AidRequest record not found for Request ID ${requestId}`);
      return;
    }
  } catch (err) {
    console.error('Error loading AidRequest record:', err);
    return;
  }

  // Determine next state based on reaction counts
  const count = (emoji) => message.reactions.cache.get(emoji)?.count || 0;
  const vettingCond = count('👀') >= 1;
  const failedVerificationCond = count('❌') >= 1;
  const inReviewCond = count('✅') >= 1;
  const rejectedCond = count('👎') >= config.discord.majorityVote;
  const approvedCond = count('👍') >= config.discord.majorityVote;
  const paidCond = count('💵') >= 1;
  const refreshCond = count('📝') >= 1;

  let newState;
  if (!vettingCond) {
    newState = 'Submitted';
  } else if (!failedVerificationCond && !inReviewCond) {
    newState = 'Vetting';
  } else if (failedVerificationCond) {
    newState = 'Failed Verification';
  } else if (!rejectedCond && !approvedCond) {
    newState = 'In Review';
  } else if (rejectedCond) {
    newState = 'Rejected';
  } else if (!paidCond) {
    newState = 'Approved';
  } else {
    newState = 'Paid';
  }

  // Exit if state hasn't changed
  const oldState = requestRecord.state;
  if (!refreshCond && newState === oldState) return;

  // Update the record with the new state
  try {
    requestRecord.state = newState;
    await requestRecord.save();
    console.log(
      `Updated AidRequest record for Request ID ${requestId} to state ${newState}`
    );
  } catch (err) {
    console.error('Failed to update AidRequest record:', err);
    return;
  }

  // Re-render the message using our helper
  const newContent = buildMessageContent(requestRecord);
  try {
    await message.edit(newContent);
    console.log(`Message content updated for Request ID ${requestId}`);
    if (oldState == "Verified" && newState === 'Approved') {
      await message.channel.send(
        `<@&${config.discord.treasurerRoleId}> please process this request for payment.`
      );
    }
  } catch (err) {
    console.error('Failed to update message content:', err);
  }
}

async function sendDiscordAidRequest(request) {
  try {
    const channel = await discordClient.channels.fetch(
      config.discord.aidRequestChannelId
    );
    if (channel && channel.isTextBased && channel.isTextBased()) {
      const thread = await channel.threads.create({
        name: `Aid Request from ${request.name} for ${request.category}`,
        autoArchiveDuration: 10080,
        reason: 'New aid request received',
      });
      const sentMsg = await thread.send(buildMessageContent(request));
      attachCollector(sentMsg, thread.name);
    }
  } catch (err) {
    console.error('Error creating Discord thread:', err);
  }
}

function attachCollector(message, threadName) {
  const filter = (reaction, user) =>
    ['👀', '✅', '❌', '👍', '👎', '💵', '📝'].includes(reaction.emoji.name);
  // Enable dispose to capture reaction removals
  const collector = message.createReactionCollector({ filter, dispose: true });

  collector.on('collect', (reaction, user) => {
    const emoji = reaction.emoji.name;
    const current = reaction.count;
    console.log(
      `Collected ${emoji} (count: ${current}) from ${user.tag} in thread '${threadName}'`
    );

    updateState(message);
  });

  collector.on('dispose', (reaction, user) => {
    const emoji = reaction.emoji.name;
    const current = reaction.count;
    console.log(
      `Removed ${emoji} (count: ${current}) from ${user.tag} in thread '${threadName}'`
    );
    updateState(message);
  });

  collector.on('end', (collected) => {
    console.log(
      `Collector for thread '${threadName}' ended with ${collected.size} events.`
    );
  });
}

async function reattachCollectors(channel) {
  let reattachedCount = 0;
  try {
    const threadsData = await channel.threads.fetchActive();
    console.log(`Found ${threadsData.threads.size} active threads.`);
    for (const thread of threadsData.threads.values()) {
      let messages = await thread.messages.fetch();
      console.log(`Found ${messages.size} messages in thread '${thread.name}'`);
      messages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
      const firstMessage = messages.first();
      if (firstMessage.author.id === discordClient.user.id) {
        const match = firstMessage.content.match(REQUEST_ID_REGEX);
        if (match) {
          const requestId = match[2].trim();
          console.log(`Attaching collector to thread '${thread.name}' with request id ${requestId}`);
          attachCollector(firstMessage, thread.name);
          reattachedCount++;
        } else {
          console.error(`Request ID not found in message for thread '${thread.name}'`);
        }
      }
    }
    console.log(`Reattached collectors for ${reattachedCount} threads.`);
  } catch (err) {
    console.error('Error reattaching collectors:', err);
  }
}

discordClient.once('ready', async () => {
  console.log(`Discord bot logged in as ${discordClient.user.tag}`);
  try {
    const channel = await discordClient.channels.fetch(
      config.discord.aidRequestChannelId
    );
    await verifyDiscordPermissions(channel);
    await reattachCollectors(channel);
  } catch (err) {
    console.error('Error during startup:', err);
  }
});

module.exports = { sendDiscordAidRequest };
