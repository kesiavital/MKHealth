// app/(tabs)/exames.tsx - VERSÃO CORRIGIDA

import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Linking from 'expo-linking';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IP from '../../service/api';
import { STORAGE_KEYS } from '../../service/auth';

const API_URL = `http://${IP}:3000/api/exames`;

interface Exame {
  id: number;
  paciente_nome: string;
  tipo_exame: string;
  data_exame: string;
  medico_solicitante: string;
  laboratorio: string;
  resultados: string | null;
  observacoes: string | null;
  possui_pdf: boolean;
  pdf_nome: string | null;
  pdf_tamanho: number | null;
  pdf_path: string | null;
  created_at: string;
  updated_at: string;
}

interface UserData {
  id: number;
  nome_completo: string;
  email: string;
  cpf: string;
  tipo_usuario: number;
  foto: string | null;
}

const TIPOS_EXAME = [
  'Hemograma', 'Glicemia', 'Colesterol', 'Triglicerídeos', 'Urina',
  'Raio-X', 'Ultrassom', 'Tomografia', 'Ressonância', 'Eletrocardiograma',
  'Teste de Esforço', 'Endoscopia', 'Colonoscopia', 'Mamografia',
  'Papanicolau', 'PCR', 'COVID-19', 'Outro',
];

const MEDICOS = [
  'Dr. João Silva - Clínico Geral',
  'Dra. Maria Santos - Cardiologista',
  'Dr. Pedro Oliveira - Ortopedista',
  'Dra. Ana Costa - Ginecologista',
  'Dr. Carlos Mendes - Neurologista',
  'Dra. Patricia Lima - Dermatologista',
  'Dr. Ricardo Alves - Pediatra',
  'Dra. Fernanda Rocha - Endocrinologista',
  'Dr. Eduardo Souza - Urologista',
  'Dra. Lucia Ferreira - Oftalmologista',
  'Outro',
];

const LABORATORIOS = [
  'Lab Diagnóstico Avançado',
  'Lab Medicina Laboratorial',
  'Lab Análises Clínicas',
  'Lab Alta Precisão',
  'Lab Central de Análises',
  'Lab Biotec Diagnósticos',
  'Lab Patologia Molecular',
  'Lab Saúde Total',
  'Lab Exame Rápido',
  'Outro',
];

export default function ExamesScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [listaExames, setListaExames] = useState<Exame[]>([]);
  const [loading, setLoading] = useState(false);
  const [openingId, setOpeningId] = useState<number | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingExame, setEditingExame] = useState<Exame | null>(null);
  const [saving, setSaving] = useState(false);
  const [newPdfFile, setNewPdfFile] = useState<any>(null);
  const [removerPdf, setRemoverPdf] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTipoSelect, setShowTipoSelect] = useState(false);
  const [showMedicoSelect, setShowMedicoSelect] = useState(false);
  const [showLaboratorioSelect, setShowLaboratorioSelect] = useState(false);

  const [formData, setFormData] = useState({
    paciente_nome: '',
    tipo_exame: '',
    data_exame: '',
    medico_solicitante: '',
    laboratorio: '',
    resultados: '',
    observacoes: '',
  });

  const [modalVisibleGlobal, setModalVisibleGlobal] = useState(false);
  const [modalTipo, setModalTipo] = useState<'sucesso' | 'erro' | 'info' | 'confirmacao' | 'pdf'>('info');
  const [modalTitulo, setModalTitulo] = useState('');
  const [modalMensagem, setModalMensagem] = useState('');
  const [modalBotaoTexto, setModalBotaoTexto] = useState('OK');
  const [modalAcao, setModalAcao] = useState<(() => void) | null>(null);
  const [modalBotaoSecundario, setModalBotaoSecundario] = useState<{ texto: string; acao: () => void } | null>(null);
  const [modalExamePdf, setModalExamePdf] = useState<Exame | null>(null);

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = async () => {
    try {
      const userDataString = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userDataString) {
        const data = JSON.parse(userDataString);
        setUserData(data);
        setIsAdmin(data?.tipo_usuario === 1);
        console.log('Usuário carregado:', data);
        console.log('É admin?', data?.tipo_usuario === 1);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const abrirModal = (
    tipo: 'sucesso' | 'erro' | 'info' | 'confirmacao' | 'pdf',
    titulo: string,
    mensagem: string,
    botaoTexto: string = 'OK',
    acao?: () => void,
    botaoSecundario?: { texto: string; acao: () => void }
  ) => {
    setModalTipo(tipo);
    setModalTitulo(titulo);
    setModalMensagem(mensagem);
    setModalBotaoTexto(botaoTexto);
    setModalAcao(() => acao || null);
    setModalBotaoSecundario(botaoSecundario || null);
    setModalExamePdf(null);
    setModalVisibleGlobal(true);
  };

  const abrirModalPDF = (exame: Exame) => {
    setModalExamePdf(exame);
    setModalTipo('pdf');
    setModalTitulo('Visualizar PDF');
    setModalMensagem(`Deseja abrir o PDF do exame de ${exame.paciente_nome}?`);
    setModalBotaoTexto('Abrir PDF');
    setModalAcao(() => () => visualizarPDF(exame));
    setModalBotaoSecundario({ texto: 'Cancelar', acao: () => { } });
    setModalVisibleGlobal(true);
  };

  const fecharModal = () => {
    setModalVisibleGlobal(false);
    if (modalAcao) {
      modalAcao();
    }
  };

  // 🔥 FUNÇÃO PARA FAZER REQUISIÇÕES COM TOKEN
  const fetchWithToken = async (url: string, options: any = {}) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);

    if (!token) {
      throw new Error('Token não encontrado');
    }

    const headers: any = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    return response;
  };

 // app/(tabs)/exames.tsx - PARTE CORRIGIDA (carregarExames)

const carregarExames = async () => {
  setLoading(true);
  try {
    console.log('📋 Carregando exames...');

    const response = await fetchWithToken(API_URL);
    const data = await response.json();

    console.log('📋 Resposta:', Array.isArray(data) ? `Array com ${data.length} itens` : typeof data);

    if (!userData) {
      await carregarUsuario();
      return;
    }

    let examesData: Exame[] = [];
    if (Array.isArray(data)) {
      examesData = data;
    } else if (data && data.exames && Array.isArray(data.exames)) {
      examesData = data.exames;
    } else if (data && data.data && Array.isArray(data.data)) {
      examesData = data.data;
    } else {
      console.log('⚠️ Estrutura de dados não reconhecida:', data);
      examesData = [];
    }

    // 🔥 FILTRO CORRIGIDO - Mais flexível
    let examesFiltrados = examesData;
    if (!isAdmin) {
      // Normalizar os nomes para comparação
      const nomePaciente = userData.nome_completo?.toLowerCase().trim().replace(/\s+/g, ' ');
      console.log('📱 Nome do paciente logado:', nomePaciente);

      examesFiltrados = examesData.filter((exame: Exame) => {
        const nomeExame = exame.paciente_nome?.toLowerCase().trim().replace(/\s+/g, ' ');
        console.log(`📱 Comparando: "${nomeExame}" === "${nomePaciente}"`);
        return nomeExame === nomePaciente;
      });
      
      console.log(`📱 Paciente ${userData.nome_completo} - ${examesFiltrados.length} exames encontrados`);
    } else {
      console.log(`📱 Admin - ${examesFiltrados.length} exames encontrados`);
    }

    setListaExames(examesFiltrados);
  } catch (error: any) {
    console.error('❌ Erro ao carregar exames:', error);

    if (error.message.includes('Sessão expirada')) {
      abrirModal('erro', '⏰ Sessão Expirada', 'Sua sessão expirou. Faça login novamente.');
    } else {
      abrirModal('erro', '❌ Erro', 'Não foi possível carregar a lista de exames');
    }
  } finally {
    setLoading(false);
  }
};
  const editarExame = (exame: Exame) => {
    setEditingExame(exame);
    setFormData({
      paciente_nome: exame.paciente_nome,
      tipo_exame: exame.tipo_exame,
      data_exame: exame.data_exame.split('T')[0],
      medico_solicitante: exame.medico_solicitante,
      laboratorio: exame.laboratorio,
      resultados: exame.resultados || '',
      observacoes: exame.observacoes || '',
    });
    setNewPdfFile(null);
    setRemoverPdf(false);
    setModalVisible(true);
  };

  const selecionarNovoPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        setNewPdfFile(result.assets[0]);
        setRemoverPdf(false);
        abrirModal('sucesso', 'PDF Selecionado', 'PDF selecionado com sucesso!');
      }
    } catch (error) {
      abrirModal('erro', 'Erro', 'Não foi possível selecionar o PDF');
    }
  };

  const confirmarRemoverPDF = () => {
    setModalTipo('confirmacao');
    setModalTitulo('Remover PDF');
    setModalMensagem('Tem certeza que deseja remover o PDF?');
    setModalBotaoTexto('Remover');
    setModalAcao(() => () => {
      setRemoverPdf(true);
      setNewPdfFile(null);
    });
    setModalBotaoSecundario({ texto: 'Cancelar', acao: () => { } });
    setModalExamePdf(null);
    setModalVisibleGlobal(true);
  };

  const formatarDataExibicao = (data: string) => {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const formatarDataAPI = (data: Date) => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const salvarAlteracoes = async () => {
    if (!formData.paciente_nome.trim()) {
      abrirModal('erro', 'Campo Obrigatório', 'Nome do paciente é obrigatório');
      return;
    }

    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('paciente_nome', formData.paciente_nome.trim());
      formDataToSend.append('tipo_exame', formData.tipo_exame.trim());
      formDataToSend.append('data_exame', formData.data_exame);
      formDataToSend.append('medico_solicitante', formData.medico_solicitante.trim());
      formDataToSend.append('laboratorio', formData.laboratorio.trim());

      if (formData.resultados) {
        formDataToSend.append('resultados', formData.resultados);
      }
      if (formData.observacoes) {
        formDataToSend.append('observacoes', formData.observacoes);
      }

      if (newPdfFile) {
        formDataToSend.append('pdf', {
          uri: newPdfFile.uri,
          type: newPdfFile.mimeType || 'application/pdf',
          name: newPdfFile.name,
        } as any);
      }

      if (removerPdf && !newPdfFile) {
        formDataToSend.append('remover_pdf', 'true');
      }

      const response = await fetchWithToken(`${API_URL}/${editingExame?.id}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao atualizar exame');
      }

      abrirModal('sucesso', 'Sucesso!', 'Exame atualizado com sucesso!', 'OK', () => {
        setModalVisible(false);
        carregarExames();
      });

    } catch (error: any) {
      console.error('❌ Erro ao salvar:', error);

      if (error.message.includes('Sessão expirada')) {
        abrirModal('erro', '⏰ Sessão Expirada', 'Sua sessão expirou. Faça login novamente.');
      } else {
        abrirModal('erro', '❌ Erro', error.message || 'Erro ao atualizar');
      }
    } finally {
      setSaving(false);
    }
  };

  const deletarExame = async (id: number) => {
    setModalTipo('confirmacao');
    setModalTitulo('Confirmar exclusão');
    setModalMensagem('Deseja excluir este exame? Esta ação não pode ser desfeita.');
    setModalBotaoTexto('Excluir');
    setModalAcao(() => async () => {
      try {
        const response = await fetchWithToken(`${API_URL}/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.erro || 'Erro ao deletar');
        }

        abrirModal('sucesso', '✅ Sucesso', 'Exame deletado com sucesso!', 'OK', () => carregarExames());
      } catch (error: any) {
        console.error('❌ Erro ao deletar:', error);

        if (error.message.includes('Sessão expirada')) {
          abrirModal('erro', '⏰ Sessão Expirada', 'Sua sessão expirou. Faça login novamente.');
        } else {
          abrirModal('erro', '❌ Erro', error.message || 'Não foi possível deletar o exame');
        }
      }
    });
    setModalBotaoSecundario({ texto: 'Cancelar', acao: () => { } });
    setModalExamePdf(null);
    setModalVisibleGlobal(true);
  };

  // ============================================
  // 🔥 FUNÇÃO VISUALIZAR PDF
  // ============================================
  const visualizarPDF = async (exame: Exame) => {
    if (!exame.possui_pdf) {
      abrirModal('erro', 'Erro', 'Este exame não possui PDF');
      return;
    }

    setOpeningId(exame.id);

    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);

      if (!token) {
        throw new Error('Token não encontrado');
      }

      const pdfUrl = `http://${IP}:3000/api/exames/${exame.id}/visualizar?token=${token}`;
      console.log('📄 Abrindo PDF:', pdfUrl);

      if (Platform.OS === 'android') {
        const supported = await Linking.canOpenURL(pdfUrl);
        if (supported) {
          await Linking.openURL(pdfUrl);
        } else {
          try {
            await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
              data: pdfUrl,
              type: 'application/pdf',
              flags: 1,
            });
          } catch (intentError) {
            console.error('❌ IntentLauncher falhou:', intentError);
            await Linking.openURL(pdfUrl);
          }
        }
      } else {
        const supported = await Linking.canOpenURL(pdfUrl);
        if (supported) {
          await Linking.openURL(pdfUrl);
        } else {
          throw new Error('Não foi possível abrir o PDF');
        }
      }

    } catch (error: any) {
      console.error('❌ Erro ao abrir PDF:', error);

      if (error.message.includes('Sessão expirada')) {
        abrirModal('erro', '⏰ Sessão Expirada', 'Sua sessão expirou. Faça login novamente.');
      } else {
        abrirModal('erro', '❌ Erro', error.message || 'Não foi possível abrir o PDF');
      }
    } finally {
      setOpeningId(null);
    }
  };

  const mostrarMenuPDF = (exame: Exame) => {
    abrirModalPDF(exame);
  };

  const mostrarMenuExame = (exame: Exame) => {
    setModalTipo('confirmacao');
    setModalTitulo('Ações');
    setModalMensagem(`O que deseja fazer com o exame de ${exame.paciente_nome}?`);
    setModalBotaoTexto('Editar');
    setModalAcao(() => () => editarExame(exame));
    setModalBotaoSecundario({
      texto: '🗑️ Excluir',
      acao: () => deletarExame(exame.id)
    });
    setModalExamePdf(null);
    setModalVisibleGlobal(true);
  };

  const formatarDataLista = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  const capitalizarNome = (texto?: string) => {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  useFocusEffect(
    useCallback(() => {
      if (userData) {
        carregarExames();
      }
    }, [userData])
  );

  // ============================================
  // RENDER
  // ============================================

  const renderModalIcon = () => {
    switch (modalTipo) {
      case 'sucesso':
        return (
          <View style={[styles.modalIconCircle, styles.modalIconSuccess]}>
            <MaterialCommunityIcons name="check-circle" size={50} color="#4CAF50" />
          </View>
        );
      case 'erro':
        return (
          <View style={[styles.modalIconCircle, styles.modalIconError]}>
            <MaterialCommunityIcons name="alert-circle" size={50} color="#F44336" />
          </View>
        );
      case 'info':
        return (
          <View style={[styles.modalIconCircle, styles.modalIconInfo]}>
            <MaterialCommunityIcons name="information" size={50} color="#2196F3" />
          </View>
        );
      case 'confirmacao':
        return (
          <View style={[styles.modalIconCircle, styles.modalIconConfirm]}>
            <MaterialCommunityIcons name="help-circle" size={50} color="#FF9800" />
          </View>
        );
      case 'pdf':
        return (
          <View style={[styles.modalIconCircle, styles.modalIconPdf]}>
            <MaterialCommunityIcons name="file-pdf-box" size={50} color="#DC143C" />
          </View>
        );
      default:
        return null;
    }
  };

  const renderExameCard = ({ item }: { item: Exame }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.pacienteInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.paciente_nome.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.pacienteDetails}>
            <Text style={styles.pacienteNome}>{capitalizarNome(item.paciente_nome)}</Text>
            <Text style={styles.exameTipo}>{item.tipo_exame}</Text>
          </View>
        </View>
        {isAdmin && (
          <TouchableOpacity onPress={() => mostrarMenuExame(item)}>
            <MaterialCommunityIcons name="dots-vertical" size={24} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="calendar" size={18} color="#8B0000" />
          <Text style={styles.infoLabel}>Data:</Text>
          <Text style={styles.infoValue}>{formatarDataLista(item.data_exame)}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="doctor" size={18} color="#8B0000" />
          <Text style={styles.infoLabel}>Médico:</Text>
          <Text style={styles.infoValue}>{item.medico_solicitante}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="test-tube" size={18} color="#8B0000" />
          <Text style={styles.infoLabel}>Laboratório:</Text>
          <Text style={styles.infoValue}>{item.laboratorio}</Text>
        </View>

        {item.resultados && (
          <View style={styles.resultadosContainer}>
            <MaterialCommunityIcons name="clipboard-text" size={16} color="#666" />
            <Text style={styles.resultadosText}>{item.resultados}</Text>
          </View>
        )}

        {item.observacoes && (
          <View style={styles.observacoesContainer}>
            <MaterialCommunityIcons name="note-text" size={16} color="#856404" />
            <Text style={styles.observacoesText}>{item.observacoes}</Text>
          </View>
        )}

        {item.possui_pdf && (
          <TouchableOpacity
            style={styles.pdfButton}
            onPress={() => mostrarMenuPDF(item)}
            disabled={openingId === item.id}
          >
            {openingId === item.id ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="file-pdf-box" size={22} color="#FFF" />
                <Text style={styles.pdfButtonText}>Visualizar PDF</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardFooter}>
        <MaterialCommunityIcons name="clock-outline" size={12} color="#999" />
        <Text style={styles.dataCriacao}>
          {new Date(item.created_at).toLocaleDateString('pt-BR')}
        </Text>
      </View>
    </View>
  );

  if (loading && listaExames.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8B0000" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {isAdmin 
              ? `Exames encontrados: ${listaExames.length}`
              : `${capitalizarNome(userData?.nome_completo?.split(' ')[0] || 'Paciente')}, você tem ${listaExames.length} ${listaExames.length === 1 ? 'exame' : 'exames'}`
            }
          </Text>
        </View>

        <FlatList
          data={listaExames}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderExameCard}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={carregarExames} colors={['#8B0000']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="file-document-outline" size={80} color="#CCCCCC" />
              <Text style={styles.emptyTitle}>Nenhum exame encontrado</Text>
              <Text style={styles.emptyText}>
                {isAdmin ? 'Cadastre o primeiro exame' : 'Aguardando cadastro de exames'}
              </Text>
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
                <Text style={styles.modalTitle}>Editar Exame</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalContent}>
                <TextInput
                  style={styles.input}
                  placeholder="Nome do Paciente *"
                  value={formData.paciente_nome}
                  onChangeText={(text) => setFormData({ ...formData, paciente_nome: text })}
                />

                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowTipoSelect(true)}
                >
                  <Text>{formData.tipo_exame || 'Selecione o tipo'}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>{formData.data_exame ? formatarDataExibicao(formData.data_exame) : 'Selecione a data'}</Text>
                  <MaterialCommunityIcons name="calendar" size={20} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowMedicoSelect(true)}
                >
                  <Text>{formData.medico_solicitante || 'Selecione o médico'}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowLaboratorioSelect(true)}
                >
                  <Text>{formData.laboratorio || 'Selecione o laboratório'}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} />
                </TouchableOpacity>

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Resultados"
                  value={formData.resultados}
                  onChangeText={(text) => setFormData({ ...formData, resultados: text })}
                  multiline
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Observações"
                  value={formData.observacoes}
                  onChangeText={(text) => setFormData({ ...formData, observacoes: text })}
                  multiline
                />

                <View style={styles.pdfSection}>
                  <Text style={styles.pdfTitle}>PDF do Exame</Text>

                  {editingExame?.possui_pdf && !removerPdf && !newPdfFile && (
                    <View style={styles.currentPdf}>
                      <Text> {editingExame.pdf_nome}</Text>
                      <TouchableOpacity onPress={confirmarRemoverPDF}>
                        <Text style={styles.removeText}>Remover</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {!removerPdf && (
                    <TouchableOpacity style={styles.uploadButton} onPress={selecionarNovoPDF}>
                      <Text>{editingExame?.possui_pdf ? 'Alterar PDF' : 'Adicionar PDF'}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={salvarAlteracoes}
                  disabled={saving}
                >
                  {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Salvar</Text>}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* MODAIS DE SELEÇÃO */}
        <Modal visible={showTipoSelect} transparent animationType="slide">
          <View style={styles.selectModalOverlay}>
            <View style={styles.selectModalContainer}>
              <View style={styles.selectModalHeader}>
                <Text style={styles.selectModalTitle}>Selecione o Tipo</Text>
                <TouchableOpacity onPress={() => setShowTipoSelect(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {TIPOS_EXAME.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.selectOption}
                    onPress={() => {
                      setFormData({ ...formData, tipo_exame: item });
                      setShowTipoSelect(false);
                    }}
                  >
                    <Text style={styles.selectOptionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal visible={showMedicoSelect} transparent animationType="slide">
          <View style={styles.selectModalOverlay}>
            <View style={styles.selectModalContainer}>
              <View style={styles.selectModalHeader}>
                <Text style={styles.selectModalTitle}>Selecione o Médico</Text>
                <TouchableOpacity onPress={() => setShowMedicoSelect(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {MEDICOS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.selectOption}
                    onPress={() => {
                      setFormData({ ...formData, medico_solicitante: item });
                      setShowMedicoSelect(false);
                    }}
                  >
                    <Text style={styles.selectOptionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal visible={showLaboratorioSelect} transparent animationType="slide">
          <View style={styles.selectModalOverlay}>
            <View style={styles.selectModalContainer}>
              <View style={styles.selectModalHeader}>
                <Text style={styles.selectModalTitle}>Selecione o Laboratório</Text>
                <TouchableOpacity onPress={() => setShowLaboratorioSelect(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {LABORATORIOS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.selectOption}
                    onPress={() => {
                      setFormData({ ...formData, laboratorio: item });
                      setShowLaboratorioSelect(false);
                    }}
                  >
                    <Text style={styles.selectOptionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {showDatePicker && (
          <DateTimePicker
            value={formData.data_exame ? new Date(formData.data_exame) : new Date()}
            mode="date"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setFormData({ ...formData, data_exame: formatarDataAPI(selectedDate) });
              }
            }}
          />
        )}

        {/* MODAL UNIVERSAL */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisibleGlobal}
          onRequestClose={fecharModal}
        >
          <Pressable style={styles.modalOverlayGlobal} onPress={fecharModal}>
            <View style={styles.modalContainerGlobal}>
              <Pressable style={styles.modalContentGlobal} onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalIconContainer}>
                  {renderModalIcon()}
                </View>

                <Text style={[
                  styles.modalTitleGlobal,
                  modalTipo === 'sucesso' && styles.modalTitleSuccess,
                  modalTipo === 'erro' && styles.modalTitleError,
                  modalTipo === 'info' && styles.modalTitleInfo,
                  modalTipo === 'confirmacao' && styles.modalTitleConfirm,
                  modalTipo === 'pdf' && styles.modalTitlePdf,
                ]}>
                  {modalTitulo}
                </Text>

                <Text style={[
                  styles.modalMensagemGlobal,
                  modalTipo === 'sucesso' && styles.modalMensagemSuccess,
                  modalTipo === 'erro' && styles.modalMensagemError,
                ]}>
                  {modalMensagem}
                </Text>

                {modalTipo === 'pdf' && modalExamePdf && (
                  <View style={styles.modalPdfInfo}>
                    <MaterialCommunityIcons name="file-pdf-box" size={40} color="#DC143C" />
                    <Text style={styles.modalPdfNome}>{modalExamePdf.pdf_nome || 'PDF do exame'}</Text>
                    <Text style={styles.modalPdfPaciente}>
                      Paciente: {modalExamePdf.paciente_nome}
                    </Text>
                  </View>
                )}

                <View style={styles.modalBotoesContainer}>
                  {modalBotaoSecundario && (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonSecundario]}
                      onPress={() => {
                        setModalVisibleGlobal(false);
                        modalBotaoSecundario?.acao();
                      }}
                    >
                      <Text style={[styles.modalButtonText, styles.modalButtonTextSecundario]}>
                        {modalBotaoSecundario.texto}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      modalTipo === 'sucesso' && styles.modalButtonSuccess,
                      modalTipo === 'erro' && styles.modalButtonError,
                      modalTipo === 'info' && styles.modalButtonInfo,
                      modalTipo === 'confirmacao' && styles.modalButtonConfirm,
                      modalTipo === 'pdf' && styles.modalButtonPdf,
                      modalBotaoSecundario && styles.modalButtonPrincipal,
                    ]}
                    onPress={fecharModal}
                  >
                    <Text style={styles.modalButtonText}>{modalBotaoTexto}</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// ============================================
// STYLES (mantidos iguais aos originais)
// ============================================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  header: {
    backgroundColor: '#8B0000',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: -15,
    zIndex: 1,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  headerText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  listContainer: { padding: 16, paddingTop: 16 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    overflow: 'hidden'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFF5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0E0'
  },
  pacienteInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  pacienteDetails: { marginLeft: 12, flex: 1 },
  pacienteNome: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  exameTipo: { fontSize: 12, color: '#8B0000', marginTop: 2, fontWeight: '500' },
  cardContent: { padding: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoLabel: { fontSize: 13, color: '#666', marginLeft: 8, marginRight: 8, fontWeight: '500' },
  infoValue: { fontSize: 13, color: '#333', flex: 1 },
  resultadosContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8
  },
  resultadosText: { fontSize: 13, color: '#333', marginLeft: 8, flex: 1 },
  observacoesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    padding: 10,
    backgroundColor: '#FFF8E1',
    borderRadius: 8
  },
  observacoesText: { fontSize: 13, color: '#856404', marginLeft: 8, flex: 1 },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B0000',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8
  },
  pdfButtonText: { fontSize: 13, fontWeight: 'bold', color: '#FFF' },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 6
  },
  dataCriacao: { fontSize: 11, color: '#999' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#999', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#CCC', marginTop: 8, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  modalContent: { padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#F8F9FA'
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#F8F9FA'
  },
  pdfSection: {
    marginTop: 10,
    marginBottom: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  pdfTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  currentPdf: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12
  },
  removeText: { color: '#FF4444', fontWeight: '500' },
  uploadButton: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8B0000',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 8
  },
  saveButton: {
    backgroundColor: '#8B0000',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  selectModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  selectModalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%'
  },
  selectModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  selectModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  selectOption: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  selectOptionText: { fontSize: 16, color: '#333' },
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
  modalIconContainer: { marginBottom: 16 },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  modalIconSuccess: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  modalIconError: { backgroundColor: '#FFEBEE', borderColor: '#F44336' },
  modalIconInfo: { backgroundColor: '#E3F2FD', borderColor: '#2196F3' },
  modalIconConfirm: { backgroundColor: '#FFF3E0', borderColor: '#FF9800' },
  modalIconPdf: { backgroundColor: '#FFEBEE', borderColor: '#DC143C' },
  modalTitleGlobal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalTitleSuccess: { color: '#2E7D32' },
  modalTitleError: { color: '#C62828' },
  modalTitleInfo: { color: '#0D47A1' },
  modalTitleConfirm: { color: '#E65100' },
  modalTitlePdf: { color: '#DC143C' },
  modalMensagemGlobal: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalMensagemSuccess: { color: '#1B5E20' },
  modalMensagemError: { color: '#B71C1C' },
  modalPdfInfo: {
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  modalPdfNome: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 8, textAlign: 'center' },
  modalPdfPaciente: { fontSize: 13, color: '#666', marginTop: 4, textAlign: 'center' },
  modalBotoesContainer: { width: '100%', gap: 10 },
  modalButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonSuccess: { backgroundColor: '#4CAF50' },
  modalButtonError: { backgroundColor: '#F44336' },
  modalButtonInfo: { backgroundColor: '#2196F3' },
  modalButtonConfirm: { backgroundColor: '#FF9800' },
  modalButtonPdf: { backgroundColor: '#DC143C' },
  modalButtonPrincipal: { marginTop: 5 },
  modalButtonSecundario: { backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0' },
  modalButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 },
  modalButtonTextSecundario: { color: '#666' },
});