const NWModel = require("../models/NWModel");
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
        // **VALIDAÇÕES BÁSICAS**
        body("nome").isLength({min:2}).withMessage("O nome deve conter 2 ou mais caracteres!"),
        
        // **VALIDAÇÃO DE EMAIL COM DUPLICIDADE**
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
        
        // **VALIDAÇÃO DE CPF COM DUPLICIDADE**
        body("cpf")
            .custom(async (cpf) => {
                const cpfLimpo = cpf.replace(/\D/g, '');
                
                if (cpfLimpo.length !== 11) {
                    throw new Error('O CPF deve conter exatamente 11 dígitos!');
                }
                
                // Validação de CPF
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
                
                // Verificar se CPF já existe
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
        
        // **VALIDAÇÃO DE SENHA**
        body("senha")
            .isLength({min:5}).withMessage("Insira uma senha válida!")
            .matches(/[A-Z]/).withMessage("Insira uma senha válida!")
            .matches(/[a-z]/).withMessage("Insira uma senha válida!")
            .matches(/\d/).withMessage("Insira uma senha válida!")
            .matches(/[\W_]/).withMessage("Insira uma senha válida!"),
        
        // **VALIDAÇÃO DE DDD**
        body("ddd").isLength({min:2}).withMessage("Insira um DDD válido!"),
        
        // **VALIDAÇÃO DE TELEFONE COM DUPLICIDADE**
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
        
        // **VALIDAÇÃO CUSTOMIZADA: Verificar duplicidades em uma única consulta**
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
                
                // **UMA ÚNICA CONSULTA para verificar todos os dados**
                const conflitos = await NWModel.verificarDadosExistentesParaAtualizacao(dadosParaVerificar, usuarioId);
                
                // Armazenar resultados na request para uso nas outras validações
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
                return true; // Fail-safe: prosseguir em caso de erro na consulta
            }
        }),
        
        body("telefone").custom(async (telefone, { req }) => {
            try {
                // Usar resultado já obtido na validação do email
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
                // Só executar para nutricionistas
                if (req.session.usuario && req.session.usuario.tipo === 'N') {
                    // Usar resultado já obtido na validação do email
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
            
            const dadosParaView = {
                publicacoes: resultados.publicacoes || [],
                nutricionistas: resultados.nutricionistas || [],
                totalResultados: (resultados.publicacoes?.length || 0) + (resultados.nutricionistas?.length || 0)
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
    
            // **OTIMIZAÇÃO 1: Uma única consulta para buscar dados atuais**
            const dadosAtuais = await NWModel.buscarDadosParaComparacao(usuarioId, tipoUsuario);
            
            if (!dadosAtuais) {
                return res.redirect('/config?erro=usuario_nao_encontrado');
            }
    
            // Preparar dados do formulário
            const telefoneCompleto = req.body.ddd + req.body.telefone;
            const especializacoesFormulario = req.body.area ? 
                (Array.isArray(req.body.area) ? req.body.area : [req.body.area]).filter(especialidade => 
                    especialidade && especialidade.trim() !== '' && especialidade !== 'on'
                ) : [];
    
            // **OTIMIZAÇÃO 2: Verificar mudanças de forma mais eficiente**
            const mudancas = verificarMudancas(dadosAtuais, req.body, telefoneCompleto, especializacoesFormulario, tipoUsuario);
            
            if (!mudancas.houveAlteracao) {
                console.log("Nenhuma alteração detectada - ignorando atualização");
                return res.redirect('/config?erro=nenhum_dado_alterado');
            }
    
            console.log("Alterações detectadas:", mudancas.alteracoes);
    
            // Hash da senha apenas se foi fornecida
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
    
            // **OTIMIZAÇÃO 3: Atualização e busca dos dados em uma única transação**
            const dadosAtualizados = await NWModel.atualizarEBuscarDados(
                usuarioId,
                dadosUsuario,
                dadosEspecificos,
                dadosPerfil,
                especializacoesFormulario,
                tipoUsuario
            );
    
            console.log("Dados atualizados com sucesso - ID:", usuarioId);
            
            // Atualizar a sessão
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
                
                console.log(`${tipo} - Tamanho:`, arquivo.size, 'bytes');
                console.log(`${tipo} - Tipo:`, arquivo.mimetype);
                
                if (arquivo.size > 5 * 1024 * 1024) {
                    throw new Error(`${tipo} muito grande. Máximo permitido: 5MB`);
                }
                
                if (arquivo.buffer && arquivo.buffer.length > 5 * 1024 * 1024) {
                    throw new Error(`${tipo} muito grande após processamento. Máximo permitido: 5MB`);
                }
                
                const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!tiposPermitidos.includes(arquivo.mimetype)) {
                    throw new Error(`Formato de ${tipo} não suportado. Use: JPEG, PNG, GIF ou WEBP`);
                }
                
                return arquivo;
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
    
            return res.redirect('/config?erro=' + encodeURIComponent(
                error.message.includes('muito grande') || error.message.includes('não suportado')
                    ? error.message
                    : 'Erro interno do servidor. Tente novamente.'
            ));
        }
    },

    /* --------------------------------------- MÉTODOS ------------------------------------ */

    processarLogin: (req, res) => {
        const erros = validationResult(req);
        
        // Se há erros de validação
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
            let isOwner = false;
            
            const usuarioLogado = req.session.usuario && req.session.usuario.logado;
            
            if (req.query.id) {
                const nutricionistaIdPublico = parseInt(req.query.id);
                
                if (isNaN(nutricionistaIdPublico) || nutricionistaIdPublico < 1) {
                    return res.redirect('/?erro=nutricionista_nao_encontrado');
                }
                
                usuarioId = await NWModel.findUsuarioIdByNutricionistaId(nutricionistaIdPublico);
                
                if (!usuarioId) {
                    return res.redirect('/?erro=nutricionista_nao_encontrado');
                }
                
                isOwner = false;
                
                if (usuarioLogado && req.session.usuario.tipo === 'N' && req.session.usuario.id === usuarioId) {
                    isOwner = true;
                    console.log("É o dono do perfil");
                }
            } 
            else {
                if (!usuarioLogado || req.session.usuario.tipo !== 'N') {
                    return res.redirect('/login?erro=acesso_negado');
                }
                usuarioId = req.session.usuario.id;
                isOwner = true;
            }
            
            
            const dadosBasicos = await NWModel.findPerfilNutri(usuarioId);
            
            if (!dadosBasicos || !dadosBasicos.nutricionista || !dadosBasicos.nutricionista.id) {
                return res.redirect('/?erro=nutricionista_sem_dados');
            }
            
            const { nutricionista, formacoes, contatosSociais } = dadosBasicos;

            const dadosProcessados = {
                id: nutricionista.id,
                nome: nutricionista.NomeCompleto,
                email: nutricionista.Email,
                telefone: nutricionista.Telefone ? 
                    `(${nutricionista.Telefone.substring(0,2)}) ${nutricionista.Telefone.substring(2,7)}-${nutricionista.Telefone.substring(7)}` :
                    null,
                crn: nutricionista.Crn,
                sobreMim: nutricionista.SobreMim || "Este nutricionista ainda não adicionou uma descrição.",
                especializacoes: nutricionista.Especializacoes || "Nenhuma especialização cadastrada",
                
                fotoPerfil: nutricionista.FotoPerfil ? 
                    `/imagem/perfil/${usuarioId}` : 
                    '/imagens/foto_perfil.jpg',
                
                fotoBanner: nutricionista.FotoBanner ? 
                    `/imagem/banner/${usuarioId}` : 
                    '/imagens/bannerperfilnutri.png'
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
            
            return res.render("pages/indexPerfilNutri", {
                erro: null,
                nutricionista: dadosProcessados,
                formacoes: formacoesProcessadas,
                contatosSociais: contatosProcessados,
                isOwner: isOwner,
                usuarioLogado: usuarioLogado
            });
            
        } catch (erro) {
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
    
            // **VALIDAÇÃO DE IMAGENS MOVIDA PARA O CONTROLLER**
            const imagensValidadas = validarImagensUpload(req.files);
            
            // Preparar dados do usuário
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
    
            // Processar interesses
            let interessesSelecionados = [];
            if (req.body.area) {
                interessesSelecionados = Array.isArray(req.body.area) ? req.body.area : [req.body.area];
                interessesSelecionados = interessesSelecionados.filter(interesse =>
                    interesse && interesse.trim() !== '' && interesse !== 'on'
                );
            }
    
            // **CHAMADA ÚNICA AO MODEL**
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
    
            // **VALIDAÇÃO DE IMAGENS E CERTIFICADOS MOVIDA PARA O CONTROLLER**
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
    
            // Processar especializações
            let especializacoesSelecionadas = [];
            if (req.body.area) {
                especializacoesSelecionadas = Array.isArray(req.body.area) ? req.body.area : [req.body.area];
                especializacoesSelecionadas = especializacoesSelecionadas.filter(especialidade => 
                    especialidade && especialidade.trim() !== '' && especialidade !== 'on'
                );
            }
    
            // **CHAMADA ÚNICA AO MODEL**
            const result = await NWModel.createNutricionista(
                dadosUsuario,
                dadosNutricionista,
                especializacoesSelecionadas,
                arquivosValidados.imagemPerfil,
                arquivosValidados.imagemBanner,
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

}

// **FUNÇÃO AUXILIAR: Verificar mudanças**
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
        
        if (arquivo.size > 5 * 1024 * 1024) {
            throw new Error(`${tipo} muito grande. Máximo permitido: 5MB`);
        }
        
        if (arquivo.buffer && arquivo.buffer.length > 5 * 1024 * 1024) {
            throw new Error(`${tipo} muito grande após processamento. Máximo permitido: 5MB`);
        }
        
        const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!tiposPermitidos.includes(arquivo.mimetype)) {
            throw new Error(`Formato de ${tipo} não suportado. Use: JPEG, PNG, GIF ou WEBP`);
        }
        
        return arquivo;
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
    // Validar imagens (reutiliza a função do cliente)
    const imagens = validarImagensUpload(req.files);
    
    // Recuperar imagens dos campos hidden (multi-step form)
    let imagemPerfil = imagens.imagemPerfil;
    let imagemBanner = imagens.imagemBanner;
    
    if (req.body.imagemPerfilData) {
        try {
            const dadosImagem = JSON.parse(req.body.imagemPerfilData);
            if (dadosImagem && dadosImagem.buffer) {
                imagemPerfil = {
                    originalname: dadosImagem.originalname,
                    mimetype: dadosImagem.mimetype,
                    size: dadosImagem.size,
                    buffer: Buffer.from(dadosImagem.buffer, 'base64')
                };
            }
        } catch (error) {
            console.error('Erro ao recuperar imagem de perfil:', error.message);
        }
    }
    
    if (req.body.imagemBannerData) {
        try {
            const dadosImagem = JSON.parse(req.body.imagemBannerData);
            if (dadosImagem && dadosImagem.buffer) {
                imagemBanner = {
                    originalname: dadosImagem.originalname,
                    mimetype: dadosImagem.mimetype,
                    size: dadosImagem.size,
                    buffer: Buffer.from(dadosImagem.buffer, 'base64')
                };
            }
        } catch (error) {
            console.error('Erro ao recuperar banner:', error.message);
        }
    }
    
    // Validar certificados
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
        
        return arquivo;
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

module.exports = NWController;