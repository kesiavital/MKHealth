// service/api.ts
// Configuração centralizada da API

// IP DO SEU COMPUTADOR - ALTERE AQUI SE O IP MUDAR
const IP = '10.200.32.206';  // ← SEU IP ATUAL
const PORTA = '3000';

// URLs base (exporta da mesma forma que suas outras telas esperam)
export const BASE_URL = `http://${IP}:${PORTA}`;
export const API_URL = `${BASE_URL}/api`;
export const USUARIOS_URL = `${API_URL}/usuarios`;
export const EXAMES_URL = `${API_URL}/exames`;

// Exporta o IP no formato que suas telas esperam (para não quebrar)
export default IP;

// Para manter compatibilidade com telas que usam IP direto
export const getFullUrl = (path: string) => `${BASE_URL}${path}`;