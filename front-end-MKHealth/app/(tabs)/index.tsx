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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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

interface UserData {
  id: number;
  nome_completo: string;
  email: string;
  cpf: string;
  tipo_usuario: number;
  foto: string | null;
  checkups_concluidos?: number; // NOVO
  ganhou_coroa?: boolean; // NOVO
}

interface EngajamentoData {
  examesEsteAno: number;
  preventivoText: string;
  rotinaText: string;
  expirandoText: string; 
  atencaoText: string;
  atencaoIcon: any; 
  atencaoColor: string;
  atencaoBg: string;
  qtdEstrelas: number;
  ganhouCoroa: boolean;
}

export default function DashboardScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [exames, setExames] = useState<Exame[]>([]);
  const [loading, setLoading] = useState(false);
  const [ultimosExames, setUltimosExames] = useState<Exame[]>([]);
  const [engajamento, setEngajamento] = useState<EngajamentoData | null>(null);

  const insets = useSafeAreaInsets(); 

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
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const carregarDados = async () => {
    setLoading(true);
    try {
<<<<<<< HEAD
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

=======
      const response = await fetch(API_URL);
      const data: Exame[] = await response.json();
      
      let examesFiltrados = data;
      
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
      if (!isAdmin && userData) {
        const nomePaciente = userData.nome_completo?.toLowerCase().trim();
        const cpfPaciente = userData.cpf?.replace(/\D/g, '');
        
        examesFinais = examesFiltrados.filter((exame: Exame) => {
          const nomeExame = exame.paciente_nome?.toLowerCase().trim();
          const cpfExame = exame.paciente_cpf?.replace(/\D/g, '');
          return nomeExame === nomePaciente || cpfExame === cpfPaciente;
        });
<<<<<<< HEAD
        
        console.log(`📱 Paciente ${userData.nome_completo} - ${examesFinais.length} exames encontrados`);
      } else {
        console.log(`📱 Admin - ${examesFinais.length} exames encontrados`);
=======
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
      }
      
      setExames(examesFinais);
      
<<<<<<< HEAD
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
=======
      const ultimos = [...examesFiltrados].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 5);
      setUltimosExames(ultimos);

      calcularEngajamento(examesFiltrados);
      
    } catch (error) {
      console.error(' Erro:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
>>>>>>> ca59470826de58cca0d79539a784bf4e81cefc68
    } finally {
      setLoading(false);
    }
  };

  const calcularEngajamento = (data: Exame[]) => {
    if (data.length === 0) {
      setEngajamento(null);
      return;
    }

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const examesEsteAno = data.filter(e => new Date(e.data_exame).getFullYear() === anoAtual).length;

    const preventivos = data.filter(e => e.tipo_exame === 'Check-Up Preventivo');
    let preventivoText = "Seu próximo check-up Preventivo recomendado é Agora";

    if (preventivos.length > 0) {
      const ultimoPrev = [...preventivos].sort((a, b) => new Date(b.data_exame).getTime() - new Date(a.data_exame).getTime())[0];
      const proximaData = new Date(ultimoPrev.data_exame);
      proximaData.setMonth(proximaData.getMonth() + 3);

      const mesesStr = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      preventivoText = `Seu próximo check-up preventivo recomendado é em ${mesesStr[proximaData.getMonth()]}/${proximaData.getFullYear()}`;
    }

    const examesDoMaisNovoAoAntigo = [...data].sort((a, b) => new Date(b.data_exame).getTime() - new Date(a.data_exame).getTime());
    const maisRecente = examesDoMaisNovoAoAntigo[0];
    const dataMaisRecente = new Date(maisRecente.data_exame);
    
    let mesesAtras = (hoje.getFullYear() - dataMaisRecente.getFullYear()) * 12 + (hoje.getMonth() - dataMaisRecente.getMonth());
    if (mesesAtras < 0) mesesAtras = 0;

    const titulosRotina: { [key: string]: string } = {
      'Check-Up Gym': 'Saúde Hipertrófica',
      'Check-Up Preventivo': 'Saúde',
      'Check-Up Veggie': 'Vitaminas e Minerais',
      'Check-Up Sono': 'Saúde do sono',
      'Check-Up Cardio': 'Saúde Cardiovascular'
    };

    const tituloRotina = titulosRotina[maisRecente.tipo_exame] || maisRecente.tipo_exame;
    const rotinaText = `${tituloRotina} em dia — último exame há ${mesesAtras} mes(es)`;

    const examesMaisAntigos = [...data].sort((a, b) => new Date(a.data_exame).getTime() - new Date(b.data_exame).getTime());

    let expirandoText = "Nenhum check-up expirando no momento.";
    
    const exameQuaseExpirando = examesMaisAntigos.find(exame => {
      const diffTempo = hoje.getTime() - new Date(exame.data_exame).getTime();
      const diffDias = Math.floor(diffTempo / (1000 * 60 * 60 * 24));
      const diasRestantes = 90 - diffDias;
      
      return diasRestantes >= 0 && diasRestantes <= 7;
    });

    if (exameQuaseExpirando) {
      const diffTempo = hoje.getTime() - new Date(exameQuaseExpirando.data_exame).getTime();
      const diffDias = Math.floor(diffTempo / (1000 * 60 * 60 * 24));
      const diasRestantes = 90 - diffDias;

      expirandoText = `${exameQuaseExpirando.tipo_exame} — Expirando em ${diasRestantes} dia(s).`;
    }

    let atencaoText = "Tudo em dia! Nenhum exame expirado.";
    let atencaoColor = "#4CAF50"; 
    let atencaoBg = "#E8F5E9";
    let atencaoIcon = "check-circle";

    const exameExpirado = examesMaisAntigos.find(exame => {
      const diffTempo = hoje.getTime() - new Date(exame.data_exame).getTime();
      const diffDias = Math.floor(diffTempo / (1000 * 60 * 60 * 24));
      return diffDias > 90; 
    });

    if (exameExpirado) {
      const diffTempo = hoje.getTime() - new Date(exameExpirado.data_exame).getTime();
      const diffDias = Math.floor(diffTempo / (1000 * 60 * 60 * 24));
      atencaoText = `${exameExpirado.tipo_exame} — Último há ${diffDias} dias.`;
      atencaoColor = "#F44336"; 
      atencaoBg = "#FFEBEE";
      atencaoIcon = "alert-circle";
    }

    // === ADICIONADO: CONTROLE EXCLUSIVO DE COMBOS DA CLINICA ===
    const combosOficiais = [
      'Check-Up Preventivo',
      'Check-Up Gym',
      'Check-Up Veggie',
      'Check-Up Cardio',
      'Check-Up Sono'
    ];
    
    // Mapeia todos os tipos únicos de exames que constam na lista do paciente
    const tiposRealizados = new Set(data.map(e => e.tipo_exame));
    
    // Filtra e conta quantos dos 5 combos o paciente possui
    const qtdEstrelas = combosOficiais.filter(combo => tiposRealizados.has(combo)).length;
    
    // Flag booleana que confere a coroa se os 5 forem diferentes
    const ganhouCoroa = qtdEstrelas === 5;

    setEngajamento({
      examesEsteAno,
      preventivoText,
      rotinaText,
      expirandoText, 
      atencaoText,
      atencaoColor,
      atencaoBg,
      atencaoIcon,
      // Passando as novas propriedades computadas para o estado
      qtdEstrelas,
      ganhouCoroa
    });
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

  const capitalizarNome = (texto?: string) => {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  const hasData = exames.length > 0;

  // NOVA FUNÇÃO: Renderizar estrelas
  const renderEstrelas = () => {
    const total = engajamento?.qtdEstrelas || 0;
    let estrelas = [];
    
    for (let i = 1; i <= 5; i++) {
      estrelas.push(
        <MaterialCommunityIcons 
          key={i} 
          name="star" 
          size={32} // Estrelas grandes e bonitas
          color={i <= total ? "#FFD700" : "#E0E0E0"} // Amarelo se completou, Cinza se não
          style={{ marginHorizontal: 4 }}
        />
      );
    }
    return estrelas;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}> 
      <StatusBar style="light" backgroundColor="#8B0000" />
      
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={carregarDados} colors={['#8B0000']} />
        }
      >
        <View style={styles.headerContainer}> 
          <View style={styles.userInfo}>
            {/* AVATAR COM A COROA */}
            <View style={{ position: 'relative' }}>
              <MaterialCommunityIcons name="account-circle" size={50} color="#DDD" />
              {engajamento?.ganhouCoroa && !isAdmin && (
                <View style={styles.coroaWrapper}>
                  <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
                </View>
              )}
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.userName}>
                {userData?.nome_completo ? capitalizarNome(userData.nome_completo) : 'Sistema MKHealth'}
              </Text>
              <Text style={styles.userCpf}>
                {isAdmin ? 'Visão Administrativa' : 'Paciente - Meus exames'}
              </Text>
            </View>
            <Image source={require('../../assets/images/logomk.png')} style={styles.logoRight} />
          </View>
        </View>

        {/* MENSAGEM DE BOAS-VINDAS */}
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeTitle}>
            Olá, {userData?.nome_completo ? capitalizarNome(userData.nome_completo.split(' ')[0]) : 'Paciente'}! 👋
          </Text>
          <Text style={styles.welcomeSub}>
            {hasData && !isAdmin
              ? 'Acompanhe seu status de rotina e mantenha sua saúde sempre em dia.'
              : 'Bem-vindo ao MK Health! Aqui você poderá acompanhar os resultados e a evolução de todos os seus exames laboratoriais.'
            }
          </Text>
        </View>

        {/* CARDS INFORMATIVOS DOS 5 COMBOS */}
        {!hasData && !isAdmin && (
          <View style={styles.combosInfoContainer}>
            <Text style={styles.combosSectionTitle}>📋 Conheça nossos Check-ups</Text>
            <Text style={styles.combosSectionSub}>
              Assim que realizar um dos nossos combos na clínica, este espaço liberará seu painel inteligente de engajamento!
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.combosCarousel}>
              <View style={[styles.comboPreviewCard, { borderLeftColor: '#4CAF50' }]}>
                <MaterialCommunityIcons name="dumbbell" size={24} color="#4CAF50" />
                <Text style={styles.comboPreviewName}>Check-Up Gym</Text>
                <Text style={styles.comboPreviewDesc}>Foco em performance e hipertrofia.</Text>
              </View>

              <View style={[styles.comboPreviewCard, { borderLeftColor: '#FF9800' }]}>
                <MaterialCommunityIcons name="sprout" size={24} color="#FF9800" />
                <Text style={styles.comboPreviewName}>Check-Up Veggie</Text>
                <Text style={styles.comboPreviewDesc}>Controle nutricional especializado.</Text>
              </View>

              <View style={[styles.comboPreviewCard, { borderLeftColor: '#F44336' }]}>
                <MaterialCommunityIcons name="heart-pulse" size={24} color="#F44336" />
                <Text style={styles.comboPreviewName}>Check-Up Cardio</Text>
                <Text style={styles.comboPreviewDesc}>Prevenção e saúde do coração.</Text>
              </View>

              <View style={[styles.comboPreviewCard, { borderLeftColor: '#9C27B0' }]}>
                <MaterialCommunityIcons name="brain" size={24} color="#9C27B0" />
                <Text style={styles.comboPreviewName}>Check-Up Sono</Text>
                <Text style={styles.comboPreviewDesc}>Mapeie fadiga, estresse e sono.</Text>
              </View>

             <View style={[styles.comboPreviewCard, { borderLeftColor: '#E91E63' }]}>
                <MaterialCommunityIcons name="clipboard-pulse" size={24} color="#E91E63" />
                <Text style={styles.comboPreviewName}>Check-Up Preventivo</Text>
                <Text style={styles.comboPreviewDesc}>Mapeamento Geral.</Text>
             </View>
            </ScrollView>
          </View>
        )}

        {/* PAINEL DE ENGAJAMENTO (GAMIFICAÇÃO E STATUS) */}
        {hasData && engajamento && !isAdmin && (
          <>
            <View style={styles.gamificationContainer}>
              {/* ========================================== */}
              {/* NOVO CARD EXCLUSIVO DE ESTRELAS E COMBOS */}
              {/* ========================================== */}
              <View style={[styles.gamificationCard, { borderLeftColor: '#9C27B0', marginBottom: 10 }]}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={[styles.gamificationText, { textAlign: 'center', marginBottom: 10 }]}>
                    Desbloqueie conquistas! Você fez <Text style={styles.boldText}>{engajamento.qtdEstrelas} de 5</Text> combos.
                  </Text>
                  
                  {/* Container que chama as 5 estrelas lado a lado */}
                  <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    {renderEstrelas()}
                  </View>
                  
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 10, fontStyle: 'italic', textAlign: 'center' }}>
                    {engajamento.qtdEstrelas >= 5 
                      ? "Você conquistou a Coroa de Prevenção 👑 !" 
                      : "Faça combos de exames diferentes para liberar estrelas!"}
                  </Text>
                </View>
              </View>
              {/* ========================================== */}
              <View style={styles.gamificationCard}>
                <MaterialCommunityIcons name="trophy-award" size={32} color="#FFD700" />
                <View style={styles.gamificationTextWrapper}>
                  <Text style={styles.gamificationText}>
                    Você realizou <Text style={styles.boldText}>{engajamento.examesEsteAno} check-ups</Text> este ano. Parabéns por cuidar da saúde!
                  </Text>
                </View>
              </View>

              <View style={[styles.gamificationCard, { borderLeftColor: '#2196F3', marginTop: 10 }]}>
                <MaterialCommunityIcons name="calendar-clock" size={32} color="#2196F3" />
                <View style={styles.gamificationTextWrapper}>
                  <Text style={styles.gamificationText}>
                    {engajamento.preventivoText}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.statusRotinaContainer}>
              <Text style={styles.sectionTitle}>Status de Rotina</Text>
              
              <View style={styles.statusItem}>
                <View style={[styles.statusIconBg, { backgroundColor: '#E8F5E9' }]}>
                  <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
                </View>
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusTitle}>Exames em Dia</Text>
                  <Text style={styles.statusSubtitle}>{engajamento.rotinaText}</Text>
                </View>
              </View>

              {/* CARD DE EXAMES EXPIRANDO */}
              <View style={styles.statusItem}>
                <View style={[styles.statusIconBg, { backgroundColor: '#FFF3E0' }]}>
                  <MaterialCommunityIcons name="clock-alert" size={24} color="#FF9800" />
                </View>
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusTitle}>Exames Expirando</Text>
                  <Text style={styles.statusSubtitle}>{engajamento.expirandoText}</Text>
                </View>
              </View>

              <View style={styles.statusItem}>
                <View style={[styles.statusIconBg, { backgroundColor: engajamento.atencaoBg }]}>
                  <MaterialCommunityIcons name={engajamento.atencaoIcon} size={24} color={engajamento.atencaoColor} />
                </View>
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusTitle}>Atenção</Text>
                  <Text style={styles.statusSubtitle}>{engajamento.atencaoText}</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* ÚLTIMOS EXAMES */}
        {ultimosExames.length > 0 && (
          <View style={styles.ultimosContainer}>
            <Text style={styles.sectionTitle}>
               {isAdmin ? 'Últimos Exames Cadastrados' : 'Meus Últimos Exames'}
            </Text>
            {ultimosExames.map((exame, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.ultimoItem}
                onPress={() => router.push('/exames')}
              >
                <View style={styles.ultimoIcon}>
                  <MaterialCommunityIcons name="flask-outline" size={24} color="#8B0000" />
                </View>
                <View style={styles.ultimoInfo}>
                  {isAdmin && <Text style={styles.ultimoNome}>{capitalizarNome(exame.paciente_nome)}</Text>}
                  <Text style={isAdmin ? styles.ultimoDetalheBold : styles.ultimoNome}>
                    {exame.tipo_exame}
                  </Text>
                  <Text style={styles.ultimoDetalhe}>{formatarData(exame.data_exame)} • {exame.laboratorio}</Text>
                </View>
                {exame.possui_pdf ? (
                  <MaterialCommunityIcons name="file-pdf-box" size={24} color="#FF4444" />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* TELA DE RETORNO VAZIA */}
        {!hasData && !loading && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={60} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>Histórico Clínico Vazio</Text>
            <Text style={styles.emptyText}>
              {isAdmin ? 'Nenhum exame foi cadastrado no banco ainda.' : 'Nenhum registro associado ao seu CPF foi inserido até o momento.'}
            </Text>
            {isAdmin && (
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => router.push('/cadastro-exame')}
              >
                <Text style={styles.emptyButtonText}>Cadastrar Novo Exame</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {loading && exames.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B0000" />
            <Text style={styles.loadingText}>Carregando dados...</Text>
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
    paddingTop: 15, 
    paddingBottom: 30, 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20 
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  userName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  userCpf: { color: '#DDD', fontSize: 12 },
  // AJUSTADO: Aumentado o tamanho de 70 para 85 para dar mais destaque visual
  logoRight: { width: 85, height: 85, resizeMode: 'contain', marginLeft: 'auto', tintColor: '#FFF' },
   
   coroaWrapper: {
    position: 'absolute',
    top: -10,
    right: -5, //voce editou aquiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii
    transform: [{ rotate: '15deg' }],
  },

  welcomeBanner: {
    backgroundColor: '#FFF',
    margin: 15,
    borderRadius: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  welcomeTitle: { fontSize: 18, fontWeight: 'bold', color: '#8B0000', marginBottom: 5 },
  welcomeSub: { fontSize: 13, color: '#555', lineHeight: 18 },

  combosInfoContainer: {
    margin: 15,
    marginTop: 5,
  },
  combosSectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  combosSectionSub: { fontSize: 12, color: '#666', marginBottom: 12 },
  combosCarousel: { flexDirection: 'row', paddingVertical: 5 },
  comboPreviewCard: {
    backgroundColor: '#FFF',
    width: 180,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  comboPreviewName: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 6, marginBottom: 4 },
  comboPreviewDesc: { fontSize: 11, color: '#666', lineHeight: 14 },

  gamificationContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
  gamificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#FFD700',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gamificationTextWrapper: {
    flex: 1,
    marginLeft: 15,
  },
  gamificationText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333',
  },

  statusRotinaContainer: {
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
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ultimoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  ultimoNome: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  ultimoDetalheBold: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginTop: 2,
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
    paddingVertical: 40,
    backgroundColor: '#FFF',
    margin: 15,
    borderRadius: 15,
    padding: 30,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#BBB',
    marginTop: 6,
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