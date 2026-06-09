// service/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const logout = async () => {
  try {
    console.log('🚪 ========================================');
    console.log('🚪 REALIZANDO LOGOUT');
    console.log('🚪 ========================================');
    
    // Verificar o que tem antes de limpar
    const tokenBefore = await AsyncStorage.getItem('token');
    const usuarioBefore = await AsyncStorage.getItem('usuario');
    console.log('📦 Antes do logout - Token:', tokenBefore ? '✅ Presente' : '❌ Ausente');
    console.log('📦 Antes do logout - Usuário:', usuarioBefore ? '✅ Presente' : '❌ Ausente');
    
    // Limpar todos os dados de autenticação
    await AsyncStorage.multiRemove(['token', 'usuario', '@user_session']);
    
    // Verificar se limpou
    const tokenAfter = await AsyncStorage.getItem('token');
    const usuarioAfter = await AsyncStorage.getItem('usuario');
    console.log('📦 Depois do logout - Token:', tokenAfter ? '⚠️ Ainda presente' : '✅ Limpo');
    console.log('📦 Depois do logout - Usuário:', usuarioAfter ? '⚠️ Ainda presente' : '✅ Limpo');
    
    console.log('✅ Usuário deslogado com sucesso');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao fazer logout:', error);
    return false;
  }
};

export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Erro ao buscar token:', error);
    return null;
  }
};

export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('usuario');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return null;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('token');
    const usuario = await AsyncStorage.getItem('usuario');
    const isAuth = !!(token && usuario);
    console.log('🔐 Verificando autenticação:', isAuth ? '✅ Logado' : '❌ Não logado');
    return isAuth;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return false;
  }
};

// Função para salvar dados do usuário após login
export const saveUserData = async (token: string, userData: any) => {
  try {
    console.log('💾 Salvando dados do usuário no auth...');
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('usuario', JSON.stringify(userData));
    console.log('✅ Dados salvos com sucesso no auth');
    
    // Verificar se salvou
    const savedToken = await AsyncStorage.getItem('token');
    const savedUser = await AsyncStorage.getItem('usuario');
    
    if (savedToken && savedUser) {
      console.log('✅ Verificação: Dados confirmados');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Erro ao salvar dados:', error);
    return false;
  }
};