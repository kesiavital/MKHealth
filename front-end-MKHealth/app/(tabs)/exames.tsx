// app/(tabs)/exames.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import IP from '../../service/api';

// URL da API
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

// Opções para selects
const TIPOS_EXAME = [
  'Hemograma',
  'Glicemia',
  'Colesterol',
  'Triglicerídeos',
  'Urina',
  'Raio-X',
  'Ultrassom',
  'Tomografia',
  'Ressonância',
  'Eletrocardiograma',
  'Teste de Esforço',
  'Endoscopia',
  'Colonoscopia',
  'Mamografia',
  'Papanicolau',
  'PCR',
  'COVID-19',
  'Outro',
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
  const [listaExames, setListaExames] = useState<Exame[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  
  // Estados para o modal de edição
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExame, setEditingExame] = useState<Exame | null>(null);
  const [saving, setSaving] = useState(false);
  const [newPdfFile, setNewPdfFile] = useState<any>(null);
  const [removerPdf, setRemoverPdf] = useState(false);
  
  // Estados para selects e datepicker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTipoSelect, setShowTipoSelect] = useState(false);
  const [showMedicoSelect, setShowMedicoSelect] = useState(false);
  const [showLaboratorioSelect, setShowLaboratorioSelect] = useState(false);
  const [tipoCustom, setTipoCustom] = useState(false);
  const [medicoCustom, setMedicoCustom] = useState(false);
  const [laboratorioCustom, setLaboratorioCustom] = useState(false);
  
  // Form data para edição
  const [formData, setFormData] = useState({
    paciente_nome: '',
    tipo_exame: '',
    data_exame: '',
    medico_solicitante: '',
    laboratorio: '',
    resultados: '',
    observacoes: '',
  });

  const carregarExames = async () => {
    console.log('🔄 Carregando exames...');
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      console.log(`✅ ${data.length} exames carregados`);
      setListaExames(data);
    } catch (error) {
      console.error('❌ Erro:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de exames');
    } finally {
      setLoading(false);
    }
  };

  // Função para editar exame
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
    
    // Verificar se os valores são personalizados
    setTipoCustom(!TIPOS_EXAME.includes(exame.tipo_exame));
    setMedicoCustom(!MEDICOS.includes(exame.medico_solicitante));
    setLaboratorioCustom(!LABORATORIOS.includes(exame.laboratorio));
    
    setModalVisible(true);
  };

  // Selecionar novo PDF
  const selecionarNovoPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        const file = result.assets[0];
        setNewPdfFile(file);
        setRemoverPdf(false);
        Alert.alert('Sucesso', `PDF selecionado: ${file.name}`);
      }
    } catch (error) {
      console.error('❌ Erro ao selecionar PDF:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o PDF');
    }
  };

  // Remover PDF existente
  const confirmarRemoverPDF = () => {
    Alert.alert(
      'Remover PDF',
      'Tem certeza que deseja remover o PDF deste exame?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => {
            setRemoverPdf(true);
            setNewPdfFile(null);
          }
        }
      ]
    );
  };

  // Função para formatar data para exibição
  const formatarDataExibicao = (data: string) => {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  // Função para formatar data para API
  const formatarDataAPI = (data: Date) => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  // Salvar alterações
  const salvarAlteracoes = async () => {
    // Validações
    if (!formData.paciente_nome.trim()) {
      Alert.alert('Erro', 'Nome do paciente é obrigatório');
      return;
    }
    if (!formData.tipo_exame.trim()) {
      Alert.alert('Erro', 'Tipo de exame é obrigatório');
      return;
    }
    if (!formData.data_exame.trim()) {
      Alert.alert('Erro', 'Data do exame é obrigatória');
      return;
    }
    if (!formData.medico_solicitante.trim()) {
      Alert.alert('Erro', 'Médico solicitante é obrigatório');
      return;
    }
    if (!formData.laboratorio.trim()) {
      Alert.alert('Erro', 'Laboratório é obrigatório');
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

      const response = await fetch(`${API_URL}/${editingExame?.id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao atualizar exame');
      }

      let mensagem = 'Exame atualizado com sucesso!';
      if (newPdfFile) {
        mensagem = 'Exame e PDF atualizados com sucesso!';
      } else if (removerPdf) {
        mensagem = 'Exame atualizado e PDF removido com sucesso!';
      }

      Alert.alert('Sucesso!', mensagem);
      setModalVisible(false);
      carregarExames();
      
    } catch (error: any) {
      console.error('❌ Erro ao atualizar:', error);
      Alert.alert('Erro', error.message || 'Não foi possível atualizar o exame');
    } finally {
      setSaving(false);
    }
  };

  const deletarExame = async (id: number) => {
    Alert.alert(
      'Confirmar exclusão',
      'Deseja realmente excluir este exame?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          onPress: async () => {
            try {
              await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
              Alert.alert('Sucesso', 'Exame deletado!');
              carregarExames();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar');
            }
          },
          style: 'destructive'
        },
      ]
    );
  };

  // Função para baixar o PDF
  const baixarPDF = async (exame: Exame): Promise<string | null> => {
    try {
      const pdfUrl = `http://${IP}/api/exames/${exame.id}/visualizar`;
      console.log('📥 Baixando PDF:', pdfUrl);
      
      const documentosDir = new Directory(Paths.document);
      const pdfDir = new Directory(documentosDir, 'pdfs');
      
      if (!pdfDir.exists) {
        pdfDir.create();
      }
      
      const downloadedFile = await File.downloadFileAsync(pdfUrl, pdfDir, {
        idempotent: true
      });
      
      console.log('✅ PDF salvo em:', downloadedFile.uri);
      return downloadedFile.uri;
      
    } catch (error) {
      console.error('❌ Erro ao baixar:', error);
      return null;
    }
  };

  // Abrir PDF no Android
  const abrirPDFAndroid = async (fileUri: string, pdfUrl: string) => {
    try {
      const serverUrl = pdfUrl;
      console.log('🌐 Tentando abrir URL do servidor:', serverUrl);
      
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: serverUrl,
        type: 'application/pdf',
      });
      console.log('✅ PDF aberto via servidor');
    } catch (error) {
      console.error('❌ Erro ao abrir via servidor:', error);
      
      try {
        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (isSharingAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Abrir PDF com...',
          });
        }
      } catch (shareError) {
        console.error('❌ Erro no fallback:', shareError);
        Alert.alert('Erro', 'Não foi possível abrir o PDF');
      }
    }
  };

  // Abrir PDF no iOS
  const abrirPDFiOS = async (fileUri: string) => {
    try {
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Abrir PDF com...',
        });
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o PDF');
      }
    } catch (error) {
      console.error('❌ Erro ao abrir no iOS:', error);
      Alert.alert('Erro', 'Não foi possível abrir o PDF');
    }
  };

  // Abrir PDF
  const abrirPDF = async (exame: Exame) => {
    if (!exame.possui_pdf || !exame.pdf_path) {
      Alert.alert('Erro', 'Este exame não possui PDF');
      return;
    }

    setDownloadingId(exame.id);
    
    try {
      const fileUri = await baixarPDF(exame);
      const pdfUrl = `http://${IP}/api/exames/${exame.id}/visualizar`;
      
      if (fileUri) {
        if (Platform.OS === 'android') {
          await abrirPDFAndroid(fileUri, pdfUrl);
        } else {
          await abrirPDFiOS(fileUri);
        }
      } else {
        Alert.alert('Erro', 'Não foi possível baixar o PDF');
      }
    } catch (error) {
      console.error('❌ Erro:', error);
      Alert.alert('Erro', 'Não foi possível abrir o PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  // Apenas baixar o PDF
  const baixarApenasPDF = async (exame: Exame) => {
    if (!exame.possui_pdf || !exame.pdf_path) {
      Alert.alert('Erro', 'Este exame não possui PDF');
      return;
    }

    setDownloadingId(exame.id);
    
    try {
      const fileUri = await baixarPDF(exame);
      
      if (fileUri) {
        Alert.alert(
          'Download concluído',
          `PDF salvo com sucesso!`,
          [
            { text: 'OK', style: 'cancel' },
            { 
              text: 'Abrir', 
              onPress: async () => {
                if (Platform.OS === 'android') {
                  const pdfUrl = `http://${IP}/api/exames/${exame.id}/visualizar`;
                  await abrirPDFAndroid(fileUri, pdfUrl);
                } else {
                  await abrirPDFiOS(fileUri);
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível baixar o PDF');
      }
    } catch (error) {
      console.error('❌ Erro:', error);
      Alert.alert('Erro', 'Não foi possível baixar o PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  // Mostrar menu de opções do PDF
  const mostrarMenuOpcoes = (exame: Exame) => {
    Alert.alert(
      'Opções do PDF',
      exame.pdf_nome || 'Escolha uma opção',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '📖 Abrir PDF', onPress: () => abrirPDF(exame) },
        { text: '💾 Baixar PDF', onPress: () => baixarApenasPDF(exame) },
      ],
      { cancelable: true }
    );
  };

  // Mostrar menu de ações do exame
  const mostrarMenuExame = (exame: Exame) => {
    Alert.alert(
      'Ações do Exame',
      `O que deseja fazer com o exame de ${exame.paciente_nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '✏️ Editar', onPress: () => editarExame(exame) },
        { text: '🗑️ Excluir', onPress: () => deletarExame(exame.id), style: 'destructive' },
      ],
      { cancelable: true }
    );
  };

  const formatarDataLista = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  const formatarTamanhoArquivo = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  useFocusEffect(
    useCallback(() => {
      carregarExames();
    }, [])
  );

  const renderExameCard = ({ item }: { item: Exame }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.pacienteInfo}>
          <MaterialCommunityIcons name="account-circle" size={28} color="#8B0000" />
          <Text style={styles.pacienteNome}>{item.paciente_nome}</Text>
        </View>
        <TouchableOpacity onPress={() => mostrarMenuExame(item)} style={styles.menuButton}>
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="flask" size={20} color="#666" />
          <Text style={styles.infoLabel}>Exame:</Text>
          <Text style={styles.infoValue}>{item.tipo_exame}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="calendar" size={20} color="#666" />
          <Text style={styles.infoLabel}>Data:</Text>
          <Text style={styles.infoValue}>{formatarDataLista(item.data_exame)}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="doctor" size={20} color="#666" />
          <Text style={styles.infoLabel}>Médico:</Text>
          <Text style={styles.infoValue}>{item.medico_solicitante}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="test-tube" size={20} color="#666" />
          <Text style={styles.infoLabel}>Laboratório:</Text>
          <Text style={styles.infoValue}>{item.laboratorio}</Text>
        </View>

        {item.resultados && (
          <View style={styles.resultadosContainer}>
            <Text style={styles.resultadosText}>📋 {item.resultados}</Text>
          </View>
        )}

        {item.observacoes && (
          <View style={styles.observacoesContainer}>
            <Text style={styles.observacoesText}>📝 {item.observacoes}</Text>
          </View>
        )}

        {item.possui_pdf && (
          <TouchableOpacity 
            style={styles.pdfButton}
            onPress={() => mostrarMenuOpcoes(item)}
            disabled={downloadingId === item.id}
          >
            {downloadingId === item.id ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="file-pdf-box" size={24} color="#FFF" />
                <Text style={styles.pdfButtonText}>Abrir PDF</Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dataCriacao}>
          Criado em: {new Date(item.created_at).toLocaleDateString('pt-BR')}
        </Text>
      </View>
    </View>
  );

  if (loading && listaExames.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8B0000" />
        <Text style={styles.loadingText}>Carregando exames...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="clipboard-list" size={32} color="#8B0000" />
        <Text style={styles.headerTitle}>Meus Exames</Text>
        <Text style={styles.headerSubtitle}>
          {listaExames.length} {listaExames.length === 1 ? 'exame encontrado' : 'exames encontrados'}
        </Text>
      </View>

      <FlatList
        data={listaExames}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExameCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={carregarExames}
            colors={['#8B0000']}
            tintColor="#8B0000"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={80} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>Nenhum exame encontrado</Text>
            <Text style={styles.emptyText}>
              Clique no botão "+" para adicionar seu primeiro exame
            </Text>
          </View>
        }
      />

      {/* MODAL DE EDIÇÃO COM SELECTS E DATEPICKER */}
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
              <View style={styles.modalHeaderLeft}>
                <MaterialCommunityIcons name="file-edit" size={24} color="#8B0000" />
                <Text style={styles.modalTitle}>Editar Exame</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContent}
            >
              {/* Nome do Paciente */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>
                  <MaterialCommunityIcons name="account" size={16} color="#8B0000" /> 
                  {' '}Nome do Paciente *
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Digite o nome completo do paciente"
                  placeholderTextColor="#999"
                  value={formData.paciente_nome}
                  onChangeText={(text) => setFormData({ ...formData, paciente_nome: text })}
                />
              </View>

              {/* Tipo do Exame - Select */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>
                  <MaterialCommunityIcons name="flask" size={16} color="#8B0000" /> 
                  {' '}Tipo do Exame *
                </Text>
                <TouchableOpacity 
                  style={styles.selectButton}
                  onPress={() => setShowTipoSelect(true)}
                >
                  <Text style={styles.selectButtonText}>
                    {formData.tipo_exame || 'Selecione o tipo de exame'}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Data do Exame - DatePicker */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>
                  <MaterialCommunityIcons name="calendar" size={16} color="#8B0000" /> 
                  {' '}Data do Exame *
                </Text>
                <TouchableOpacity 
                  style={styles.selectButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.selectButtonText}>
                    {formData.data_exame ? formatarDataExibicao(formData.data_exame) : 'Selecione a data'}
                  </Text>
                  <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Médico Solicitante - Select */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>
                  <MaterialCommunityIcons name="doctor" size={16} color="#8B0000" /> 
                  {' '}Médico Solicitante *
                </Text>
                <TouchableOpacity 
                  style={styles.selectButton}
                  onPress={() => setShowMedicoSelect(true)}
                >
                  <Text style={styles.selectButtonText}>
                    {formData.medico_solicitante || 'Selecione o médico'}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Laboratório - Select */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>
                  <MaterialCommunityIcons name="test-tube" size={16} color="#8B0000" /> 
                  {' '}Laboratório *
                </Text>
                <TouchableOpacity 
                  style={styles.selectButton}
                  onPress={() => setShowLaboratorioSelect(true)}
                >
                  <Text style={styles.selectButtonText}>
                    {formData.laboratorio || 'Selecione o laboratório'}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Resultados */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>
                  <MaterialCommunityIcons name="clipboard-text" size={16} color="#666" /> 
                  {' '}Resultados
                </Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="Digite os resultados do exame..."
                  placeholderTextColor="#999"
                  value={formData.resultados}
                  onChangeText={(text) => setFormData({ ...formData, resultados: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Observações */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>
                  <MaterialCommunityIcons name="note-text" size={16} color="#666" /> 
                  {' '}Observações
                </Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="Observações adicionais..."
                  placeholderTextColor="#999"
                  value={formData.observacoes}
                  onChangeText={(text) => setFormData({ ...formData, observacoes: text })}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* SEÇÃO DE PDF */}
              <View style={styles.pdfSection}>
                <Text style={styles.pdfSectionTitle}>
                  <MaterialCommunityIcons name="file-pdf-box" size={18} color="#8B0000" /> 
                  {' '}Documento PDF
                </Text>

                {editingExame?.possui_pdf && !removerPdf && !newPdfFile && (
                  <View style={styles.currentPdfContainer}>
                    <View style={styles.currentPdfInfo}>
                      <MaterialCommunityIcons name="file-pdf-box" size={24} color="#DC143C" />
                      <View style={styles.currentPdfDetails}>
                        <Text style={styles.currentPdfName}>{editingExame.pdf_nome}</Text>
                        <Text style={styles.currentPdfSize}>
                          {formatarTamanhoArquivo(editingExame.pdf_tamanho)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.removePdfButton}
                      onPress={confirmarRemoverPDF}
                    >
                      <MaterialCommunityIcons name="delete" size={20} color="#FF4444" />
                      <Text style={styles.removePdfText}>Remover PDF</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {newPdfFile && (
                  <View style={styles.newPdfContainer}>
                    <MaterialCommunityIcons name="file-pdf-box" size={24} color="#4CAF50" />
                    <View style={styles.newPdfDetails}>
                      <Text style={styles.newPdfName}>{newPdfFile.name}</Text>
                      <Text style={styles.newPdfSize}>
                        {formatarTamanhoArquivo(newPdfFile.size)}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => setNewPdfFile(null)}
                      style={styles.clearPdfButton}
                    >
                      <MaterialCommunityIcons name="close-circle" size={22} color="#999" />
                    </TouchableOpacity>
                  </View>
                )}

                {removerPdf && !newPdfFile && (
                  <View style={styles.removedPdfContainer}>
                    <MaterialCommunityIcons name="file-pdf-box" size={24} color="#999" />
                    <Text style={styles.removedPdfText}>PDF será removido ao salvar</Text>
                    <TouchableOpacity 
                      onPress={() => setRemoverPdf(false)}
                      style={styles.undoRemoveButton}
                    >
                      <Text style={styles.undoRemoveText}>Desfazer</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {!removerPdf && (
                  <TouchableOpacity 
                    style={styles.selectPdfButton}
                    onPress={selecionarNovoPDF}
                  >
                    <MaterialCommunityIcons name="cloud-upload" size={20} color="#8B0000" />
                    <Text style={styles.selectPdfButtonText}>
                      {editingExame?.possui_pdf ? 'Alterar PDF' : 'Adicionar PDF'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalSaveButton, saving && styles.modalSaveButtonDisabled]}
                onPress={salvarAlteracoes}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="content-save" size={20} color="#FFF" />
                    <Text style={styles.modalSaveButtonText}>Salvar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de seleção - Tipo de Exame */}
      <Modal
        visible={showTipoSelect}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTipoSelect(false)}
      >
        <View style={styles.selectModalOverlay}>
          <View style={styles.selectModalContainer}>
            <View style={styles.selectModalHeader}>
              <Text style={styles.selectModalTitle}>Selecione o Tipo de Exame</Text>
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
                    setTipoCustom(false);
                    setShowTipoSelect(false);
                  }}
                >
                  <Text style={styles.selectOptionText}>{item}</Text>
                  {formData.tipo_exame === item && (
                    <MaterialCommunityIcons name="check" size={20} color="#8B0000" />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.selectOption, styles.customOption]}
                onPress={() => {
                  setTipoCustom(true);
                  setFormData({ ...formData, tipo_exame: '' });
                  setShowTipoSelect(false);
                }}
              >
                <MaterialCommunityIcons name="plus-circle" size={20} color="#8B0000" />
                <Text style={[styles.selectOptionText, styles.customOptionText]}>
                  Digitar outro...
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de seleção - Médico */}
      <Modal
        visible={showMedicoSelect}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMedicoSelect(false)}
      >
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
                    setMedicoCustom(false);
                    setShowMedicoSelect(false);
                  }}
                >
                  <Text style={styles.selectOptionText}>{item}</Text>
                  {formData.medico_solicitante === item && (
                    <MaterialCommunityIcons name="check" size={20} color="#8B0000" />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.selectOption, styles.customOption]}
                onPress={() => {
                  setMedicoCustom(true);
                  setFormData({ ...formData, medico_solicitante: '' });
                  setShowMedicoSelect(false);
                }}
              >
                <MaterialCommunityIcons name="plus-circle" size={20} color="#8B0000" />
                <Text style={[styles.selectOptionText, styles.customOptionText]}>
                  Digitar outro...
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de seleção - Laboratório */}
      <Modal
        visible={showLaboratorioSelect}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLaboratorioSelect(false)}
      >
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
                    setLaboratorioCustom(false);
                    setShowLaboratorioSelect(false);
                  }}
                >
                  <Text style={styles.selectOptionText}>{item}</Text>
                  {formData.laboratorio === item && (
                    <MaterialCommunityIcons name="check" size={20} color="#8B0000" />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.selectOption, styles.customOption]}
                onPress={() => {
                  setLaboratorioCustom(true);
                  setFormData({ ...formData, laboratorio: '' });
                  setShowLaboratorioSelect(false);
                }}
              >
                <MaterialCommunityIcons name="plus-circle" size={20} color="#8B0000" />
                <Text style={[styles.selectOptionText, styles.customOptionText]}>
                  Digitar outro...
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DatePicker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.data_exame ? new Date(formData.data_exame) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setFormData({ ...formData, data_exame: formatarDataAPI(selectedDate) });
            }
          }}
        />
      )}

      {/* Input customizado para Tipo */}
      {tipoCustom && (
        <Modal transparent={true} animationType="slide" visible={tipoCustom}>
          <View style={styles.customInputOverlay}>
            <View style={styles.customInputContainer}>
              <Text style={styles.customInputTitle}>Digite o Tipo de Exame</Text>
              <TextInput
                style={styles.customInput}
                autoFocus
                value={formData.tipo_exame}
                onChangeText={(text) => setFormData({ ...formData, tipo_exame: text })}
                placeholder="Ex: Biópsia, Cintilografia..."
              />
              <View style={styles.customInputButtons}>
                <TouchableOpacity 
                  style={styles.customInputCancel}
                  onPress={() => {
                    setTipoCustom(false);
                    if (!formData.tipo_exame && editingExame) {
                      setFormData({ ...formData, tipo_exame: editingExame.tipo_exame });
                    }
                  }}
                >
                  <Text>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.customInputConfirm}
                  onPress={() => setTipoCustom(false)}
                >
                  <Text style={{ color: '#8B0000', fontWeight: 'bold' }}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Input customizado para Médico */}
      {medicoCustom && (
        <Modal transparent={true} animationType="slide" visible={medicoCustom}>
          <View style={styles.customInputOverlay}>
            <View style={styles.customInputContainer}>
              <Text style={styles.customInputTitle}>Digite o nome do Médico</Text>
              <TextInput
                style={styles.customInput}
                autoFocus
                value={formData.medico_solicitante}
                onChangeText={(text) => setFormData({ ...formData, medico_solicitante: text })}
                placeholder="Dr(a). Nome Completo"
              />
              <View style={styles.customInputButtons}>
                <TouchableOpacity 
                  style={styles.customInputCancel}
                  onPress={() => {
                    setMedicoCustom(false);
                    if (!formData.medico_solicitante && editingExame) {
                      setFormData({ ...formData, medico_solicitante: editingExame.medico_solicitante });
                    }
                  }}
                >
                  <Text>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.customInputConfirm}
                  onPress={() => setMedicoCustom(false)}
                >
                  <Text style={{ color: '#8B0000', fontWeight: 'bold' }}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Input customizado para Laboratório */}
      {laboratorioCustom && (
        <Modal transparent={true} animationType="slide" visible={laboratorioCustom}>
          <View style={styles.customInputOverlay}>
            <View style={styles.customInputContainer}>
              <Text style={styles.customInputTitle}>Digite o nome do Laboratório</Text>
              <TextInput
                style={styles.customInput}
                autoFocus
                value={formData.laboratorio}
                onChangeText={(text) => setFormData({ ...formData, laboratorio: text })}
                placeholder="Nome do laboratório"
              />
              <View style={styles.customInputButtons}>
                <TouchableOpacity 
                  style={styles.customInputCancel}
                  onPress={() => {
                    setLaboratorioCustom(false);
                    if (!formData.laboratorio && editingExame) {
                      setFormData({ ...formData, laboratorio: editingExame.laboratorio });
                    }
                  }}
                >
                  <Text>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.customInputConfirm}
                  onPress={() => setLaboratorioCustom(false)}
                >
                  <Text style={{ color: '#8B0000', fontWeight: 'bold' }}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#8B0000', marginTop: 8 },
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  listContainer: { padding: 16 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0E0',
  },
  pacienteInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  pacienteNome: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 8, flex: 1 },
  menuButton: { padding: 8 },
  cardContent: { padding: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' },
  infoLabel: { fontSize: 14, color: '#666', marginRight: 8, fontWeight: '500' },
  infoValue: { fontSize: 14, color: '#333', flex: 1 },
  resultadosContainer: { marginTop: 8, marginBottom: 8, padding: 10, backgroundColor: '#F8F9FA', borderRadius: 8 },
  resultadosText: { fontSize: 14, color: '#333' },
  observacoesContainer: { marginTop: 8, marginBottom: 8, padding: 10, backgroundColor: '#FFF8E1', borderRadius: 8 },
  observacoesText: { fontSize: 14, color: '#856404' },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B0000',
    padding: 14,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  pdfButtonText: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },
  cardFooter: { padding: 12, backgroundColor: '#FAFAFA', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  dataCriacao: { fontSize: 11, color: '#999', textAlign: 'right' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#999', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#CCCCCC', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },

  // Estilos do Modal Principal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    borderBottomColor: '#E0E0E0',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 20,
  },
  modalInputGroup: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F8F9FA',
  },
  modalTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalHelperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginLeft: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#8B0000',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  modalSaveButtonDisabled: {
    backgroundColor: '#CC6666',
    opacity: 0.7,
  },
  modalSaveButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },

  // Estilos dos Select Buttons
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#333',
  },

  // Estilos dos Modais de Seleção
  selectModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  selectModalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  selectModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectOptionText: {
    fontSize: 16,
    color: '#333',
  },
  customOption: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
    backgroundColor: '#FFF5F5',
  },
  customOptionText: {
    color: '#8B0000',
    fontWeight: '500',
  },

  // Estilos dos Inputs Customizados
  customInputOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customInputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '80%',
  },
  customInputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  customInputButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  customInputCancel: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  customInputConfirm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  // Estilos da seção PDF
  pdfSection: {
    marginTop: 10,
    marginBottom: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  pdfSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  currentPdfContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  currentPdfInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  currentPdfDetails: {
    flex: 1,
    marginLeft: 12,
  },
  currentPdfName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  currentPdfSize: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  removePdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
  },
  removePdfText: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  newPdfContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  newPdfDetails: {
    flex: 1,
    marginLeft: 12,
  },
  newPdfName: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  newPdfSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  clearPdfButton: {
    padding: 4,
  },
  removedPdfContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  removedPdfText: {
    flex: 1,
    fontSize: 14,
    color: '#D32F2F',
  },
  undoRemoveButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  undoRemoveText: {
    color: '#8B0000',
    fontSize: 14,
    fontWeight: '600',
  },
  selectPdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8B0000',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  selectPdfButtonText: {
    fontSize: 14,
    color: '#8B0000',
    fontWeight: '500',
  },
});