//api atual que ta funcionando:
const LOCAL_IP = '10.209.144.135'; // Substitua pelo IP local\atual
const PORTA = '3000';

// Comentamos as regras antigas temporariamente
// const EMULATOR_HOST = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
// const HOST = Platform.OS === 'android' ? EMULATOR_HOST : LOCAL_IP;

// Força o uso do IP de ancoragem
const HOST = LOCAL_IP; 

export const BASE_URL = `http://${HOST}:${PORTA}`;

// ...
export const API_URL = `${BASE_URL}/api`;
export const USUARIOS_URL = `${API_URL}/usuarios`;
export const EXAMES_URL = `${API_URL}/exames`;

// Exporta o host no formato que suas telas esperam (para não quebrar)
export default HOST;

// Para manter compatibilidade com telas que usam IP direto
export const getFullUrl = (path: string) => `${BASE_URL}${path}`;



