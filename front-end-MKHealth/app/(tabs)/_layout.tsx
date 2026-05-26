import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

function TabBarWrapper() {
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';
  
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#C0C0C0',
          tabBarStyle: {
            backgroundColor: '#8B0000',
            borderTopWidth: 0,
            height: isAndroid ? 65 : 60,
            paddingBottom: isAndroid ? 10 : 8,
            paddingTop: isAndroid ? 8 : 6,
            position: 'relative',
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
      {/* Espaço extra para Android */}
      {isAndroid && <View style={{ height: insets.bottom || 10 }} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <TabBarWrapper />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B0000',
  },
});