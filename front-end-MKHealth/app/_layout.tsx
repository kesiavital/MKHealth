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
    console.log('📱 Dados do usuário no drawer:', data);
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
              if (props.navigation) {
                props.navigation.closeDrawer();
              }
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

  if (pathname === '/login' || pathname === '/RegisterScreen' || pathname === '/recuperarSenha') return null;

  const getFotoUrl = (fotoPath: string | null): string | null => {
    if (!fotoPath) return null;
    if (fotoPath.startsWith('http')) return fotoPath;
    return `${BASE_URL}${fotoPath}`;
  };

  const fotoUrl = userData?.foto ? getFotoUrl(userData.foto) : null;

  const getTipoUsuarioDescricao = (tipo: number): string => {
    return tipo === 1 ? 'Médico' : 'Paciente';
  };

  const getTipoUsuarioIcon = (tipo: number): string => {
    return tipo === 1 ? 'doctor' : 'account';
  };

  const getTipoUsuarioColor = (tipo: number): string => {
    return tipo === 1 ? '#2196F3' : '#4CAF50';
  };

  const menuItems: { label: string; icon: string; route: Href }[] = [
    { label: 'Home', icon: 'home', route: '/(tabs)' },
    { label: 'Sobre', icon: 'information', route: '/sobre' },
  ];

  const isAdmin = userData?.tipo_usuario === 1;

  const navigateTo = (route: string) => {
    if (props.navigation) {
      props.navigation.closeDrawer();
    }
    setTimeout(() => {
      router.push(route as Href);
    }, 200);
  };

  return (
    <DrawerContentScrollView 
      {...props} 
      contentContainerStyle={styles.drawerContainer}
    >
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
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {userData?.nome_completo?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.userName}>
          {userData?.nome_completo || userData?.name || 'Usuário'}
        </Text>
        
        {userData?.tipo_usuario !== undefined && (
          <View style={[
            styles.userTypeBadge,
            { backgroundColor: getTipoUsuarioColor(userData.tipo_usuario) }
          ]}>
            <MaterialCommunityIcons 
              name={getTipoUsuarioIcon(userData.tipo_usuario) as any} 
              color="#FFFFFF" 
              size={16} 
            />
            <Text style={styles.userTypeText}>
              {getTipoUsuarioDescricao(userData.tipo_usuario)}
            </Text>
          </View>
        )}
        
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
      
      <View style={styles.drawerItems}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.route.toString()}
            style={styles.menuItem}
            onPress={() => navigateTo(item.route.toString())}
          >
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons name={item.icon as any} size={24} color="#8B0000" />
            </View>
            <Text style={styles.menuItemLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        {isAdmin && (
          <>
            <View style={styles.divider} />
            
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('/RegisterScreen')}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <MaterialCommunityIcons name="account-plus" size={24} color="#2E7D32" />
              </View>
              <Text style={styles.menuItemLabel}>Cadastrar Usuário</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('/admin')}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <MaterialCommunityIcons name="shield-account" size={24} color="#E65100" />
              </View>
              <Text style={styles.menuItemLabel}>Admin</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('/recuperarSenha')}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <MaterialCommunityIcons name="key" size={24} color="#E65100" />
              </View>
              <Text style={styles.menuItemLabel}>Recuperar Senha</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      
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

function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    verificarAcesso();
  }, []);

  const verificarAcesso = async () => {
    try {
      const data = await getUserData();
      setUserData(data);
      console.log('🔐 Verificando acesso admin...');
      console.log('📌 Tipo usuário:', data?.tipo_usuario);
      
      if (data?.tipo_usuario !== 1) {
        console.log('🚫 Acesso negado!');
        Alert.alert(
          'Acesso Negado',
          'Esta área é restrita para médicos.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/(tabs)');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Erro ao verificar acesso:', error);
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B0000" />
        <Text style={styles.loadingText}>Verificando acesso...</Text>
      </View>
    );
  }

  if (userData?.tipo_usuario === 1) {
    return <>{children}</>;
  }

  return null;
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

  // 🔥 IMPORTANTE: Verificar sempre que a rota mudar
  useEffect(() => {
    verificarAutenticacao();
  }, [pathname]);

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

  const publicRoutes = ['/login', '/RegisterScreen', '/recuperarSenha'];

  // 🔥 REGRA 1: Não logado e em rota privada → vai pro login
  if (!isAuthenticatedState && !publicRoutes.includes(pathname)) {
    console.log('🚀 Redirecionando para login...');
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Redirect href="/login" />
      </GestureHandlerRootView>
    );
  }

  // 🔥 REGRA 2: Logado e em rota pública → vai pra home
  if (isAuthenticatedState && publicRoutes.includes(pathname)) {
    console.log('🚀 Usuário logado, redirecionando para home...');
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Redirect href="/(tabs)" />
      </GestureHandlerRootView>
    );
  }

  // 🔥 REGRA 3: Rota Admin
  if (pathname === '/admin') {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AdminRouteGuard>
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
            <Drawer.Screen name="admin" options={{ title: 'Admin' }} />
          </Drawer>
        </AdminRouteGuard>
      </GestureHandlerRootView>
    );
  }

  // 🔥 REGRA 4: Rotas principais com Drawer
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
          <Drawer.Screen name="recuperarSenha" options={{ drawerItemStyle: { display: 'none' } }} />
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
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  userTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 5,
    marginBottom: 10,
    gap: 6,
  },
  userTypeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
    marginHorizontal: 20,
  },
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