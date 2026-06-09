// app/(tabs)/exames.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Directory, File, Paths } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
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

export default function ExamesScreen() {
  const [listaExames, setListaExames] = useState<Exame[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

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

  // Abrir PDF no Android - usando IntentLauncher com URL direta
  const abrirPDFAndroid = async (fileUri: string, pdfUrl: string) => {
    try {
      // Tentar abrir diretamente com a URL do servidor (melhor opção)
      const serverUrl = pdfUrl;
      console.log('🌐 Tentando abrir URL do servidor:', serverUrl);
      
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: serverUrl,
        type: 'application/pdf',
      });
      console.log('✅ PDF aberto via servidor');
    } catch (error) {
      console.error('❌ Erro ao abrir via servidor:', error);
      
      // Fallback: tentar com o arquivo local via Sharing
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

  // Abrir PDF - mostra escolha de aplicativo
  const abrirPDF = async (exame: Exame) => {
    if (!exame.possui_pdf || !exame.pdf_path) {
      Alert.alert('Erro', 'Este exame não possui PDF');
      return;
    }

    setDownloadingId(exame.id);
    
    try {
      // Primeiro baixa o PDF
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

  // Apenas baixar o PDF (sem abrir)
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
                  const pdfUrl = `http://192.168.0.13:3000/api/exames/${exame.id}/visualizar`;
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

  // Mostrar menu de opções
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

  const formatarData = (dataString: string) => {
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
          <MaterialCommunityIcons name="account-circle" size={28} color="#8B0000" />
          <Text style={styles.pacienteNome}>{item.paciente_nome}</Text>
        </View>
        <TouchableOpacity onPress={() => deletarExame(item.id)} style={styles.deleteButton}>
          <MaterialCommunityIcons name="trash-can-outline" size={22} color="#FF4444" />
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
          <Text style={styles.infoValue}>{formatarData(item.data_exame)}</Text>
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
  deleteButton: { padding: 8 },
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
});