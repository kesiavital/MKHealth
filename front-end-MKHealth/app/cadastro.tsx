// app/cadastro.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { USUARIOS_URL } from '../service/api';

export default function CadastroScreen() {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    cpf: '',
    senha: '',
    confirmar_senha: '',
    tipo_usuario: '0', // Por padrão, cadastramos como Paciente
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [foto, setFoto] = useState<string | null>(null);

  // Permissões e Upload de Foto
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted' && libraryStatus !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera e galeria.');
        return false;
      }
      return true;
    }
    return false;
  };

  const tirarFoto = async (): Promise<void> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    setUploading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        setFoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    } finally {
      setUploading(false);
    }
  };

  const escolherFotoGaleria = async (): Promise<void> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    setUploading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        setFoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível escolher a foto.');
    } finally {
      setUploading(false);
    }
  };

  const removerFoto = (): void => setFoto(null);

  const adicionarFoto = (): void => {
    Alert.alert('Adicionar Foto', 'Escolha uma opção', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Tirar Foto', onPress: tirarFoto },
      { text: 'Escolher da Galeria', onPress: escolherFotoGaleria },
      ...(foto ? [{ text: 'Remover Foto', onPress: removerFoto, style: 'destructive' as const }] : []),
    ]);
  };

  // Validações
  const validateCPF = (cpf: string): boolean => {
    const cpfClean = cpf.replace(/[^\d]/g, '');
    if (cpfClean.length !== 11 || /^(\d)\1{10}$/.test(cpfClean)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpfClean.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfClean.charAt(9))) return false;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpfClean.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfClean.charAt(10))) return false;
    return true;
  };

  const formatCPF = (value: string): string => {
    const cpfClean = value.replace(/[^\d]/g, '');
    if (cpfClean.length <= 3) return cpfClean;
    if (cpfClean.length <= 6) return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3)}`;
    if (cpfClean.length <= 9) return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6)}`;
    return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6, 9)}-${cpfClean.slice(9, 11)}`;
  };

  const limparCPF = (cpf: string): string => cpf.replace(/[^\d]/g, '');
  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Submit
  const handleCadastrar = async () => {
    if (!formData.nome_completo.trim()) return Alert.alert('Erro', 'Nome completo é obrigatório');
    if (!validateEmail(formData.email)) return Alert.alert('Erro', 'E-mail inválido');
    const cpfLimpo = limparCPF(formData.cpf);
    if (!validateCPF(formData.cpf)) return Alert.alert('Erro', 'CPF inválido');
    if (formData.senha.length < 4) return Alert.alert('Erro', 'Senha deve ter pelo menos 4 caracteres');
    if (formData.senha !== formData.confirmar_senha) return Alert.alert('Erro', 'Senhas não coincidem');

    setSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nome_completo', formData.nome_completo.trim());
      formDataToSend.append('email', formData.email.trim().toLowerCase());
      formDataToSend.append('cpf', cpfLimpo);
      formDataToSend.append('senha', formData.senha);
      formDataToSend.append('tipo_usuario', formData.tipo_usuario);
      
      if (foto) {
        const uriParts = foto.split('.');
        const fileType = uriParts[uriParts.length - 1] || 'jpg';
        formDataToSend.append('foto', {
          uri: foto,
          name: `foto.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      const response = await fetch(`${USUARIOS_URL}/cadastro`, {
        method: 'POST',
        body: formDataToSend,
        headers: { 'Accept': 'application/json' },
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.erro || 'Erro ao cadastrar');
      
      Alert.alert('Sucesso', 'Conta criada com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/') } // Volta para o Login
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}> 
      {/* O translucent={true} permite que seu app 'invada' o espaço da barra de notificações */}
      <StatusBar style="light" backgroundColor="transparent" translucent={true} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* CABEÇALHO SIMPLIFICADO */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={28} color="#FFF" />
            </TouchableOpacity>

            <Image
              source={require('../assets/images/logomk.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formCard}>

                {/* 🔥 TEXTOS AGORA FICAM AQUI DENTRO DO CARD */}
            <Text style={styles.cardTitle}>Criar Conta</Text>

            <View style={styles.fotoContainer}>
              <TouchableOpacity style={styles.fotoButton} onPress={adicionarFoto} disabled={uploading}>
                {uploading ? (
                  <ActivityIndicator size="small" color="#8B0000" />
                ) : foto ? (
                  <Image source={{ uri: foto }} style={styles.fotoPerfil} />
                ) : (
                  <View style={styles.fotoPlaceholder}>
                    <MaterialCommunityIcons name="camera-plus" size={40} color="#8B0000" />
                    <Text style={styles.fotoPlaceholderText}>Sua Foto</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

             
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu nome completo"
                placeholderTextColor="#999"
                value={formData.nome_completo}
                onChangeText={(text) => setFormData({ ...formData, nome_completo: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail *</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu e-mail"
                placeholderTextColor="#999"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CPF *</Text>
              <TextInput
                style={styles.input}
                placeholder="000.000.000-00"
                placeholderTextColor="#999"
                value={formData.cpf}
                onChangeText={(text) => setFormData({ ...formData, cpf: formatCPF(text) })}
                keyboardType="numeric"
                maxLength={14}
              />
            </View>


            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Crie uma senha (mín. 4 caracteres)"
                  placeholderTextColor="#999"
                  value={formData.senha}
                  onChangeText={(text) => setFormData({ ...formData, senha: text })}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Senha *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirme sua senha"
                  placeholderTextColor="#999"
                  value={formData.confirmar_senha}
                  onChangeText={(text) => setFormData({ ...formData, confirmar_senha: text })}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleCadastrar}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>CONCLUIR CADASTRO</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#8B0000' // Fundo vermelho para subir até a barra de status
  },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center', // Centraliza o card branco na tela
    paddingBottom: 30 
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    width: '100%',
  },
  backButton: { 
    position: 'absolute', 
    left: 20, 
    top: 60, 
    zIndex: 10, 
    padding: 10 
  },
  headerLogo: { 
    width: 0,                       //aqui foi mexidooooooooooo inicio
    height: 0, 
    tintColor: '#FFF',
  },
  
  // 🔥 ESTILOS NOVOS DOS TEXTOS (DENTRO DO CARD)
  cardTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 0,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 4,
  },

  formCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 50,
    marginBottom: 20,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24, // 🔥 AJUSTADO: Reduzido de 50 para 24. Isso puxa o texto para cima!
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  fotoContainer: { 
    alignItems: 'center', 
    marginTop: 15, // 🔥 AJUSTADO: Adicionado para desgrudar a foto do título
    marginBottom: 20, 
  },

  //aqui foi mexido fim

  fotoButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#8B0000',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotoPerfil: { width: 80, height: 80, borderRadius: 40 },
  fotoPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  fotoPlaceholderText: { fontSize: 12, color: '#666', marginTop: 4 },
  
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 4 },
  
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  passwordInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#333' },
  eyeButton: { paddingHorizontal: 14 },
  eyeIcon: { fontSize: 18, color: '#666' },

  saveButton: {
    backgroundColor: '#8B0000',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 6,
    alignItems: 'center',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonDisabled: { backgroundColor: '#CC6666', opacity: 0.7 },
  saveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFF', letterSpacing: 0.5 },
});