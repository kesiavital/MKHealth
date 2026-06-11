// app/(tabs)/_layout.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Componente de Tab Bar personalizada
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';
  
  // Reorganizando a ordem dos itens: Home, Perfil, Novo Exame, Exames
  const orderedRoutes = [
    state.routes.find((route: any) => route.name === 'index'),
    state.routes.find((route: any) => route.name === 'profile'),
    state.routes.find((route: any) => route.name === 'cadastro-exame'),
    state.routes.find((route: any) => route.name === 'exames'),
  ].filter(Boolean);
  
  return (
    <View style={[
      styles.tabBarContainer,
      {
        paddingBottom: isAndroid ? 10 + (insets.bottom || 0) : 8,
        paddingTop: isAndroid ? 8 : 6,
        height: isAndroid ? 70 + (insets.bottom || 0) : 65,
      }
    ]}>
      {orderedRoutes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === state.routes.findIndex((r: any) => r.name === route.name);
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        
        // Ícone para cada rota
        const renderIcon = () => {
          const color = isFocused ? '#FFFFFF' : '#E0E0E0';
          
          switch (route.name) {
            case 'index':
              return <MaterialCommunityIcons name={isFocused ? "home" : "home-outline"} color={color} size={24} />;
            case 'profile':
              return <MaterialCommunityIcons name={isFocused ? "account" : "account-outline"} color={color} size={24} />;
            case 'exames':
              return <MaterialCommunityIcons name={isFocused ? "clipboard-text" : "clipboard-text-outline"} color={color} size={24} />;
            case 'cadastro-exame':
              // Botão especial para Novo Exame
              return (
                <View style={styles.specialButton}>
                  <MaterialCommunityIcons name="plus" color="#8B0000" size={36} />
                </View>
              );
            default:
              return null;
          }
        };
        
        // Se for o botão Novo Exame (cadastro-exame) - posição central (índice 2)
        if (route.name === 'cadastro-exame') {
          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={styles.specialTabItem}
              activeOpacity={0.8}
            >
              {renderIcon()}
              <Text style={styles.specialLabel}>Novo Exame</Text>
            </TouchableOpacity>
          );
        }
        
        // Botões normais
        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            {renderIcon()}
            <Text style={[
              styles.tabLabel,
              { color: isFocused ? '#FFFFFF' : '#E0E0E0' }
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const navigation = useNavigation();
  
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
        }}
      />
      
      <Tabs.Screen
        name="exames"
        options={{
          title: 'Exames',
        }}
      />
      
      <Tabs.Screen
        name="cadastro-exame"
        options={{
          title: 'Novo Exame',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#8B0000',
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  specialTabItem: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20, // Sobressai mais para destaque
  },
  specialButton: {
    backgroundColor: '#FFD700',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginBottom: 4,
  },
  specialLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 2,
  },
});