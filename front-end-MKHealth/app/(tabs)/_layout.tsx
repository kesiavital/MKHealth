// app/(tabs)/_layout.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#C0C0C0',
        tabBarStyle: {
          backgroundColor: '#8B0000',
          borderTopWidth: 0,
          height: isAndroid ? 65 + (insets.bottom || 0) : 60,
          paddingBottom: isAndroid ? 10 + (insets.bottom || 0) : 8,
          paddingTop: isAndroid ? 8 : 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: 'bold',
          marginBottom: isAndroid ? 4 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="exames"
        options={{
          title: 'Exames',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="clipboard-text" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="cadastro-exame"
        options={{
          title: 'Novo Exame',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="plus-circle" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="contato"
        options={{
          title: 'Contato',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="phone" color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}