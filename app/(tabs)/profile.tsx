import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      {/* Fundo Vermelho Superior */}
      <View style={styles.redHeader}>
        <View style={styles.headerContent}>
             <Image source={{ uri: 'https://i.imgur.com/vP3JgVz.png' }} style={styles.logoSmall} />
             <Text style={styles.screenTitle}>Meu Perfil</Text>
             <View style={{width: 30}} /> 
        </View>
      </View>

      {/* Cartão Branco Sobreposto */}
      <View style={styles.whiteCard}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* Avatar e Nome */}
            <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                     <MaterialCommunityIcons name="account" size={45} color="#8B0000" />
                </View>
                <View>
                    <Text style={styles.userName}> Sosthenes </Text>
                    <Text style={styles.userCpf}>CPF: 100.000.000-90</Text>
                </View>
            </View>

            {/* Informações */}
            <View style={styles.infoRow}>
                <MaterialCommunityIcons name="calendar-month" size={24} color="#8B0000" />
                <Text style={styles.infoText}>Data de Nascimento</Text>
            </View>

            <View style={styles.infoRow}>
                <MaterialCommunityIcons name="email-outline" size={24} color="#8B0000" />
                <Text style={styles.infoText}>Sosthenes.sousa@gmail.com</Text>
            </View>

            <View style={styles.infoRow}>
                <MaterialCommunityIcons name="phone" size={24} color="#8B0000" />
                <Text style={styles.infoText}>(61) 99999-9999</Text>
            </View>

            <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker" size={24} color="#8B0000" />
                <Text style={styles.infoText}>Brasília - DF</Text>
            </View>

            <View style={styles.infoRow}>
                <MaterialCommunityIcons name="lock" size={24} color="#8B0000" />
                <Text style={styles.infoText}>*******</Text>
            </View>

            {/* Convênio e Exame */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Convênio</Text>
                <Text style={styles.sectionValue}>Saúde Mais</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Último exame</Text>
                <Text style={styles.sectionValue}>Hemograma - 02/12/2025</Text>
            </View>

            {/* Botão de Editar */}
            <View style={styles.footerButtonContainer}>
                <TouchableOpacity style={styles.editButton}>
                    <MaterialCommunityIcons name="pencil" size={24} color="#FFF" />
                    <Text style={styles.editButtonText}>Editar perfil</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8B0000' },
  redHeader: { height: 130, paddingTop: 40, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoSmall: { width: 30, height: 30, resizeMode: 'contain', tintColor: '#FFF' },
  screenTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  
  whiteCard: {
    flex: 1, backgroundColor: '#F0F4F8',
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    paddingTop: 25, paddingHorizontal: 25
  },
  scrollContent: { paddingBottom: 40 },
  
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 35 },
  avatarContainer: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF',
    borderWidth: 2, borderColor: '#8B0000',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  userCpf: { fontSize: 14, color: '#666' },

  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  infoText: { marginLeft: 15, fontSize: 16, color: '#333' },

  section: { marginTop: 10, marginBottom: 15 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  sectionValue: { fontSize: 16, color: '#555', marginTop: 3 },

  footerButtonContainer: { alignItems: 'center', marginTop: 20 },
  editButton: {
    backgroundColor: '#8B0000', width: 110, height: 110, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center', elevation: 5
  },
  editButtonText: { color: '#FFF', marginTop: 5, fontSize: 13, textAlign: 'center' }
});
