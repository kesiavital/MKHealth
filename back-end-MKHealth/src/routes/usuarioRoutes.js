const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/UsuarioController');
const upload = require('../config/multer');

// Rotas públicas
router.post('/cadastro', upload.single('foto'), usuarioController.criar);
router.post('/login', usuarioController.logar);

// Rotas protegidas
router.get('/', usuarioController.listar);
router.get('/:id', usuarioController.buscarPorId);
router.put('/:id/foto', upload.single('foto'), usuarioController.atualizarFoto);
router.delete('/:id', usuarioController.deletar);

module.exports = router;