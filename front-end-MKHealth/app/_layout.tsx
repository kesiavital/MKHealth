// app/_layout.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { usePathname } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ExamesProvider } from '../service/ExamesContext';
import { getUserData, logout } from '../service/auth';

function CustomDrawerContent(props: any) {
  const [userData, setUserData] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    getUserData().then(setUserData);
  }, []);

  // Não mostra drawer na tela de login
  if (pathname === '/login') return null;

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <MaterialCommunityIcons name="account-circle" size={80} color="#8B0000" />
        <Text style={styles.userName}>{userData?.nome_completo || 'Usuário'}</Text>
        <Text style={styles.userDetail}>{userData?.cpf || '---'}</Text>
        <Text style={styles.userDetail}>{userData?.email || ''}</Text>
      </View>
      
      <View style={styles.drawerItems}>
        <DrawerItemList {...props} />
      </View>
      
      <View style={styles.logoutButton}>
        <DrawerItem
          label="Sair"
          icon={({ size }) => <MaterialCommunityIcons name="logout" color="#8B0000" size={size} />}
          onPress={() => logout()}
          labelStyle={styles.logoutLabel}
        />
      </View>
    </DrawerContentScrollView>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ExamesProvider>
        <Drawer
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerShown: false,
            drawerActiveTintColor: '#8B0000',
            drawerInactiveTintColor: '#333',
            drawerLabelStyle: { fontSize: 16, fontWeight: '500' },
            drawerStyle: { width: '85%' },
            swipeEnabled: true,
          }}
        >
          <Drawer.Screen
            name="(tabs)"
            options={{
              drawerLabel: 'Home',
              drawerIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="home" color={color} size={size} />
              ),
            }}
          />
          
          <Drawer.Screen
            name="sobre"
            options={{
              drawerLabel: 'Sobre',
              drawerIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="information" color={color} size={size} />
              ),
            }}
          />
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
  drawerItems: { flex: 1 },
  logoutButton: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  logoutLabel: {
    color: '#8B0000',
    fontWeight: 'bold',
  },
});