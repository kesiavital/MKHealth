// app/(tabs)/exames.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExames } from '../_context/ExamesContext';

export default function ExamesScreen() {
  const { listaExames, loading, carregarExames, deletarExame } = useExames();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExame, setSelectedExame] = useState<any>(null);

  // Função para abrir o PDF
  const abrirPDF = async (pdfPath: string, nomeArquivo: string) => {
    if (!pdfPath) {
      Alert.alert('Ops', 'Este exame não possui arquivo anexado.');
      return;
    }

    try {
      // URL completa do PDF
      const pdfUrl = `http://192.168.0.13:3000${pdfPath}`;
      console.log('📄 Abrindo PDF:', pdfUrl);
      
      // Abrir URL diretamente
      const canOpen = await Linking.canOpenURL(pdfUrl);
      
      if (canOpen) {
        await Linking.openURL(pdfUrl);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o PDF.');
      }
    } catch (error) {
      console.error('❌ Erro ao abrir PDF:', error);
      Alert.alert('Erro', 'Não foi possível abrir o PDF. Verifique sua conexão.');
    }
  };

  // Função para visualizar detalhes do exame
  const verDetalhes = (exame: any) => {
    setSelectedExame(exame);
    setModalVisible(true);
  };

  // Função para confirmar deleção
  const confirmarDelecao = (id: number, nome: string) => {
    Alert.alert(
      'Confirmar Deleção',
      `Tem certeza que deseja deletar o exame de ${nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Deletar', 
          style: 'destructive',
          onPress: () => deletarExame(id)
        }
      ]
    );
  };

  // Formatar data para exibição
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Formatar tamanho do arquivo
  const formatarTamanho = (bytes: number | null) => {
    if (!bytes) return 'Desconhecido';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Renderizar item da lista
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="file-document-outline" size={30} color="#8B0000" />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.pacienteNome}>{item.paciente_nome}</Text>
          <Text style={styles.exameTipo}>{item.tipo_exame}</Text>
          <Text style={styles.data}>Data: {formatarData(item.data_exame)}</Text>
          <Text style={styles.medico}>Médico: {item.medico_solicitante}</Text>
          <Text style={styles.laboratorio}>Laboratório: {item.laboratorio}</Text>
        </View>
      </View>

      {/* Resultados (se houver) */}
      {item.resultados && (
        <View style={styles.resultadosContainer}>
          <Text style={styles.resultadosLabel}>Resultados:</Text>
          <Text style={styles.resultadosText} numberOfLines={2}>
            {item.resultados}
          </Text>
        </View>
      )}

      {/* Botões de ação */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.detalhesButton}
          onPress={() => verDetalhes(item)}
        >
          <MaterialCommunityIcons name="eye-outline" size={20} color="#555" />
          <Text style={styles.detalhesButtonText}>Detalhes</Text>
        </TouchableOpacity>

        {item.possui_pdf && (
          <TouchableOpacity 
            style={styles.pdfButton}
            onPress={() => abrirPDF(item.pdf_path, item.pdf_nome || 'exame.pdf')}
          >
            <MaterialCommunityIcons name="file-pdf-box" size={20} color="#FFF" />
            <Text style={styles.pdfButtonText}>Ver PDF</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => confirmarDelecao(item.id, item.paciente_nome)}
        >
          <MaterialCommunityIcons name="delete-outline" size={20} color="#FFF" />
          <Text style={styles.deleteButtonText}>Deletar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && listaExames.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meus Exames</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8B0000" />
          <Text style={styles.loadingText}>Carregando exames...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Exames</Text>
        <Text style={styles.headerSubtitle}>{listaExames.length} exames cadastrados</Text>
      </View>

      <FlatList
        data={listaExames}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={80} color="#CCC" />
            <Text style={styles.emptyText}>Nenhum exame encontrado</Text>
            <Text style={styles.emptySubtext}>Cadastre seu primeiro exame</Text>
          </View>
        }
        renderItem={renderItem}
        onRefresh={carregarExames}
        refreshing={loading}
      />

      {/* Modal de detalhes */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes do Exame</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedExame && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Paciente:</Text>
                  <Text style={styles.detailValue}>{selectedExame.paciente_nome}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tipo de Exame:</Text>
                  <Text style={styles.detailValue}>{selectedExame.tipo_exame}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Data do Exame:</Text>
                  <Text style={styles.detailValue}>{formatarData(selectedExame.data_exame)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Médico Solicitante:</Text>
                  <Text style={styles.detailValue}>{selectedExame.medico_solicitante}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Laboratório:</Text>
                  <Text style={styles.detailValue}>{selectedExame.laboratorio}</Text>
                </View>
                {selectedExame.resultados && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Resultados:</Text>
                    <Text style={styles.detailValue}>{selectedExame.resultados}</Text>
                  </View>
                )}
                {selectedExame.observacoes && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Observações:</Text>
                    <Text style={styles.detailValue}>{selectedExame.observacoes}</Text>
                  </View>
                )}
                {selectedExame.possui_pdf && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Arquivo PDF:</Text>
                      <Text style={styles.detailValue} numberOfLines={2}>
                        {selectedExame.pdf_nome}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tamanho:</Text>
                      <Text style={styles.detailValue}>{formatarTamanho(selectedExame.pdf_tamanho)}</Text>
                    </View>
                  </>
                )}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cadastrado em:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedExame.created_at).toLocaleString('pt-BR')}
                  </Text>
                </View>
              </ScrollView>
            )}

            {selectedExame?.possui_pdf && (
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  setModalVisible(false);
                  abrirPDF(selectedExame.pdf_path, selectedExame.pdf_nome);
                }}
              >
                <MaterialCommunityIcons name="file-pdf-box" size={20} color="#FFF" />
                <Text style={styles.modalButtonText}>Ver PDF</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { 
    backgroundColor: '#8B0000', 
    padding: 20, 
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: '#FFEBEE', fontSize: 14, marginTop: 5 },
  listContent: { padding: 15 },
  card: { 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 15, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  iconContainer: { marginRight: 15, backgroundColor: '#FFEBEE', padding: 10, borderRadius: 50 },
  infoContainer: { flex: 1 },
  pacienteNome: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  exameTipo: { fontSize: 15, color: '#8B0000', fontWeight: '600', marginTop: 2 },
  data: { fontSize: 13, color: '#666', marginTop: 4 },
  medico: { fontSize: 13, color: '#666', marginTop: 2 },
  laboratorio: { fontSize: 13, color: '#666', marginTop: 2 },
  resultadosContainer: { 
    backgroundColor: '#F5F5F5', 
    padding: 10, 
    borderRadius: 8, 
    marginTop: 5,
    marginBottom: 10,
  },
  resultadosLabel: { fontSize: 12, fontWeight: 'bold', color: '#555', marginBottom: 3 },
  resultadosText: { fontSize: 12, color: '#666' },
  buttonContainer: { flexDirection: 'row', gap: 10, marginTop: 5 },
  detalhesButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    gap: 5,
  },
  detalhesButtonText: { color: '#555', fontWeight: 'bold', fontSize: 13 },
  pdfButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
    gap: 5,
  },
  pdfButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#C62828',
    gap: 5,
  },
  deleteButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyText: { fontSize: 18, color: '#999', marginTop: 20 },
  emptySubtext: { fontSize: 14, color: '#CCC', marginTop: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', borderRadius: 20, width: '90%', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  modalBody: { padding: 20 },
  detailRow: { marginBottom: 15 },
  detailLabel: { fontSize: 13, fontWeight: 'bold', color: '#666', marginBottom: 3 },
  detailValue: { fontSize: 15, color: '#333' },
  modalButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    gap: 10,
  },
  modalButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});