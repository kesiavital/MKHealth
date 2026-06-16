const express = require("express");
const cors = require("cors");
const path = require('path');
const fs = require('fs');
const routes = require("./routes/usuarioRoutes");
const exameRoutes = require("./routes/exameRoutes");
const usuarioController = require("./controllers/UsuarioController");

const app = express();

// Configurar limites maiores para upload de PDF
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Log de requisições (para debug)
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Servidor rodando!'
  });
});

// ============================================
// CORREÇÃO: Servir arquivos estáticos com caminho ABSOLUTO
// ============================================
const uploadsPath = path.join(__dirname, 'uploads');
console.log('📁 Servindo arquivos estáticos de:', uploadsPath);

// Verificar se a pasta uploads existe
if (!fs.existsSync(uploadsPath)) {
  console.log('⚠️ Pasta uploads não existe, criando...');
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Criar pasta para fotos
const fotosPath = path.join(uploadsPath, 'foto');
if (!fs.existsSync(fotosPath)) {
  console.log('📸 Pasta foto não existe, criando...');
  fs.mkdirSync(fotosPath, { recursive: true });
}

// Verificar se a pasta exams existe
const examsPath = path.join(uploadsPath, 'exams');
if (!fs.existsSync(examsPath)) {
  console.log('⚠️ Pasta exams não existe, criando...');
  fs.mkdirSync(examsPath, { recursive: true });
}

// Servir arquivos estáticos
app.use('/uploads', express.static(uploadsPath));

// ============================================
// ROTA DE DEBUG
// ============================================
app.get('/debug/check-pdf', (req, res) => {
  const examsPathFull = path.join(__dirname, 'uploads', 'exams');
  let filesInExams = [];
  
  if (fs.existsSync(examsPathFull)) {
    filesInExams = fs.readdirSync(examsPathFull);
  }
  
  res.json({
    uploads_path: uploadsPath,
    exams_path: examsPathFull,
    arquivos_na_pasta_exams: filesInExams,
    total_arquivos: filesInExams.length
  });
});

// Rota de debug para verificar fotos
app.get('/debug/check-fotos', (req, res) => {
  const fotosPathFull = path.join(__dirname, 'uploads', 'foto');
  let filesInFotos = [];
  
  if (fs.existsSync(fotosPathFull)) {
    filesInFotos = fs.readdirSync(fotosPathFull);
  }
  
  res.json({
    fotos_path: fotosPathFull,
    arquivos_na_pasta_fotos: filesInFotos,
    total_fotos: filesInFotos.length
  });
});

// Usar as rotas da API
app.use("/api/usuarios", routes);
app.use("/api/exames", exameRoutes);

// Rota de login (já está nas rotas de usuário, mas mantida para compatibilidade)
app.post("/logar", usuarioController.logar);

// Middleware 404
app.use((req, res) => {
  res.status(404).json({ 
    erro: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.stack);
  res.status(500).json({ 
    erro: 'Erro interno do servidor',
    mensagem: err.message 
  });
});

module.exports = app;