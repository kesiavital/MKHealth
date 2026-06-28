// app/(tabs)/index.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import IP from '../../service/api';
import { STORAGE_KEYS } from '../../service/auth';

const { width: screenWidth } = Dimensions.get('window');

const API_URL = `http://${IP}:3000/api/exames`;

interface Exame {
  id: number;
  paciente_nome: string;
  paciente_cpf?: string;
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

interface ExamesPorMes {
  mes: string;
  quantidade: number;
}

interface ExamesPorTipo {
  nome: string;
  quantidade: number;
  cor: string;
}

interface UserData {
  id: number;
  nome_completo: string;
  email: string;
  cpf: string;
  tipo_usuario: number;
  foto: string | null;
}

export default function DashboardScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [exames, setExames] = useState<Exame[]>([]);
  const [loading, setLoading] = useState(false);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [ultimosExames, setUltimosExames] = useState<Exame[]>([]);
  const [examesPorMes, setExamesPorMes] = useState<ExamesPorMes[]>([]);
  const [examesPorTipo, setExamesPorTipo] = useState<ExamesPorTipo[]>([]);

  // 🔥 CARREGAR DADOS DO USUÁRIO
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
        console.log('📱 Dashboard - Usuário:', data?.nome_completo);
        console.log('📱 Dashboard - É admin?', data?.tipo_usuario === 1);
        console.log('📱 Dashboard - CPF:', data?.cpf);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar usuário:', error);
    }
  };

  const carregarDados = async () => {
    console.log('🔄 Carregando dados...');
    setLoading(true);
    try {
      // 🔥 PEGAR TOKEN
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      console.log('🔑 Token encontrado?', !!token);

      if (!token) {
        console.log('❌ Token não encontrado');
        setLoading(false);
        return;
      }

      // 🔥 FAZER REQUISIÇÃO COM TOKEN
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Status da resposta:', response.status);

      if (response.status === 401) {
        console.log('❌ Token expirado');
        Alert.alert('Sessão expirada', 'Faça login novamente');
        router.replace('/login');
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('📊 Dados recebidos:', Array.isArray(data) ? `Array com ${data.length} itens` : typeof data);

      // 🔥 VERIFICAR SE data É UM ARRAY
      let examesFiltrados: Exame[] = [];

      if (Array.isArray(data)) {
        examesFiltrados = data;
        console.log(`✅ ${examesFiltrados.length} exames encontrados`);
      } else if (data && typeof data === 'object') {
        // Se for um objeto, tentar extrair os exames
        if (data.exames && Array.isArray(data.exames)) {
          examesFiltrados = data.exames;
        } else if (data.data && Array.isArray(data.data)) {
          examesFiltrados = data.data;
        } else {
          console.log('⚠️ Estrutura de dados não reconhecida');
          examesFiltrados = [];
        }
      } else {
        console.log('⚠️ Dados inválidos recebidos');
        examesFiltrados = [];
      }

      // 🔥 FILTRAR EXAMES BASEADO NO TIPO DE USUÁRIO
      let examesFinais = examesFiltrados;

      if (!isAdmin && userData) {
        // Paciente vê apenas seus exames
        const nomePaciente = userData.nome_completo?.toLowerCase().trim();
        const cpfPaciente = userData.cpf?.replace(/\D/g, '');
        
        examesFinais = examesFiltrados.filter((exame: Exame) => {
          const nomeExame = exame.paciente_nome?.toLowerCase().trim();
          const cpfExame = exame.paciente_cpf?.replace(/\D/g, '');
          return nomeExame === nomePaciente || cpfExame === cpfPaciente;
        });
        
        console.log(`📱 Paciente ${userData.nome_completo} - ${examesFinais.length} exames encontrados`);
      } else {
        console.log(`📱 Admin - ${examesFinais.length} exames encontrados`);
      }
      
      setExames(examesFinais);
      
      // 🔥 CALCULAR ESTATÍSTICAS COM OS EXAMES FILTRADOS
      if (examesFinais.length > 0) {
        calcularEstatisticas(examesFinais);
        calcularDadosGraficos(examesFinais);
        
        const ultimos = [...examesFinais].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 5);
        setUltimosExames(ultimos);
      } else {
        // Resetar dados se não houver exames
        setEstatisticas(null);
        setExamesPorMes([]);
        setExamesPorTipo([]);
        setUltimosExames([]);
      }
      
      console.log(`✅ ${examesFinais.length} exames carregados`);
    } catch (error: any) {
      console.error('❌ Erro:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados: ' + (error.message || ''));
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

  const calcularDadosGraficos = (data: Exame[]) => {
    // Dados para gráfico de exames por mês (últimos 6 meses)
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const hoje = new Date();
    const ultimos6Meses = [];
    
    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      ultimos6Meses.push(meses[data.getMonth()]);
    }
    
    const examesPorMesData = ultimos6Meses.map((mes) => {
      const mesIndex = meses.indexOf(mes);
      const ano = hoje.getFullYear() - (mesIndex > hoje.getMonth() ? 1 : 0);
      const quantidade = data.filter(e => {
        const dataExame = new Date(e.data_exame);
        return dataExame.getMonth() === mesIndex && dataExame.getFullYear() === ano;
      }).length;
      return { mes, quantidade };
    });
    
    setExamesPorMes(examesPorMesData);
    
    // Dados para gráfico de exames por tipo (top 5)
    const tipoCount = new Map<string, number>();
    data.forEach(exame => {
      tipoCount.set(exame.tipo_exame, (tipoCount.get(exame.tipo_exame) || 0) + 1);
    });
    
    const sortedTipos = Array.from(tipoCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const cores = ['#8B0000', '#D32F2F', '#F44336', '#FF5252', '#FF7961'];
    const examesPorTipoData = sortedTipos.map(([nome, quantidade], index) => ({
      nome: nome.length > 15 ? nome.substring(0, 12) + '...' : nome,
      quantidade,
      cor: cores[index % cores.length],
    }));
    
    setExamesPorTipo(examesPorTipoData);
  };

  useFocusEffect(
    useCallback(() => {
      if (userData) {
        carregarDados();
      }
    }, [userData])
  );

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Prepara dados para o gráfico de linha
  const lineChartData = {
    labels: examesPorMes.map(item => item.mes),
    datasets: [{
      data: examesPorMes.map(item => item.quantidade),
      color: (opacity = 1) => `rgba(139, 0, 0, ${opacity})`,
      strokeWidth: 2
    }]
  };

  // Prepara dados para o gráfico de pizza
  const pieChartData = examesPorTipo.map(item => ({
    name: item.nome,
    population: item.quantidade,
    color: item.cor,
    legendFontColor: '#333',
    legendFontSize: 11
  }));

  // Prepara dados para o gráfico de progresso (PDF vs Sem PDF)
  const progressChartData = {
    labels: ['Com PDF', 'Sem PDF'],
    data: estatisticas ? [
      estatisticas.percentual_com_pdf / 100,
      (100 - estatisticas.percentual_com_pdf) / 100
    ] : [0, 0]
  };

  const chartConfig = {
    backgroundColor: '#FFF',
    backgroundGradientFrom: '#FFF',
    backgroundGradientTo: '#FFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(139, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#8B0000'
    }
  };

  const hasData = exames.length > 0;

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
          <Text style={styles.headerWelcome}>
            {isAdmin ? '📊 Dashboard Médico' : '📊 Meus Exames'}
          </Text>
          <View style={styles.userInfo}>
            <MaterialCommunityIcons name="account-circle" size={50} color="#DDD" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.userName}>
                {userData?.nome_completo || 'Sistema MKHealth'}
              </Text>
              <Text style={styles.userCpf}>
                {isAdmin ? '👨‍⚕️ Médico - Todos os exames' : '👤 Paciente - Meus exames'}
              </Text>
            </View>
            <Image source={require('../../assets/images/logomk.png')} style={styles.logoRight} />
          </View>
        </View>

        {hasData && estatisticas && (
          <>
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>
                {isAdmin ? '📊 Estatísticas Gerais' : '📊 Minhas Estatísticas'}
              </Text>
              
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
                
                {isAdmin && (
                  <>
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
                  </>
                )}
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

            {/* GRÁFICO DE LINHA - Exames por Mês */}
            {examesPorMes.length > 0 && examesPorMes.some(item => item.quantidade > 0) && (
              <View style={styles.chartContainer}>
                <Text style={styles.sectionTitle}>
                  📈 {isAdmin ? 'Evolução de Exames' : 'Meus Exames por Mês'} (Últimos 6 meses)
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <LineChart
                    data={lineChartData}
                    width={Math.max(screenWidth - 40, examesPorMes.length * 70)}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                    formatYLabel={(value) => Math.floor(Number(value)).toString()}
                    fromZero
                  />
                </ScrollView>
              </View>
            )}

            {/* GRÁFICO DE PIZZA - Tipos de Exame */}
            {pieChartData.length > 0 && (
              <View style={styles.chartContainer}>
                <Text style={styles.sectionTitle}>
                  🥧 {isAdmin ? 'Distribuição por Tipo de Exame' : 'Meus Tipos de Exame'}
                </Text>
                <PieChart
                  data={pieChartData}
                  width={screenWidth - 30}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            )}

            {/* GRÁFICO DE PROGRESSO - PDF vs Sem PDF */}
            {estatisticas && estatisticas.total_exames > 0 && (
              <View style={styles.chartContainer}>
                <Text style={styles.sectionTitle}>
                  📄 {isAdmin ? 'Proporção de Exames com PDF' : 'Meus Exames com PDF'}
                </Text>
                <ProgressChart
                  data={progressChartData}
                  width={screenWidth - 30}
                  height={160}
                  chartConfig={chartConfig}
                  style={styles.chart}
                />
                <Text style={styles.chartNote}>
                  {estatisticas.exames_com_pdf} de {estatisticas.total_exames} exames possuem PDF
                </Text>
              </View>
            )}

            {ultimosExames.length > 0 && (
              <View style={styles.ultimosContainer}>
                <Text style={styles.sectionTitle}>
                  📋 {isAdmin ? 'Últimos Exames' : 'Meus Últimos Exames'}
                </Text>
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

        {!hasData && !loading && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={80} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>Nenhum exame encontrado</Text>
            <Text style={styles.emptyText}>
              {isAdmin ? 'Cadastre o primeiro exame' : 'Aguardando cadastro de exames'}
            </Text>
            {isAdmin && (
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => router.push('/cadastro-exame')}
              >
                <Text style={styles.emptyButtonText}>Cadastrar Exame</Text>
              </TouchableOpacity>
            )}
          </View>
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
  
  chartContainer: {
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginTop: 10,
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
  
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#FFF',
    margin: 15,
    borderRadius: 15,
    padding: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  emptyButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});