const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/UsuarioController');
const upload = require('../config/multer');
const auth = require("../middleware/auth");

// ============================================
// 🔴 ATENÇÃO: ROTAS ESPECÍFICAS PRIMEIRO!
// ============================================

// 1. Rota de verificação
router.get('/verificar', auth, usuarioController.verificarUsuarios);

// 2. Cadastro
router.post('/cadastro', upload.single('foto'), usuarioController.criar);

// 3. LOGIN - TEM QUE VIR ANTES DO /:id !
router.post('/login', usuarioController.logar);

// 4. Listar todos
router.get('/', auth, usuarioController.listar);

// ============================================
// 🔥 ROTAS DE RECUPERAÇÃO DE SENHA
// ============================================

// 5. Verificar email (recuperação de senha)
router.post('/verificar-email', usuarioController.verificarEmail);

// 6. Redefinir senha
router.post('/redefinir-senha', usuarioController.redefinirSenha);

// ============================================
// 🟢 ROTAS COM :id - DEPOIS das específicas
// ============================================

// 7. Buscar por ID
router.get('/:id', auth, usuarioController.buscarPorId);

// 8. Atualizar foto
router.put('/:id/foto', auth, upload.single('foto'), usuarioController.atualizarFoto);

// 9. Deletar
router.delete('/:id', auth, usuarioController.deletar);

module.exports = router;