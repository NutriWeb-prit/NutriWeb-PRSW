const NWModel = require("../models/NWModel");
const pagamentoModel = require("../models/pagamentoModel")
const {body, validationResult} = require("express-validator");

const bcrypt = require('bcryptjs');

const NWController = {

    // validação login
    validacaoLogin: [
        body("email")
            .isEmail()
            .withMessage("Insira um email válido no formato: exemplo@dominio.com"),
        body("senha")
            .isLength({min: 5})
            .withMessage("A senha deve conter pelo menos 5 caracteres")
    ],

    // validação cadastro cliente
    validacaoCadCliente: [
        body("nome").isLength({min:2}).withMessage("O nome deve conter 2 ou mais caracteres!"),
        
        body("email")
            .isEmail().withMessage("Insira um Email válido!")
            .custom(async (email) => {
                try {
                    const emailExiste = await NWModel.verificarEmailExistente(email);
                    if (emailExiste) {
                        throw new Error('Este email já está cadastrado!');
                    }
                    return true;
                } catch (error) {
                    if (error.message === 'Este email já está cadastrado!') {
                        throw error;
                    }
                    console.error('Erro na validação de email:', error.message);
                    return true;
                }
            }),
        
        body("cpf")
            .custom(async (cpf) => {
                const cpfLimpo = cpf.replace(/\D/g, '');
                
                if (cpfLimpo.length !== 11) {
                    throw new Error('O CPF deve conter exatamente 11 dígitos!');
                }
                
                function validarCPF(cpf) {
                    if (/^(\d)\1{10}$/.test(cpf)) return false;
                    
                    let soma = 0;
                    for (let i = 0; i < 9; i++) {
                        soma += parseInt(cpf.charAt(i)) * (10 - i);
                    }
                    let resto = soma % 11;
                    let digito1 = resto < 2 ? 0 : 11 - resto;
                    
                    if (parseInt(cpf.charAt(9)) !== digito1) return false;
                    
                    soma = 0;
                    for (let i = 0; i < 10; i++) {
                        soma += parseInt(cpf.charAt(i)) * (11 - i);
                    }
                    resto = soma % 11;
                    let digito2 = resto < 2 ? 0 : 11 - resto;
                    
                    return parseInt(cpf.charAt(10)) === digito2;
                }
                
                if (!validarCPF(cpfLimpo)) {
                    throw new Error('CPF inválido!');
                }
                
                try {
                    const cpfExiste = await NWModel.verificarCPFExistente(cpfLimpo);
                    if (cpfExiste) {
                        throw new Error('Este CPF já está cadastrado!');
                    }
                    return true;
                } catch (error) {
                    if (error.message === 'Este CPF já está cadastrado!') {
                        throw error;
                    }
                    console.error('Erro na validação de CPF:', error.message);
                    return true;
                }
            }),
    
        body("senha")
            .isLength({min:5}).withMessage("Insira uma senha válida!")
            .matches(/[A-Z]/).withMessage("Insira uma senha válida!")
            .matches(/[a-z]/).withMessage("Insira uma senha válida!")
            .matches(/\d/).withMessage("Insira uma senha válida!")
            .matches(/[\W_]/).withMessage("Insira uma senha válida!"),

        body("ddd").isLength({min:2}).withMessage("Insira um DDD válido!"),
        
        body("telefone")
            .isMobilePhone().withMessage("Insira um número de telefone válido!")
            .custom(async (telefone, { req }) => {
                try {
                    const ddd = req.body.ddd;
                    const telefoneExiste = await NWModel.verificarTelefoneExistente(ddd, telefone);
                    if (telefoneExiste) {
                        throw new Error('Este telefone já está cadastrado!');
                    }
                    return true;
                } catch (error) {
                    if (error.message === 'Este telefone já está cadastrado!') {
                        throw error;
                    }
                    console.error('Erro na validação de telefone:', error.message);
                    return true;
                }
            })
    ],
    
    validacaoCadNutri1: [
        body("nome").isLength({min:2}).withMessage("O nome deve conter 2 ou mais caracteres!"),
        body("telefone").isMobilePhone().withMessage("Insira um número de telefone válido!"),
        body("ddd").isLength({min:2}).withMessage("Insira um DDD válido!"),

        body("email")
            .isEmail().withMessage("Insira um Email válido!")
            .custom(async (email) => {
                try {
                    const emailExiste = await NWModel.verificarEmailExistente(email);
                    if (emailExiste) {
                        throw new Error('Este email já está cadastrado!');
                    }
                    return true;
                } catch (error) {
                    if (error.message === 'Este email já está cadastrado!') {
                        throw error;
                    }
                    console.error('Erro na validação de email:', error.message);
                    return true;
                }
            }),
        
        body("telefone").custom(async (telefone, { req }) => {
            try {
                const ddd = req.body.ddd;
                const telefoneExiste = await NWModel.verificarTelefoneExistente(ddd, telefone);
                if (telefoneExiste) {
                    throw new Error('Este telefone já está cadastrado!');
                }
                return true;
            } catch (error) {
                if (error.message === 'Este telefone já está cadastrado!') {
                    throw error;
                }
                console.error('Erro na validação de telefone:', error.message);
                return true;
            }
        }),
        
        body("senha")
            .isLength({min:5}).withMessage("Insira uma senha válida!")
            .matches(/[A-Z]/).withMessage("Insira uma senha válida!")
            .matches(/[a-z]/).withMessage("Insira uma senha válida!")
            .matches(/\d/).withMessage("Insira uma senha válida!")
            .matches(/[\W_]/).withMessage("Insira uma senha válida!"),
        
        body("area")
            .custom((value) => {
                if (!value) return false;
                if (Array.isArray(value)) {
                    return value.length >= 1;
                }
                return typeof value === "string" && value.length > 0;
            })
            .withMessage("Selecione no mínimo uma especialização!"),
        
        body("crn")
            .isLength({min:5}).withMessage("Insira um CRN válido!")
            .custom(async (crn) => {
                try {
                    const crnExiste = await NWModel.verificarCrnExistente(crn);
                    if (crnExiste) {
                        throw new Error('Este CRN já está cadastrado!');
                    }
                    return true;
                } catch (error) {
                    if (error.message === 'Este CRN já está cadastrado!') {
                        throw error;
                    }
                    console.error('Erro na validação de CRN:', error.message);
                    return true;
                }
            })
    ],

    validacaoAtualizarDados: [
        body("nome").isLength({min:2}).withMessage("O nome deve conter 2 ou mais caracteres!"),
        body("telefone").isMobilePhone().withMessage("Insira um número de telefone válido!"),
        body("ddd").isLength({min:2}).withMessage("Insira um DDD válido!"),
        body("email").isEmail().withMessage("Insira um Email válido!"),
        body("senha")
            .optional({ checkFalsy: true })
            .isLength({min:5}).withMessage("Insira uma senha válida!")
            .matches(/[A-Z]/).withMessage("Insira uma senha válida!")
            .matches(/[a-z]/).withMessage("Insira uma senha válida!")
            .matches(/\d/).withMessage("Insira uma senha válida!")
            .matches(/[\W_]/).withMessage("Insira uma senha válida!"),
        body("area")
            .if((value, { req }) => req.session.usuario && req.session.usuario.tipo === 'N')
            .custom((value) => {
                if (!value) return false;
                if (Array.isArray(value)) {
                    return value.length >= 1;
                }
                return typeof value === "string" && value.length > 0;
            })
            .withMessage("Selecione no mínimo uma especialização!"),
        body("crn")
            .if((value, { req }) => req.session.usuario && req.session.usuario.tipo === 'N')
            .isLength({min:5}).withMessage("Insira um CRN válido!"),
        
        body("email").custom(async (email, { req }) => {
            try {
                const usuarioId = req.session.usuario.id;
                const tipoUsuario = req.session.usuario.tipo;
                const telefoneCompleto = req.body.ddd + req.body.telefone;
                
                const dadosParaVerificar = {
                    email: email,
                    telefone: telefoneCompleto
                };
                
                if (tipoUsuario === 'N') {
                    dadosParaVerificar.crn = req.body.crn;
                }
                
                const conflitos = await NWModel.verificarDadosExistentesParaAtualizacao(dadosParaVerificar, usuarioId);
                
                req.conflitosValidacao = conflitos;
                
                if (conflitos.email) {
                    throw new Error('Este email já está cadastrado!');
                }
                
                return true;
            } catch (error) {
                if (error.message === 'Este email já está cadastrado!') {
                    throw error;
                }
                console.error('Erro na validação de dados:', error.message);
                return true;
            }
        }),
        
        body("telefone").custom(async (telefone, { req }) => {
            try {
                if (req.conflitosValidacao && req.conflitosValidacao.telefone) {
                    throw new Error('Este telefone já está cadastrado!');
                }
                return true;
            } catch (error) {
                if (error.message === 'Este telefone já está cadastrado!') {
                    throw error;
                }
                return true;
            }
        }),
        
        body("crn").custom(async (crn, { req }) => {
            try {
                if (req.session.usuario && req.session.usuario.tipo === 'N') {
                    if (req.conflitosValidacao && req.conflitosValidacao.crn) {
                        throw new Error('Este CRN já está cadastrado!');
                    }
                }
                return true;
            } catch (error) {
                if (error.message === 'Este CRN já está cadastrado!') {
                    throw error;
                }
                return true;
            }
        })
    ],

    validacaoPublicacao: [
        body("legenda")
            .optional()
            .isLength({max: 1000})
            .withMessage("A legenda deve ter no máximo 1000 caracteres"),
        body("categoria")
            .isIn(['Dica', 'Receita'])
            .withMessage("Categoria inválida. Escolha entre 'Dica' ou 'Receita'")
    ],

    /* --------------------------------------- BUSCA ------------------------------------ */

    buscar: async (req, res) => {
        try {
            const termo = req.query.q;
            
            console.log('=== BUSCA EXECUTADA ===');
            console.log('Termo recebido:', termo);
            
            if (!termo) {
                console.log('Sem termo - renderizando página inicial');
                return res.render('pages/indexBusca', {
                    resultados: null,
                    termo: '',
                    headerUsuario: req.session.usuario || { estaLogado: false }
                });
            }
    
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('pages/indexBusca', {
                    resultados: null,
                    termo: termo,
                    erro: 'Termo de busca muito curto',
                    headerUsuario: req.session.usuario || { estaLogado: false }
                });
            }
            
            console.log('Com termo - executando busca...');
            const resultados = await NWModel.buscarConteudo(termo);
            console.log('Resultados encontrados:', {
                publicacoes: resultados.publicacoes?.length || 0,
                nutricionistas: resultados.nutricionistas?.length || 0
            });
            
            const publicacoesProcessadas = await Promise.all(
                (resultados.publicacoes || []).map(async (pub) => {
                    const premiumInfo = await pagamentoModel.verificarPremiumAtivo(pub.autor.nutricionistaId || pub.autor.id);
                    
                    return {
                        ...pub,
                        autor: {
                            ...pub.autor,
                            premium: premiumInfo
                        }
                    };
                })
            );
            
            const nutricionistasProcessados = await Promise.all(
                (resultados.nutricionistas || []).map(async (nut) => {
                    const premiumInfo = await pagamentoModel.verificarPremiumAtivo(nut.nutricionistaId);
                    
                    return {
                        ...nut,
                        premium: premiumInfo
                    };
                })
            );
            
            console.log('Dados Premium processados:', {
                publicacoesComPremium: publicacoesProcessadas.filter(p => p.autor.premium.temPremium).length,
                nutricionistasComPremium: nutricionistasProcessados.filter(n => n.premium.temPremium).length
            });
    
            const dadosParaView = {
                publicacoes: publicacoesProcessadas,
                nutricionistas: nutricionistasProcessados,
                totalResultados: publicacoesProcessadas.length + nutricionistasProcessados.length
            };
    
            res.render('pages/indexBusca', {
                resultados: dadosParaView,
                termo: termo,
                headerUsuario: req.session.usuario || { estaLogado: false }
            });
    
        } catch (error) {
            console.error('Erro na busca:', error);
            res.render('pages/indexBusca', {
                resultados: null,
                termo: req.query.q || '',
                erro: 'Erro interno do servidor',
                headerUsuario: req.session.usuario || { estaLogado: false }
            });
        }
    },

    /* --------------------------------------- UPDATE ------------------------------------ */

    atualizarDadosPessoais: async (req, res) => {
        if (!req.session.usuario || !req.session.usuario.id || !req.session.usuario.tipo) {
            return res.redirect('/login');
        }
    
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('pages/indexConfig', {
                    tipoUsuario: req.session.usuario.tipo,
                    valores: req.body,
                    msgErro: {},
                    erroValidacao: {},
                    listaErros: errors
                });
            }
    
            const usuarioId = req.session.usuario.id;
            const tipoUsuario = req.session.usuario.tipo;
    
            const dadosAtuais = await NWModel.buscarDadosParaComparacao(usuarioId, tipoUsuario);
            
            if (!dadosAtuais) {
                return res.redirect('/config?erro=usuario_nao_encontrado');
            }
    
            const telefoneCompleto = req.body.ddd + req.body.telefone;
            const especializacoesFormulario = req.body.area ? 
                (Array.isArray(req.body.area) ? req.body.area : [req.body.area]).filter(especialidade => 
                    especialidade && especialidade.trim() !== '' && especialidade !== 'on'
                ) : [];
    
            const mudancas = verificarMudancas(dadosAtuais, req.body, telefoneCompleto, especializacoesFormulario, tipoUsuario);
            
            if (!mudancas.houveAlteracao) {
                console.log("Nenhuma alteração detectada - ignorando atualização");
                return res.redirect('/config?erro=nenhum_dado_alterado');
            }
    
            console.log("Alterações detectadas:", mudancas.alteracoes);
    
            let senhaHash = null;
            if (req.body.senha && req.body.senha.trim() !== '') {
                senhaHash = await bcrypt.hash(req.body.senha, 12);
            }
    
            const dadosUsuario = {
                NomeCompleto: req.body.nome,
                Email: req.body.email,
                Telefone: telefoneCompleto
            };
    
            if (senhaHash) {
                dadosUsuario.Senha = senhaHash;
            }
    
            let dadosEspecificos = {};
            let dadosPerfil = {
                SobreMim: req.body.sobreMim || null
            };
    
            if (tipoUsuario === 'N') {
                dadosEspecificos = {
                    Crn: req.body.crn
                };
            }
    
            const dadosAtualizados = await NWModel.atualizarEBuscarDados(
                usuarioId,
                dadosUsuario,
                dadosEspecificos,
                dadosPerfil,
                especializacoesFormulario,
                tipoUsuario
            );
    
            console.log("Dados atualizados com sucesso - ID:", usuarioId);
            
            req.session.usuario.nome = req.body.nome;
            req.session.usuario.email = req.body.email;
            
            if (tipoUsuario === 'N' && req.body.crn) {
                req.session.usuario.documento = req.body.crn;
            }
    
            return res.redirect('/config?sucesso=dados_atualizados');
    
        } catch (error) {
            console.error("Erro na atualização dos dados:", error.message);
            return res.redirect('/config?erro');
        }
    },

    atualizarImagens: async (req, res) => {
        try {
            if (!req.session.usuario || !req.session.usuario.logado) {
                console.log('ERRO: Usuário não autenticado');
                return res.status(401).json({ 
                    success: false, 
                    message: 'Usuário não autenticado' 
                });
            }
    
            const usuarioId = req.session.usuario.id;
            console.log('Usuario ID:', usuarioId);
    
            const validarImagem = (arquivo, tipo) => {
                console.log(`Validando ${tipo}:`, arquivo ? 'arquivo presente' : 'arquivo ausente');
                if (!arquivo) return null;
                
                console.log(`${tipo} - Caminho:`, arquivo.path);
                console.log(`${tipo} - Tamanho:`, arquivo.size, 'bytes');
                console.log(`${tipo} - Tipo:`, arquivo.mimetype);
                
                if (arquivo.size > 5 * 1024 * 1024) {
                    throw new Error(`${tipo} muito grande. Máximo permitido: 5MB`);
                }
                
                const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!tiposPermitidos.includes(arquivo.mimetype)) {
                    throw new Error(`Formato de ${tipo} não suportado. Use: JPEG, PNG, GIF ou WEBP`);
                }
                
                const caminhoRelativo = arquivo.path
                    .replace(/\\/g, '/') 
                    .split('public/')[1];
                
                console.log(`${tipo} será salvo em: ${caminhoRelativo}`);
                return caminhoRelativo;
            };
    
            const fotoPerfil = validarImagem(
                req.files && req.files['fotoPerfil'] ? req.files['fotoPerfil'][0] : null,
                'foto de perfil'
            );
            
            const fotoBanner = validarImagem(
                req.files && req.files['fotoBanner'] ? req.files['fotoBanner'][0] : null,
                'banner'
            );
    
            if (!fotoPerfil && !fotoBanner) {
                console.log('ERRO: Nenhuma imagem foi enviada');
                return res.redirect('/config?erro=nenhuma_imagem');
            }
    
            const resultado = await NWModel.atualizarImagensUsuario(usuarioId, fotoPerfil, fotoBanner);
    
            if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
                return res.json({
                    success: true,
                    message: 'Imagens atualizadas com sucesso!',
                    data: resultado
                });
            }
    
            return res.redirect('/config?sucesso=imagens_atualizadas');
    
        } catch (error) {
            console.error('Erro ao atualizar imagens:', error);
            return res.redirect('/config?erro=' + encodeURIComponent(
                error.message.includes('muito grande') || error.message.includes('não suportado')
                    ? error.message
                    : 'Erro interno do servidor. Tente novamente.'
            ));
        }
    },

    /* ---------------------------------- PUBLICAÇÕES ------------------------------------ */

    criarPublicacao: async (req, res) => {
        try {
            if (!req.session.usuario || req.session.usuario.tipo !== 'N') {
                return res.redirect('/login?erro=apenas_nutricionistas_publicacao');
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('Erros de validação:', errors.array());
                return res.redirect('/perfilnutri?erro=dados_invalidos');
            }

            if (!req.file) {
                return res.redirect('/perfilnutri?erro=imagem_obrigatoria');
            }

            const imagemValidada = validarImagemPublicacao(req.file);

            const usuarioId = req.session.usuario.id;
            
            const nutricionistaId = await NWModel.findNutricionistaIdByUsuarioId(usuarioId);
            
            if (!nutricionistaId) {
                return res.redirect('/perfilnutri?erro=nutricionista_nao_encontrado');
            }

            const dadosPublicacao = {
                CaminhoFoto: imagemValidada,
                Legenda: req.body.legenda || null,
                Categoria: req.body.categoria,
                UsuarioId: usuarioId
            };

            const resultado = await NWModel.criarPublicacao(dadosPublicacao, nutricionistaId);

            console.log('Publicação criada com sucesso - ID:', resultado.publicacaoId);

            return res.redirect('/perfilnutri?sucesso=publicacao_criada');

        } catch (error) {
            console.error('Erro ao criar publicação:', error.message);
            
            if (error.message.includes('muito grande') || error.message.includes('não suportado')) {
                return res.redirect('/perfilnutri?erro=imagem_invalida');
            }
            
            return res.redirect('/perfilnutri?erro=erro_criar_publicacao');
        }
    },

    buscarPublicacao: async (req, res) => {
        try {
            const publicacaoId = req.params.id;

            const publicacao = await NWModel.buscarPublicacaoPorId(publicacaoId);

            if (!publicacao) {
                return res.status(404).json({
                    success: false,
                    message: 'Publicação não encontrada'
                });
            }

            return res.status(200).json({
                success: true,
                publicacao: publicacao
            });

        } catch (error) {
            console.error('Erro ao buscar publicação:', error.message);
            
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor. Tente novamente.'
            });
        }
    },

    /* --------------------------------------- MÉTODOS ------------------------------------ */

    processarLogin: (req, res) => {
        const erros = validationResult(req);
        
        if (!erros.isEmpty()) {
            console.log("Erros de validação no login:", erros.array());
            return res.render("pages/indexLogin", {
                retorno: null, 
                valores: { email: req.body.email, senha: "" },
                listaErros: erros
            });
        }
    
        if (req.loginError) {
            console.log("Erro no login:", req.loginError);
            
            const erroPersonalizado = {
                errors: []
            };
            
            if (req.loginError.includes("Email") || req.loginError.includes("não encontrado")) {
                erroPersonalizado.errors.push({
                    path: "email",
                    msg: req.loginError
                });
            } else if (req.loginError.includes("senha") || req.loginError.includes("incorretos")) {
                erroPersonalizado.errors.push({
                    path: "senha", 
                    msg: req.loginError
                });
            } else {
                erroPersonalizado.errors.push({
                    path: "email",
                    msg: req.loginError
                });
                erroPersonalizado.errors.push({
                    path: "senha",
                    msg: req.loginError
                });
            }
            
            return res.render("pages/indexLogin", {
                retorno: null,
                valores: { email: req.body.email, senha: "" },
                listaErros: erroPersonalizado
            });
        }
    
        if (req.loginSucesso) {
            console.log("Login bem-sucedido, redirecionando...");
            
            if (req.session.usuario.tipo === 'C') {
                return res.redirect("/perfilcliente?login=sucesso");
            } else if (req.session.usuario.tipo === 'N') {
                return res.redirect("/perfilnutri?login=sucesso");
            } else {
                return res.redirect("/?login=sucesso");
            }
        }
    
        console.log("Estado inesperado no processamento do login");
        const erroInesperado = {
            errors: [
                {
                    path: "email",
                    msg: "Erro inesperado. Tente novamente."
                },
                {
                    path: "senha",
                    msg: "Erro inesperado. Tente novamente."
                }
            ]
        };
        
        return res.render("pages/indexLogin", {
            retorno: null,
            valores: { email: req.body.email, senha: "" },
            listaErros: erroInesperado
        });
    },

    mostrarLogin: (req, res) => {
        if (req.session.usuario && req.session.usuario.logado) {
            console.log(`Usuário ${req.session.usuario.nome} já está logado, redirecionando...`);
            
            if (req.session.usuario.tipo === 'C') {
                return res.redirect('/perfilcliente');
            } else if (req.session.usuario.tipo === 'N') {
                return res.redirect('/perfilnutri');
            } else {
                return res.redirect('/');
            }
        }
    
        let retorno = null;
        
        if (req.query.cadastro === "sucesso") {
            retorno = { tipo: "sucesso", mensagem: "Cadastro realizado com sucesso! Faça seu login." };
        } else if (req.query.logout === "sucesso") {
            retorno = { tipo: "sucesso", mensagem: "Logout realizado com sucesso!" };
        } else if (req.query.erro === "acesso_negado") {
            retorno = { tipo: "erro", mensagem: "Você precisa fazer login para acessar esta página." };
        } else if (req.query.erro === "sem_permissao") {
            retorno = { tipo: "erro", mensagem: "Você não tem permissão para acessar esta página." };
        }
    
        res.render('pages/indexLogin', { 
            retorno: retorno, 
            valores: { email: "", senha: "" }, 
            listaErros: null
        });
    },

    mostrarHome: async (req, res) => {
        try {
            console.log("Buscando publicações do banco...");
            
            const publicacoes = await NWModel.buscarPublicacoes();
            
            const publicacoesProcessadas = await Promise.all(
                publicacoes.map(async (pub) => {
                    const legenda = pub.Legenda || 'Sem legenda disponível';
                    
                    const premiumInfo = await pagamentoModel.verificarPremiumAtivo(pub.NutricionistaId);
                    
                    console.log('Processando publicação:', {
                        id: pub.PublicacaoId,
                        nutricionistaId: pub.NutricionistaId,
                        temPremium: premiumInfo.temPremium,
                        legenda: legenda.substring(0, 50) + '...'
                    });
                    
                    // Usar caminho direto da foto igual à busca
                    const fotoPerfil = pub.FotoPerfil || 'imagens/foto_perfil.jpg';
                    
                    return {
                        id: pub.PublicacaoId || pub.id,
                        nutricionistaId: pub.NutricionistaId,
                        usuarioId: pub.UsuarioId,
                        nome: pub.NomeCompleto,
                        profissao: pub.Especializacoes || 'Nutrição',
                        imgPerfil: fotoPerfil,
                        imgConteudo: pub.CaminhoFoto || 'imagens/placeholder-post.jpg',
                        legenda: legenda,
                        categoria: pub.Categoria || 'Nutrição',
                        mediaEstrelas: pub.MediaEstrelas || 5,
                        dataPublicacao: pub.DataPublicacao || pub.DataCriacao || new Date().toISOString(),
                        premium: premiumInfo
                    };
                })
            );
            
            console.log(`${publicacoesProcessadas.length} publicações carregadas com informações de Premium`);
            
            return res.render('pages/indexHome', {
                publicacoes: publicacoesProcessadas,
                headerUsuario: res.locals.headerUsuario,
                totalPublicacoes: publicacoesProcessadas.length
            });
            
        } catch (error) {
            console.error("Erro ao carregar home:", error.message);
            
            return res.render('pages/indexHome', {
                publicacoes: [],
                headerUsuario: res.locals.headerUsuario || { estaLogado: false },
                erro: 'Erro ao carregar publicações'
            });
        }
    },

    mostrarPerfilCliente: async (req, res) => {
        try {
            if (!req.session.usuario || req.session.usuario.tipo !== 'C') {
                return res.redirect('/login?erro=acesso_negado');
            }
            
            const usuarioId = req.session.usuario.id;
            console.log("Carregando perfil do cliente ID:", usuarioId);
            let isOwner = false;

            const usuarioLogado = req.session.usuario && req.session.usuario.logado;

            if (usuarioLogado && req.session.usuario.tipo === 'C' && req.session.usuario.id === usuarioId) {
                isOwner = true;
                console.log("É o dono do perfil");
            }
            
            const dadosCompletos = await NWModel.findPerfilCompleto(usuarioId);
            
            if (!dadosCompletos.cliente) {
                console.log("Cliente não encontrado");
                return res.render("pages/indexPerfilCliente", {
                    erro: "Dados do cliente não encontrados",
                    cliente: null,
                    publicacoesCurtidas: []
                });
            }
            
            const { cliente, publicacoes } = dadosCompletos;
            
            const dadosProcessados = {
                id: cliente.id,
                nome: cliente.NomeCompleto,
                email: cliente.Email,
                telefone: cliente.Telefone ? 
                    `(${cliente.Telefone.substring(0,2)}) ${cliente.Telefone.substring(2,7)}-${cliente.Telefone.substring(7)}` : 
                    null,
                cpf: cliente.CPF,
                cep: cliente.CEP,
                dataNascimento: cliente.DataNascimento,
                objetivos: cliente.SobreMim || "Ainda não definiu seus objetivos nutricionais.",
                interesses: cliente.InteressesNutricionais || "Nenhum interesse cadastrado",
                
                fotoPerfil: cliente.FotoPerfil ? `/imagem/perfil/${usuarioId}` : 'imagens/foto_perfil.jpg',
                fotoBanner: cliente.FotoBanner ? `/imagem/banner/${usuarioId}` : null,
                
                publicacoes: publicacoes.map(pub => ({
                    id: pub.PublicacaoId,
                    imagem: pub.FotoPublicacao ? `/imagem/publicacao/${pub.PublicacaoId}` : 'imagens/placeholder-post.jpg',
                    legenda: pub.Legenda,
                    categoria: pub.Categoria,
                    estrelas: pub.MediaEstrelas,
                    dataCurtida: pub.DataCurtida
                }))
            };
            
            console.log("Dados processados para o cliente:", {
                nome: dadosProcessados.nome,
                email: dadosProcessados.email,
                quantidadePublicacoes: dadosProcessados.publicacoes.length,
                temFotoPerfil: !!cliente.FotoPerfil,
                temObjetivos: !!cliente.SobreMim
            });
            
            return res.render("pages/indexPerfilCliente", {
                erro: null,
                cliente: dadosProcessados,
                publicacoesCurtidas: dadosProcessados.publicacoes,
                isOwner: isOwner
            });
            
        } catch (erro) {
            console.error("Erro ao carregar perfil do cliente:", erro);
            return res.render("pages/indexPerfilCliente", {
                erro: "Erro interno. Tente novamente mais tarde.",
                cliente: null,
                publicacoesCurtidas: []
            });
        }
    },

    mostrarPerfilNutricionista: async (req, res) => {
        try {
            let usuarioId = null;
            let nutricionistaId = null;
            let isOwner = false;
            
            const usuarioLogado = req.session.usuario && req.session.usuario.logado;
            
            if (req.query.id) {
                nutricionistaId = parseInt(req.query.id);
                
                if (isNaN(nutricionistaId) || nutricionistaId < 1) {
                    return res.redirect('/?erro=nutricionista_nao_encontrado');
                }
                
                usuarioId = await NWModel.findUsuarioIdByNutricionistaId(nutricionistaId);
                
                if (!usuarioId) {
                    return res.redirect('/?erro=nutricionista_nao_encontrado');
                }
                
                isOwner = false;
                
                if (usuarioLogado && req.session.usuario.tipo === 'N' && req.session.usuario.id === usuarioId) {
                    isOwner = true;
                    console.log("✅ É o dono do perfil");
                }
            } 
            else {
                if (!usuarioLogado || req.session.usuario.tipo !== 'N') {
                    return res.redirect('/login?erro=acesso_negado');
                }
                
                usuarioId = req.session.usuario.id;
                isOwner = true;
                
                nutricionistaId = await NWModel.findNutricionistaIdByUsuarioId(usuarioId);
                
                if (!nutricionistaId) {
                    return res.redirect('/?erro=nutricionista_nao_encontrado');
                }
            }
            
            const dadosBasicos = await NWModel.findPerfilNutri(usuarioId);
            
            if (!dadosBasicos || !dadosBasicos.nutricionista || !dadosBasicos.nutricionista.id) {
                return res.redirect('/?erro=nutricionista_sem_dados');
            }
            
            const { nutricionista, formacoes, contatosSociais } = dadosBasicos;
    
            const premiumInfo = await pagamentoModel.verificarPremiumAtivo(nutricionistaId);
            console.log("🌟 Status Premium:", premiumInfo);
    
            let publicacoes = [];
            try {
                const publicacoesRaw = await NWModel.findPublicacoesNutricionista(nutricionistaId);
                
                publicacoes = publicacoesRaw.map(pub => ({
                    id: pub.PublicacaoId,
                    legenda: pub.Legenda || '',
                    categoria: pub.Categoria,
                    mediaEstrelas: pub.MediaEstrelas || 0,
                    dataCriacao: pub.DataCriacao,
                    imgConteudo: pub.CaminhoFoto,
                    nome: pub.NomeCompleto,
                    nutricionistaId: pub.NutricionistaId,
                    // CORRIGIDO: Usar caminho direto
                    imgPerfil: pub.FotoPerfil || 'imagens/foto_perfil.jpg',
                    profissao: pub.Especializacoes || 'Geral'
                }));
                
                console.log(`✅ ${publicacoes.length} publicações carregadas`);
            } catch (erroPublicacoes) {
                console.error("⚠️ Erro ao carregar publicações:", erroPublicacoes);
            }
    
            const dadosProcessados = {
                id: nutricionista.NutricionistaId,
                usuarioId: nutricionista.id,
                nome: nutricionista.NomeCompleto,
                email: nutricionista.Email,
                telefone: nutricionista.Telefone ? 
                    `(${nutricionista.Telefone.substring(0,2)}) ${nutricionista.Telefone.substring(2,7)}-${nutricionista.Telefone.substring(7)}` :
                    null,
                crn: nutricionista.Crn,
                sobreMim: nutricionista.SobreMim || "Este nutricionista ainda não adicionou uma descrição.",
                especializacoes: nutricionista.Especializacoes || "Nenhuma especialização cadastrada",
                
                // CORRIGIDO: Usar caminhos diretos
                fotoPerfil: nutricionista.FotoPerfil || 'imagens/foto_perfil.jpg',
                fotoBanner: nutricionista.FotoBanner || 'imagens/bannerperfilnutri.png',
                
                // Adiciona informações de Premium
                premium: premiumInfo
            };
            
            const formacoesProcessadas = formacoes.map(formacao => ({
                id: formacao.id,
                tipo: formacao.TipoFormacao,
                nome: formacao.NomeFormacao,
                instituicao: formacao.NomeInstituicao,
                temCertificado: !!formacao.CertificadoArquivo,
                urlCertificado: formacao.CertificadoArquivo ? `/certificado/${formacao.id}` : null
            }));
            
            const contatosProcessados = contatosSociais.reduce((acc, contato) => {
                acc[contato.Tipo.toLowerCase()] = contato.Link;
                return acc;
            }, {});
            
            console.log("✅ Dados completos do perfil:", {
                nutricionistaId: dadosProcessados.id,
                usuarioId: dadosProcessados.usuarioId,
                nome: dadosProcessados.nome,
                isOwner: isOwner,
                quantidadePublicacoes: publicacoes.length,
                temFotoPerfil: !!nutricionista.FotoPerfil,
                temFotoBanner: !!nutricionista.FotoBanner,
                temPremium: premiumInfo.temPremium,
                fotoPerfil: dadosProcessados.fotoPerfil,
                fotoBanner: dadosProcessados.fotoBanner
            });
            
            return res.render("pages/indexPerfilNutri", {
                erro: null,
                nutricionista: dadosProcessados,
                formacoes: formacoesProcessadas,
                contatosSociais: contatosProcessados,
                isOwner: isOwner,
                publicacoes: publicacoes,
                usuarioLogado: usuarioLogado
            });
            
        } catch (erro) {
            console.error("❌ Erro ao carregar perfil do nutricionista:", erro);
            return res.redirect('/?erro=erro_interno');
        }
    },

    redirecionarParaMeuPerfil: async (req, res) => {
        try {
            if (!req.session.usuario || !req.session.usuario.logado || req.session.usuario.tipo !== 'N') {
                return res.redirect('/login?erro=acesso_negado');
            }
            
            const usuarioId = req.session.usuario.id;
            
            const nutricionistaId = await NWModel.findNutricionistaIdByUsuarioId(usuarioId);
            
            if (!nutricionistaId) {
                return res.redirect('/?erro=perfil_nao_encontrado');
            }
            
            return res.redirect(`/perfilnutri?id=${nutricionistaId}`);
            
        } catch (erro) {
            return res.redirect('/?erro=erro_interno');
        }
    },

    cadastrarCliente: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('pages/indexCadastroCliente', {
                    etapa: "2",
                    cardSucesso: true,
                    valores: req.body,
                    listaErros: errors
                });
            }
    
            const imagensValidadas = validarImagensUpload(req.files);
            
            const cpfLimpo = req.body.cpf ? req.body.cpf.replace(/\D/g, '') : '';
            if (!cpfLimpo) {
                throw new Error('CPF é obrigatório!');
            }
    
            const senhaHash = await bcrypt.hash(req.body.senha, 12);
            
            const dadosUsuario = {
                NomeCompleto: req.body.nome,
                Email: req.body.email,
                Senha: senhaHash,
                Telefone: req.body.ddd + req.body.telefone,
                UsuarioTipo: 'C'
            };
    
            let interessesSelecionados = [];
            if (req.body.area) {
                interessesSelecionados = Array.isArray(req.body.area) ? req.body.area : [req.body.area];
                interessesSelecionados = interessesSelecionados.filter(interesse =>
                    interesse && interesse.trim() !== '' && interesse !== 'on'
                );
            }
    
            const resultado = await NWModel.createCliente(
                dadosUsuario, 
                cpfLimpo, 
                imagensValidadas.imagemPerfil,
                imagensValidadas.imagemBanner,
                interessesSelecionados
            );
    
            console.log('Cliente cadastrado com sucesso - ID:', resultado.usuarioId);
            return res.redirect('/login?login=cadastro_realizado');
    
        } catch (error) {
            console.error('Erro no cadastro do cliente:', error.message);
            
            return res.render('pages/indexCadastroCliente', {
                etapa: "2",
                cardSucesso: true,
                valores: req.body,
                listaErros: {
                    errors: [{
                        msg: error.message.includes('muito grande') || error.message.includes('não suportado')
                            ? error.message
                            : 'Erro interno do servidor. Tente novamente.'
                    }]
                }
            });
        }
    },
    
    cadastrarNutricionista: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('pages/indexCadastrarNutri', {
                    etapa: "4", 
                    card1: "hidden", 
                    card2: "hidden", 
                    card3: "hidden", 
                    card4: "",
                    valores: req.body, 
                    listaErros: errors
                });
            }
    
            const arquivosValidados = validarArquivosNutricionista(req);
            
            const senhaHash = await bcrypt.hash(req.body.senha, 12);
    
            const dadosUsuario = {
                NomeCompleto: req.body.nome,
                Email: req.body.email,
                Senha: senhaHash,
                Telefone: req.body.ddd + req.body.telefone,
                UsuarioTipo: 'N'
            };
    
            const dadosNutricionista = {
                Crn: req.body.crn,
                RazaoSocial: req.body.razaoSocial || req.body.nome,
                SobreMim: req.body.sobreMim
            };
    
            const formacao = {
                graduacao: {
                    nome: req.body.faculdade,
                    instituicao: req.body.faculdadeOrg,
                    certificado: arquivosValidados.certificadoFaculdade
                },
                curso: {
                    nome: req.body.curso,
                    instituicao: req.body.cursoOrg,
                    certificado: arquivosValidados.certificadoCurso
                }
            };
    
            let especializacoesSelecionadas = [];
            if (req.body.area) {
                especializacoesSelecionadas = Array.isArray(req.body.area) ? req.body.area : [req.body.area];
                especializacoesSelecionadas = especializacoesSelecionadas.filter(especialidade => 
                    especialidade && especialidade.trim() !== '' && especialidade !== 'on'
                );
            }
    
            const caminhoFotoPerfil = req.body.caminhoFotoPerfil || null;
            const caminhoFotoBanner = req.body.caminhoFotoBanner || null;
    
            console.log('=== ETAPA 3: SALVANDO NO BANCO ===');
            console.log('Foto de perfil a ser salva:', caminhoFotoPerfil);
            console.log('Foto de banner a ser salva:', caminhoFotoBanner);
    
            const result = await NWModel.createNutricionista(
                dadosUsuario,
                dadosNutricionista,
                especializacoesSelecionadas,
                caminhoFotoPerfil, 
                caminhoFotoBanner, 
                formacao
            );
    
            console.log("Nutricionista cadastrado com sucesso - ID:", result.usuarioId);
            return res.redirect("/login?login=cadastro_realizado");
    
        } catch (error) {
            console.error("Erro no cadastro do nutricionista:", error.message);
            
            return res.render('pages/indexCadastrarNutri', {
                etapa: "4", 
                card1: "hidden", 
                card2: "hidden", 
                card3: "hidden", 
                card4: "",
                valores: req.body,
                listaErros: { 
                    errors: [{ 
                        msg: error.message.includes('muito grande') || error.message.includes('não suportado') || error.message.includes('inválido')
                            ? error.message 
                            : 'Erro interno do servidor. Tente novamente.' 
                    }] 
                }
            });
        }
    },

    validarArquivosNutricionista: function(req) {
        const imagens = this.validarImagensUpload(req.files);
        
        let imagemPerfil = imagens.imagemPerfil;
        let imagemBanner = imagens.imagemBanner;
        
        const validarCertificado = (arquivo, tipo) => {
            if (!arquivo) return null;
            
            if (arquivo.size > 10 * 1024 * 1024) {
                throw new Error(`${tipo} muito grande. Máximo permitido: 10MB`);
            }
            
            const tiposPermitidos = [
                'application/pdf', 
                'image/jpeg', 
                'image/jpg', 
                'image/png', 
                'image/gif', 
                'image/webp'
            ];
            if (!tiposPermitidos.includes(arquivo.mimetype)) {
                throw new Error(`Formato de ${tipo} não suportado. Use: PDF, JPEG, PNG, GIF ou WEBP`);
            }
            
            return {
                filepath: arquivo.filepath,
                filename: arquivo.filename,
                mimetype: arquivo.mimetype,
                size: arquivo.size
            };
        };
    
        return {
            imagemPerfil,
            imagemBanner,
            certificadoFaculdade: validarCertificado(
                req.files && req.files['certificadoFaculdade'] ? req.files['certificadoFaculdade'][0] : null,
                'certificado de faculdade'
            ),
            certificadoCurso: validarCertificado(
                req.files && req.files['certificadoCurso'] ? req.files['certificadoCurso'][0] : null,
                'certificado de curso'
            )
        };
    },

}

function verificarMudancas(dadosAtuais, formData, telefoneCompleto, especializacoesFormulario, tipoUsuario) {
    const alteracoes = [];
    let houveAlteracao = false;

    if (dadosAtuais.nome !== formData.nome) {
        alteracoes.push("nome");
        houveAlteracao = true;
    }
    
    if (dadosAtuais.email !== formData.email) {
        alteracoes.push("email");
        houveAlteracao = true;
    }
    
    if (dadosAtuais.telefone !== telefoneCompleto) {
        alteracoes.push("telefone");
        houveAlteracao = true;
    }

    if (formData.senha && formData.senha.trim() !== '') {
        alteracoes.push("senha");
        houveAlteracao = true;
    }

    if (tipoUsuario === 'N') {
        if (dadosAtuais.crn !== formData.crn) {
            alteracoes.push("crn");
            houveAlteracao = true;
        }
        
        if ((dadosAtuais.sobreMim || '') !== (formData.sobreMim || '')) {
            alteracoes.push("sobreMim");
            houveAlteracao = true;
        }
        
        const especializacoesAtuais = (dadosAtuais.especializacoes || []).sort();
        const especializacoesNovas = especializacoesFormulario.sort();
        
        if (JSON.stringify(especializacoesAtuais) !== JSON.stringify(especializacoesNovas)) {
            alteracoes.push("especializacoes");
            houveAlteracao = true;
        }
    }

    return { houveAlteracao, alteracoes };
}

function validarImagensUpload(files) {
    const validarImagem = (arquivo, tipo) => {
        if (!arquivo) return null;
        
        console.log(`Validando ${tipo}:`, {
            originalname: arquivo.originalname,
            size: arquivo.size,
            path: arquivo.path 
        });
        
        if (arquivo.size > 5 * 1024 * 1024) {
            throw new Error(`${tipo} muito grande. Máximo permitido: 5MB`);
        }
        
        const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!tiposPermitidos.includes(arquivo.mimetype)) {
            throw new Error(`Formato de ${tipo} não suportado. Use: JPEG, PNG, GIF ou WEBP`);
        }
        
        const caminhoRelativo = arquivo.path
            .replace(/\\/g, '/')
            .split('public/')[1];
        
        console.log(`${tipo} será salvo com caminho relativo: ${caminhoRelativo}`);
        return caminhoRelativo;
    };

    return {
        imagemPerfil: validarImagem(
            files && files['input-imagem'] ? files['input-imagem'][0] : null,
            'foto de perfil'
        ),
        imagemBanner: validarImagem(
            files && files['input-banner'] ? files['input-banner'][0] : null,
            'banner'
        )
    };
}

function validarArquivosNutricionista(req) {
    const imagens = validarImagensUpload(req.files);
    
    let imagemPerfil = imagens.imagemPerfil;
    let imagemBanner = imagens.imagemBanner;
    
    const validarCertificado = (arquivo, tipo) => {
        if (!arquivo) return null;
        
        console.log(`Validando ${tipo}:`, {
            originalname: arquivo.originalname,
            size: arquivo.size,
            path: arquivo.path
        });
        
        if (arquivo.size > 10 * 1024 * 1024) {
            throw new Error(`${tipo} muito grande. Máximo permitido: 10MB`);
        }
        
        const tiposPermitidos = [
            'application/pdf', 
            'image/jpeg', 
            'image/jpg', 
            'image/png', 
            'image/gif', 
            'image/webp'
        ];
        if (!tiposPermitidos.includes(arquivo.mimetype)) {
            throw new Error(`Formato de ${tipo} não suportado. Use: PDF, JPEG, PNG, GIF ou WEBP`);
        }
        
        const caminhoRelativo = arquivo.path
            .replace(/\\/g, '/')
            .split('public/')[1];
        
        console.log(`${tipo} será salvo com caminho relativo: ${caminhoRelativo}`);
        
        return {
            filepath: caminhoRelativo,
            filename: arquivo.filename,
            mimetype: arquivo.mimetype,
            size: arquivo.size
        };
    };

    return {
        imagemPerfil,
        imagemBanner,
        certificadoFaculdade: validarCertificado(
            req.files && req.files['certificadoFaculdade'] ? req.files['certificadoFaculdade'][0] : null,
            'certificado de faculdade'
        ),
        certificadoCurso: validarCertificado(
            req.files && req.files['certificadoCurso'] ? req.files['certificadoCurso'][0] : null,
            'certificado de curso'
        )
    };
}

function validarImagemPublicacao(arquivo) {
    if (!arquivo) {
        throw new Error('Imagem é obrigatória');
    }
    
    console.log('✅ Validando imagem de publicação:', {
        originalname: arquivo.originalname,
        filename: arquivo.filename,
        size: arquivo.size,
        mimetype: arquivo.mimetype,
        path: arquivo.path
    });
    
    if (arquivo.size > 5 * 1024 * 1024) {
        throw new Error('Imagem muito grande. Máximo: 5MB');
    }
    
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!tiposPermitidos.includes(arquivo.mimetype)) {
        throw new Error('Formato não suportado');
    }
    
    const caminhoRelativo = arquivo.path
        .replace(/\\/g, '/')
        .split('public/')[1];
    
    console.log('✅ Caminho relativo da publicação:', caminhoRelativo);
    return caminhoRelativo;
}

module.exports = NWController;