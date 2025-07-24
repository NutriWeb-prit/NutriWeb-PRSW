const NWModel = require("../models/NWModel");
const {body, validationResult} = require("express-validator");

const NWController = {

    // validação login
    validacaoLogin : [
        body("email").isEmail().withMessage("Insira um Email válido!"),
            body("senha").isLength({min:5}).withMessage("A senha deve conter 5 ou mais caracteres!"),
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


    /* --------------------------------------- MÉTODOS ------------------------------------ */

    cadastrarCliente: async (req, res) => {
        try {
            console.log('Iniciando processo de cadastro de cliente...');
            
            // Verificar erros de validação
            const erros = validationResult(req);
            if (!erros.isEmpty()) {
                console.log('Erros de validação encontrados:', erros.array());
                return res.render('pages/indexCadastroCliente', {
                    etapa: "2",
                    cardSucesso: true,
                    valores: req.body,
                    listaErros: erros
                });
            }
    
            console.log('Validações passaram, preparando dados...');
    
            // Função para validar imagens
            const validarImagem = (arquivo, tipo) => {
                if (!arquivo) return null;
    
                // Verificar tamanho máximo para upload (5MB - mais conservador que MEDIUMBLOB)
                if (arquivo.size > 5 * 1024 * 1024) {
                    throw new Error(`${tipo} muito grande. Máximo permitido: 5MB`);
                }
    
                // Verificar tamanho do buffer também
                if (arquivo.buffer && arquivo.buffer.length > 5 * 1024 * 1024) {
                    throw new Error(`${tipo} muito grande após processamento. Máximo permitido: 5MB`);
                }
    
                // Verificar tipo de arquivo
                const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!tiposPermitidos.includes(arquivo.mimetype)) {
                    throw new Error(`Formato de ${tipo} não suportado. Use: JPEG, PNG, GIF ou WEBP`);
                }
    
                console.log(`${tipo} validada:`, arquivo.originalname, `(${arquivo.size} bytes)`);
                return arquivo;
            };
    
            // Validar imagens
            const imagemPerfil = validarImagem(
                req.files && req.files['input-imagem'] ? req.files['input-imagem'][0] : null, 
                'foto de perfil'
            );
            
            const imagemBanner = validarImagem(
                req.files && req.files['input-banner'] ? req.files['input-banner'][0] : null, 
                'banner'
            );
    
            const dadosUsuario = {
                NomeCompleto: req.body.nome,
                Email: req.body.email,
                Senha: req.body.senha,
                Telefone: req.body.ddd + req.body.telefone,
                UsuarioTipo: 'C'
            };
    
            // Processar interesses nutricionais
            const interessesSelecionados = req.body.area ? 
                (Array.isArray(req.body.area) ? req.body.area : [req.body.area]) : [];
    
            console.log('Dados do usuário preparados:', dadosUsuario);
            console.log('Imagens:', {
                perfil: imagemPerfil ? `${imagemPerfil.originalname} (${imagemPerfil.size} bytes)` : 'Não enviada',
                banner: imagemBanner ? `${imagemBanner.originalname} (${imagemBanner.size} bytes)` : 'Não enviada'
            });
            console.log('Interesses selecionados:', interessesSelecionados);
    
            const resultado = await NWModel.createCliente(dadosUsuario, imagemPerfil, imagemBanner, interessesSelecionados);
    
            console.log('Cliente cadastrado com sucesso:', resultado);
    
            return res.redirect('/login?cadastro=sucesso');
    
        } catch (error) {
            console.error('Erro no processo de cadastro:', error.message);
            
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
            console.log('Iniciando cadastro de nutricionista...');
            
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('Erros de validação:', errors.array());
                return res.render('pages/indexCadastrarNutri', {
                    etapa: "4", card1: "hidden", card2: "hidden", card3: "hidden", card4: "",
                    valores: req.body, listaErros: errors
                });
            }
    
            // Validar imagens
            const validarImagem = (arquivo, tipo) => {
                if (!arquivo) return null;
                if (arquivo.size > 5 * 1024 * 1024) {
                    throw new Error(`${tipo} muito grande. Máximo: 5MB`);
                }
                const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!tiposPermitidos.includes(arquivo.mimetype)) {
                    throw new Error(`Formato de ${tipo} inválido`);
                }
                return arquivo;
            };
    
            const imagemPerfil = validarImagem(
                req.files && req.files['input-imagem'] ? req.files['input-imagem'][0] : null,
                'foto de perfil'
            );
            const imagemBanner = validarImagem(
                req.files && req.files['input-banner'] ? req.files['input-banner'][0] : null,
                'banner'
            );
    
            const dadosUsuario = {
                NomeCompleto: req.body.nome,
                Email: req.body.email,
                Senha: req.body.senha,
                Telefone: req.body.ddd + req.body.telefone,
                UsuarioTipo: 'N'
            };
    
            const dadosNutricionista = {
                Crn: req.body.crn,
                RazaoSocial: req.body.razaoSocial || req.body.nome,
                SobreMim: req.body.sobreMim
            };
    
            const formacao = {
                faculdade: req.body.faculdade,
                faculdadeOrg: req.body.faculdadeOrg,
                curso: req.body.curso,
                cursoOrg: req.body.cursoOrg
            };
    
            const especializacoes = Array.isArray(req.body.area) ? req.body.area : [req.body.area];
            
            const certificados = {
                faculdade: req.files && req.files['certificadoFaculdade'] ? req.files['certificadoFaculdade'][0] : null,
                curso: req.files && req.files['certificadoCurso'] ? req.files['certificadoCurso'][0] : null
            };
    
            console.log('Dados preparados para criação');
    
            const result = await NWModel.createNutricionista(
                dadosUsuario,
                dadosNutricionista,
                especializacoes,
                imagemPerfil,
                imagemBanner,
                formacao,
                certificados
            );
    
            console.log("Nutricionista criado:", result);
            return res.redirect("/login?cadastro=sucesso");
    
        } catch (err) {
            console.error("Erro ao cadastrar:", err.message);
            
            return res.render('pages/indexCadastrarNutri', {
                etapa: "4", card1: "hidden", card2: "hidden", card3: "hidden", card4: "",
                valores: req.body,
                listaErros: { errors: [{ msg: err.message.includes('muito grande') || err.message.includes('inválido') ? err.message : "Erro ao cadastrar. Tente novamente." }] }
            });
        }
    },

}

module.exports = NWController;