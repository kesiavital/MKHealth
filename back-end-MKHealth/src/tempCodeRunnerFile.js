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
      // Pula interfaces não IPv4 e internas
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
  
};

sequelize.authenticate()
  .then(() => {
    console.log("✅ Banco conectado com sucesso");
    
    // Modificado para aceitar conexões de qualquer IP na rede
    app.listen(PORT, '0.0.0.0', () => {
      const localIp = getLocalIp();
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📱 Acesse localmente: http://localhost:${PORT}`);
      console.log(`🌐 Acesse na rede: http://${localIp}:${PORT}`);
      console.log(`📡 API disponível em: http://${localIp}:${PORT}/api/usuarios`);
    });
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar no banco:", err);
  });