import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // <--- Remove a barra branca das abas
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#C0C0C0',
        tabBarStyle: {
          backgroundColor: '#8B0000',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 10,
          paddingTop: 10
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        }
      }}
    >
      <Tabs.Screen
        name="index" // Essa é a sua Home
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="profile" // Meu Perfil
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="exames" // Exames
        options={{
          title: 'Exames',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="clipboard-text" color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="contato" // Contato
        options={{
          title: 'Contato',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="phone" color={color} size={28} />,
        }}
      />
    </Tabs>
  );
}