import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Linking from 'expo-linking';
import { useFocusEffect } from 'expo-router';
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

// URL da API - COM A PORTA 3000
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
  const [tipoCustom, setTipoCustom] = useState(false);
  const [medicoCustom, setMedicoCustom] = useState(false);
  const [laboratorioCustom, setLaboratorioCustom] = useState(false);
  
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
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setListaExames(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar a lista de exames');
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
    setTipoCustom(!TIPOS_EXAME.includes(exame.tipo_exame));
    setMedicoCustom(!MEDICOS.includes(exame.medico_solicitante));
    setLaboratorioCustom(!LABORATORIOS.includes(exame.laboratorio));
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
        Alert.alert('Sucesso', 'PDF selecionado!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar o PDF');
    }
  };

  const confirmarRemoverPDF = () => {
    Alert.alert(
      'Remover PDF',
      'Tem certeza que deseja remover o PDF?',
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

  const formatarTamanhoArquivo = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const salvarAlteracoes = async () => {
    if (!formData.paciente_nome.trim()) {
      Alert.alert('Erro', 'Nome do paciente é obrigatório');
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
        headers: { 'Accept': 'application/json' },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao atualizar exame');
      }

      Alert.alert('Sucesso!', 'Exame atualizado!');
      setModalVisible(false);
      carregarExames();
      
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao atualizar');
    } finally {
      setSaving(false);
    }
  };

  const deletarExame = async (id: number) => {
    Alert.alert(
      'Confirmar exclusão',
      'Deseja excluir este exame?',
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

  // FUNÇÃO CORRIGIDA - Abrir PDF diretamente
  const visualizarPDF = async (exame: Exame) => {
    if (!exame.possui_pdf) {
      Alert.alert('Erro', 'Este exame não possui PDF');
      return;
    }

    setOpeningId(exame.id);
    
    try {
      // URL CORRETA com a porta 3000
      const pdfUrl = `http://${IP}:3000/api/exames/${exame.id}/visualizar`;
      console.log('📄 Abrindo PDF:', pdfUrl);
      
      // Verificar se o PDF existe
      const checkResponse = await fetch(pdfUrl, { method: 'HEAD' });
      console.log('Status da verificação:', checkResponse.status);
      
      if (!checkResponse.ok) {
        throw new Error(`PDF não encontrado (Status: ${checkResponse.status})`);
      }
      
      // Abrir no Android
      if (Platform.OS === 'android') {
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: pdfUrl,
          type: 'application/pdf',
          flags: 1,
        });
      } else {
        // iOS
        await Linking.openURL(pdfUrl);
      }
      
    } catch (error) {
      console.error('Erro ao abrir PDF:', error);
      Alert.alert(
        'Erro', 
        `Não foi possível abrir o PDF.\n\nURL: http://${IP}:3000/api/exames/${exame.id}/visualizar`
      );
    } finally {
      setOpeningId(null);
    }
  };

  const mostrarMenuPDF = (exame: Exame) => {
    Alert.alert(
      'PDF do Exame',
      exame.pdf_nome || 'Opções',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '📖 Visualizar PDF', onPress: () => visualizarPDF(exame) },
      ]
    );
  };

  const mostrarMenuExame = (exame: Exame) => {
    Alert.alert(
      'Ações',
      `O que deseja fazer?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '✏️ Editar', onPress: () => editarExame(exame) },
        { text: '🗑️ Excluir', onPress: () => deletarExame(exame.id), style: 'destructive' },
      ]
    );
  };

  const formatarDataLista = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
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
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.paciente_nome.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.pacienteDetails}>
            <Text style={styles.pacienteNome}>{item.paciente_nome}</Text>
            <Text style={styles.exameTipo}>{item.tipo_exame}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => mostrarMenuExame(item)}>
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#666" />
        </TouchableOpacity>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="clipboard-list" size={32} color="#8B0000" />
        <Text style={styles.headerTitle}>Meus Exames</Text>
        <Text style={styles.headerSubtitle}>
          {listaExames.length} {listaExames.length === 1 ? 'exame' : 'exames'}
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
            <Text style={styles.emptyText}>Cadastre seu primeiro exame</Text>
          </View>
        }
      />

      {/* MODAL DE EDIÇÃO - Mantenha o mesmo do seu código */}
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
                    <Text>📄 {editingExame.pdf_nome}</Text>
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

      {/* Modais de seleção */}
      <Modal visible={showTipoSelect} transparent animationType="slide">
        <View style={styles.selectModalOverlay}>
          <View style={styles.selectModalContainer}>
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
                  <Text>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showMedicoSelect} transparent animationType="slide">
        <View style={styles.selectModalOverlay}>
          <View style={styles.selectModalContainer}>
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
                  <Text>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showLaboratorioSelect} transparent animationType="slide">
        <View style={styles.selectModalOverlay}>
          <View style={styles.selectModalContainer}>
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
                  <Text>{item}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  header: { backgroundColor: '#FFF', padding: 20, paddingTop: 60, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#8B0000', marginTop: 8 },
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  listContainer: { padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16, elevation: 2, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFF5F5', borderBottomWidth: 1, borderBottomColor: '#FFE0E0' },
  pacienteInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#8B0000', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  pacienteDetails: { marginLeft: 12, flex: 1 },
  pacienteNome: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  exameTipo: { fontSize: 13, color: '#8B0000', marginTop: 2 },
  cardContent: { padding: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoLabel: { fontSize: 14, color: '#666', marginLeft: 8, marginRight: 8, fontWeight: '500' },
  infoValue: { fontSize: 14, color: '#333', flex: 1 },
  resultadosContainer: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8, padding: 10, backgroundColor: '#F8F9FA', borderRadius: 8 },
  resultadosText: { fontSize: 14, color: '#333', marginLeft: 8, flex: 1 },
  observacoesContainer: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8, padding: 10, backgroundColor: '#FFF8E1', borderRadius: 8 },
  observacoesText: { fontSize: 14, color: '#856404', marginLeft: 8, flex: 1 },
  pdfButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8B0000', padding: 12, borderRadius: 8, marginTop: 12, gap: 8 },
  pdfButtonText: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#FAFAFA', borderTopWidth: 1, borderTopColor: '#F0F0F0', gap: 6 },
  dataCriacao: { fontSize: 11, color: '#999' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#999', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#CCC', marginTop: 8, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  modalContent: { padding: 20 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, padding: 12, marginBottom: 16, backgroundColor: '#F8F9FA' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  selectButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, padding: 12, marginBottom: 16, backgroundColor: '#F8F9FA' },
  pdfSection: { marginTop: 10, marginBottom: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  pdfTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  currentPdf: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 10, padding: 12, marginBottom: 12 },
  removeText: { color: '#FF4444', fontWeight: '500' },
  uploadButton: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#8B0000', borderStyle: 'dashed', alignItems: 'center', marginTop: 8 },
  saveButton: { backgroundColor: '#8B0000', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  selectModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  selectModalContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', padding: 20 },
  selectOption: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
});