const express = require('express');
const routes = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Rotas públicas
routes.post('/logar', usuarioController.logar);
routes.post('/', usuarioController.criar);

// Rotas protegidas (opcionais)
routes.get('/', usuarioController.listar);
routes.get('/:id', usuarioController.buscarPorId);
routes.delete('/:id', usuarioController.deletar);

module.exports = routes;