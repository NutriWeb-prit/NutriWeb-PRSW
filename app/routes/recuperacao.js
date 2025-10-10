const express = require('express');
const router = express.Router();
const RecuperacaoSenhaController = require('../controllers/recuperarSenhaController');
const { body } = require('express-validator');

const validarEmail = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email é obrigatório')
        .isEmail().withMessage('Email inválido')
        .isLength({ max: 50 }).withMessage('Email muito longo')
];

const validarNovaSenha = [
    body('senha')
        .notEmpty().withMessage('Senha é obrigatória')
        .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
        .matches(/[A-Z]/).withMessage('Deve conter letra maiúscula')
        .matches(/[a-z]/).withMessage('Deve conter letra minúscula')
        .matches(/[0-9]/).withMessage('Deve conter número'),
    
    body('confirmarSenha')
        .notEmpty().withMessage('Confirmação de senha é obrigatória')
        .custom((value, { req }) => {
            if (value !== req.body.senha) {
                throw new Error('As senhas não coincidem');
            }
            return true;
        })
];

router.get('/senha', RecuperacaoSenhaController.exibirPaginaRecuperacao);
router.post('/senha', validarEmail, RecuperacaoSenhaController.solicitarRecuperacao);

router.get('/redefinir-senha', RecuperacaoSenhaController.exibirPaginaRedefinicao);
router.post('/redefinir-senha', validarNovaSenha, RecuperacaoSenhaController.redefinirSenha);

module.exports = router;