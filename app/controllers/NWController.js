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
            console.log('Iniciando processo de cadastro de cliente...');
            
            console.log('req.body completo:', req.body);
            console.log('req.body.area (interesses):', req.body.area);
            console.log('Tipo de req.body.area:', typeof req.body.area);
            
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
    
            // Função para validar imagens (mantida igual)
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
    
            // Limpar CPF
            const cpfLimpo = req.body.cpf ? req.body.cpf.replace(/\D/g, '') : '';
            if (!cpfLimpo) {
                throw new Error('CPF é obrigatório!');
            }
            
            const dadosUsuario = {
                NomeCompleto: req.body.nome,
                Email: req.body.email,
                Senha: req.body.senha,
                Telefone: req.body.ddd + req.body.telefone,
                UsuarioTipo: 'C'
            };
    
            let interessesSelecionados = [];
            
            if (req.body.area) {
                console.log('🔍 Processando interesses...');
                console.log('req.body.area recebido:', req.body.area);
                
                interessesSelecionados = Array.isArray(req.body.area) ? req.body.area : [req.body.area];
                
                console.log('Interesses após processamento:', interessesSelecionados);
                console.log('Quantidade de interesses:', interessesSelecionados.length);
                
                interessesSelecionados = interessesSelecionados.filter(interesse => 
                    interesse && interesse.trim() !== '' && interesse !== 'on'
                );
                
                console.log('Interesses após filtrar:', interessesSelecionados);
            } else {
                console.log('Nenhum interesse recebido (req.body.area está undefined/null)');
            }
    
            console.log('RESUMO DOS DADOS:');
            console.log('- Usuário:', dadosUsuario);
            console.log('- CPF limpo:', cpfLimpo);
            console.log('- Interesses selecionados:', interessesSelecionados);
            console.log('- Quantidade de interesses:', interessesSelecionados.length);
            console.log('- Imagens:', {
                perfil: imagemPerfil ? `${imagemPerfil.originalname} (${imagemPerfil.size} bytes)` : 'Não enviada',
                banner: imagemBanner ? `${imagemBanner.originalname} (${imagemBanner.size} bytes)` : 'Não enviada'
            });
    
            const resultado = await NWModel.createCliente(dadosUsuario, cpfLimpo, imagemPerfil, imagemBanner, interessesSelecionados);
    
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
            console.log('Iniciando cadastro de nutricionista no controller...');
            
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('Erros de validação no controller:', errors.array());
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
    
            console.log('req.body completo:', req.body);
            console.log('req.body.area (especialidades):', req.body.area);
            console.log('Tipo de req.body.area:', typeof req.body.area);
    
            const imagemPerfil = req.body.imagemPerfilData ? JSON.parse(req.body.imagemPerfilData) : null
            const imagemBanner = req.body.imagemBannerData ? JSON.parse(req.body.imagemBannerData) : null
            
            const certificadoFaculdade = req.files && req.files['certificadoFaculdade'] ? req.files['certificadoFaculdade'][0] : null;
            const certificadoCurso = req.files && req.files['certificadoCurso'] ? req.files['certificadoCurso'][0] : null;
    
            console.log('Arquivos recebidos no controller:');
            console.log('- Perfil:', imagemPerfil ? `${imagemPerfil.originalname} (${imagemPerfil.size} bytes)` : 'Não enviada');
            console.log('- Banner:', imagemBanner ? `${imagemBanner.originalname} (${imagemBanner.size} bytes)` : 'Não enviada');
            console.log('- Cert. Faculdade:', certificadoFaculdade ? `${certificadoFaculdade.originalname} (${certificadoFaculdade.size} bytes)` : 'Não enviado');
            console.log('- Cert. Curso:', certificadoCurso ? `${certificadoCurso.originalname} (${certificadoCurso.size} bytes)` : 'Não enviado');
    
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
    
            let especializacoesSelecionadas = [];
            
            if (req.body.area) {
                console.log('🔍 Processando especialidades...');
                console.log('req.body.area recebido:', req.body.area);
                
                especializacoesSelecionadas = Array.isArray(req.body.area) ? req.body.area : [req.body.area];
                
                console.log('Especialidades após processamento:', especializacoesSelecionadas);
                console.log('Quantidade de especialidades:', especializacoesSelecionadas.length);
                
                especializacoesSelecionadas = especializacoesSelecionadas.filter(especialidade => 
                    especialidade && especialidade.trim() !== '' && especialidade !== 'on'
                );
                
                console.log('Especialidades após filtrar:', especializacoesSelecionadas);
            } else {
                console.log('Nenhuma especialidade recebida (req.body.area está undefined/null)');
            }
    
            const certificados = {
                faculdade: certificadoFaculdade,
                curso: certificadoCurso
            };
    
            console.log('RESUMO DOS DADOS:');
            console.log('- Usuário:', dadosUsuario);
            console.log('- Nutricionista:', dadosNutricionista);
            console.log('- Formação:', formacao);
            console.log('- Especialidades selecionadas:', especializacoesSelecionadas);
            console.log('- Quantidade de especialidades:', especializacoesSelecionadas.length);
            console.log('- Certificados:', {
                faculdade: certificadoFaculdade ? `${certificadoFaculdade.originalname} (${certificadoFaculdade.size} bytes)` : 'Não enviado',
                curso: certificadoCurso ? `${certificadoCurso.originalname} (${certificadoCurso.size} bytes)` : 'Não enviado'
            });
    
            const result = await NWModel.createNutricionista(
                dadosUsuario,
                dadosNutricionista,
                especializacoesSelecionadas,
                imagemPerfil,
                imagemBanner,
                formacao,
                certificados
            );
    
            console.log("Nutricionista cadastrado com sucesso:", result);
            return res.redirect("/login?cadastro=sucesso");
    
        } catch (error) {
            console.error("Erro no processo de cadastro:", error.message);
            
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