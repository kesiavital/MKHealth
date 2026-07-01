// service/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔥 CONSTANTES CENTRALIZADAS
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_DATA: 'userData',
};

// ============================================
// SALVAR DADOS DO USUÁRIO (APÓS LOGIN)
// ============================================
export const saveUserData = async (token: string, userData: any) => {
  try {
    console.log('💾 Salvando dados do usuário...');
    console.log('📌 Token:', token?.substring(0, 30) + '...');
    console.log('📌 UserData:', userData);
    
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    
    // Verificar se salvou
    const savedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    const savedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    
    if (savedToken && savedUser) {
      console.log('✅ Dados salvos com sucesso!');
      return true;
    }
    console.error('❌ Falha ao salvar dados');
    return false;
  } catch (error) {
    console.error('❌ Erro ao salvar dados:', error);
    return false;
  }
};

// ============================================
// BUSCAR TOKEN
// ============================================
export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    console.log('🔑 Token recuperado:', token ? '✅ Sim' : '❌ Não');
    return token;
  } catch (error) {
    console.error('❌ Erro ao buscar token:', error);
    return null;
  }
};

// ============================================
// BUSCAR DADOS DO USUÁRIO
// ============================================
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (userData) {
      console.log('👤 UserData recuperado:', '✅ Sim');
      return JSON.parse(userData);
    }
    console.log('👤 UserData recuperado:', '❌ Não');
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar userData:', error);
    return null;
  }
};

// ============================================
// VERIFICAR SE ESTÁ AUTENTICADO
// ============================================
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    const isAuth = !!(token && userData);
    console.log('🔐 Autenticado?', isAuth ? '✅ Sim' : '❌ Não');
    return isAuth;
  } catch (error) {
    console.error('❌ Erro ao verificar autenticação:', error);
    return false;
  }
};

// ============================================
// LOGOUT
// ============================================
export const logout = async () => {
  try {
<<<<<<< HEAD
    console.log('🚪 Realizando logout...');
    await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER_DATA]);
    console.log('✅ Logout realizado com sucesso');
=======
    console.log('🚪 ========================================');
    console.log('🚪 REALIZANDO LOGOUT');
    console.log('🚪 ========================================');
    
    // Verificar o que tem antes de limpar
    const tokenBefore = await AsyncStorage.getItem('token');
    const usuarioBefore = await AsyncStorage.getItem('userData');
    console.log('Antes do logout - Token:', tokenBefore ? 'Presente' : 'Ausente');
    console.log('Antes do logout - Usuário:', usuarioBefore ? 'Presente' : 'Ausente');
    
    // Limpar todos os dados de autenticação
    await AsyncStorage.multiRemove(['token', 'userData', '@user_session']);
    
    // Verificar se limpou
    const tokenAfter = await AsyncStorage.getItem('token');
    const usuarioAfter = await AsyncStorage.getItem('userData');
    console.log('Depois do logout - Token:', tokenAfter ? ' Ainda presente' : 'Limpo');
    console.log('Depois do logout - Usuário:', usuarioAfter ? 'Ainda presente' : 'Limpo');
    
    console.log('Usuário deslogado com sucesso');
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
    return true;
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return false;
  }
};

// ============================================
// REMOVER DADOS (alias para logout)
// ============================================
export const removeUserData = async () => {
  return await logout();
};

// ============================================
// OBTER USUÁRIO ATUAL
// ============================================
export const getCurrentUser = async () => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('❌ Erro ao buscar usuário atual:', error);
    return null;
  }
<<<<<<< HEAD
=======
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userData = await AsyncStorage.getItem('userData');
    const isAuth = !!(token && userData);
    console.log(' Verificando autenticação:', isAuth ? 'Logado' : ' Não logado');
    console.log('Token existe?', !!token);
    console.log('UserData existe?', !!userData);
    return isAuth;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return false;
  }
};

// Função para salvar dados do usuário após login
export const saveUserData = async (token: string, userData: any) => {
  try {
    console.log('Salvando dados do usuário no auth...');
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    console.log('Dados salvos com sucesso no auth');
    
    // Verificar se salvou
    const savedToken = await AsyncStorage.getItem('token');
    const savedUser = await AsyncStorage.getItem('userData');
    
    if (savedToken && savedUser) {
      console.log('Verificação: Dados confirmados');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    return false;
  }
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
};