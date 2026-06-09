// app/(tabs)/_layout.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';
  const navigation = useNavigation();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#8B0000',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={{ marginLeft: 15, padding: 8 }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="menu" color="#FFFFFF" size={28} />
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#C0C0C0',
        tabBarStyle: {
          backgroundColor: '#8B0000',
          borderTopWidth: 0,
          elevation: 8,
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
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "home" : "home-outline"} 
              color={color} 
              size={24} 
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "account" : "account-outline"} 
              color={color} 
              size={24} 
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="exames"
        options={{
          title: 'Exames',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "clipboard-text" : "clipboard-text-outline"} 
              color={color} 
              size={24} 
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="cadastro-exame"
        options={{
          title: 'Novo Exame',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "plus-circle" : "plus-circle-outline"} 
              color={color} 
              size={24} 
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="contato"
        options={{
          title: 'Contato',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "phone" : "phone-outline"} 
              color={color} 
              size={24} 
            />
          ),
        }}
      />
    </Tabs>
  );
}