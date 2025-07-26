const NWModel = require("../models/NWModel");
const {body, validationResult} = require("express-validator");

const bcrypt = require('bcryptjs');

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


    /* --------------------------------------- MÉTODOS ------------------------------------ */

    cadastrarCliente: async (req, res) => {
        try {
            // ver erros de validaçao
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
            return res.redirect('/login?cadastro=sucesso');
    
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
    
            // Recuperar imagens dos campos hidden (Base64 → Buffer)
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
            
            // Certificados (recebidos diretamente do upload)
            const certificadoFaculdade = req.files && req.files['certificadoFaculdade'] ? req.files['certificadoFaculdade'][0] : null;
            const certificadoCurso = req.files && req.files['certificadoCurso'] ? req.files['certificadoCurso'][0] : null;
    
            // Criptografar senha
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
    
            // Processar especialidades
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
            return res.redirect("/login?cadastro=sucesso");
    
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