const transporter = require("../../config/nodemailer");

class EmailService {
    
    static async enviarEmailRecuperacao(destinatario, nomeUsuario, token) {
        try {
            const linkRecuperacao = `${process.env.BASE_URL}/redefinir-senha?token=${token}`;
            
            const mailOptions = {
                from: `"NutriWeb - Recuperação de Senha" <${process.env.EMAIL_USER}>`,
                to: destinatario,
                subject: 'Recuperação de Senha - NutriWeb',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                     padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                            .header h1 { color: white; margin: 0; }
                            .content { background: #f9f9f9; padding: 30px; }
                            .button { display: inline-block; background: #667eea; color: white !important; 
                                     padding: 15px 30px; text-decoration: none; border-radius: 5px; 
                                     margin: 20px 0; font-weight: bold; }
                            .warning { background: #fff3cd; border-left: 4px solid #ffc107; 
                                      padding: 15px; margin: 20px 0; }
                            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>NutriWeb</h1>
                            </div>
                            <div class="content">
                                <h2>Olá, ${nomeUsuario}!</h2>
                                <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
                                
                                <center>
                                    <a href="${linkRecuperacao}" class="button">
                                        Redefinir Minha Senha
                                    </a>
                                </center>
                                
                                <div class="warning">
                                    <strong>⚠️ Importante:</strong>
                                    <ul>
                                        <li>Este link expira em <strong>1 hora</strong></li>
                                        <li>Se você não solicitou, ignore este email</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="footer">
                                <p>&copy; 2024 NutriWeb. Todos os direitos reservados.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
                text: `Recuperação de Senha - NutriWeb\n\nOlá, ${nomeUsuario}!\n\nAcesse: ${linkRecuperacao}\n\n⚠️ Expira em 1 hora.`
            };

            const info = await transporter.sendMail(mailOptions);
            return { success: true, messageId: info.messageId };
            
        } catch (error) {
            console.error('Erro ao enviar email:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = EmailService;