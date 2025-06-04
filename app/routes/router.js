var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");

const NWController = require("../controllers/NWController");
const NWModel = require("../models/NWModel");

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
    NWController.validacaoCadCliente,
    async function (req, res) {
        const etapa = req.body.etapa;
        const listaErros = validationResult(req);

        const dadosCliente = {
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha,
            ddd: req.body.ddd,
            telefone: req.body.telefone,
        };

        if (etapa == "1") {

            if (!listaErros.isEmpty()) {
                console.log(listaErros);
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

            if (!listaErros.isEmpty()) {
                console.log(listaErros);
                return res.render("pages/indexCadastroCliente", {
                    etapa: "2",
                    cardSucesso: true,
                    valores: dadosCliente,
                    listaErros: listaErros,
                });
            }

            return await NWController.cadastrarCliente(req, res);
        }
    }
);


router.post(
    "/cadastrarnutricionista",
    NWController.validacaoCadNutri1,
    async function (req, res) {
        const etapa = req.body.etapa;
        const listaErros = validationResult(req);

        const dadosNutri = {
            nome: req.body.nome,
            telefone: req.body.ddd + req.body.telefone,
            email: req.body.email,
            senha: req.body.senha,
            area: req.body.area, // pode ser um array
            crn: req.body.crn,
            razaoSocial: req.body.razaoSocial,
            // Se quiser manter foto/banner temporários, adicione aqui.
        };

        if (etapa === "1") {
            if (!listaErros.isEmpty()) {
                console.log(listaErros);
                return res.render("pages/indexCadastrarNutri", {
                    etapa: "1",
                    card1Sucesso: false,
                    valores: dadosNutri,
                    listaErros: listaErros,
                });
            }

            // Passa para a etapa 2
            return res.render("pages/indexCadastrarNutri", {
                etapa: "2",
                card1Sucesso: true,
                valores: dadosNutri,
                listaErros: null
            });
        }

        if (etapa === "2") {
            // Salva imagem/banners no form? Apenas segue para etapa 3
            return res.render("pages/indexCadastrarNutri", {
                etapa: "3",
                card1Sucesso: true,
                valores: dadosNutri,
                listaErros: listaErros,
            });
        }

        if (etapa === "3") {
            // Última tela antes de envio
            return res.render("pages/indexCadastrarNutri", {
                etapa: "4",
                card1Sucesso: true,
                valores: dadosNutri,
                listaErros: listaErros,
            });
        }

        if (etapa === "4") {
            try {
                const dadosUsuarios = {
                    NomeCompleto: req.body.nome,
                    Email: req.body.email,
                    Senha: req.body.senha,
                    Telefone: req.body.telefone,
                    UsuarioTipo: 'N'
                };

                const dadosNutricionistas = {
                    Crn: req.body.crn,
                    RazaoSocial: req.body.razaoSocial
                };

                const especializacoes = Array.isArray(req.body.area)
                    ? req.body.area
                    : [req.body.area];

                await NWModel.createNutricionista(dadosUsuarios, dadosNutricionistas, especializacoes)

                return res.redirect("/");

            } catch (err) {
                console.log(listaErros);
                console.error("Erro ao cadastrar nutricionista:", err.message);
                return res.status(500).send("Erro ao cadastrar nutricionista");
            }
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
    res.render('pages/indexCadastroCliente', { retorno: null, etapa:"1", valores: {nome:"", email:"", senha:"", telefone:"", ddd:""}, listaErros: null});
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