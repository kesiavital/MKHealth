import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SobreNosScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <MaterialCommunityIcons name="arrow-left" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sobre Nós</Text>
         {/* Logo pequena no canto direito */}
         <Image source={{ uri: 'https://i.imgur.com/vP3JgVz.png' }} style={styles.headerLogo} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.text}>
          Somos três estudantes do curso de Análise e Desenvolvimento de Sistemas da faculdade CCI, unidas pelo desejo de criar soluções tecnológicas que facilitem o dia a dia das pessoas.
        </Text>
        <Text style={styles.text}>
          Assim nasceu o MK Health, um aplicativo inovador que tem como missão agilizar o acesso aos exames médicos e melhorar a comunicação entre pacientes e hospitais.
        </Text>
        <Text style={styles.text}>
          Nosso objetivo é oferecer uma plataforma segura, intuitiva e moderna, permitindo que cada paciente acompanhe seus exames com rapidez, praticidade e conforto.
        </Text>
        <Text style={styles.text}>
          Acreditamos que a tecnologia pode transformar a saúde, tornando-a mais acessível, eficiente e humana.
        </Text>
      </ScrollView>
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
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 2, flex: 1, marginLeft: 15 },
  headerLogo: { width: 30, height: 30, tintColor: '#FFF', resizeMode: 'contain', marginBottom: 2 },
  content: { padding: 30 },
  text: { fontSize: 16, color: '#333', textAlign: 'justify', marginBottom: 25, lineHeight: 24 }
});