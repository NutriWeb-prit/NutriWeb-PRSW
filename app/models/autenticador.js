const { validationResult } = require("express-validator");
const NWModel = require("../models/NWModel");
const pagamentoModel = require("../models/pagamentoModel");
const bcrypt = require("bcryptjs");

const cacheUsuarios = new Map();

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

        cacheUsuarios.delete(usuario.id);

        req.loginSucesso = true;
        next();

    } catch (erro) {
        console.error("Erro no processamento do login:", erro);
        req.loginError = "Erro interno do servidor. Tente novamente em alguns instantes";
        next();
    }
};

const verificarUsuAutenticado = async (req, res, next) => {
    if (req.session.usuario && req.session.usuario.logado) {
        res.locals.usuarioLogado = req.session.usuario;
        res.locals.isCliente = req.session.usuario.tipo === 'C';
        res.locals.isNutricionista = req.session.usuario.tipo === 'N';
        
        const usuarioId = req.session.usuario.id;
        let dadosCompletos = null;
        let premiumInfo = { temPremium: false }; // ADICIONAR

        // Verificar cache
        if (cacheUsuarios.has(usuarioId)) {
            const cached = cacheUsuarios.get(usuarioId);
            
            if (Date.now() - cached.timestamp < 10000) {
                dadosCompletos = cached.dados;
                premiumInfo = cached.premiumInfo || { temPremium: false }; // ADICIONAR
            } else {
                cacheUsuarios.delete(usuarioId);
            }
        }

        if (!dadosCompletos) {
            try {
                if (req.session.usuario.tipo === 'N') {
                    const perfilNutri = await NWModel.findPerfilNutri(usuarioId);
                    if (perfilNutri.nutricionista) {
                        dadosCompletos = {
                            nome: perfilNutri.nutricionista.NomeCompleto,
                            email: perfilNutri.nutricionista.Email,
                            telefone: perfilNutri.nutricionista.Telefone ? perfilNutri.nutricionista.Telefone.slice(-9) : '',
                            ddd: perfilNutri.nutricionista.Telefone ? perfilNutri.nutricionista.Telefone.slice(0, 2) : '',
                            crn: perfilNutri.nutricionista.Crn || '',
                            sobreMim: perfilNutri.nutricionista.SobreMim || '',
                            area: perfilNutri.nutricionista.Especializacoes ? 
                                   perfilNutri.nutricionista.Especializacoes.split(', ') : [],
                            senha: ''
                        };
                        
                        // VERIFICAR PREMIUM - NOVO CÓDIGO
                        const nutricionistaId = perfilNutri.nutricionista.NutricionistaId;
                        premiumInfo = await pagamentoModel.verificarPremiumAtivo(nutricionistaId);
                    }
                } else if (req.session.usuario.tipo === 'C') {
                    const perfilCliente = await NWModel.findPerfilCompleto(usuarioId);
                    if (perfilCliente.cliente) {
                        dadosCompletos = {
                            nome: perfilCliente.cliente.NomeCompleto,
                            email: perfilCliente.cliente.Email,
                            telefone: perfilCliente.cliente.Telefone ? perfilCliente.cliente.Telefone.slice(-9) : '',
                            ddd: perfilCliente.cliente.Telefone ? perfilCliente.cliente.Telefone.slice(0, 2) : '',
                            sobreMim: perfilCliente.cliente.SobreMim || '',
                            senha: ''
                        };
                    }
                }

                // Salvar no cache COM informação de Premium
                cacheUsuarios.set(usuarioId, {
                    dados: dadosCompletos,
                    premiumInfo: premiumInfo, // ADICIONAR
                    timestamp: Date.now()
                });

            } catch (erro) {
                console.error("Erro ao carregar dados completos:", erro.message);
            }
        }
        
        const timestamp = cacheUsuarios.has(usuarioId) 
            ? cacheUsuarios.get(usuarioId).timestamp 
            : Date.now();

        res.locals.headerUsuario = {
            id: req.session.usuario.id,
            nome: req.session.usuario.nome,
            tipo: req.session.usuario.tipo,
            estaLogado: true,
            urlPerfil: req.session.usuario.tipo === 'C' ? '/perfilcliente' : '/indexPerfilNutri',
            fotoPerfil: `/imagem/perfil/${req.session.usuario.id}?t=${timestamp}`,
            fotoBanner: `/imagem/banner/${req.session.usuario.id}?t=${timestamp}`,
            dadosCompletos: dadosCompletos,
            premium: premiumInfo // ADICIONAR ESTA LINHA
        };
        
        if (!cacheUsuarios.has(usuarioId) || 
            (Date.now() - cacheUsuarios.get(usuarioId).timestamp) > 10000) {
            console.log("Usuário autenticado (banco):", {
                id: req.session.usuario.id,
                nome: req.session.usuario.nome,
                tipo: req.session.usuario.tipo,
                premium: premiumInfo.temPremium // ADICIONAR
            });
        }
        
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
    
    if (req.session.usuario?.id) {
        cacheUsuarios.delete(req.session.usuario.id);
    }
    
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