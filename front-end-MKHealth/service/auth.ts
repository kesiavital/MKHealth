// service/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

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
    
    // Forçar navegação para login e impedir volta
    console.log('🚀 Redirecionando para tela de login...');
    
    // Usar replace para não permitir voltar
    router.replace('/login');
    
  } catch (error) {
    console.error('❌ Erro ao fazer logout:', error);
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