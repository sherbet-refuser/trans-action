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

        <h3>Links</h3>
        <ul>
          <li>
            Organization Bylaws:&nbsp;
            <a
              href="https://github.com/sherbet-refuser/trans-action/blob/main/docs/charter.md#transaction-redistribution-council-charter"
              target="_blank"
              rel="noopener noreferrer"
            >
              charter.md
            </a>
          </li>
          <li>
            Policies:&nbsp;
            <a
              href="https://github.com/sherbet-refuser/trans-action/blob/main/docs/agreements.md#collective-actions--agreements"
              target="_blank"
              rel="noopener noreferrer"
            >
              agreements.md
            </a>
          </li>
          <li>
            Website/Server Source Code:&nbsp;
            <a
              href="https://github.com/sherbet-refuser/trans-action"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Repo
            </a>
          </li>
        </ul>

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
  );
}

export default About;
