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
    validacaoCadCliente : [
        body("nome").isLength({min:2}).withMessage("O nome deve conter 2 ou mais caracteres!"),
        body("email").isEmail().withMessage("Insira um Email válido!")
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

    // validação cadastro nutricionista (card 1)
    validacaoCadNutri1 : [
        body("nome").isLength({min:2}).withMessage("O nome deve conter 2 ou mais caracteres!"),
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
            }),
        body("ddd").isLength({min:2}).withMessage("Insira um DDD válido!"),
        body("email").isEmail().withMessage("Insira um Email válido!")
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
            }),
    ],

    validacaoAtualizarDados: [
        body("nome").isLength({min:2}).withMessage("O nome deve conter 2 ou mais caracteres!"),
        body("telefone")
            .isMobilePhone().withMessage("Insira um número de telefone válido!")
            .custom(async (telefone, { req }) => {
                try {
                    const ddd = req.body.ddd;
                    const usuarioId = req.session.usuarioId;
                    const telefoneExiste = await NWModel.verificarTelefoneExistenteParaAtualizacao(ddd, telefone, usuarioId);
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
        body("ddd").isLength({min:2}).withMessage("Insira um DDD válido!"),
        body("email").isEmail().withMessage("Insira um Email válido!")
            .custom(async (email, { req }) => {
                try {
                    const usuarioId = req.session.usuarioId;
                    const emailExiste = await NWModel.verificarEmailExistenteParaAtualizacao(email, usuarioId);
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
        body("senha")
            .optional({ checkFalsy: true }) // Senha opcional na atualização
            .isLength({min:5}).withMessage("Insira uma senha válida!")
            .matches(/[A-Z]/).withMessage("Insira uma senha válida!")
            .matches(/[a-z]/).withMessage("Insira uma senha válida!")
            .matches(/\d/).withMessage("Insira uma senha válida!")
            .matches(/[\W_]/).withMessage("Insira uma senha válida!"),
        body("area")
            .if((value, { req }) => req.session.tipoUsuario === 'N') // Apenas para nutricionistas
            .custom((value) => {
              if (!value) return false;
              if (Array.isArray(value)) {
                return value.length >= 1;
              }
              return typeof value === "string" && value.length > 0;
            })
            .withMessage("Selecione no mínimo uma especialização!"),
        body("crn")
            .if((value, { req }) => req.session.tipoUsuario === 'N') // Apenas para nutricionistas
            .isLength({min:5}).withMessage("Insira um CRN válido!")
            .custom(async (crn, { req }) => {
                try {
                    const usuarioId = req.session.usuarioId;
                    const crnExiste = await NWModel.verificarCrnExistenteParaAtualizacao(crn, usuarioId);
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
            }),
    ],

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
    
            // Buscar dados atuais do usuário para comparação
            let dadosAtuais = {};
            if (tipoUsuario === 'N') {
                const perfilNutri = await NWModel.findPerfilNutri(usuarioId);
                if (perfilNutri.nutricionista) {
                    dadosAtuais = {
                        nome: perfilNutri.nutricionista.NomeCompleto,
                        email: perfilNutri.nutricionista.Email,
                        telefone: perfilNutri.nutricionista.Telefone,
                        crn: perfilNutri.nutricionista.Crn,
                        sobreMim: perfilNutri.nutricionista.SobreMim || '',
                        especializacoes: perfilNutri.nutricionista.Especializacoes ? 
                                       perfilNutri.nutricionista.Especializacoes.split(', ') : []
                    };
                }
            } else {
                const perfilCliente = await NWModel.findPerfilCompleto(usuarioId);
                if (perfilCliente.cliente) {
                    dadosAtuais = {
                        nome: perfilCliente.cliente.NomeCompleto,
                        email: perfilCliente.cliente.Email,
                        telefone: perfilCliente.cliente.Telefone
                    };
                }
            }
    
            // Preparar dados do formulário
            const telefoneCompleto = req.body.ddd + req.body.telefone;
            const especializacoesFormulario = req.body.area ? 
                (Array.isArray(req.body.area) ? req.body.area : [req.body.area]).filter(especialidade => 
                    especialidade && especialidade.trim() !== '' && especialidade !== 'on'
                ) : [];
    
            // Verificar se houve mudanças nos dados principais
            let houveAlteracao = false;
            
            if (dadosAtuais.nome !== req.body.nome) {
                console.log("Nome mudou:", dadosAtuais.nome, "->", req.body.nome);
                houveAlteracao = true;
            }
            
            if (dadosAtuais.email !== req.body.email) {
                console.log("Email mudou:", dadosAtuais.email, "->", req.body.email);
                houveAlteracao = true;
            }
            
            if (dadosAtuais.telefone !== telefoneCompleto) {
                console.log("Telefone mudou:", dadosAtuais.telefone, "->", telefoneCompleto);
                houveAlteracao = true;
            }
    
            if (req.body.senha && req.body.senha.trim() !== '') {
                console.log("Nova senha fornecida");
                houveAlteracao = true;
            }
    
            if (tipoUsuario === 'N') {
                if (dadosAtuais.crn !== req.body.crn) {
                    console.log("CRN mudou:", dadosAtuais.crn, "->", req.body.crn);
                    houveAlteracao = true;
                }
                
                if ((dadosAtuais.sobreMim || '') !== (req.body.sobreMim || '')) {
                    console.log("Sobre mim mudou:", dadosAtuais.sobreMim, "->", req.body.sobreMim);
                    houveAlteracao = true;
                }
                
                const especializacoesAtuais = dadosAtuais.especializacoes.sort();
                const especializacoesNovas = especializacoesFormulario.sort();
                
                if (JSON.stringify(especializacoesAtuais) !== JSON.stringify(especializacoesNovas)) {
                    console.log("Especializações mudaram:", especializacoesAtuais, "->", especializacoesNovas);
                    houveAlteracao = true;
                }
            }
    
            // Se não houve alteração, retornar sem fazer update
            if (!houveAlteracao) {
                console.log("Nenhuma alteração detectada - ignorando atualização");
                
                // Preparar dados para renderizar (valores atuais formatados)
                let dadosParaExibir = {};
                if (tipoUsuario === 'N') {
                    dadosParaExibir = {
                        nome: dadosAtuais.nome,
                        email: dadosAtuais.email,
                        telefone: dadosAtuais.telefone ? dadosAtuais.telefone.slice(-9) : '',
                        ddd: dadosAtuais.telefone ? dadosAtuais.telefone.slice(0, 2) : '',
                        crn: dadosAtuais.crn,
                        sobreMim: dadosAtuais.sobreMim,
                        area: dadosAtuais.especializacoes,
                        senha: ''
                    };
                } else {
                    dadosParaExibir = {
                        nome: dadosAtuais.nome,
                        email: dadosAtuais.email,
                        telefone: dadosAtuais.telefone ? dadosAtuais.telefone.slice(-9) : '',
                        ddd: dadosAtuais.telefone ? dadosAtuais.telefone.slice(0, 2) : '',
                        senha: ''
                    };
                }
    
                return res.render('pages/indexConfig', {
                    tipoUsuario: tipoUsuario,
                    valores: dadosParaExibir,
                    msgErro: { info: 'Nenhuma alteração foi detectada nos dados.' },
                    erroValidacao: {},
                    listaErros: null
                });
            }
    
            // Prosseguir com a atualização
            console.log("Alterações detectadas - prosseguindo com atualização");
    
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
            let especializacoesSelecionadas = especializacoesFormulario;
    
            if (tipoUsuario === 'N') {
                dadosEspecificos = {
                    Crn: req.body.crn
                };
            }
    
            const result = await NWModel.atualizarDadosUsuario(
                usuarioId,
                dadosUsuario,
                dadosEspecificos,
                dadosPerfil,
                especializacoesSelecionadas,
                tipoUsuario
            );
    
            console.log("Dados atualizados com sucesso - ID:", usuarioId);
            
            // *** ATUALIZAR A SESSÃO COM OS NOVOS DADOS ***
            req.session.usuario.nome = req.body.nome;
            req.session.usuario.email = req.body.email;
            
            if (tipoUsuario === 'N' && req.body.crn) {
                req.session.usuario.documento = req.body.crn;
            }
    
            console.log("Sessão atualizada:", {
                id: req.session.usuario.id,
                nome: req.session.usuario.nome,
                email: req.session.usuario.email,
                tipo: req.session.usuario.tipo
            });
            
            // Recarregar dados atualizados para exibir
            let dadosAtualizados = {};
            if (tipoUsuario === 'N') {
                const perfilNutri = await NWModel.findPerfilNutri(usuarioId);
                if (perfilNutri.nutricionista) {
                    dadosAtualizados = {
                        nome: perfilNutri.nutricionista.NomeCompleto,
                        email: perfilNutri.nutricionista.Email,
                        telefone: perfilNutri.nutricionista.Telefone.slice(-9),
                        ddd: perfilNutri.nutricionista.Telefone.slice(0, 2),
                        crn: perfilNutri.nutricionista.Crn,
                        sobreMim: perfilNutri.nutricionista.SobreMim || '',
                        area: perfilNutri.nutricionista.Especializacoes ? 
                               perfilNutri.nutricionista.Especializacoes.split(', ') : [],
                        senha: ''
                    };
                }
            } else {
                const perfilCliente = await NWModel.findPerfilCompleto(usuarioId);
                if (perfilCliente.cliente) {
                    dadosAtualizados = {
                        nome: perfilCliente.cliente.NomeCompleto,
                        email: perfilCliente.cliente.Email,
                        telefone: perfilCliente.cliente.Telefone.slice(-9),
                        ddd: perfilCliente.cliente.Telefone.slice(0, 2),
                        senha: ''
                    };
                }
            }
    
            return res.render('pages/indexConfig', {
                tipoUsuario: tipoUsuario,
                valores: dadosAtualizados,
                msgErro: { sucesso: 'Dados atualizados com sucesso!' },
                erroValidacao: {},
                listaErros: null
            });
    
        } catch (error) {
            console.error("Erro na atualização dos dados:", error.message);
            
            return res.render('pages/indexConfig', {
                tipoUsuario: req.session.usuario.tipo,
                valores: req.body,
                msgErro: { geral: 'Erro interno do servidor. Tente novamente.' },
                erroValidacao: {},
                listaErros: null
            });
        }
    },

    atualizarImagens: async (req, res) => {
        try {
            // Verificar se o usuário está logado
            if (!req.session.usuario || !req.session.usuario.logado) {
                console.log('ERRO: Usuário não autenticado');
                return res.status(401).json({ 
                    success: false, 
                    message: 'Usuário não autenticado' 
                });
            }
    
            const usuarioId = req.session.usuario.id;
            console.log('Usuario ID:', usuarioId);
    
            // Função de validação de imagem (reutilizada do cadastro)
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
                return res.status(400).json({
                    success: false,
                    message: 'Nenhuma imagem foi selecionada para atualização'
                });
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
            
            if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
                return res.status(500).json({
                    success: false,
                    message: error.message.includes('muito grande') || error.message.includes('não suportado')
                        ? error.message
                        : 'Erro interno do servidor. Tente novamente.'
                });
            }
    
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
                publicacoesCurtidas: dadosProcessados.publicacoes
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
            const erros = validationResult(req);
            if (!erros.isEmpty()) {
                return res.render('pages/indexCadastroCliente', {
                    etapa: "2",
                    cardSucesso: true,
                    valores: req.body,
                    listaErros: erros
                });
            }
    
            // validaçao de imagem
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
    
            // validaçao de imagem
            const imagemPerfil = validarImagem(
                req.files && req.files['input-imagem'] ? req.files['input-imagem'][0] : null, 
                'foto de perfil'
            );
            
            const imagemBanner = validarImagem(
                req.files && req.files['input-banner'] ? req.files['input-banner'][0] : null, 
                'banner'
            );
    
            // deixar o cpf limpo
            const cpfLimpo = req.body.cpf ? req.body.cpf.replace(/\D/g, '') : '';
            if (!cpfLimpo) {
                throw new Error('CPF é obrigatório!');
            }
    
            // criptografar a senha
            const senhaHash = await bcrypt.hash(req.body.senha, 12);
            
            const dadosUsuario = {
                NomeCompleto: req.body.nome,
                Email: req.body.email,
                Senha: senhaHash,
                Telefone: req.body.ddd + req.body.telefone,
                UsuarioTipo: 'C'
            };
    
            // interessesa
            let interessesSelecionados = [];
            if (req.body.area) {
                interessesSelecionados = Array.isArray(req.body.area) ? req.body.area : [req.body.area];
                interessesSelecionados = interessesSelecionados.filter(interesse => 
                    interesse && interesse.trim() !== '' && interesse !== 'on'
                );
            }
    
            const resultado = await NWModel.createCliente(dadosUsuario, cpfLimpo, imagemPerfil, imagemBanner, interessesSelecionados);
    
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
    
            let imagemPerfil = null;
            let imagemBanner = null;
            
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
            
            const certificadoFaculdade = req.files && req.files['certificadoFaculdade'] ? req.files['certificadoFaculdade'][0] : null;
            const certificadoCurso = req.files && req.files['certificadoCurso'] ? req.files['certificadoCurso'][0] : null;

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
                    certificado: certificadoFaculdade
                },
                curso: {
                    nome: req.body.curso,
                    instituicao: req.body.cursoOrg,
                    certificado: certificadoCurso
                }
            };
    
            let especializacoesSelecionadas = [];
            if (req.body.area) {
                especializacoesSelecionadas = Array.isArray(req.body.area) ? req.body.area : [req.body.area];
                especializacoesSelecionadas = especializacoesSelecionadas.filter(especialidade => 
                    especialidade && especialidade.trim() !== '' && especialidade !== 'on'
                );
            }
    
            const certificados = {
                faculdade: certificadoFaculdade,
                curso: certificadoCurso
            };
    
            const result = await NWModel.createNutricionista(
                dadosUsuario,
                dadosNutricionista,
                especializacoesSelecionadas,
                imagemPerfil,
                imagemBanner,
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

module.exports = NWController;