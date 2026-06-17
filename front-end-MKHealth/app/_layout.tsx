// app/_layout.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Href, Redirect, usePathname, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ExamesProvider } from '../service/ExamesContext';
import { BASE_URL } from '../service/api';
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

  // Não mostra drawer na tela de login e cadastro
  if (pathname === '/login' || pathname === '/RegisterScreen') return null;

  // Função para obter a URL completa da foto
  const getFotoUrl = (fotoPath: string | null): string | null => {
    if (!fotoPath) return null;
    if (fotoPath.startsWith('http')) return fotoPath;
    return `${BASE_URL}${fotoPath}`;
  };

  const fotoUrl = userData?.foto ? getFotoUrl(userData.foto) : null;

  // Menu items personalizados
  const menuItems: { label: string; icon: string; route: Href }[] = [
    { label: 'Home', icon: 'home', route: '/(tabs)' },
    { label: 'Sobre', icon: 'information', route: '/sobre' },
  ];

  return (
    <DrawerContentScrollView 
      {...props} 
      contentContainerStyle={styles.drawerContainer}
    >
      {/* Header com fundo vermelho igual às telas */}
      <View style={styles.drawerHeader}>
        <View style={styles.avatarContainer}>
          {fotoUrl ? (
            <Image 
              source={{ uri: fotoUrl }} 
              style={styles.avatarImage}
              onError={(e) => {
                console.log('❌ Drawer: Erro ao carregar foto:', e.nativeEvent.error);
              }}
            />
          ) : (
            <MaterialCommunityIcons name="account" size={50} color="#8B0000" />
          )}
        </View>
        
        <Text style={styles.userName}>
          {userData?.nome_completo || userData?.name || 'Usuário'}
        </Text>
        
        <View style={styles.userInfoContainer}>
          <View style={styles.userInfoRow}>
            <MaterialCommunityIcons name="account" size={16} color="#FFF" />
            <Text style={styles.userDetail}>
              CPF: {userData?.cpf || userData?.document || '---'}
            </Text>
          </View>
          <View style={styles.userInfoRow}>
            <MaterialCommunityIcons name="email" size={16} color="#FFF" />
            <Text style={styles.userDetail} numberOfLines={1}>
              {userData?.email || ''}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Itens do Menu */}
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
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons name={item.icon as any} size={24} color="#8B0000" />
            </View>
            <Text style={styles.menuItemLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Botão Sair */}
      <View style={styles.logoutButton}>
        <TouchableOpacity
          style={styles.logoutItem}
          onPress={handleLogout}
        >
          <View style={styles.menuIconContainer}>
            <MaterialCommunityIcons name="logout" size={24} color="#8B0000" />
          </View>
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

  useEffect(() => {
    verificarAutenticacao();
  }, []);

  useEffect(() => {
    verificarAutenticacao();
  }, [pathname, verificarAutenticacao]);

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

  if (!isAuthenticatedState && pathname !== '/login' && pathname !== '/RegisterScreen') {
    console.log('🚀 Redirecionando para login...');
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Redirect href="/login" />
      </GestureHandlerRootView>
    );
  }

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
            drawerStyle: { 
              width: '85%',
              backgroundColor: '#FFF',
            },
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
  drawerContainer: { 
    flex: 1,
    backgroundColor: '#FFF',
  },
  // HEADER VERMELHO IGUAL ÀS TELAS
  drawerHeader: {
    backgroundColor: '#8B0000',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFF',
    marginBottom: 10,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  userInfoContainer: {
    width: '100%',
    marginTop: 5,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  userDetail: {
    fontSize: 13,
    color: '#FFF',
    marginLeft: 6,
    textAlign: 'center',
    opacity: 0.9,
  },
  // ITENS DO MENU
  drawerItems: { 
    flex: 1,
    paddingTop: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  // BOTÃO SAIR
  logoutButton: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 10,
    paddingTop: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
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