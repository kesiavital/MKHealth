import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#8B0000" />
      
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerWelcome}>Bem Vindo</Text>
          <View style={styles.userInfo}>
             <MaterialCommunityIcons name="account-circle" size={50} color="#DDD" />
             <View style={{marginLeft: 10}}>
                <Text style={styles.userName}>Sosthenes Carlos</Text>
                <Text style={styles.userCpf}>CPF: 100.000.000-90</Text>
             </View>
            <Image source={require('../img/logomk.png')} style={styles.logoRight} />
          </View>
        </View>

        <View style={styles.contentArea}>
          <Text style={styles.sectionTitle}>Nossos serviços</Text>
          
          <View style={styles.grid}>
             <TouchableOpacity style={styles.card} onPress={() => router.push('/profile')}>
                <MaterialCommunityIcons name="account" size={36} color="#8B0000" />
                <Text style={styles.cardText}>Meu Perfil</Text>
             </TouchableOpacity>

             <TouchableOpacity style={styles.card} onPress={() => router.push('/exames')}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={36} color="#8B0000" />
                <Text style={styles.cardText}>Exames</Text>
             </TouchableOpacity>
          </View>

          <View style={styles.grid}>
             <TouchableOpacity style={styles.card} onPress={() => router.push('/sobre')}>
                <MaterialCommunityIcons name="magnify" size={36} color="#8B0000" />
                <Text style={styles.cardText}>Sobre Nós</Text>
             </TouchableOpacity>

             <TouchableOpacity style={styles.card} onPress={() => router.push('/contato')}>
                <MaterialCommunityIcons name="phone" size={36} color="#8B0000" />
                <Text style={styles.cardText}>Contato</Text>
             </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  container: { flex: 1 },
  headerContainer: { backgroundColor: '#8B0000', padding: 20, paddingBottom: 40, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerWelcome: { color: '#FFF', textAlign: 'center', fontSize: 18, marginBottom: 20, fontWeight: 'bold' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  userName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  userCpf: { color: '#DDD', fontSize: 12 },
  logoRight: { width: 100, height: 100, resizeMode: 'contain', marginLeft: 'auto', tintColor: '#FFF' },
  
  contentArea: { padding: 20, marginTop: 20 },
  sectionTitle: { fontSize: 18, textAlign: 'center', color: '#333', marginBottom: 25 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  card: { 
    width: '47%', backgroundColor: '#FFF', padding: 25, borderRadius: 15, 
    alignItems: 'center', justifyContent: 'center', elevation: 3, height: 140 // Botões mais altos
  },
  cardText: { marginTop: 15, color: '#666', fontSize: 16 }
});