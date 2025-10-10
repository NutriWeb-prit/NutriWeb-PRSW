const RecuperacaoSenhaModel = require('../models/recuperarSenhaModel');
const EmailService = require('../util/email');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

class RecuperacaoSenhaController {
    
    static gerarToken(email) {
        return jwt.sign(
            { email: email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    }
    
    static validarToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return { valido: true, email: decoded.email };
        } catch (error) {
            return { valido: false, email: null };
        }
    }
    
    static exibirPaginaRecuperacao(req, res) {
        res.render('pages/indexEsqueciSenha', {
            listaErros: null,
            valores: { email: '' },
            headerUsuario: req.session.logado || { estaLogado: false }
        });
    }
    
    static async solicitarRecuperacao(req, res) {
        const erros = validationResult(req);
        
        if (!erros.isEmpty()) {
            return res.render('pages/indexEsqueciSenha', {
                listaErros: erros,
                valores: req.body,
                headerUsuario: req.session.logado || { estaLogado: false }
            });
        }
        
        try {
            const { email } = req.body;
            const usuario = await RecuperacaoSenhaModel.buscarUsuarioPorEmail(email);
            
            if (usuario) {
                const token = RecuperacaoSenhaController.gerarToken(email);
                await EmailService.enviarEmailRecuperacao(
                    usuario.Email,
                    usuario.NomeCompleto,
                    token
                );
            }
            
            // Redireciona com mensagem de sucesso via query param
            return res.redirect('/senha?sucesso=email_enviado');
            
        } catch (error) {
            console.error('Erro na recuperação:', error);
            return res.redirect('/senha?erro=erro_envio');
        }
    }
    
    // GET - Página de redefinição
    static async exibirPaginaRedefinicao(req, res) {
        const { token } = req.query;
        
        if (!token) {
            return res.redirect('/senha?erro=token_ausente');
        }
        
        const { valido, email } = RecuperacaoSenhaController.validarToken(token);
        
        if (!valido) {
            return res.render('pages/indexRedefinirSenha', {
                tokenValido: false,
                token: null,
                listaErros: null,
                valores: {},
                headerUsuario: req.session.logado || { estaLogado: false }
            });
        }
        
        return res.render('pages/indexRedefinirSenha', {
            tokenValido: true,
            token: token,
            email: email,
            listaErros: null,
            valores: {},
            headerUsuario: req.session.logado || { estaLogado: false }
        });
    }
    
    // POST - Redefinir senha
    static async redefinirSenha(req, res) {
        const erros = validationResult(req);
        const { token } = req.body;
        
        if (!erros.isEmpty()) {
            return res.render('pages/indexRedefinirSenha', {
                tokenValido: true,
                token: token,
                listaErros: erros,
                valores: req.body,
                headerUsuario: req.session.logado || { estaLogado: false }
            });
        }
        
        try {
            const { valido, email } = RecuperacaoSenhaController.validarToken(token);
            
            if (!valido) {
                return res.redirect('/redefinir-senha?token=' + token + '&erro=token_invalido');
            }
            
            const { senha } = req.body;
            await RecuperacaoSenhaModel.atualizarSenha(email, senha);
            
            return res.redirect('/login?sucesso=senha_alterada');
            
        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            return res.redirect('/redefinir-senha?token=' + token + '&erro=erro_redefinir');
        }
    }
}

module.exports = RecuperacaoSenhaController;