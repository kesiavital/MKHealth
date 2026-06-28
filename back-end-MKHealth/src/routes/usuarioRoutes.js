// routes/usuarioRoutes.js
const express = require("express");
const routes = express.Router();

const usuarioController = require("../controllers/UsuarioController");
const uploadConfig = require("../config/upload");
const { authMiddleware } = require("../middlewares/auth");

// Pega o upload do config
const { upload } = uploadConfig;

// ===============================
// LOGIN (PÚBLICO)
// ===============================
routes.post("/login", usuarioController.logar);

// ===============================
// CADASTRO (PÚBLICO)
// ===============================
routes.post("/cadastro", upload.single("foto"), usuarioController.criar);

// ===============================
// VERIFICAR EMAIL (PÚBLICO)
// ===============================
routes.post("/verificar-email", usuarioController.verificarEmail);

// ===============================
// REDEFINIR SENHA (PÚBLICO)
// ===============================
routes.post("/redefinir-senha", usuarioController.redefinirSenha);

// ===============================
// VERIFICAR USUÁRIOS (PROTEGIDO)
// ===============================
routes.get("/verificar", authMiddleware, usuarioController.verificarUsuarios);

// ===============================
// LISTAR (PROTEGIDO)
// ===============================
routes.get("/", authMiddleware, usuarioController.listar);

// ===============================
// BUSCAR POR ID (PROTEGIDO)
// ===============================
routes.get("/:id", authMiddleware, usuarioController.buscarPorId);

// ===============================
// ATUALIZAR FOTO (PROTEGIDO)
// ===============================
routes.put("/:id/foto", authMiddleware, upload.single("foto"), usuarioController.atualizarFoto);

// ===============================
// DELETAR (PROTEGIDO)
// ===============================
routes.delete("/:id", authMiddleware, usuarioController.deletar);

module.exports = routes;