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
    console.log('Dados do usuário no drawer:', data);
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

  if (pathname === '/login' || pathname === '/recuperarSenha') return null;

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

  const menuItems: { label: string; icon: string; route: Href; iconBg?: string; iconColor?: string }[] = [
    { label: 'Home', icon: 'home', route: '/(tabs)', iconBg: '#FFF0F0', iconColor: '#8B0000' },
    { label: 'Sobre', icon: 'information', route: '/sobre', iconBg: '#E3F2FD', iconColor: '#1565C0' },
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

  const isActive = (route: string) => {
    if (route === '/(tabs)' && pathname === '/') return true;
    if (route === '/(tabs)' && pathname.startsWith('/(tabs)')) return true;
    if (route === '/admin/RegisterScreen' && pathname === '/admin/RegisterScreen') return true;
    return pathname === route;
  };

  return (
    <DrawerContentScrollView 
      {...props} 
      contentContainerStyle={styles.drawerContainer}
    >
      <View style={styles.drawerHeader}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logomk.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>MKHealth</Text>
        </View>

        <View style={styles.dividerLine} />

        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            {fotoUrl ? (
              <Image 
                source={{ uri: fotoUrl }} 
                style={styles.avatarImage}
                onError={(e) => {
                  console.log('Drawer: Erro ao carregar foto:', e.nativeEvent.error);
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
          
          <Text style={styles.userName} numberOfLines={1}>
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
                size={14} 
              />
              <Text style={styles.userTypeText}>
                {getTipoUsuarioDescricao(userData.tipo_usuario)}
              </Text>
            </View>
          )}
          
          <View style={styles.userInfoContainer}>
            <View style={styles.userInfoRow}>
              <MaterialCommunityIcons name="account" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.userDetail} numberOfLines={1}>
                CPF: {userData?.cpf || userData?.document || '---'}
              </Text>
            </View>
            <View style={styles.userInfoRow}>
              <MaterialCommunityIcons name="email" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.userDetail} numberOfLines={1}>
                {userData?.email || ''}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.drawerItems}>
        {menuItems.map((item) => {
          const active = isActive(item.route.toString());
          return (
            <TouchableOpacity
              key={item.route.toString()}
              style={[
                styles.menuItem,
                active && styles.menuItemActive
              ]}
              onPress={() => navigateTo(item.route.toString())}
            >
              <View style={[
                styles.menuIconContainer,
                { backgroundColor: item.iconBg || '#F8F8F8' },
                active && styles.menuIconContainerActive
              ]}>
                <MaterialCommunityIcons 
                  name={item.icon as any} 
                  size={22} 
                  color={active ? '#FFF' : (item.iconColor || '#8B0000')} 
                />
              </View>
              <Text style={[
                styles.menuItemLabel,
                active && styles.menuItemLabelActive
              ]}>
                {item.label}
              </Text>
              {active && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          );
        })}

        {isAdmin && (
          <>
            <View style={styles.divider} />
            
            <Text style={styles.adminSectionTitle}> Administração</Text>
            
            {/* SÓ O GERENCIAR USUÁRIO, REMOVIDO O ADMIN */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('/admin/RegisterScreen')}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <MaterialCommunityIcons name="account-plus" size={22} color="#2E7D32" />
              </View>
              <Text style={styles.menuItemLabel}>Gerenciar Usuário</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      
      <View style={styles.logoutButton}>
        <TouchableOpacity
          style={styles.logoutItem}
          onPress={handleLogout}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: '#FFEBEE' }]}>
            <MaterialCommunityIcons name="logout" size={22} color="#D32F2F" />
          </View>
          <Text style={styles.logoutLabel}>Sair</Text>
        </TouchableOpacity>
        
        <View style={styles.footerVersion}>
          <Text style={styles.footerVersionText}>MKHealth v1.0.0</Text>
        </View>
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
      console.log('Estado de autenticação:', authStatus ? 'Logado' : 'Não logado');
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

  const publicRoutes = ['/login', '/recuperarSenha', '/cadastro'];

  if (!isAuthenticatedState && !publicRoutes.includes(pathname)) {
    console.log(' Redirecionando para login...');
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Redirect href="/login" />
      </GestureHandlerRootView>
    );
  }

  if (isAuthenticatedState && publicRoutes.includes(pathname)) {
    console.log(' Usuário logado, redirecionando para home...');
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Redirect href="/(tabs)" />
      </GestureHandlerRootView>
    );
  }

  //  LAYOUT ÚNICO PARA TODAS AS ROTAS
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ExamesProvider>
        <Drawer
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerShown: false,
            drawerStyle: { 
              width: '80%',
              backgroundColor: '#FFF',
              borderTopRightRadius: 20,
              borderBottomRightRadius: 20,
            },
            swipeEnabled: true,
          }}
        >
          {/* ROTAS PRINCIPAIS */}
          <Drawer.Screen name="(tabs)" options={{ title: 'Home' }} />
          <Drawer.Screen name="sobre" options={{ title: 'Sobre' }} />
          
          {/* ROTAS ADMIN (VISÍVEIS NO DRAWER, MAS COM PROTEÇÃO NA TELA) */}
          <Drawer.Screen name="admin/RegisterScreen" options={{ title: 'Gerenciar Usuário' }} />
          
          {/* ROTAS OCULTAS */}
          <Drawer.Screen name="login" options={{ drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="recuperarSenha" options={{ drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="cadastro" options={{ drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="index" options={{ drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="admin" options={{ drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="modal" options={{ drawerItemStyle: { display: 'none' } }} />
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
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  logoImage: {
    width: 45,
    height: 45,
    tintColor: '#FFF',
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 10,
    letterSpacing: 1,
  },
  dividerLine: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 15,
  },
  
  profileContainer: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFD700',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarImage: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    resizeMode: 'cover',
  },
  avatarFallback: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  userName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 4,
    maxWidth: '90%',
  },
  userTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
    gap: 5,
  },
  userTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfoContainer: {
    width: '100%',
    marginTop: 2,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  userDetail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginLeft: 5,
    textAlign: 'center',
  },
  
  drawerItems: { 
    flex: 1,
    paddingTop: 5,
    paddingHorizontal: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 3,
    borderRadius: 12,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  menuItemActive: {
    backgroundColor: '#FFF5F5',
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuIconContainerActive: {
    backgroundColor: '#8B0000',
  },
  menuItemLabel: {
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
    flex: 1,
  },
  menuItemLabelActive: {
    color: '#8B0000',
    fontWeight: 'bold',
  },
  activeIndicator: {
    width: 4,
    height: 24,
    backgroundColor: '#8B0000',
    borderRadius: 2,
    position: 'absolute',
    right: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 12,
    marginHorizontal: 10,
  },
  adminSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 15,
    marginBottom: 8,
  },
  
  logoutButton: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 5,
    paddingTop: 12,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
  },
  logoutLabel: {
    fontSize: 15,
    marginLeft: 14,
    color: '#D32F2F',
    fontWeight: '600',
  },
  footerVersion: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerVersionText: {
    fontSize: 11,
    color: '#BBB',
    letterSpacing: 0.5,
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