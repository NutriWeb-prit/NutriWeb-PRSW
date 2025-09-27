const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const NWController = require('../controllers/NWController');

router.get('/', [
    query('q')
        .optional() // Campo opcional
        .isLength({ min: 2 })
        .withMessage('O termo de busca deve ter pelo menos 2 caracteres')
        .trim() // Remove espaços no início e fim
], NWController.buscar);

module.exports = router;