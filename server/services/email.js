const nodemailer = require('nodemailer');

let transporter;

const createTransporter = async () => {
    if (transporter) return transporter;

    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    const testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    console.log('Ethereal Email Configured:', testAccount.user);
    return transporter;
};

const sendEmail = async (to, subject, html) => {
    try {
        const mailTransport = await createTransporter();
        const info = await mailTransport.sendMail({
            from: '"Biblioteca Neunoi" <noreply@neunoi.it>',
            to,
            subject,
            html,
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

module.exports = { sendEmail };
