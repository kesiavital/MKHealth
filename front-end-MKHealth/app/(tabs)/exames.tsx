// app/(tabs)/exames.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// URL da API
const API_URL = 'http://172.17.20.72:3000/api/exames';

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

  const carregarExames = async () => {
    console.log('🔄 Carregando exames...');
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Status:', response.status);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ ${data.length} exames carregados`);
      setListaExames(data);
    } catch (error) {
      console.error('❌ Erro ao carregar exames:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de exames');
    } finally {
      setLoading(false);
    }
  };

  const deletarExame = async (id: number) => {
    try {
      console.log(`🗑️ Deletando exame ${id}...`);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar exame');
      }

      Alert.alert('Sucesso', 'Exame deletado com sucesso!');
      await carregarExames(); // Recarrega a lista
    } catch (error) {
      console.error('❌ Erro ao deletar exame:', error);
      Alert.alert('Erro', 'Não foi possível deletar o exame');
    }
  };

  // Recarregar exames sempre que a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      carregarExames();
    }, [])
  );

  const handleDelete = (id: number, pacienteNome: string) => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja realmente excluir o exame de ${pacienteNome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          onPress: () => deletarExame(id),
          style: 'destructive'
        },
      ]
    );
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const renderExameCard = ({ item }: { item: Exame }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.pacienteInfo}>
          <MaterialCommunityIcons name="account-circle" size={28} color="#8B0000" />
          <Text style={styles.pacienteNome}>{item.paciente_nome}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item.id, item.paciente_nome)}
          style={styles.deleteButton}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={22} color="#FF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="flask" size={20} color="#666" />
          <Text style={styles.infoLabel}>Tipo de Exame:</Text>
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
            <MaterialCommunityIcons name="file-document-outline" size={20} color="#666" />
            <Text style={styles.resultadosLabel}>Resultados:</Text>
            <Text style={styles.resultadosText}>{item.resultados}</Text>
          </View>
        )}

        {item.observacoes && (
          <View style={styles.observacoesContainer}>
            <MaterialCommunityIcons name="note-text-outline" size={20} color="#666" />
            <Text style={styles.observacoesLabel}>Observações:</Text>
            <Text style={styles.observacoesText}>{item.observacoes}</Text>
          </View>
        )}

        {item.possui_pdf && (
          <View style={styles.pdfBadge}>
            <MaterialCommunityIcons name="file-pdf-box" size={18} color="#FF0000" />
            <Text style={styles.pdfText}>PDF Anexado</Text>
          </View>
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
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B0000',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
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
  pacienteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pacienteNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
    flex: 1,
  },
  resultadosContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 8,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  resultadosLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 4,
    fontWeight: '500',
  },
  resultadosText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    flexWrap: 'wrap',
  },
  observacoesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 8,
    padding: 10,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
  },
  observacoesLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 4,
    fontWeight: '500',
  },
  observacoesText: {
    fontSize: 14,
    color: '#856404',
    flex: 1,
    flexWrap: 'wrap',
  },
  pdfBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  pdfText: {
    fontSize: 12,
    color: '#D32F2F',
    marginLeft: 6,
    fontWeight: '500',
  },
  cardFooter: {
    padding: 12,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dataCriacao: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});