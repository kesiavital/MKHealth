import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ContatoScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <MaterialCommunityIcons name="arrow-left" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contato</Text>
        <Image source={{ uri: 'https://i.imgur.com/vP3JgVz.png' }} style={styles.logoSmall} />
      </View>

      <View style={styles.content}>
        {/* Placeholder do Mapa */}
        <View style={styles.mapContainer}>
             <Image 
                source={{ uri: 'https://i.imgur.com/3q5q5Xy.png' }} 
                style={styles.mapImage}
            />
             <View style={styles.pinOverlay}>
                <MaterialCommunityIcons name="map-marker" size={40} color="#8B0000" />
             </View>
        </View>

        <View style={styles.infoContainer}>
            <View style={styles.row}>
                <MaterialCommunityIcons name="map-marker" size={28} color="#8B0000" />
                <Text style={styles.text}>
                    QS 05, Lote 22, Avenida Areal,{'\n'}Taguatinga
                </Text>
            </View>

            <View style={styles.row}>
                <MaterialCommunityIcons name="phone" size={28} color="#8B0000" />
                <Text style={styles.text}>(61) 99570-5870</Text>
            </View>

            <View style={styles.row}>
                <MaterialCommunityIcons name="email" size={28} color="#8B0000" />
                <Text style={styles.text}>contato@santalucia.com.br</Text>
            </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  header: {
    backgroundColor: '#8B0000', height: 110, flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-between', paddingBottom: 20, paddingHorizontal: 20,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20
  },
  backButton: { marginBottom: 3 },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 2 },
  logoSmall: { width: 30, height: 30, resizeMode: 'contain', tintColor: '#FFF' },
  
  content: { flex: 1, padding: 25, alignItems: 'center' },
  mapContainer: { width: '100%', height: 200, marginBottom: 40, marginTop: 20, justifyContent: 'center', alignItems: 'center' },
  mapImage: { width: '100%', height: '100%', borderRadius: 15, opacity: 0.8 },
  pinOverlay: { position: 'absolute' },
  
  infoContainer: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  text: { marginLeft: 20, fontSize: 16, color: '#333', flex: 1 }
});