var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");

router.post(
    "/entrar", 
    
    body("email").isEmail().withMessage("Insira um Email válido!"),
    body("senha").isLength({min:5}).withMessage("A senha deve conter 5 ou mais caracteres!"),
    
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
    
    body("nome").isLength({min:2}).withMessage("O nome deve conter 2 ou mais caracteres!"),
    body("email").isEmail().withMessage("Insira um Email válido!"),
    body("senha")
        .isLength({min:5}).withMessage("Insira uma senha válida!")
        .matches(/[A-Z]/).withMessage("Insira uma senha válida!")
        .matches(/[a-z]/).withMessage("Insira uma senha válida!")
        .matches(/\d/).withMessage("Insira uma senha válida!")
        .matches(/[\W_]/).withMessage("Insira uma senha válida!"),
    
    function (req, res) {
        const listaErros = validationResult(req);
        if (listaErros.isEmpty()) {
            return res.redirect("/")
        }else {
            console.log(listaErros);
            return res.render("pages/indexCadastroCliente", {retorno: null, valores: {email: req.body.email, senha: req.body.senha}, listaErros:listaErros});
        }
    }
);

router.post(
    "/card1", 
    
    body("nome").isLength({min:2}).withMessage("O nome deve conter 2 ou mais caracteres!"),
    body("telefone").isMobilePhone().withMessage("Insira um número de telefone válido!"),
    body("email").isEmail().withMessage("Insira um Email válido!"),
    body("senha")
        .isLength({min:5}).withMessage("Insira uma senha válida!")
        .matches(/[A-Z]/).withMessage("Insira uma senha válida!")
        .matches(/[a-z]/).withMessage("Insira uma senha válida!")
        .matches(/\d/).withMessage("Insira uma senha válida!")
        .matches(/[\W_]/).withMessage("Insira uma senha válida!"),
    body("area").isLength({min:2}).withMessage("Selecione no mínimo uma especialização!"),
    body("crn").isLength({min:5}).withMessage("Insira um CRN válido!"),
    
    function (req, res) {
        const listaErros = validationResult(req);
        let card1Sucesso = false;
        if (listaErros.isEmpty()) {
            card1Sucesso = true;
        }

        return res.render("pages/indexCadastrarNutri", {
            card1Sucesso: card1Sucesso,
            valores: {
                nome: req.body.nome,
                telefone: req.body.telefone,
                email: req.body.email,
                senha: req.body.senha,
                area: req.body.area,
                crn: req.body.crn
            },
            listaErros: listaErros.isEmpty() ? null : listaErros
        });
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
    res.render('pages/indexCadastroCliente', { retorno: null, valores: {nome:"", email:"", senha:""}, listaErros: null});
});

router.get("/cadastronutri", function (req, res) {
    res.render('pages/indexCadastrarNutri', { retorno: null, valores: {nome:"", telefone:"", email:"", senha:"", area:"", crn:""}, listaErros: null});
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