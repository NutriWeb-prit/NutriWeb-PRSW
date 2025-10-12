const express = require("express");
const ADMController = require("../controllers/ADMController");
const { body } = require("express-validator");
const router = express.Router();
const upload = require("../util/uploader.js");

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

router.get("/imagem/perfil/:usuarioId", async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId;
       
        if (isNaN(usuarioId)) {
            return res.status(400).send('ID inválido');
        }
       
        const NWModel = require("../models/NWModel");
        const imagem = await NWModel.findImagemPerfil(usuarioId);
       
        if (!imagem) {
            return res.status(404).send('Imagem não encontrada');
        }
       
        res.set({
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=300',
            'ETag': `perfil-adm-${usuarioId}-${Date.now()}`,
            'Vary': 'Accept-Encoding'
        });
       
        res.send(imagem);
       
    } catch (erro) {
        console.error("Erro ao servir imagem de perfil ADM:", erro);
        res.status(500).send('Erro interno');
    }
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
    upload,
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