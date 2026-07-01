<<<<<<< HEAD
// routes/examesRoutes.js
const express = require("express");
const routes = express.Router();

const exameController = require("../controllers/ExameController");
const uploadConfig = require("../config/upload");
const { authMiddleware } = require("../middlewares/auth");
=======
const express = require('express');
const router = express.Router();
//const auth = require('../middlewares/authMiddleware');//
const exameController = require('../controllers/ExameController');
const { upload } = require('../config/upload');
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68

// Pega o upload do config
const { upload } = uploadConfig;

// ===============================
// HEALTH CHECK (PÚBLICO)
// ===============================
routes.get("/health", (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// ===============================
// ROTAS DE BUSCA (PROTEGIDAS)
// ===============================
routes.get("/periodo", authMiddleware, exameController.buscarPorPeriodo);
routes.get("/estatisticas", authMiddleware, exameController.estatisticas);
routes.get("/stats", authMiddleware, exameController.estatisticas);
routes.get("/paciente/:nome", authMiddleware, exameController.buscarPorPaciente);
routes.get("/buscar/:nome", authMiddleware, exameController.buscarPorPaciente);

<<<<<<< HEAD
// ===============================
// ROTAS PRINCIPAIS (PROTEGIDAS)
// ===============================
routes.post("/", authMiddleware, upload.single("pdf"), exameController.criar);
routes.get("/", authMiddleware, exameController.listar);
=======
router.get('/',exameController.listar); 

router.get('/periodo', exameController.buscarPorPeriodo);
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68

// ===============================
// 🔥 ROTA PDF - SEM AUTENTICAÇÃO (PÚBLICA)
// ===============================
routes.get("/:id/visualizar", exameController.visualizarPdf);

// ===============================
// ROTA DOWNLOAD (PROTEGIDA)
// ===============================
routes.get("/:id/download", authMiddleware, exameController.downloadPdf);

// ===============================
// ROTAS COM ID (PROTEGIDAS - SEMPRE POR ÚLTIMO)
// ===============================
routes.get("/:id", authMiddleware, exameController.buscarPorId);
routes.put("/:id", authMiddleware, upload.single("pdf"), exameController.atualizar);
routes.delete("/:id", authMiddleware, exameController.deletar);

module.exports = routes;