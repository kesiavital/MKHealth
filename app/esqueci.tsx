import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EsqueciSenhaScreen() {
  const [email, setEmail] = useState('');

  return (
    <View style={styles.container}>
      {/* Header Vermelho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <MaterialCommunityIcons name="arrow-left" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Esqueci a senha</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.instructionText}>
          Informe seu e-mail para receber as instruções de recuperação de senha.
        </Text>

        <View style={styles.inputContainer}>
            <TextInput 
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            />
        </View>

        <TouchableOpacity style={styles.button} onPress={() => { alert('Email enviado!'); router.back(); }}>
          <Text style={styles.buttonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  header: {
    backgroundColor: '#8B0000', height: 100, flexDirection: 'row', alignItems: 'flex-end',
    paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20
  },
  backButton: { marginRight: 15, marginBottom: 3 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 30, marginTop: 30, alignItems: 'center' },
  instructionText: { fontSize: 18, color: '#000', textAlign: 'center', marginBottom: 50, lineHeight: 26 },
  inputContainer: { width: '100%', marginBottom: 30 },
  input: {
    width: '100%', backgroundColor: '#E0E0E0', borderRadius: 5, padding: 15, fontSize: 16, color: '#333'
  },
  button: {
    width: '100%', backgroundColor: '#8B0000', padding: 15, borderRadius: 8, alignItems: 'center'
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});