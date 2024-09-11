var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");

router.get("/login", function (req, res) {
    res.render('pages/indexLogin', { retorno: null, valores: {email:"", senha:""}, listaErros: null});
});

router.post(
    "/entrar", 
    
    body("email").isEmail().withMessage("Insira um Email válido!"),
    body("senha").isLength({min:5}).withMessage("A senha deve conter 5 ou mais caracteres!"),
    
    function (req, res) {
        const listaErros = validationResult(req);
        if (listaErros.isEmpty()) {
            return res.redirect("/")
        }else {
            console.log(listaErros);
            return res.render("pages/indexLogin", {retorno: null, valores: {email: req.body.email, senha: req.body.senha}, listaErros:listaErros});
        }
    }
);

router.get("/cadastrocliente", function (req, res) {
    res.render('pages/indexCadastroCliente', { retorno: null, valores: {nome:"", email:"", senha:""}, listaErros: null});
});

router.post(
    "/cadastrarcliente", 
    
    body("nome").isLength({min:2}).withMessage("O nome deve conter 2 ou mais caracteres!"),
    body("email").isEmail().withMessage("Insira um Email válido!"),
    body("senha").isLength({min:5}).withMessage("A senha deve conter 5 ou mais caracteres!"),
    
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

router.get("/cadastronutri", function (req, res) {
    res.render('pages/indexCadastrarNutri', { retorno: null, valores: {nome:"", telefone:"", email:"", senha:"", area:"", crn:""}, listaErros: null});
});

router.post(
    "/cadastrarnutri", 
    
    body("nome").isLength({min:2}).withMessage("O nome deve conter 2 ou mais caracteres!"),
    body("telefone").isMobilePhone().withMessage("Insira um número de telefone válido!"),
    body("email").isEmail().withMessage("Insira um Email válido!"),
    body("senha").isLength({min:5}).withMessage("A senha deve conter 5 ou mais caracteres!"),
    body("area").isLength({min:2}).isAlpha().withMessage("Insira uma área da nutrição válida!"),
    body("crn").isLength({min:5}).withMessage("Insira um CRN válido!"),
    
    function (req, res) {
        const listaErros = validationResult(req);
        if (listaErros.isEmpty()) {
            return res.redirect("/")
        }else {
            console.log(listaErros);
            return res.render("pages/indexCadastrarNutri", {retorno: null, valores: {nome: req.body.nome, telefone: req.body.telefone, email: req.body.email, senha: req.body.senha, area: req.body.area, crn: req.body.crn}, listaErros:listaErros});
        }
    }
);


router.get("/", function (req, res) {
    res.render('pages/indexHome')
});

router.get("/cadastro", function (req, res) {
    res.render('pages/indexCadastrar')
});

router.get("/perfilnutri", function (req, res) {
    res.render('pages/indexPerfilNutri')
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


module.exports = router;