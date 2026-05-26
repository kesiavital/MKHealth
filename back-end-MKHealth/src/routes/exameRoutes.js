const express = require('express');
const router = express.Router();
const exameController = require('../controllers/ExameController');
const { upload } = require('../config/upload');

// ============================================
// ROTAS DE EXAMES
// ============================================

// Health check já está no app principal, mas vamos manter por segurança
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rotas principais (sem barra no final)
router.post('/', upload.single('pdf'), exameController.criar);
router.get('/', exameController.listar);
router.get('/:id', exameController.buscarPorId);
router.put('/:id', upload.single('pdf'), exameController.atualizar);
router.delete('/:id', exameController.deletar);

// Rotas de PDF
router.get('/:id/download', exameController.downloadPdf);
router.get('/:id/visualizar', exameController.visualizarPdf);

// Rotas de busca (devem vir ANTES das rotas com :id)
router.get('/paciente/:nome', exameController.buscarPorPaciente);
router.get('/periodo', exameController.buscarPorPeriodo);
router.get('/estatisticas', exameController.estatisticas);

// Rota alternativa para stats (se seu frontend usa)
router.get('/stats', exameController.estatisticas);

// Rota de busca alternativa
router.get('/buscar/:nome', exameController.buscarPorPaciente);

console.log('✅ Rotas de exames registradas:');
console.log('  POST   /api/exames/');
console.log('  GET    /api/exames/');
console.log('  GET    /api/exames/:id');
console.log('  PUT    /api/exames/:id');
console.log('  DELETE /api/exames/:id');
console.log('  GET    /api/exames/:id/download');
console.log('  GET    /api/exames/:id/visualizar');
console.log('  GET    /api/exames/paciente/:nome');
console.log('  GET    /api/exames/periodo');
console.log('  GET    /api/exames/estatisticas');
console.log('  GET    /api/exames/stats');

module.exports = router;