const nodemailer = require('nodemailer');

let transporter;

// Google Workspace SMTP — credenziali da .env
transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL su porta 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

// Verifica connessione all'avvio
transporter.verify((error) => {
    if (error) {
        console.error('Errore configurazione email:', error.message);
    } else {
        console.log('Server email pronto — webapp@neunoi.it');
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: '"Biblioteca Neu [nòi]" <webapp@neunoi.it>',
            to,
            subject,
            html,
        });

        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

module.exports = { sendEmail };
