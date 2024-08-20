var express = require("express");
var router = express.Router();


router.get("/", function (req, res) {
    res.render('pages/indexHome')
});

router.get("/login", function (req, res) {
    res.render('pages/indexLogin')
});

router.get("/cadastro", function (req, res) {
    res.render('pages/indexCadastrar')
});

router.get("/cadastronutri", function (req, res) {
    res.render('pages/indexCadastrarNutri')
});

router.get("/cadastrocliente", function (req, res) {
    res.render('pages/indexCadastroCliente')
});

router.get("/entrar", function (req, res) {
    res.render('pages/indexEntrar')
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