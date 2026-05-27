// app/(tabs)/index.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// URL da API
const API_URL = 'http://192.168.0.13:3000/api/exames';

interface Exame {
  id: number;
  paciente_nome: string;
  tipo_exame: string;
  data_exame: string;
  medico_solicitante: string;
  laboratorio: string;
  possui_pdf: boolean;
  created_at: string;
}

interface Estatisticas {
  total_exames: number;
  total_pacientes: number;
  total_medicos: number;
  total_laboratorios: number;
  exames_com_pdf: number;
  percentual_com_pdf: number;
  exames_este_mes: number;
}

export default function DashboardScreen() {
  const [exames, setExames] = useState<Exame[]>([]);
  const [loading, setLoading] = useState(false);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [ultimosExames, setUltimosExames] = useState<Exame[]>([]);

  const carregarDados = async () => {
    console.log('🔄 Carregando dados...');
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data: Exame[] = await response.json();
      setExames(data);
      
      calcularEstatisticas(data);
      
      const ultimos = [...data].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 5);
      setUltimosExames(ultimos);
      
      console.log(`✅ ${data.length} exames carregados`);
    } catch (error) {
      console.error('❌ Erro:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = (data: Exame[]) => {
    const pacientesUnicos = new Set(data.map(e => e.paciente_nome));
    const medicosUnicos = new Set(data.map(e => e.medico_solicitante));
    const laboratoriosUnicos = new Set(data.map(e => e.laboratorio));
    const examesComPdf = data.filter(e => e.possui_pdf).length;
    
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();
    const examesEsteMes = data.filter(e => {
      const dataExame = new Date(e.data_exame);
      return dataExame.getMonth() === mesAtual && dataExame.getFullYear() === anoAtual;
    }).length;
    
    setEstatisticas({
      total_exames: data.length,
      total_pacientes: pacientesUnicos.size,
      total_medicos: medicosUnicos.size,
      total_laboratorios: laboratoriosUnicos.size,
      exames_com_pdf: examesComPdf,
      percentual_com_pdf: data.length > 0 ? (examesComPdf / data.length) * 100 : 0,
      exames_este_mes: examesEsteMes,
    });
  };

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#8B0000" />
      
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={carregarDados} colors={['#8B0000']} />
        }
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerWelcome}>Dashboard</Text>
          <View style={styles.userInfo}>
            <MaterialCommunityIcons name="account-circle" size={50} color="#DDD" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.userName}>Sistema MKHealth</Text>
              <Text style={styles.userCpf}>Gestão de Exames</Text>
            </View>
            <Image source={require('../img/logomk.png')} style={styles.logoRight} />
          </View>
        </View>

        {estatisticas && (
          <>
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>📊 Estatísticas Gerais</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="file-document" size={28} color="#8B0000" />
                  <Text style={styles.statNumber}>{estatisticas.total_exames}</Text>
                  <Text style={styles.statLabel}>Total Exames</Text>
                </View>
                
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="account-group" size={28} color="#8B0000" />
                  <Text style={styles.statNumber}>{estatisticas.total_pacientes}</Text>
                  <Text style={styles.statLabel}>Pacientes</Text>
                </View>
                
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="doctor" size={28} color="#8B0000" />
                  <Text style={styles.statNumber}>{estatisticas.total_medicos}</Text>
                  <Text style={styles.statLabel}>Médicos</Text>
                </View>
                
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="flask" size={28} color="#8B0000" />
                  <Text style={styles.statNumber}>{estatisticas.total_laboratorios}</Text>
                  <Text style={styles.statLabel}>Laboratórios</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statCardHalf}>
                  <MaterialCommunityIcons name="file-pdf-box" size={28} color="#8B0000" />
                  <Text style={styles.statNumber}>{estatisticas.exames_com_pdf}</Text>
                  <Text style={styles.statLabel}>Exames com PDF</Text>
                  <Text style={styles.statPercent}>{estatisticas.percentual_com_pdf.toFixed(1)}%</Text>
                </View>
                
                <View style={styles.statCardHalf}>
                  <MaterialCommunityIcons name="calendar-today" size={28} color="#8B0000" />
                  <Text style={styles.statNumber}>{estatisticas.exames_este_mes}</Text>
                  <Text style={styles.statLabel}>Exames este mês</Text>
                </View>
              </View>
            </View>

            {ultimosExames.length > 0 && (
              <View style={styles.ultimosContainer}>
                <Text style={styles.sectionTitle}>📋 Últimos Exames</Text>
                {ultimosExames.map((exame, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.ultimoItem}
                    onPress={() => router.push('/exames')}
                  >
                    <View style={styles.ultimoIcon}>
                      <MaterialCommunityIcons name="account" size={20} color="#8B0000" />
                    </View>
                    <View style={styles.ultimoInfo}>
                      <Text style={styles.ultimoNome}>{exame.paciente_nome}</Text>
                      <Text style={styles.ultimoDetalhe}>{exame.tipo_exame} • {formatarData(exame.data_exame)}</Text>
                    </View>
                    {exame.possui_pdf && (
                      <MaterialCommunityIcons name="file-pdf-box" size={20} color="#FF4444" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {loading && !estatisticas && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B0000" />
            <Text style={styles.loadingText}>Carregando estatísticas...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  container: { flex: 1 },
  
  headerContainer: { 
    backgroundColor: '#8B0000', 
    padding: 20, 
    paddingBottom: 30, 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20 
  },
  headerWelcome: { color: '#FFF', textAlign: 'center', fontSize: 22, marginBottom: 20, fontWeight: 'bold' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  userName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  userCpf: { color: '#DDD', fontSize: 12 },
  logoRight: { width: 70, height: 70, resizeMode: 'contain', marginLeft: 'auto', tintColor: '#FFF' },
  
  statsContainer: { 
    backgroundColor: '#FFF', 
    margin: 15, 
    marginTop: 20, 
    borderRadius: 15, 
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  statsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: { 
    width: '23%', 
    alignItems: 'center', 
    padding: 10,
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
  },
  statCardHalf: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
  },
  statNumber: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333', 
    marginTop: 5 
  },
  statLabel: { 
    fontSize: 11, 
    color: '#666', 
    textAlign: 'center',
    marginTop: 3,
  },
  statPercent: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  
  ultimosContainer: {
    backgroundColor: '#FFF',
    margin: 15,
    marginTop: 0,
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ultimoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  ultimoIcon: {
    width: 35,
    alignItems: 'center',
  },
  ultimoInfo: {
    flex: 1,
    marginLeft: 10,
  },
  ultimoNome: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  ultimoDetalhe: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
});