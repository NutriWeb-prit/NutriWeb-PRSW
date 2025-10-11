const express = require("express");
const ADMController = require("../controllers/ADMController");
const { body } = require("express-validator");
const router = express.Router();

const validacaoAtualizacaoUsuario = [
    body("nome")
        .isLength({ min: 2 })
        .withMessage("Nome deve ter no mínimo 2 caracteres"),
    body("email")
        .isEmail()
        .withMessage("Email inválido"),
    body("status")
        .isIn(["0", "1"])
        .withMessage("Status inválido")
];

router.get("/login", (req, res) => {
    ADMController.mostrarLoginADM(req, res);
});

router.use(ADMController.verificarAdmin);

router.get("/", (req, res) => {
    ADMController.dashboard(req, res);
});

router.get("/api/estatisticas", (req, res) => {
    ADMController.obterEstatisticas(req, res);
});

router.get("/usuarios", (req, res) => {
    ADMController.listarUsuarios(req, res);
});

router.get("/usuarios-detalhes", (req, res) => {
    ADMController.exibirDetalhes(req, res);
});

router.get("/usuarios-editar", (req, res) => {
    ADMController.exibirEdicao(req, res);
});

router.post(
    "/atualizar-usuario",
    validacaoAtualizacaoUsuario,
    (req, res) => {
        ADMController.atualizarUsuario(req, res);
    }
);

router.get("/usuarios-excluir", (req, res) => {
    ADMController.exibirExclusao(req, res);
});

router.post("/excluir-usuario", (req, res) => {
    ADMController.excluirUsuario(req, res);
});

module.exports = router;