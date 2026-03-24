const transporter = require('../configs/nodemailer.config');

const sendEmail = async (to, subject, text, html, cc, bcc) => {
    try {
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to,
            subject,
            ...(text && { text }),
            ...(html && { html }),
            ...(cc && { cc }),
            ...(bcc && { bcc })
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.messageId);
    } catch (error) {
        console.error('Error sending email: ', error);
        const newError = new Error('Unable to send email!');
        newError.code = 500;
        throw newError;
    }
};

const saveMessage = async ({ name, email, subject, question }) => {
    const textContent = `📩 New Contact Form Submission

From: ${name} (${email})
Subject: ${subject}

Message:
${question}
`;

    const htmlContent = `
    <h2>📩 New Contact Message</h2>
    <p><strong>From:</strong> ${name} (${email})</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <p>${question}</p>
  `;

    sendEmail(
        process.env.RECEIVER_EMAIL || "support@example.com",
        `Contact Us: ${subject}`,
        textContent,
        htmlContent
    );

    return { success: true };
};

const sendOTPEmail = async (email, otp) => {
    const subject = "Your Email Verification OTP";
    const text = `Your OTP code is: ${otp}. It will expire in 5 minutes.`;
    const html = `
        <h2>Email Verification</h2>
        <p>Your OTP code is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 5 minutes.</p>
    `;

    await sendEmail(email, subject, text, html);
};



module.exports = { sendEmail, saveMessage, sendOTPEmail };