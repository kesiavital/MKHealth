const express = require("express");
const cors = require("cors");
const path = require('path');
const fs = require('fs');
const routes = require("./routes/usuarioRoutes");
const exameRoutes = require("./routes/exameRoutes");

const app = express();

// Configurar limites maiores para upload
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// 🔍 LOG DE TODAS AS REQUISIÇÕES (DEBUG)
// ============================================
app.use((req, res, next) => {
  console.log(`\n🔍 [${req.method}] ${req.originalUrl}`);
  console.log('🔍 Params:', req.params);
  console.log('🔍 Query:', req.query);
  console.log('🔍 Body:', req.body);
  next();
});

// ============================================
// 🏥 ROTA DE HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Servidor rodando!'
  });
});

// ============================================
// 🧪 ROTA DE TESTE
// ============================================
app.get('/teste', (req, res) => {
  res.json({ 
    mensagem: '✅ Servidor funcionando!',
    rotas_disponiveis: {
      health: 'GET /health',
      teste: 'GET /teste',
      cadastro: 'POST /api/usuarios/cadastro',
      login: 'POST /api/usuarios/login',
      usuarios: 'GET /api/usuarios',
      verificar: 'GET /api/usuarios/verificar',
      'usuario_id': 'GET /api/usuarios/:id',
      'atualizar_foto': 'PUT /api/usuarios/:id/foto',
      'deletar': 'DELETE /api/usuarios/:id'
    }
  });
});

// ============================================
// 📁 SERVIDOR DE ARQUIVOS ESTÁTICOS
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
// 🐛 ROTAS DE DEBUG
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

// ============================================
// 📡 ROTAS DA API
// ============================================
app.use("/api/usuarios", routes);
app.use("/api/exames", exameRoutes);

// ============================================
// ❌ MIDDLEWARE 404 - ROTA NÃO ENCONTRADA
// ============================================
app.use((req, res) => {
  console.log(`❌ Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    erro: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method,
    rotas_disponiveis: {
      health: 'GET /health',
      teste: 'GET /teste',
      cadastro: 'POST /api/usuarios/cadastro',
      login: 'POST /api/usuarios/login',
      usuarios: 'GET /api/usuarios',
      verificar: 'GET /api/usuarios/verificar',
      'usuario_id': 'GET /api/usuarios/:id',
      'atualizar_foto': 'PUT /api/usuarios/:id/foto',
      'deletar': 'DELETE /api/usuarios/:id'
    }
  });
});

// ============================================
// ⚠️ MIDDLEWARE DE ERRO
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.stack);
  res.status(500).json({ 
    erro: 'Erro interno do servidor',
    mensagem: err.message 
  });
});

// ============================================
// ✅ EXPORTA O APP (SEM app.listen)
// ============================================
module.exports = app;