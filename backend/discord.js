const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config');
const { AidRequest } = require('./db');

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

function updateState(message) {
  const stateRegex = /(\*\*State\*\*:\s*)(.*?)(?=\n|$)/;
  const currentStateMatch = message.content.match(stateRegex);
  const currentState = currentStateMatch ? currentStateMatch[2] : 'Submitted';

  const count = (emoji) => message.reactions.cache.get(emoji)?.count || 0;

  const majorityVote = config.discord.majorityVote;
  let newState, nextActionMsg;
  if (count('👀') < 1) {
    newState = 'Submitted';
    nextActionMsg = 'React with 👀 to start vetting this request.';
  } else if (count('✅') < 1 && count('❌') < 1) {
    newState = 'Vetting';
    nextActionMsg =
      'React with ✅ to verify this request, or ❌ to mark it as failed verification.';
  } else if (count('❌') >= 1) {
    newState = 'Failed Verification';
    nextActionMsg = '';
  } else if (
    count('✅') >= 1 &&
    count('👍') < majorityVote &&
    count('👎') < majorityVote
  ) {
    newState = 'In Review';
    nextActionMsg = `React with ${majorityVote} 👍 to approve this request, or ${majorityVote} 👎 to reject it.`;
  } else if (count('👎') >= majorityVote) {
    newState = 'Rejected';
    nextActionMsg = '';
  } else if (count('👍') >= majorityVote && count('💵') < 1) {
    newState = 'Approved';
    nextActionMsg = 'React with 💵 to mark this request as paid.';
  } else {
    newState = 'Paid';
    nextActionMsg = '';
  }

  if (newState !== currentState) {
    console.log(`Updating message state from ${currentState} to ${newState}`);
    const nextStepRegex = /(\*\*Next Step\*\*:\s*)(.*?)(?=\n|$)/;
    const newContent = message.content
      .replace(stateRegex, `**State**: ${newState}`)
      .replace(nextStepRegex, `**Next Step**: ${nextActionMsg || 'None'}`);
    message
      .edit(newContent)
      .then(() => {
        console.log(
          `Updated message state from ${currentState} to ${newState}`
        );
        // If state is "Approved", reply to the thread, pinging the @treasurer role.
        if (newState === 'Approved') {
          message.channel.send(
            `<@&${config.discord.treasurerRoleId}> please process this request for payment.`
          );
        }
      })
      .catch((err) => console.error('Failed to update message state:', err));

    // Parse the Request ID and update the corresponding AidRequest record
    const idRegex = /(\*\*Request ID:\*\*\s*)(.*?)(?=\n|$)/;
    const idMatch = message.content.match(idRegex);
    if (idMatch) {
      const requestId = idMatch[2].trim();
      AidRequest.update({ state: newState }, { where: { id: requestId } })
        .then(() =>
          console.log(
            `AidRequest record updated for Request ID ${requestId} to state ${newState}`
          )
        )
        .catch((err) =>
          console.error('Failed to update AidRequest record:', err)
        );
    }
  }
}

function attachCollector(message, threadName) {
  const filter = (reaction, user) =>
    ['👀', '✅', '❌', '👍', '👎', '💵'].includes(reaction.emoji.name);
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
      console.log(`Checking thread: ${thread.name}`);
      let messages = await thread.messages.fetch();
      for (const message of messages.values()) {
        attachCollector(message, thread.name);
        reattachedCount++;
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

async function sendDiscordAidRequest(details) {
  try {
    const channel = await discordClient.channels.fetch(
      config.discord.aidRequestChannelId
    );
    if (channel && channel.isTextBased && channel.isTextBased()) {
      const {
        id,
        name,
        isTrans,
        pronouns,
        amountRequested,
        category,
        description,
        neighborhood,
        socialMedia,
        contactMethod,
        contactInfo,
        receiveMethod,
        userIP,
        requestReceivedAt,
      } = details;
      const thread = await channel.threads.create({
        name: `Aid Request from ${name} for ${category}`,
        autoArchiveDuration: 10080, // 7 days in minutes
        reason: 'New aid request received',
      });
      const sentMsg = await thread.send(`
**Name:** ${name}
**Is Trans:** ${isTrans}
**Pronouns:** ${pronouns}
**Amount Requested:** $${amountRequested}
**Category:** ${category}
**Description:** ${description}
**Neighborhood:** ${neighborhood}
**Social Media:** ${socialMedia}
**Contact Method:** ${contactMethod}
**Contact Info:** ${contactInfo}
**Receive Method:** ${receiveMethod}

**Request ID:** ${id}
**IP Address:** ${userIP}
**Request Received:** ${requestReceivedAt.toLocaleString()}

**State**: Submitted
**Next Step**: React with 👀 to start vetting this request.
`);
      // Attach reaction collector for the new message.
      attachCollector(sentMsg, thread.name);
    }
  } catch (err) {
    console.error('Error creating Discord thread:', err);
  }
}

module.exports = { sendDiscordAidRequest };
