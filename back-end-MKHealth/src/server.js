require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/database");

const PORT = process.env.PORT || 3000;

// Função para obter o IP local da máquina
const getLocalIp = () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
};

// ============================================
// 🚀 INICIANDO O SERVIDOR
// ============================================
console.log('🔄 Conectando ao banco de dados...');

sequelize.authenticate()
  .then(() => {
    console.log("✅ Banco conectado com sucesso");
    console.log("🔄 Iniciando servidor...");
  })
  .then(() => {
    // ✅ app.listen AQUI - SOMENTE AQUI!
    app.listen(PORT, '0.0.0.0', () => {
      const localIp = getLocalIp();
      console.log("\n========================================");
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📱 Acesse localmente: http://localhost:${PORT}`);
      console.log(`🌐 Acesse na rede: http://${localIp}:${PORT}`);
      console.log(`📡 API disponível em: http://${localIp}:${PORT}/api/usuarios`);
      console.log("========================================");
      console.log("\n📋 Rotas disponíveis:");
      console.log(`   GET  /health`);
      console.log(`   GET  /teste`);
      console.log(`   POST /api/usuarios/cadastro`);
      console.log(`   POST /api/usuarios/login`);
      console.log(`   GET  /api/usuarios`);
      console.log(`   GET  /api/usuarios/verificar`);
      console.log(`   GET  /api/usuarios/:id`);
      console.log(`   PUT  /api/usuarios/:id/foto`);
      console.log(`   DELETE /api/usuarios/:id`);
      console.log("========================================\n");
    });
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar no banco:", err);
    console.error("❌ Detalhes:", err.message);
    process.exit(1);
  });

// ============================================
// TRATAMENTO DE SINAIS
// ============================================
process.on('SIGINT', () => {
  console.log('\n🛑 Servidor encerrado por SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Servidor encerrado por SIGTERM');
  process.exit(0);
});