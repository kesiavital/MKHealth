const express = require("express");
const cors = require("cors");
const path = require('path');
const routes = require("./routes/usuarioRoutes");
const usuarioController = require("./controllers/usuarioController");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições (para debug)
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// Rota de health check (deve vir ANTES das rotas da API)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Servidor rodando!'
  });
});

// CAMINHO CORRETO - USANDO APENAS 'uploads'
app.use('/uploads', express.static('uploads'));

// Usar as rotas da API
app.use("/api/usuarios", routes);

// Rota de login (mantida para compatibilidade)
app.post("/logar", usuarioController.logar);

// Middleware 404 - Captura qualquer requisição que não casou com nenhuma rota anterior
app.use((req, res) => {
  res.status(404).json({ 
    erro: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method,
    rotas_disponiveis: [
      'GET  /health',
      'POST /api/usuarios/logar',
      'POST /api/usuarios/',
      'GET  /api/usuarios/',
      'GET  /api/usuarios/:id',
      'GET  /api/usuarios/email/:email',
      'PUT  /api/usuarios/:id',
      'DELETE /api/usuarios/:id',
      'GET  /api/usuarios/estatisticas/geral',
      'POST /api/usuarios/verificar-token',
      'POST /api/usuarios/recuperar-senha',
      'POST /api/usuarios/redefinir-senha',
      'POST /logar'
    ]
  });
});

// Middleware de erro (deve ser o último)
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.stack);
  res.status(500).json({ 
    erro: 'Erro interno do servidor',
    mensagem: err.message 
  });
});

module.exports = app;