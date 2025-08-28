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

        if (!usuario.Senha) {
            console.log("ERRO: Usuário sem senha no banco!");
            req.loginError = "Conta com problemas de configuração. Contate o administrador";
            return next();
        }

        const senhaCorreta = bcrypt.compareSync(req.body.senha, usuario.Senha);
        
        if (!senhaCorreta) {
            console.log("Senha incorreta para:", req.body.email);
            req.loginError = "Senha incorreta. Verifique e tente novamente";
            return next();
        }

        console.log("Login bem-sucedido para:", req.body.email);

        req.session.usuario = {
            id: usuario.id,
            nome: usuario.NomeCompleto,
            email: usuario.Email,
            tipo: usuario.UsuarioTipo,
            tipoDescricao: usuario.TipoDescricao || (usuario.UsuarioTipo === 'C' ? 'Cliente' : 'Nutricionista'),
            documento: usuario.ClienteCPF || usuario.NutricionistaCRN,
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
        
        const timestamp = Date.now();
        
        res.locals.headerUsuario = {
            id: req.session.usuario.id,
            nome: req.session.usuario.nome,
            tipo: req.session.usuario.tipo,
            estaLogado: true,
            urlPerfil: req.session.usuario.tipo === 'C' ? '/perfilcliente' : '/indexPerfilNutri',
            fotoPerfil: `/imagem/perfil/${req.session.usuario.id}?t=${timestamp}`,
            fotoBanner: `/imagem/banner/${req.session.usuario.id}?t=${timestamp}`
        };
        
        console.log("Usuário autenticado:", {
            id: req.session.usuario.id,
            nome: req.session.usuario.nome,
            tipo: req.session.usuario.tipo
        });
        
    } else {
        res.locals.usuarioLogado = null;
        res.locals.isCliente = false;
        res.locals.isNutricionista = false;
        
        res.locals.headerUsuario = {
            estaLogado: false
        };
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
        res.redirect("/login?login=logout");
    });
};

module.exports = {
    processarLogin,
    verificarUsuAutenticado,
    verificarPermissao,
    logout
};