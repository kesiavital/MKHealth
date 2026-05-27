const express = require('express');
const router = express.Router();

const exameController = require('../controllers/ExameController');
const { upload } = require('../config/upload');

// ============================================
// HEALTH CHECK
// ============================================

router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ROTAS DE BUSCA
// ============================================

router.get('/periodo', exameController.buscarPorPeriodo);

router.get('/estatisticas', exameController.estatisticas);

router.get('/stats', exameController.estatisticas);

router.get('/paciente/:nome', exameController.buscarPorPaciente);

router.get('/buscar/:nome', exameController.buscarPorPaciente);

// ============================================
// ROTAS PRINCIPAIS
// ============================================

router.post(
  '/',
  upload.single('pdf'),
  exameController.criar
);

router.get('/', exameController.listar);

// ============================================
// ROTAS PDF
// ============================================

router.get('/:id/download', exameController.downloadPdf);

router.get('/:id/visualizar', exameController.visualizarPdf);

// ============================================
// ROTAS COM ID (SEMPRE POR ÚLTIMO)
// ============================================

router.get('/:id', exameController.buscarPorId);

router.put(
  '/:id',
  upload.single('pdf'),
  exameController.atualizar
);

router.delete('/:id', exameController.deletar);

// ============================================

module.exports = router;