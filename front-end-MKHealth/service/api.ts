<<<<<<< HEAD
// ========================================
// service/api.ts
// Configuração centralizada da API
// ========================================
=======
//api atual que ta funcionando:
const LOCAL_IP = '10.209.144.135'; // Substitua pelo IP local\atual
const PORTA = '3000';
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68

// IP DO COMPUTADOR ONDE O BACKEND ESTÁ RODANDO
// Altere apenas esta linha quando mudar de rede.
const LOCAL_IP = "192.168.0.12";

<<<<<<< HEAD
const PORTA = "3000";
=======
// Força o uso do IP de ancoragem
const HOST = LOCAL_IP; 
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68

// Host utilizado pela aplicação
const HOST = LOCAL_IP;

// URL base
export const BASE_URL = `http://${HOST}:${PORTA}`;

<<<<<<< HEAD
// URL da API
=======
// ...
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
export const API_URL = `${BASE_URL}/api`;

// Rotas
export const USUARIOS_URL = `${API_URL}/usuarios`;
export const EXAMES_URL = `${API_URL}/exames`;

// Exporta o host para compatibilidade com outros arquivos
export default HOST;

<<<<<<< HEAD
// Função para montar qualquer rota
export const getFullUrl = (path: string): string => {
  return `${BASE_URL}${path}`;
};
=======
// Para manter compatibilidade com telas que usam IP direto
export const getFullUrl = (path: string) => `${BASE_URL}${path}`;



>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
