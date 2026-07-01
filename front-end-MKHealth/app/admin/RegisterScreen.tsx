// app/admin/RegisterScreen.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL, USUARIOS_URL } from '../../service/api';

interface Usuario {
  id: number;
  nome_completo: string;
  email: string;
  cpf: string;
  foto: string | null;
  tipo_usuario: number;
  tipo_descricao?: string;
}

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    cpf: '',
    senha: '',
    confirmar_senha: '',
    tipo_usuario: '0',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [foto, setFoto] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [saving, setSaving] = useState(false);

  const [fotoModalVisible, setFotoModalVisible] = useState(false);
  const [fotoModalUrl, setFotoModalUrl] = useState<string | null>(null);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');

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
        base64: true,
      });
      if (!result.canceled && result.assets[0]) {
        setFoto(result.assets[0].uri);
        setFotoBase64(result.assets[0].base64 || null);
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
        base64: true,
      });
      if (!result.canceled && result.assets[0]) {
        setFoto(result.assets[0].uri);
        setFotoBase64(result.assets[0].base64 || null);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível escolher a foto.');
    } finally {
      setUploading(false);
    }
  };

  const removerFoto = (): void => {
    setFoto(null);
    setFotoBase64(null);
  };

  const adicionarFoto = (): void => {
    Alert.alert(
      'Adicionar Foto',
      'Escolha uma opção',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Tirar Foto', onPress: tirarFoto },
        { text: ' Escolher da Galeria', onPress: escolherFotoGaleria },
        ...(foto ? [{ text: 'Remover Foto', onPress: removerFoto, style: 'destructive' as const }] : [])
      ]
    );
  };

  const validateCPF = (cpf: string): boolean => {
    const cpfClean = cpf.replace(/[^\d]/g, '');
    if (cpfClean.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpfClean)) return false;
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
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const carregarUsuarios = async () => {
    try {
      const response = await fetch(`${USUARIOS_URL}`);
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleCadastrar = async () => {
    if (!formData.nome_completo.trim()) {
      Alert.alert('Erro', 'Nome completo é obrigatório');
      return;
    }
    if (!validateEmail(formData.email)) {
      Alert.alert('Erro', 'E-mail inválido');
      return;
    }
    const cpfLimpo = limparCPF(formData.cpf);
    if (!validateCPF(formData.cpf)) {
      Alert.alert('Erro', 'CPF inválido');
      return;
    }
    if (formData.senha.length < 4) {
      Alert.alert('Erro', 'Senha deve ter pelo menos 4 caracteres');
      return;
    }
    if (formData.senha !== formData.confirmar_senha) {
      Alert.alert('Erro', 'Senhas não coincidem');
      return;
    }

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
      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
      limparFormulario();
      carregarUsuarios();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditar = async () => {
    if (!editingUser) return;
    if (!formData.nome_completo.trim()) {
      Alert.alert('Erro', 'Nome completo é obrigatório');
      return;
    }
    if (!validateEmail(formData.email)) {
      Alert.alert('Erro', 'E-mail inválido');
      return;
    }
    setSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nome_completo', formData.nome_completo.trim());
      formDataToSend.append('email', formData.email.trim().toLowerCase());
      if (formData.senha && formData.senha.length > 0) {
        if (formData.senha.length < 4) {
          Alert.alert('Erro', 'Senha deve ter pelo menos 4 caracteres');
          setSaving(false);
          return;
        }
        if (formData.senha !== formData.confirmar_senha) {
          Alert.alert('Erro', 'Senhas não coincidem');
          setSaving(false);
          return;
        }
        formDataToSend.append('senha', formData.senha);
      }
      const response = await fetch(`${USUARIOS_URL}/${editingUser.id}`, {
        method: 'PUT',
        body: formDataToSend,
        headers: { 'Accept': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.erro || 'Erro ao atualizar');
      Alert.alert('Sucesso', 'Usuário atualizado com sucesso!');
      setModalVisible(false);
      setEditingUser(null);
      limparFormulario();
      carregarUsuarios();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletar = async (id: number) => {
    try {
      const response = await fetch(`${USUARIOS_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao deletar');
      Alert.alert('Sucesso', 'Usuário deletado com sucesso!');
      carregarUsuarios();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const limparFormulario = () => {
    setFormData({
      nome_completo: '',
      email: '',
      cpf: '',
      senha: '',
      confirmar_senha: '',
      tipo_usuario: '0',
    });
    setFoto(null);
    setFotoBase64(null);
  };

  const abrirEdicao = (usuario: Usuario) => {
    setEditingUser(usuario);
    setFormData({
      nome_completo: usuario.nome_completo,
      email: usuario.email,
      cpf: usuario.cpf,
      senha: '',
      confirmar_senha: '',
      tipo_usuario: String(usuario.tipo_usuario),
    });
    setModalVisible(true);
  };

  const confirmarDelecao = (id: number) => {
    setConfirmTitle('Confirmar exclusão');
    setConfirmMessage('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.');
    setConfirmAction(() => () => handleDeletar(id));
    setConfirmModalVisible(true);
  };

  useFocusEffect(
    useCallback(() => {
      carregarUsuarios();
    }, [])
  );

  const voltarParaHome = () => {
    router.replace('/(tabs)');
  };

  const renderUsuarioCard = ({ item }: { item: Usuario }) => {
    const getFotoUrl = (fotoPath: string | null): string | null => {
      if (!fotoPath) return null;
      if (fotoPath.startsWith('http')) return fotoPath;
      return `${BASE_URL}${fotoPath}`;
    };
    const fotoUrl = item.foto ? getFotoUrl(item.foto) : null;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => {
            if (fotoUrl) {
              setFotoModalUrl(fotoUrl);
              setFotoModalVisible(true);
            }
          }}
        >
          <View style={styles.avatarContainer}>
            {fotoUrl ? (
              <Image source={{ uri: fotoUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <MaterialCommunityIcons name="account" size={28} color="#FFF" />
              </View>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.nome_completo}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {item.email}
            </Text>
            <View style={styles.userTags}>
              <View style={[styles.tag, { backgroundColor: item.tipo_usuario === 1 ? '#E3F2FD' : '#E8F5E9' }]}>
                <MaterialCommunityIcons
                  name={item.tipo_usuario === 1 ? 'doctor' : 'account'}
                  size={14}
                  color={item.tipo_usuario === 1 ? '#1976D2' : '#2E7D32'}
                />
                <Text style={[styles.tagText, { color: item.tipo_usuario === 1 ? '#1976D2' : '#2E7D32' }]}>
                  {item.tipo_usuario === 1 ? 'Médico' : 'Paciente'}
                </Text>
              </View>
              <View style={[styles.tag, { backgroundColor: '#FFF3E0' }]}>
                <MaterialCommunityIcons name="card-account-details" size={14} color="#E65100" />
                <Text style={[styles.tagText, { color: '#E65100' }]}>
                  {item.cpf}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionEdit]}
            onPress={() => abrirEdicao(item)}
          >
            <MaterialCommunityIcons name="pencil" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionDelete]}
            onPress={() => confirmarDelecao(item.id)}
          >
            <MaterialCommunityIcons name="delete" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUsuarioCard}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={carregarUsuarios} colors={['#8B0000']} />
          }
          ListHeaderComponent={
            <>
              {/* HEADER COM GRADIENTE E BOTÃO VOLTAR */}
              <LinearGradient
                colors={['#8B0000', '#A52A2A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
              >
                <TouchableOpacity style={styles.backButton} onPress={voltarParaHome}>
                  <MaterialCommunityIcons name="arrow-left" size={28} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.headerTop}>
                  <View style={styles.headerLeft}>
                    <MaterialCommunityIcons name="account-cog" size={28} color="#FFD700" />
                    <Text style={styles.headerTitle}>Gerenciar Usuário</Text>
                  </View>
                  <Image
                    source={require('../../assets/images/logomk.png')}
                    style={styles.headerLogo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.headerSubtitle}>
                  {usuarios.length} {usuarios.length === 1 ? 'usuário' : 'usuários'} cadastrados
                </Text>
              </LinearGradient>

              {/* FORMULÁRIO DE CADASTRO */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}> Cadastrar Novo Usuário</Text>

                <View style={styles.fotoContainer}>
                  <TouchableOpacity
                    style={styles.fotoButton}
                    onPress={adicionarFoto}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator size="small" color="#8B0000" />
                    ) : foto ? (
                      <Image source={{ uri: foto }} style={styles.fotoPerfil} />
                    ) : (
                      <View style={styles.fotoPlaceholder}>
                        <MaterialCommunityIcons name="camera-plus" size={40} color="#8B0000" />
                        <Text style={styles.fotoPlaceholderText}>Adicionar Foto</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome Completo *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Digite o nome completo"
                    placeholderTextColor="#999"
                    value={formData.nome_completo}
                    onChangeText={(text) => setFormData({ ...formData, nome_completo: text })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>E-mail *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Digite o e-mail"
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
                  <Text style={styles.label}>Tipo de Usuário *</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.tipo_usuario}
                      onValueChange={(itemValue) => setFormData({ ...formData, tipo_usuario: itemValue })}
                      style={styles.picker}
                      dropdownIconColor="#8B0000"
                    >
                      <Picker.Item label="Paciente" value="0" />
                      <Picker.Item label="Médico" value="1" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Senha *</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Digite a senha (mín. 4 caracteres)"
                      placeholderTextColor="#999"
                      value={formData.senha}
                      onChangeText={(text) => setFormData({ ...formData, senha: text })}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirmar Senha *</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Confirme a senha"
                      placeholderTextColor="#999"
                      value={formData.confirmar_senha}
                      onChangeText={(text) => setFormData({ ...formData, confirmar_senha: text })}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
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
                    <>
                      <MaterialCommunityIcons name="content-save" size={20} color="#FFF" />
                      <Text style={styles.saveButtonText}>CADASTRAR USUÁRIO</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* LISTA DE USUÁRIOS */}
              <View style={styles.listaContainer}>
                <View style={styles.listaHeader}>
                  <MaterialCommunityIcons name="account-group" size={22} color="#8B0000" />
                  <Text style={styles.listaTitle}>Lista de Usuários</Text>
                  <View style={styles.listaBadge}>
                    <Text style={styles.listaBadgeText}>{usuarios.length}</Text>
                  </View>
                </View>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="account-off" size={60} color="#CCCCCC" />
              <Text style={styles.emptyTitle}>Nenhum usuário cadastrado</Text>
              <Text style={styles.emptyText}>Cadastre o primeiro usuário</Text>
            </View>
          }
        />

        {/* MODAL DE EDIÇÃO */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>✏️ Editar Usuário</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome Completo *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Digite o nome completo"
                    placeholderTextColor="#999"
                    value={formData.nome_completo}
                    onChangeText={(text) => setFormData({ ...formData, nome_completo: text })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>E-mail *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Digite o e-mail"
                    placeholderTextColor="#999"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tipo de Usuário *</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.tipo_usuario}
                      onValueChange={(itemValue) => setFormData({ ...formData, tipo_usuario: itemValue })}
                      style={styles.picker}
                      dropdownIconColor="#8B0000"
                    >
                      <Picker.Item label="Paciente" value="0" />
                      <Picker.Item label="Médico" value="1" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nova Senha (opcional)</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Digite a nova senha (mín. 4 caracteres)"
                      placeholderTextColor="#999"
                      value={formData.senha}
                      onChangeText={(text) => setFormData({ ...formData, senha: text })}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirmar Nova Senha</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Confirme a nova senha"
                      placeholderTextColor="#999"
                      value={formData.confirmar_senha}
                      onChangeText={(text) => setFormData({ ...formData, confirmar_senha: text })}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={handleEditar}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="content-save" size={20} color="#FFF" />
                      <Text style={styles.saveButtonText}>ATUALIZAR USUÁRIO</Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* MODAL DE CONFIRMAÇÃO */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={confirmModalVisible}
          onRequestClose={() => setConfirmModalVisible(false)}
        >
          <Pressable style={styles.modalOverlayGlobal} onPress={() => setConfirmModalVisible(false)}>
            <View style={styles.modalContainerGlobal}>
              <Pressable style={styles.modalContentGlobal} onPress={(e) => e.stopPropagation()}>
                <View style={[styles.modalIconCircle, styles.modalIconConfirm]}>
                  <MaterialCommunityIcons name="alert-circle" size={50} color="#FF9800" />
                </View>
                <Text style={[styles.modalTitleGlobal, styles.modalTitleConfirm]}>
                  {confirmTitle}
                </Text>
                <Text style={styles.modalMensagemGlobal}>{confirmMessage}</Text>
                <View style={styles.modalBotoesContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonSecundario]}
                    onPress={() => setConfirmModalVisible(false)}
                  >
                    <Text style={styles.modalButtonTextSecundario}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonError]}
                    onPress={() => {
                      setConfirmModalVisible(false);
                      if (confirmAction) confirmAction();
                    }}
                  >
                    <Text style={styles.modalButtonText}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* MODAL DE VISUALIZAÇÃO DE FOTO */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={fotoModalVisible}
          onRequestClose={() => setFotoModalVisible(false)}
        >
          <Pressable style={styles.modalOverlayGlobal} onPress={() => setFotoModalVisible(false)}>
            <View style={styles.modalContainerGlobal}>
              <Pressable style={styles.modalContentGlobal} onPress={(e) => e.stopPropagation()}>
                <Text style={styles.modalTitleGlobal}>Foto do Usuário</Text>
                {fotoModalUrl && (
                  <Image source={{ uri: fotoModalUrl }} style={styles.modalFoto} />
                )}
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonInfo]}
                  onPress={() => setFotoModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Fechar</Text>
                </TouchableOpacity>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  listContainer: { paddingBottom: 30 },

  // HEADER
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 10,
  },
  headerLogo: {
    width: 45,
    height: 45,
    tintColor: '#FFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    textAlign: 'center',
  },

  // FORMULÁRIO
  formCard: {
    backgroundColor: '#FFF',
    margin: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  fotoContainer: { alignItems: 'center', marginBottom: 16 },
  fotoButton: {
    width: 110,
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#8B0000',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotoPerfil: { width: 110, height: 110, borderRadius: 12 },
  fotoPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8B0000',
    borderStyle: 'dashed',
  },
  fotoPlaceholderText: { fontSize: 12, color: '#666', marginTop: 4 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  pickerContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
    height: 56,
  },
  picker: {
    height: 56,
    width: '100%',
    color: '#333',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  eyeButton: { paddingHorizontal: 14 },
  eyeIcon: { fontSize: 18, color: '#666' },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8B0000',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonDisabled: { backgroundColor: '#CC6666', opacity: 0.7 },
  saveButtonText: { fontSize: 15, fontWeight: 'bold', color: '#FFF', letterSpacing: 0.5 },

  // LISTA DE USUÁRIOS
  listaContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  listaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E8E8E8',
  },
  listaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  listaBadge: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  listaBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // CARDS
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: { width: 54, height: 54, borderRadius: 12 },
  avatarFallback: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 13, color: '#666', marginTop: 1 },
  userTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  tagText: { fontSize: 11, fontWeight: '500' },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  actionEdit: { backgroundColor: '#8B0000' },
  actionDelete: { backgroundColor: '#D32F2F' },
  actionButtonText: { fontSize: 13, fontWeight: 'bold', color: '#FFF' },

  // EMPTY
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#999', marginTop: 12 },
  emptyText: { fontSize: 14, color: '#CCC', marginTop: 4 },

  // MODAL DE EDIÇÃO
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  modalContent: { padding: 20 },

  // MODAIS GLOBAIS
  modalOverlayGlobal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainerGlobal: { padding: 20, width: '100%', alignItems: 'center' },
  modalContentGlobal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 16,
  },
  modalIconConfirm: { backgroundColor: '#FFF3E0', borderColor: '#FF9800' },
  modalTitleGlobal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalTitleConfirm: { color: '#E65100' },
  modalMensagemGlobal: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalBotoesContainer: { width: '100%', gap: 10 },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  modalButtonSuccess: { backgroundColor: '#4CAF50' },
  modalButtonError: { backgroundColor: '#F44336' },
  modalButtonInfo: { backgroundColor: '#2196F3' },
  modalButtonConfirm: { backgroundColor: '#FF9800' },
  modalButtonSecundario: { backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0' },
  modalButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 },
  modalButtonTextSecundario: { color: '#666' },
  modalFoto: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: 'contain',
  },
});