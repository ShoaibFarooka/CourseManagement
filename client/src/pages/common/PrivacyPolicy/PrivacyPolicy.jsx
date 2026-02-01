import React from "react";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
    return (
        <>
            <div className='privacy'>
                <div className='title'>Privacy Policy</div>
                <div className='sub-title'> Your privacy is important to us.</div>
            </div>

            <div className="privacy-policy">
                <h1>Privacy Policy</h1>
                <p>
                    Your privacy is important to us. This Privacy Policy explains how we
                    collect, use, disclose, and safeguard your information when you use our
                    services.
                </p>

                <h2>1. Information We Collect</h2>
                <p>
                    We may collect personal information such as your name, email address,
                    and usage data when you interact with our website or services.
                </p>

                <h2>2. How We Use Your Information</h2>
                <p>
                    We use the collected data to provide and improve our services,
                    communicate with you, and ensure a better user experience.
                </p>

                <h2>3. Sharing Your Information</h2>
                <p>
                    We do not sell or rent your personal information to third parties. We
                    may share data only with trusted partners to help deliver our services.
                </p>

                <h2>4. Security</h2>
                <p>
                    We take reasonable steps to protect your information, but please note
                    that no method of transmission over the Internet is completely secure.
                </p>

                <h2>5. Changes to This Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. Any changes will be
                    posted on this page with an updated date.
                </p>

                <h2>6. Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy, please contact us
                    at <a href="mailto:eproexamprep@gmail.com" target='blank'>support@example.com</a>.
                </p>
            </div>
        </>
    );
};

export default PrivacyPolicy;
