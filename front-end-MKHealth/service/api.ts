// ========================================
// service/api.ts
// Configuração centralizada da API
// ========================================

// IP DO COMPUTADOR ONDE O BACKEND ESTÁ RODANDO
// Altere apenas esta linha quando mudar de rede.
const LOCAL_IP = "192.168.15.9";

const PORTA = "3000";

// Host utilizado pela aplicação
const HOST = LOCAL_IP;

// URL base
export const BASE_URL = `http://${HOST}:${PORTA}`;

// URL da API
export const API_URL = `${BASE_URL}/api`;

// Rotas
export const USUARIOS_URL = `${API_URL}/usuarios`;
export const EXAMES_URL = `${API_URL}/exames`;

// Exporta o host para compatibilidade com outros arquivos
export default HOST;

// Função para montar qualquer rota
export const getFullUrl = (path: string): string => {
  return `${BASE_URL}${path}`;
};