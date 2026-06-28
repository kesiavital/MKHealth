// middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-jwt';

const authMiddleware = async (req, res, next) => {
  try {
    // Busca o token no header Authorization
    let token = req.headers.authorization?.split(' ')[1];
    
    // 🔥 SE NÃO TIVER NO HEADER, TENTA NA QUERY STRING
    if (!token && req.query.token) {
      token = req.query.token;
    }
    
    if (!token) {
      return res.status(401).json({ 
        erro: 'Token não fornecido ou formato inválido' 
      });
    }
    
    // Verifica o token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Adiciona os dados do usuário ao request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ erro: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ erro: 'Token expirado' });
    }
    return res.status(500).json({ erro: 'Erro ao validar token' });
  }
};

module.exports = { authMiddleware, JWT_SECRET };