const { validationResult } = require("express-validator");
const NWModel = require("../models/NWModel"); 
const bcrypt = require("bcryptjs");

const processarLogin = async (req, res, next) => {
    const erros = validationResult(req);
    
    if (!erros.isEmpty()) {
        return next();
    }

    try {
        console.log("Tentativa de login para:", req.body.email);
        
        // Busca o usuário no banco
        const usuarios = await NWModel.findByEmail(req.body.email);
        
        if (!usuarios || usuarios.length === 0) {
            console.log("Usuário não encontrado:", req.body.email);
            req.loginError = "Email não encontrado em nossa base de dados";
            return next();
        }

        const usuario = usuarios[0];
        
        console.log("Usuário encontrado:", {
            id: usuario.id,
            nome: usuario.NomeCompleto,
            email: usuario.Email,
            tipo: usuario.UsuarioTipo,
            temSenha: !!usuario.Senha
        });

        // Verificar se a senha existe
        if (!usuario.Senha) {
            console.log("ERRO: Usuário sem senha no banco!");
            req.loginError = "Conta com problemas de configuração. Contate o administrador";
            return next();
        }

        // Verificar a senha
        const senhaCorreta = bcrypt.compareSync(req.body.senha, usuario.Senha);
        
        if (!senhaCorreta) {
            console.log("Senha incorreta para:", req.body.email);
            req.loginError = "Senha incorreta. Verifique e tente novamente";
            return next();
        }

        console.log("Login bem-sucedido para:", req.body.email);

        // Buscar dados completos para a sessão
        const dadosCompletos = await NWModel.findClienteCompleto(usuario.id);
        const usuarioCompleto = dadosCompletos && dadosCompletos.length > 0 ? dadosCompletos[0] : usuario;

        // Criar sessão
        req.session.usuario = {
            id: usuario.id,
            nome: usuario.NomeCompleto,
            email: usuario.Email,
            tipo: usuario.UsuarioTipo,
            tipoDescricao: usuario.TipoDescricao || (usuario.UsuarioTipo === 'C' ? 'Cliente' : 'Nutricionista'),
            documento: usuario.ClienteCPF || usuario.NutricionistaCRN,
            fotoPerfil: usuarioCompleto.FotoPerfil ? 
                `data:image/jpeg;base64,${usuarioCompleto.FotoPerfil.toString('base64')}` : null,
            logado: true,
            dataLogin: new Date()
        };

        req.loginSucesso = true;
        next();

    } catch (erro) {
        console.error("Erro no processamento do login:", erro);
        req.loginError = "Erro interno do servidor. Tente novamente em alguns instantes";
        next();
    }
};

const verificarUsuAutenticado = (req, res, next) => {
    if (req.session.usuario && req.session.usuario.logado) {
        res.locals.usuarioLogado = req.session.usuario;
        res.locals.isCliente = req.session.usuario.tipo === 'C';
        res.locals.isNutricionista = req.session.usuario.tipo === 'N';
    } else {
        res.locals.usuarioLogado = null;
        res.locals.isCliente = false;
        res.locals.isNutricionista = false;
    }
    next();
};


const verificarPermissao = (tiposPermitidos = [], paginaRedirecionamento = "/login") => {
    return (req, res, next) => {
        if (!req.session.usuario || !req.session.usuario.logado) {
            return res.redirect(paginaRedirecionamento + "?erro=acesso_negado");
        }

        if (tiposPermitidos.length > 0 && !tiposPermitidos.includes(req.session.usuario.tipo)) {
            return res.redirect(paginaRedirecionamento + "?erro=sem_permissao");
        }

        next();
    };
};

const logout = (req, res, next) => {
    const nomeUsuario = req.session.usuario?.nome || 'Usuário';
    
    req.session.destroy((err) => {
        if (err) {
            console.error("Erro ao fazer logout:", err);
            return res.redirect("/?erro=logout");
        }
        
        console.log(`Logout realizado para: ${nomeUsuario}`);
        res.redirect("/login?logout=sucesso");
    });
};

module.exports = {
    processarLogin,
    verificarUsuAutenticado,
    verificarPermissao,
    logout
};