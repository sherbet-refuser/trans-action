import React from 'react';

function About() {
  return (
    <div className="about-container">
      <h2>about</h2>
      <div className="about-content">
        <p>
          The Seattle TransAction Fund is a mutual aid platform where trans
          people in Seattle can request and contribute monetary aid.
        </p>

        <p>
          This organization isn't a registered nonprofit yet. Contributions are
          not tax-deductible.
        </p>

        <div className="team-section">
          <h3>Team</h3>
          <ul className="team-list">
            <li className="team-member">
              <img src="/kay-160.jpeg" alt="selfie of kay with blue hair smiling while riding the bus" />
              <div className="info">
                <strong>kay</strong> they/them
                <p>say hi the next time you see me skateboarding around downtown or cap hill!</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="links">
          <h3>Links</h3>
          <ul>
            <li>
              <a
                href="https://github.com/sherbet-refuser/trans-action/blob/main/docs/agreements.md#collective-actions--agreements"
                target="_blank"
                rel="noopener noreferrer"
              >
                Policies
              </a>
            </li>
            <li>
              <a
                href="https://github.com/sherbet-refuser/trans-action/blob/main/docs/charter.md#transaction-redistribution-council-charter"
                target="_blank"
                rel="noopener noreferrer"
              >
                Organization Charter
              </a>
            </li>
            <li>
              <a
                href="https://github.com/sherbet-refuser/trans-action"
                target="_blank"
                rel="noopener noreferrer"
              >
                Website/Server Source Code
              </a>
            </li>
          </ul>
        </div>

        <div className="contacts">
          <h3>Contact</h3>
          <ul>
            <li>
              Website Admin:&nbsp;
              <a
                href="mailto:sherbet-refuser0j@icloud.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                sherbet-refuser0j@icloud.com
              </a>
            </li>
            <li>
              Discord Support Channel:&nbsp;
              <a
                href="https://discord.gg/Pm3XEhfYsC"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://discord.gg/Pm3XEhfYsC
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default About;
