// app/sobre.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SobreNosScreen() {
  const teamMembers = [
    {
      nome: 'Ana Silva',
      papel: 'Desenvolvedora Full Stack',
      icon: 'account-circle',
    },
    {
      nome: 'Maria Santos',
      papel: 'UX/UI Designer',
      icon: 'account-circle',
    },
    {
      nome: 'Juliana Oliveira',
      papel: 'Desenvolvedora Backend',
      icon: 'account-circle',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header Profissional */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sobre Nós</Text>
        <Image 
          source={require('./img/logomk.png')} 
          style={styles.headerLogo}
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo e Missão */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('./img/logomk.png')} 
            style={styles.mainLogo}
          />
          <Text style={styles.appName}>MK Health</Text>
          <Text style={styles.slogan}>Sua saúde em primeiro lugar</Text>
        </View>

        {/* Quem Somos */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="account-group" size={28} color="#8B0000" />
            <Text style={styles.cardTitle}>Quem Somos</Text>
          </View>
          <Text style={styles.text}>
            Somos três estudantes do curso de Análise e Desenvolvimento de Sistemas da faculdade CCI, 
            unidas pelo desejo de criar soluções tecnológicas que facilitem o dia a dia das pessoas.
          </Text>
        </View>

        {/* Nossa Missão */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="target" size={28} color="#8B0000" />
            <Text style={styles.cardTitle}>Nossa Missão</Text>
          </View>
          <Text style={styles.text}>
            Oferecer uma plataforma segura, intuitiva e moderna, permitindo que cada paciente 
            acompanhe seus exames com rapidez, praticidade e conforto.
          </Text>
        </View>

        {/* Nossa Visão */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="lightbulb" size={28} color="#8B0000" />
            <Text style={styles.cardTitle}>Nossa Visão</Text>
          </View>
          <Text style={styles.text}>
            Ser referência em inovação na área da saúde, transformando a experiência dos pacientes 
            através da tecnologia e humanização.
          </Text>
        </View>

        {/* Nossos Valores */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="heart" size={28} color="#8B0000" />
            <Text style={styles.cardTitle}>Nossos Valores</Text>
          </View>
          <View style={styles.valuesContainer}>
            <View style={styles.valueItem}>
              <MaterialCommunityIcons name="shield-check" size={24} color="#8B0000" />
              <Text style={styles.valueText}>Segurança</Text>
            </View>
            <View style={styles.valueItem}>
              <MaterialCommunityIcons name="speedometer" size={24} color="#8B0000" />
              <Text style={styles.valueText}>Agilidade</Text>
            </View>
            <View style={styles.valueItem}>
              <MaterialCommunityIcons name="handshake" size={24} color="#8B0000" />
              <Text style={styles.valueText}>Confiança</Text>
            </View>
            <View style={styles.valueItem}>
              <MaterialCommunityIcons name="head-heart" size={24} color="#8B0000" />
              <Text style={styles.valueText}>Humanização</Text>
            </View>
          </View>
        </View>

        {/* Time */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="account-group" size={28} color="#8B0000" />
          </View>
          {teamMembers.map((member, index) => (
            <View key={index} style={styles.memberItem}>
              <MaterialCommunityIcons name={member.icon as any} size={50} color="#8B0000" />
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.nome}</Text>
                <Text style={styles.memberRole}>{member.papel}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Contato */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="email" size={28} color="#8B0000" />
            <Text style={styles.cardTitle}>Contato</Text>
          </View>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => Linking.openURL('mailto:contato@mkhealth.com')}
          >
            <MaterialCommunityIcons name="email-outline" size={24} color="#8B0000" />
            <Text style={styles.contactText}>contato@mkhealth.com</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => Linking.openURL('https://www.instagram.com/mkhealth')}
          >
            <MaterialCommunityIcons name="instagram" size={24} color="#8B0000" />
            <Text style={styles.contactText}>@mkhealth</Text>
          </TouchableOpacity>
        </View>

        {/* Versão */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Versão 1.0.0</Text>
          <Text style={styles.copyright}>© 2024 MK Health - Todos os direitos reservados</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F7FA' 
  },
  
  header: {
    backgroundColor: '#8B0000',
    height: 110,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  backButton: { 
    marginBottom: 3,
    padding: 5,
  },
  
  headerTitle: { 
    color: '#FFF', 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 2, 
    flex: 1, 
    marginLeft: 15 
  },
  
  headerLogo: { 
    width: 35, 
    height: 35, 
    resizeMode: 'contain', 
    marginBottom: 2,
    tintColor: '#FFF',
  },
  
  content: { 
    padding: 20 
  },
  
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  
  mainLogo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 5,
  },
  
  slogan: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#8B0000',
    paddingBottom: 10,
  },
  
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  
  text: {
    fontSize: 16,
    color: '#555',
    textAlign: 'justify',
    lineHeight: 24,
  },
  
  valuesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  valueItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  
  valueText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    fontWeight: '500',
  },
  
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
  },
  
  memberInfo: {
    marginLeft: 15,
    flex: 1,
  },
  
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  
  memberRole: {
    fontSize: 14,
    color: '#8B0000',
  },
  
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 10,
  },
  
  contactText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  
  versionContainer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  
  versionText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  
  copyright: {
    fontSize: 12,
    color: '#BBB',
    textAlign: 'center',
  },
});