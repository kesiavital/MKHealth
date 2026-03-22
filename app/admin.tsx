import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useExames } from './_context/ExamesContext';

export default function AdminScreen() {
  const [cpf, setCpf] = useState('');
  const [nomeExame, setNomeExame] = useState(''); 
  const [medico, setMedico] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [arquivo, setArquivo] = useState<any>(null);
  
  const { adicionarExame } = useExames();

  const selecionarArquivo = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      if (!resultado.canceled) setArquivo(resultado.assets[0]);
    } catch (error) { Alert.alert('Erro', 'Erro ao selecionar arquivo'); }
  };

  const handleSalvar = () => {
    // 1. Validação básica
    if (!cpf || !nomeExame || !medico) { 
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.'); 
      return; 
    }
    
    // 2. Cria o objeto do exame
    const novoExame = {
      id: Math.random().toString(), // Gera ID único
      pacienteCpf: cpf,
      titulo: nomeExame,
      data: new Date().toLocaleDateString('pt-BR'),
      medico: medico,
      arquivoUri: arquivo ? arquivo.uri : null,
      arquivoNome: arquivo ? arquivo.name : null,
    };

    // 3. Salva na memória
    adicionarExame(novoExame);

    // 4. Limpa os campos VISUALMENTE na hora (para evitar clique duplo)
    setCpf('');
    setNomeExame('');
    setMedico('');
    setArquivo(null);
    setObservacoes('');

    // 5. Mostra o Alerta com confirmação
    // O setTimeout ajuda a garantir que o alerta apareça se a tela estiver renderizando algo
    setTimeout(() => {
        Alert.alert(
            'Sucesso! ✅', 
            'O exame foi enviado para o paciente.',
            [
                { 
                    text: 'OK', 
                    onPress: () => {
                        // Opção A: Se quiser que volte para o login/home sozinho:
                        // router.replace('/'); 
                        
                        // Opção B: Se quiser continuar na tela de Admin para lançar outro (Recomendado):
                        console.log('Exame salvo e alerta fechado.');
                    }
                }
            ]
        );
    }, 100);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
         <Text style={styles.headerTitle}>Buscar paciente pelo{'\n'}nome/CPF</Text>
      </View>

      <View style={styles.form}>
        {/* Campo Busca */}
        <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={24} color="#888" />
            <TextInput style={styles.searchInput} placeholder="Buscar paciente pelo nome/CPF" value={cpf} onChangeText={setCpf} />
        </View>

        {/* Tipo de Exame */}
        <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="Tipo de exame" value={nomeExame} onChangeText={setNomeExame} />
            <MaterialCommunityIcons name="chevron-down" size={24} color="#666" style={styles.iconRight} />
        </View>

        {/* Data */}
        <View style={styles.inputContainer}>
             <MaterialCommunityIcons name="calendar-blank-outline" size={20} color="#666" style={styles.iconLeft}/>
             <TextInput style={[styles.input, {paddingLeft: 45}]} placeholder="Data do exame" editable={false} value={new Date().toLocaleDateString('pt-BR')} />
        </View>

        {/* Médico */}
        <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="Médico responsável" value={medico} onChangeText={setMedico} />
        </View>

        {/* Observações */}
        <View style={styles.inputContainer}>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Observações" multiline={true} value={observacoes} onChangeText={setObservacoes} />
        </View>

        {/* Upload */}
        <Text style={styles.labelBold}>Upload do exame:</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={selecionarArquivo}>
            <Text style={styles.uploadText}>{arquivo ? arquivo.name : 'Selecionar arquivo'}</Text>
        </TouchableOpacity>
        <Text style={styles.fileStatus}>{arquivo ? 'Arquivo pronto para envio' : 'Nenhum arquivo selecionado'}</Text>

        {/* Botões Finais */}
        <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleSalvar}>
                <Text style={styles.buttonText}>Salvar/Enviar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={() => router.replace('/')}>
                <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F0F4F8' },
  header: { backgroundColor: '#8B0000', padding: 40, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  form: { padding: 25 },
  searchContainer: { flexDirection: 'row', backgroundColor: '#E0E0E0', borderRadius: 5, padding: 12, alignItems: 'center', marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  inputContainer: { marginBottom: 15, justifyContent: 'center' },
  input: { backgroundColor: '#E0E0E0', borderRadius: 5, padding: 15, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  iconRight: { position: 'absolute', right: 15 },
  iconLeft: { position: 'absolute', left: 15, zIndex: 1 },
  labelBold: { fontWeight: 'bold', fontSize: 16, marginBottom: 8, marginTop: 10 },
  uploadBox: { backgroundColor: '#E0E0E0', padding: 15, borderRadius: 5 },
  uploadText: { color: '#555' },
  fileStatus: { color: '#888', fontSize: 12, marginBottom: 30, marginTop: 5 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  actionButton: { backgroundColor: '#8B0000', flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold' }
});