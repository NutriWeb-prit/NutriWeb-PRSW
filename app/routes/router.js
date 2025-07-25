var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");

const NWController = require("../controllers/NWController");
const NWModel = require("../models/NWModel");

const upload = require("../util/uploader.js");

router.post(
    "/entrar", 
    
    NWController.validacaoLogin,
    
    function (req, res) {
        const listaErros = validationResult(req);
        if (listaErros.isEmpty()) {
            return res.redirect('/');
        }else {
            console.log(listaErros);
            return res.render("pages/indexLogin", {retorno: null, valores: {email: req.body.email, senha: req.body.senha}, listaErros:listaErros});
        }
    }
);

router.post(
    "/cadastrarcliente",
    upload,
    NWController.validacaoCadCliente,
    async function (req, res) {
        const etapa = req.body.etapa;
        const listaErros = validationResult(req);

        const dadosCliente = {
            nome: req.body.nome || '',
            email: req.body.email || '',
            senha: req.body.senha || '',
            cpf: req.body.cpf || '',
            ddd: req.body.ddd || '',
            telefone: req.body.telefone || '',
            area: req.body.area || null 
        };

        console.log('ROUTER DEBUG CLIENTE:');
        console.log('- Etapa:', etapa);
        console.log('- req.body.area:', req.body.area);
        console.log('- Tipo area:', typeof req.body.area);
        console.log('- dadosCliente.area:', dadosCliente.area);
        console.log('- Arquivos recebidos:', req.files ? Object.keys(req.files) : 'Nenhum');

        if (etapa == "1") {
            console.log('Processando ETAPA 1...');
            
            if (!listaErros.isEmpty()) {
                console.log('Erros na etapa 1:', listaErros.array());
                return res.render("pages/indexCadastroCliente", {
                    etapa: "1",
                    cardSucesso: false,
                    valores: dadosCliente,
                    listaErros: listaErros,
                });
            }

            console.log('Etapa 1 validada, passando para etapa 2');
            console.log('Dados preservados:', dadosCliente);
            
            return res.render("pages/indexCadastroCliente", {
                etapa: "2",
                cardSucesso: true,
                valores: dadosCliente,
                listaErros: null,
            });
        }

        if (etapa == "2") {
            console.log('Processando ETAPA 2 - upload de imagens e cadastro final');
            console.log('Dados recebidos na etapa 2:', dadosCliente);
            
            try {
                // Função para validar imagens (igual ao nutricionista)
                const validarImagem = (arquivo, tipo) => {
                    if (!arquivo) return null;
                    
                    console.log(`Validando ${tipo}:`, {
                        nome: arquivo.originalname,
                        tamanho: arquivo.size,
                        tipo: arquivo.mimetype
                    });
                    
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
                    
                    console.log(`${tipo} validada com sucesso:`, arquivo.originalname, `(${arquivo.size} bytes)`);
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

                console.log('Imagens:');
                console.log('- Perfil:', imagemPerfil ? `${imagemPerfil.originalname} (${imagemPerfil.size} bytes)` : 'Não enviada');
                console.log('- Banner:', imagemBanner ? `${imagemBanner.originalname} (${imagemBanner.size} bytes)` : 'Não enviada');

                dadosCliente.imagemPerfil = imagemPerfil;
                dadosCliente.imagemBanner = imagemBanner;

                console.log('INTERESSES FINAIS ANTES DO CONTROLLER:');
                console.log('- req.body.area:', req.body.area);
                console.log('- dadosCliente.area:', dadosCliente.area);

                return await NWController.cadastrarCliente(req, res);

            } catch (error) {
                console.error('Erro na validação de imagens:', error.message);
                
                let mensagemErro = 'Erro no upload das imagens. Tente novamente.';
                
                if (error.message.includes('muito grande')) {
                    mensagemErro = error.message;
                } else if (error.message.includes('não suportado')) {
                    mensagemErro = error.message;
                } else if (error.message.includes('formato') || error.message.includes('inválido')) {
                    mensagemErro = error.message;
                } else if (error.code === 'LIMIT_FILE_SIZE') {
                    mensagemErro = 'Arquivo muito grande. Tamanho máximo permitido: 5MB';
                }
                
                console.log('Retornando erro para etapa 2:', mensagemErro);
                
                return res.render("pages/indexCadastroCliente", {
                    etapa: "2",
                    cardSucesso: true,
                    valores: dadosCliente,
                    listaErros: { 
                        errors: [{ msg: mensagemErro }] 
                    },
                });
            }
        }

        console.log('Etapa inválida:', etapa);
        return res.redirect('/cadastrarcliente');
    }
);

router.post(
    "/cadastrarnutricionista",
    upload, // Middleware de upload
    NWController.validacaoCadNutri1,
    async function (req, res) {
        const etapa = req.body.etapa;
        const listaErros = validationResult(req);

        const dadosNutri = {
            nome: req.body.nome || '',
            telefone: req.body.telefone || '',
            ddd: req.body.ddd || '',
            email: req.body.email || '',
            senha: req.body.senha || '',
            area: req.body.area || [],
            crn: req.body.crn || '',
            sobreMim: req.body.sobreMim || '',
            faculdade: req.body.faculdade || '',
            faculdadeOrg: req.body.faculdadeOrg || '',
            curso: req.body.curso || '',
            cursoOrg: req.body.cursoOrg || ''
        };

        console.log('ROUTER DEBUG NUTRICIONISTA:');
        console.log('- Etapa:', etapa);
        console.log('- req.body.area:', req.body.area);
        console.log('- Tipo area:', typeof req.body.area);
        console.log('- dadosNutri.area:', dadosNutri.area);
        console.log('- Arquivos recebidos:', req.files ? Object.keys(req.files) : 'Nenhum');

        if (etapa === "1") {
            console.log('Processando ETAPA 1...');
            
            if (!listaErros.isEmpty()) {
                console.log('Erros na etapa 1:', listaErros.array());
                return res.render("pages/indexCadastrarNutri", {
                    etapa: "1", 
                    card1: "", 
                    card2: "hidden", 
                    card3: "hidden", 
                    card4: "hidden",
                    cardSucesso: false,
                    valores: dadosNutri, 
                    listaErros: listaErros
                });
            }

            console.log('Etapa 1 validada, passando para etapa 2');
            console.log('Dados preservados:', dadosNutri);
            
            return res.render("pages/indexCadastrarNutri", {
                etapa: "2", 
                card1: "hidden", 
                card2: "", 
                card3: "hidden", 
                card4: "hidden",
                cardSucesso: true,
                valores: dadosNutri, 
                listaErros: null
            });
        }

        if (etapa === "2") {
            console.log('Processando ETAPA 2 - upload de imagens');
            console.log('Dados preservados na etapa 2:', dadosNutri);
            
            try {
                // Função para validar imagens (igual ao controller do cliente)
                const validarImagem = (arquivo, tipo) => {
                    if (!arquivo) return null;
                    
                    console.log(`Validando ${tipo}:`, {
                        nome: arquivo.originalname,
                        tamanho: arquivo.size,
                        tipo: arquivo.mimetype
                    });
                    
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
                    
                    console.log(`${tipo} validada com sucesso:`, arquivo.originalname, `(${arquivo.size} bytes)`);
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

                console.log('Imagens:');
                console.log('- Perfil:', imagemPerfil ? `${imagemPerfil.originalname} (${imagemPerfil.size} bytes)` : 'Não enviada');
                console.log('- Banner:', imagemBanner ? `${imagemBanner.originalname} (${imagemBanner.size} bytes)` : 'Não enviada');

                dadosNutri.imagemPerfil = imagemPerfil;
                dadosNutri.imagemBanner = imagemBanner;

                console.log('Todas as imagens validadas com sucesso, passando para etapa 3');
                
                return res.render("pages/indexCadastrarNutri", {
                    etapa: "3", 
                    card1: "hidden", 
                    card2: "hidden", 
                    card3: "", 
                    card4: "hidden",
                    cardSucesso: true,
                    valores: dadosNutri, 
                    listaErros: null
                });

            } catch (error) {
                console.error('Erro na validação de imagens:', error.message);
                
                let mensagemErro = 'Erro no upload das imagens. Tente novamente.';
                
                if (error.message.includes('muito grande')) {
                    mensagemErro = error.message;
                } else if (error.message.includes('não suportado')) {
                    mensagemErro = error.message;
                } else if (error.message.includes('formato') || error.message.includes('inválido')) {
                    mensagemErro = error.message;
                } else if (error.code === 'LIMIT_FILE_SIZE') {
                    mensagemErro = 'Arquivo muito grande. Tamanho máximo permitido: 5MB';
                }
                
                console.log('Retornando erro para etapa 2:', mensagemErro);
                
                return res.render("pages/indexCadastrarNutri", {
                    etapa: "2", 
                    card1: "hidden", 
                    card2: "", 
                    card3: "hidden", 
                    card4: "hidden",
                    cardSucesso: true,
                    valores: dadosNutri,
                    listaErros: { 
                        errors: [{ msg: mensagemErro }] 
                    }
                });
            }
        }

        if (etapa === "3") {
            console.log('Processando ETAPA 3...');
            console.log('Dados preservados na etapa 3:', dadosNutri);
            
            // Recuperar imagens dos campos hidden (se existirem)
            if (req.body.imagemPerfilData && req.body.imagemBannerData) {
                console.log('Recuperando imagens dos campos hidden...');
                
                // Reconstruir objeto das imagens a partir dos dados hidden
                dadosNutri.imagemPerfil = req.body.imagemPerfilData ? JSON.parse(req.body.imagemPerfilData) : null;
                dadosNutri.imagemBanner = req.body.imagemBannerData ? JSON.parse(req.body.imagemBannerData) : null;
                
                console.log('Imagens recuperadas:');
                console.log('- Perfil:', dadosNutri.imagemPerfil ? dadosNutri.imagemPerfil.originalname : 'Não enviada');
                console.log('- Banner:', dadosNutri.imagemBanner ? dadosNutri.imagemBanner.originalname : 'Não enviada');
            }
            
            return res.render("pages/indexCadastrarNutri", {
                etapa: "4", 
                card1: "hidden", 
                card2: "hidden", 
                card3: "hidden", 
                card4: "",
                cardSucesso: true,
                valores: dadosNutri, 
                listaErros: null
            });
        }

        if (etapa === "4") {
            console.log('Processando ETAPA 4 - upload de certificados e cadastro final');
            console.log('Dados recebidos na etapa 4:', dadosNutri);
            
            // Recuperar imagens dos campos hidden ou dos arquivos anteriores
            if (req.body.imagemPerfilData || req.body.imagemBannerData) {
                console.log('Recuperando imagens dos campos hidden...');
                
                try {
                    dadosNutri.imagemPerfil = req.body.imagemPerfilData ? JSON.parse(req.body.imagemPerfilData) : null;
                    dadosNutri.imagemBanner = req.body.imagemBannerData ? JSON.parse(req.body.imagemBannerData) : null;
                    
                    console.log('Imagens recuperadas dos campos hidden:');
                    console.log('- Perfil:', dadosNutri.imagemPerfil ? dadosNutri.imagemPerfil.originalname : 'Não enviada');
                    console.log('- Banner:', dadosNutri.imagemBanner ? dadosNutri.imagemBanner.originalname : 'Não enviada');
                } catch (error) {
                    console.error('Erro ao recuperar imagens dos campos hidden:', error.message);
                    dadosNutri.imagemPerfil = null;
                    dadosNutri.imagemBanner = null;
                }
            }
            
            try {
                // Função para validar certificados (PDFs ou imagens)
                const validarCertificado = (arquivo, tipo) => {
                    if (!arquivo) return null;
                    
                    console.log(`Validando ${tipo}:`, {
                        nome: arquivo.originalname,
                        tamanho: arquivo.size,
                        tipo: arquivo.mimetype
                    });
                    
                    if (arquivo.size > 10 * 1024 * 1024) { // 10MB para certificados
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
                    
                    console.log(`${tipo} validado com sucesso:`, arquivo.originalname, `(${arquivo.size} bytes)`);
                    return arquivo;
                };

                const certificadoFaculdade = validarCertificado(
                    req.files && req.files['certificadoFaculdade'] ? req.files['certificadoFaculdade'][0] : null,
                    'certificado de faculdade'
                );
                
                const certificadoCurso = validarCertificado(
                    req.files && req.files['certificadoCurso'] ? req.files['certificadoCurso'][0] : null,
                    'certificado de curso'
                );

                console.log('Certificados:');
                console.log('- Certificado Faculdade:', certificadoFaculdade ? `${certificadoFaculdade.originalname} (${certificadoFaculdade.size} bytes)` : 'Não enviado');
                console.log('- Certificado Curso:', certificadoCurso ? `${certificadoCurso.originalname} (${certificadoCurso.size} bytes)` : 'Não enviado');

                dadosNutri.certificadoFaculdade = certificadoFaculdade;
                dadosNutri.certificadoCurso = certificadoCurso;

                console.log('DADOS FINAIS ANTES DO CONTROLLER:');
                console.log('- req.body.area:', req.body.area);
                console.log('- dadosNutri.area:', dadosNutri.area);
                console.log('- Imagens finais:', {
                    perfil: dadosNutri.imagemPerfil ? `${dadosNutri.imagemPerfil.originalname} (${dadosNutri.imagemPerfil.size} bytes)` : 'Não enviada',
                    banner: dadosNutri.imagemBanner ? `${dadosNutri.imagemBanner.originalname} (${dadosNutri.imagemBanner.size} bytes)` : 'Não enviada'
                });

                return await NWController.cadastrarNutricionista(req, res);

            } catch (error) {
                console.error('Erro na validação de certificados:', error.message);
                
                let mensagemErro = 'Erro no upload dos certificados. Tente novamente.';
                
                if (error.message.includes('muito grande')) {
                    mensagemErro = error.message;
                } else if (error.message.includes('não suportado')) {
                    mensagemErro = error.message;
                } else if (error.message.includes('formato') || error.message.includes('inválido')) {
                    mensagemErro = error.message;
                } else if (error.code === 'LIMIT_FILE_SIZE') {
                    mensagemErro = 'Arquivo muito grande. Tamanho máximo permitido: 10MB';
                }
                
                console.log('Retornando erro para etapa 4:', mensagemErro);
                
                return res.render("pages/indexCadastrarNutri", {
                    etapa: "4", 
                    card1: "hidden", 
                    card2: "hidden", 
                    card3: "hidden", 
                    card4: "",
                    cardSucesso: true,
                    valores: dadosNutri,
                    listaErros: { 
                        errors: [{ msg: mensagemErro }] 
                    }
                });
            }
        }

        console.log('Etapa inválida:', etapa);
        return res.redirect('/cadastrarnutricionista');
    }
);

router.post(
    "/publicaravaliacao", 
    
    body("avaliacao").isLength({min:1}).withMessage("Preencha a avaliação!"),
    
    function (req, res) {
        const listaErros = validationResult(req);
        if (listaErros.isEmpty()) {
            return res.redirect('/');
        }else {
            console.log(listaErros);
            return res.render("pages/indexPerfilNutri", {retorno: null, valores: {avaliacao: req.body.avaliacao}, listaErros:listaErros});
        }
    }
);

router.get("/login", function (req, res) {
    res.render('pages/indexLogin', { retorno: null, valores: {email:"", senha:""}, listaErros: null});
});

router.get("/cadastrocliente", function (req, res) {
    res.render('pages/indexCadastroCliente', { retorno: null, etapa:"1", valores: {nome:"", email:"", cpf:"", senha:"", telefone:"", ddd:""}, listaErros: null});
});

router.get("/cadastronutri", function (req, res) {
    res.render('pages/indexCadastrarNutri', { retorno: null, etapa:"1", valores: {nome:"", telefone:"", email:"", senha:"", area:"", crn:""}, listaErros: null});
});

router.get('/perfilnutri', function (req, res) {
    res.render('pages/indexPerfilNutri', { retorno: null, valores: {avaliacao:""}, listaErros: null});
});

router.get("/", function (req, res) {
    res.render('pages/indexHome')
});

router.get("/cadastro", function (req, res) {
    res.render('pages/indexCadastrar')
});

router.get("/profissionais", function (req, res) {
    res.render('pages/indexProfissionais')
});

router.get("/ranking", function (req, res) {
    res.render('pages/indexRanking')
});

router.get("/premium", function (req, res) {
    res.render('pages/indexPremium')
});

router.get("/tiponutri", function (req, res) {
    res.render('pages/indexTipoNutri')
});

router.get("/publicar", function (req, res) {
    res.render('pages/indexPublicar')
});

router.get("/perfilcliente", function (req, res) {
    res.render('pages/indexPerfilCliente')
});

module.exports = router;