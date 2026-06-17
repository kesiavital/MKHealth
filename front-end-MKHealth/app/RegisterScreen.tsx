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
import { BASE_URL, USUARIOS_URL } from '../service/api';

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados para mostrar/ocultar senha
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estado para foto
  const [foto, setFoto] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);

  // ========== FUNÇÕES DE FOTO ==========

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' && libraryStatus !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera e galeria para adicionar foto.');
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
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setFoto(asset.uri);
        setFotoBase64(asset.base64 || null);
        console.log('📸 Foto tirada com sucesso!');
        console.log('📸 URI:', asset.uri);
      }
    } catch (error) {
      console.error('❌ Erro ao tirar foto:', error);
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
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setFoto(asset.uri);
        setFotoBase64(asset.base64 || null);
        console.log('📸 Foto escolhida com sucesso!');
        console.log('📸 URI:', asset.uri);
      }
    } catch (error) {
      console.error('❌ Erro ao escolher foto:', error);
      Alert.alert('Erro', 'Não foi possível escolher a foto.');
    } finally {
      setUploading(false);
    }
  };

  const removerFoto = (): void => {
    setFoto(null);
    setFotoBase64(null);
    console.log('🗑️ Foto removida');
  };

  const adicionarFoto = (): void => {
    Alert.alert(
      'Adicionar Foto',
      'Escolha uma opção',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '📷 Tirar Foto', onPress: () => tirarFoto() },
        { text: '🖼️ Escolher da Galeria', onPress: () => escolherFotoGaleria() },
        ...(foto ? [{ text: '🗑️ Remover Foto', onPress: () => removerFoto(), style: 'destructive' as const }] : [])
      ]
    );
  };

  // ========== FUNÇÕES DE VALIDAÇÃO ==========

  const validateCPF = (cpf: string): boolean => {
    const cpfClean = cpf.replace(/[^\d]/g, '');
    if (cpfClean.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpfClean)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfClean.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfClean.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfClean.charAt(i)) * (11 - i);
    }
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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ========== FUNÇÃO PRINCIPAL DE CADASTRO ==========

  const handleRegister = async (): Promise<void> => {
    console.log('🚀 ========== INICIANDO CADASTRO ==========');
    console.log('📝 Dados do formulário:', {
      name: name.trim(),
      email: email.trim(),
      cpf: cpf,
      hasFoto: !!foto
    });

    // Validações
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu nome completo.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu e-mail.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, digite um e-mail válido.');
      return;
    }

    const cpfLimpo = limparCPF(cpf);
    if (!validateCPF(cpf)) {
      Alert.alert('Erro', 'Por favor, digite um CPF válido.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Erro', 'Por favor, digite sua senha.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    if (password.length < 4) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const url = `${USUARIOS_URL}/cadastro`;
      
      console.log('📡 BASE_URL:', BASE_URL);
      console.log('📡 USUARIOS_URL:', USUARIOS_URL);
      console.log('📡 URL completa:', url);

      // Criar FormData
      const formData = new FormData();
      formData.append('nome_completo', name.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('cpf', cpfLimpo);
      formData.append('senha', password);

      // 🔥 CORREÇÃO: Adicionar foto no formato que o React Native entende
      if (foto) {
        console.log('📸 Processando foto para upload...');
        console.log('📸 URI da foto:', foto);
        
        try {
          // Pega a extensão do arquivo a partir da URI
          const uriParts = foto.split('.');
          const fileType = uriParts[uriParts.length - 1] || 'jpg';
          
          // Cria o objeto de arquivo no formato que o React Native entende
          // @ts-ignore - O React Native aceita este formato
          formData.append('foto', {
            uri: foto,
            name: `foto.${fileType}`,
            type: `image/${fileType}`,
          });
          
          console.log('📸 Foto adicionada com sucesso!');
          console.log('📸 Tipo:', fileType);
        } catch (fotoError) {
          console.error('❌ Erro ao processar foto:', fotoError);
          // Continua mesmo sem foto
        }
      }

      // Log dos campos do FormData
      console.log('📦 Campos do FormData:');
      // @ts-ignore
      for (let pair of formData.entries()) {
        const key = pair[0];
        const value = pair[1];
        if (key === 'senha') {
          console.log(`  - ${key}: ****`);
        } else if (key === 'foto') {
          console.log(`  - ${key}: [ARQUIVO] - ${typeof value === 'object' ? JSON.stringify(value) : 'File'}`);
        } else {
          console.log(`  - ${key}: ${value}`);
        }
      }

      console.log('📡 Enviando requisição POST para:', url);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📡 Status da resposta:', response.status);

      // Ler resposta como texto primeiro
      const responseText = await response.text();
      console.log('📡 Resposta bruta:', responseText.substring(0, 500));

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('📡 Dados parseados:', data);
      } catch (parseError) {
        console.error('❌ Erro ao parsear JSON:', parseError);
        throw new Error(`Resposta inválida do servidor: ${responseText.substring(0, 100)}`);
      }

      // Tratar erros específicos
      if (response.status === 400) {
        Alert.alert('Erro de Validação', data.erro || 'Dados inválidos');
        return;
      }

      if (response.status === 409) {
        Alert.alert('Erro', data.erro || 'Email ou CPF já cadastrado');
        return;
      }

      if (!response.ok) {
        throw new Error(data.erro || `Erro ${response.status}: ${response.statusText}`);
      }

      // Sucesso!
      console.log('✅ Cadastro realizado com sucesso!');
      console.log('✅ Foto salva:', data.usuario?.foto || 'Sem foto');
      
      Alert.alert(
        'Sucesso!', 
        data.mensagem || 'Cadastro realizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('🚀 Redirecionando para Login...');
              router.replace('/');
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.error('❌ ========== ERRO NO CADASTRO ==========');
      console.error('❌ Mensagem:', error.message);
      console.error('❌ Stack:', error.stack);
      
      if (error.message === 'Network request failed' || error.message.includes('Network')) {
        Alert.alert(
          'Erro de Conexão',
          `Não foi possível conectar ao servidor.\n\nURL tentada:\n${USUARIOS_URL}/cadastro\n\nVerifique:\n• Backend está rodando (npm start)\n• IP correto: ${BASE_URL}\n• Mesma rede Wi-Fi\n• Firewall não está bloqueando`
        );
      } else {
        Alert.alert('Erro', error.message || 'Erro ao realizar cadastro.');
      }
    } finally {
      setLoading(false);
      console.log('🏁 ========== CADASTRO FINALIZADO ==========');
    }
  };

  // Função para navegar para o login
  const navigateToLogin = () => {
    console.log('🔵 Navegando para Login...');
    try {
      router.replace('/');
      console.log('✅ Navegação executada com sucesso!');
    } catch (error) {
      console.error('❌ Erro na navegação:', error);
      Alert.alert('Erro', 'Não foi possível voltar para o login');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      <View style={styles.backgroundCircle} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('./img/logomk.png')}
            style={styles.logo}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>Cadastre-se para acessar seus exames</Text>

          {/* Botão para adicionar foto */}
          <TouchableOpacity 
            style={styles.fotoContainer} 
            onPress={adicionarFoto}
            activeOpacity={0.8}
            disabled={uploading || loading}
          >
            {uploading ? (
              <View style={styles.fotoPlaceholder}>
                <ActivityIndicator size="large" color="#8B0000" />
              </View>
            ) : foto ? (
              <Image source={{ uri: foto }} style={styles.fotoPerfil} />
            ) : (
              <View style={styles.fotoPlaceholder}>
                <Text style={styles.fotoPlaceholderEmoji}>📷</Text>
                <Text style={styles.fotoPlaceholderText}>Adicionar Foto</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* NOME COMPLETO */}
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome completo"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!loading}
          />

          {/* E-MAIL */}
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu e-mail"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          {/* CPF */}
          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={styles.input}
            placeholder="000.000.000-00"
            placeholderTextColor="#999"
            value={cpf}
            onChangeText={(text) => setCpf(formatCPF(text))}
            keyboardType="numeric"
            maxLength={14}
            editable={!loading}
          />

          {/* SENHA */}
          <Text style={styles.label}>Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              <Text style={styles.eyeIcon}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* CONFIRMAR SENHA */}
          <Text style={styles.label}>Confirmar Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirme sua senha"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              <Text style={styles.eyeIcon}>
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* BOTÃO CADASTRAR */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>CADASTRAR</Text>
            )}
          </TouchableOpacity>

          {/* LINK PARA LOGIN */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já tem uma conta?</Text>
            <TouchableOpacity 
              onPress={navigateToLogin}
              disabled={loading}
            >
              <Text style={styles.loginLink}> Faça login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B0000'
  },
  backgroundCircle: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#A52A2A',
    opacity: 0.5
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  logo: {
    width: 120,
    height: 120,
    tintColor: '#FFF',
    resizeMode: 'contain'
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20
  },
  fotoContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 5,
  },
  fotoPerfil: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#8B0000',
  },
  fotoPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8B0000',
    borderStyle: 'dashed',
  },
  fotoPlaceholderEmoji: {
    fontSize: 40,
    marginBottom: 5,
  },
  fotoPlaceholderText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
    marginLeft: 5
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 15
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 15,
  },
  eyeButton: {
    paddingHorizontal: 15,
  },
  eyeIcon: {
    fontSize: 20,
    color: '#666'
  },
  button: {
    backgroundColor: '#8B0000',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#8B0000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3
  },
  buttonDisabled: {
    backgroundColor: '#CC6666',
    opacity: 0.7
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#8B0000',
    fontSize: 14,
    fontWeight: 'bold',
  }
});