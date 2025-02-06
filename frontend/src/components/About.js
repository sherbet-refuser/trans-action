import React from 'react';

function About() {
    return (
        <div className="about-container">
            <h2>about</h2>
            <div className="about-content">
                <p>The Seattle TransAction Fund is a mutual aid platform where trans people in Seattle can request and contribute monetary aid.</p>

                <p>This organization isn't a registered nonprofit yet. Contributions are not tax-deductible.</p>

                <h3>Links</h3>
                <ul>
                    <li>
                        Organization Charter (Proposed):
                        <a href="https://github.com/sherbet-refuser/trans-action/blob/main/docs/charter.md">charter.md</a>
                    </li>
                    <li>
                        Anti-Money Laundering Policies (Proposed):
                        <a href="https://github.com/sherbet-refuser/trans-action/blob/main/docs/aml.md">aml.md</a>
                    </li>
                    <li>
                        Website/Server Source Code:
                        <a href="https://github.com/sherbet-refuser/trans-action">GitHub Repo</a>
                    </li>
                </ul>

                <h3>Contact</h3>
                <ul>
                    <li>Website Admin: <a href="mailto:sherbet-refuser0j@icloud.com">sherbet-refuser0j@icloud.com</a></li>
                </ul>
            </div>
        </div>
    );
}

export default About;
