const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

transporter.verify(function(error, success) {
    if (error) {
        console.log('Erro na configuração do email:', error);
    } else {
        console.log('Servidor de email pronto');
    }
});

module.exports = transporter;