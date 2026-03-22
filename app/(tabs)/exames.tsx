import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExames } from '../_context/ExamesContext';

export default function ExamesScreen() {
  const { listaExames } = useExames();

  // Função inteligente que funciona na Web e no Celular
  const abrirPDF = async (uri: string, nomeArquivo: string = 'exame.pdf') => {
    if (!uri) {
      Alert.alert('Ops', 'Este exame não possui arquivo anexado.');
      return;
    }

    // --- LÓGICA PARA WEB (COMPUTADOR) ---
    if (Platform.OS === 'web') {
        // Cria um link invisível e clica nele para forçar o download
        const link = document.createElement('a');
        link.href = uri;
        link.download = nomeArquivo; // Nome que vai ser baixado
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return; 
    }

    // --- LÓGICA PARA CELULAR (ANDROID/IOS) ---
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Erro', 'Seu dispositivo não suporta visualização de arquivos.');
      return;
    }
    await Sharing.shareAsync(uri);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Exames</Text>
      </View>

      <FlatList
        data={listaExames}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 50}}>Nenhum exame encontrado.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="file-document-outline" size={30} color="#8B0000" />
                </View>
                <View style={styles.infoContainer}>
                <Text style={styles.titulo}>{item.titulo}</Text>
                <Text style={styles.data}>Data: {item.data}</Text>
                <Text style={styles.medico}>Médico: {item.medico}</Text>
                </View>
            </View>
            
            {/* Botão para ver o PDF */}
            {item.arquivoUri && (
                <TouchableOpacity 
                    style={styles.pdfButton} 
                    // Passamos também o nome do arquivo para o download ficar bonito
                    onPress={() => abrirPDF(item.arquivoUri!, item.arquivoNome || 'exame.pdf')}
                >
                    <MaterialCommunityIcons name="download" size={20} color="#FFF" />
                    <Text style={styles.pdfButtonText}>BAIXAR RESULTADO (PDF)</Text>
                </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#8B0000', padding: 20, paddingBottom: 20 },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconContainer: { marginRight: 15, backgroundColor: '#FFEBEE', padding: 10, borderRadius: 50 },
  infoContainer: { flex: 1 },
  titulo: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  data: { fontSize: 14, color: '#666' },
  medico: { fontSize: 12, color: '#999', marginTop: 2 },
  pdfButton: {
    backgroundColor: '#2E7D32', // Verde
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  pdfButtonText: { color: '#FFF', fontWeight: 'bold', marginLeft: 10, fontSize: 14 }
});