// app/_layout.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Href, Redirect, usePathname, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ExamesProvider } from '../service/ExamesContext';
import { getUserData, isAuthenticated, logout } from '../service/auth';

function CustomDrawerContent(props: any) {
  const [userData, setUserData] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = async () => {
    const data = await getUserData();
    setUserData(data);
  };

  const handleLogout = async () => {
    try {
      Alert.alert(
        'Sair',
        'Tem certeza que deseja sair?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: async () => {
              props.navigation.closeDrawer();
              const logoutSuccess = await logout();
              
              if (logoutSuccess) {
                setUserData(null);
                setTimeout(() => {
                  router.replace('/login');
                }, 100);
              } else {
                Alert.alert('Erro', 'Não foi possível fazer logout');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível fazer logout');
    }
  };

  // CORRIGIDO: Não mostra drawer na tela de login E nem no cadastro
  if (pathname === '/login' || pathname === '/RegisterScreen') return null;

  // Menu items personalizados
  const menuItems: { label: string; icon: string; route: Href }[] = [
    { label: 'Home', icon: 'home', route: '/(tabs)' },
    { label: 'Sobre', icon: 'information', route: '/sobre' },
  ];

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <MaterialCommunityIcons name="account-circle" size={80} color="#8B0000" />
        <Text style={styles.userName}>{userData?.nome_completo || userData?.name || 'Usuário'}</Text>
        <Text style={styles.userDetail}>{userData?.cpf || userData?.document || '---'}</Text>
        <Text style={styles.userDetail}>{userData?.email || ''}</Text>
      </View>
      
      <View style={styles.drawerItems}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.route.toString()}
            style={styles.menuItem}
            onPress={() => {
              router.push(item.route);
              props.navigation.closeDrawer();
            }}
          >
            <MaterialCommunityIcons name={item.icon as any} size={24} color="#333" />
            <Text style={styles.menuItemLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.logoutButton}>
        <TouchableOpacity
          style={styles.logoutItem}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={24} color="#8B0000" />
          <Text style={styles.logoutLabel}>Sair</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

export default function RootLayout() {
  const [isAuthenticatedState, setIsAuthenticatedState] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  const verificarAutenticacao = useCallback(async () => {
    try {
      const authStatus = await isAuthenticated();
      console.log('🔐 Estado de autenticação:', authStatus ? 'Logado' : 'Não logado');
      setIsAuthenticatedState(authStatus);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setIsAuthenticatedState(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verifica ao carregar o app
  useEffect(() => {
    verificarAutenticacao();
  }, []);

  // Verifica sempre que a rota mudar
  useEffect(() => {
    verificarAutenticacao();
  }, [pathname, verificarAutenticacao]);

  // Tela de loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B0000" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  // CORRIGIDO: Permite acesso ao RegisterScreen mesmo sem estar autenticado
  // Se não estiver autenticado e não estiver na tela de login OU na tela de cadastro, redireciona
  if (!isAuthenticatedState && pathname !== '/login' && pathname !== '/RegisterScreen') {
    console.log('🚀 Redirecionando para login...');
    console.log('📍 Pathname atual:', pathname);
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Redirect href="/login" />
      </GestureHandlerRootView>
    );
  }

  // Se estiver autenticado e estiver na tela de login, redireciona para home
  if (isAuthenticatedState && pathname === '/login') {
    console.log('🚀 Usuário já logado, redirecionando para home...');
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Redirect href="/(tabs)" />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ExamesProvider>
        <Drawer
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerShown: false,
            drawerStyle: { width: '85%' },
            swipeEnabled: true,
          }}
        >
          <Drawer.Screen name="(tabs)" options={{ title: 'Home' }} />
          <Drawer.Screen name="sobre" options={{ title: 'Sobre' }} />
          <Drawer.Screen name="login" options={{ drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="RegisterScreen" options={{ drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="index" options={{ drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="admin" options={{ drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="modal" options={{ drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="esqueci" options={{ drawerItemStyle: { display: 'none' } }} />
        </Drawer>
      </ExamesProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerContainer: { flex: 1 },
  drawerHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#333',
    textAlign: 'center',
  },
  userDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
    textAlign: 'center',
  },
  drawerItems: { 
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 4,
    borderRadius: 8,
  },
  menuItemLabel: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  logoutLabel: {
    fontSize: 16,
    marginLeft: 15,
    color: '#8B0000',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B0000',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FFF',
  },
});