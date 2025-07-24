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
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha,
            cpf: req.body.cpf ? req.body.cpf.replace(/\D/g, '') : '', 
            ddd: req.body.ddd,
            telefone: req.body.telefone,
        };

        console.log('Etapa:', etapa);
        console.log('CPF recebido:', req.body.cpf, '→ CPF limpo:', dadosCliente.cpf);
        console.log('Arquivos recebidos:', req.files);

        if (etapa == "1") {
            if (!listaErros.isEmpty()) {
                console.log('Erros na etapa 1:', listaErros);
                return res.render("pages/indexCadastroCliente", {
                    etapa: "1",
                    cardSucesso: false,
                    valores: dadosCliente,
                    listaErros: listaErros,
                });
            }

            return res.render("pages/indexCadastroCliente", {
                etapa: "2",
                cardSucesso: true,
                valores: dadosCliente,
                listaErros: null,
            });
        }

        if (etapa == "2") {
            try {
                console.log('Processando etapa 2 - cadastro final');
                
                const imagemPerfil = req.files && req.files['input-imagem'] ? req.files['input-imagem'][0] : null;
                const imagemBanner = req.files && req.files['input-banner'] ? req.files['input-banner'][0] : null;

                console.log('Imagem perfil:', imagemPerfil ? `${imagemPerfil.originalname} (${imagemPerfil.size} bytes)` : 'Não enviada');
                console.log('Imagem banner:', imagemBanner ? `${imagemBanner.originalname} (${imagemBanner.size} bytes)` : 'Não enviada');

                dadosCliente.imagemPerfil = imagemPerfil;
                dadosCliente.imagemBanner = imagemBanner;

                return await NWController.cadastrarCliente(req, res);

            } catch (error) {
                console.error('Erro no upload de arquivos:', error.message);
                
                let mensagemErro = 'Erro no upload das imagens. Tente novamente.';
                
                if (error.message.includes('arquivos de imagem')) {
                    mensagemErro = error.message;
                } else if (error.message.includes('muito grande')) {
                    mensagemErro = error.message;
                } else if (error.message.includes('não suportado')) {
                    mensagemErro = error.message;
                } else if (error.code === 'LIMIT_FILE_SIZE') {
                    mensagemErro = 'Arquivo muito grande. Tamanho máximo permitido: 5MB';
                }
                
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
    }
);

router.post(
    "/cadastrarnutricionista",
    upload, // Middleware de upload
    NWController.validacaoCadNutri1,
    async function (req, res) {
        try {
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

            console.log('Etapa:', etapa, 'Dados:', dadosNutri);

            if (etapa === "1") {
                if (!listaErros.isEmpty()) {
                    return res.render("pages/indexCadastrarNutri", {
                        etapa: "1", card1: "", card2: "hidden", card3: "hidden", card4: "hidden",
                        valores: dadosNutri, listaErros: listaErros
                    });
                }
                return res.render("pages/indexCadastrarNutri", {
                    etapa: "2", card1: "hidden", card2: "", card3: "hidden", card4: "hidden",
                    valores: dadosNutri, listaErros: null
                });
            }

            if (etapa === "2") {
                return res.render("pages/indexCadastrarNutri", {
                    etapa: "3", card1: "hidden", card2: "hidden", card3: "", card4: "hidden",
                    valores: dadosNutri, listaErros: null
                });
            }

            if (etapa === "3") {
                return res.render("pages/indexCadastrarNutri", {
                    etapa: "4", card1: "hidden", card2: "hidden", card3: "hidden", card4: "",
                    valores: dadosNutri, listaErros: null
                });
            }

            if (etapa === "4") {
                const imagemPerfil = req.files && req.files['input-imagem'] ? req.files['input-imagem'][0] : null;
                const imagemBanner = req.files && req.files['input-banner'] ? req.files['input-banner'][0] : null;
                const certificadoFaculdade = req.files && req.files['certificadoFaculdade'] ? req.files['certificadoFaculdade'][0] : null;
                const certificadoCurso = req.files && req.files['certificadoCurso'] ? req.files['certificadoCurso'][0] : null;

                return await NWController.cadastrarNutricionista(req, res);
            }

        } catch (error) {
            console.error('Erro no router:', error.message);
            return res.render("pages/indexCadastrarNutri", {
                etapa: req.body.etapa || "1", card1: "", card2: "hidden", card3: "hidden", card4: "hidden",
                valores: req.body || {}, listaErros: { errors: [{ msg: 'Erro interno. Tente novamente.' }] }
            });
        }
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