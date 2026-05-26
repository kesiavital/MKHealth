import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


const API_URL = 'http://172.17.20.72:3000/api/exames/';  

// Lista de exames comuns
const commonExams = [
  { id: 1, name: 'Hemograma Completo', category: 'Sangue' },
  { id: 2, name: 'Glicemia em Jejum', category: 'Sangue' },
  { id: 3, name: 'Colesterol Total e Frações', category: 'Sangue' },
  { id: 4, name: 'Triglicerídeos', category: 'Sangue' },
  { id: 5, name: 'TGO/AST', category: 'Sangue' },
  { id: 6, name: 'TGP/ALT', category: 'Sangue' },
  { id: 7, name: 'Creatinina', category: 'Sangue' },
  { id: 8, name: 'Uréia', category: 'Sangue' },
  { id: 9, name: 'Ácido Úrico', category: 'Sangue' },
  { id: 10, name: 'Vitamina D', category: 'Sangue' },
  { id: 11, name: 'Ferritina', category: 'Sangue' },
  { id: 12, name: 'PSA Total', category: 'Sangue' },
  { id: 13, name: 'TSH', category: 'Hormônios' },
  { id: 14, name: 'T4 Livre', category: 'Hormônios' },
  { id: 15, name: 'Testosterona', category: 'Hormônios' },
  { id: 16, name: 'Raio-X de Tórax', category: 'Imagem' },
  { id: 17, name: 'Ultrassonografia Abdômen Total', category: 'Imagem' },
  { id: 18, name: 'Mamografia', category: 'Imagem' },
  { id: 19, name: 'Ressonância Magnética', category: 'Imagem' },
  { id: 20, name: 'Tomografia Computadorizada', category: 'Imagem' },
  { id: 21, name: 'Eletrocardiograma', category: 'Cardiologia' },
  { id: 22, name: 'Teste Ergométrico', category: 'Cardiologia' },
  { id: 23, name: 'Ecocardiograma', category: 'Cardiologia' },
  { id: 24, name: 'Colonoscopia', category: 'Endoscopia' },
  { id: 25, name: 'Endoscopia Digestiva Alta', category: 'Endoscopia' },
  { id: 26, name: 'Urina Tipo I', category: 'Urina' },
  { id: 27, name: 'Urocultura', category: 'Urina' },
  { id: 28, name: 'Papanicolau', category: 'Ginecologia' },
];

// Lista de clínicas/laboratórios
const clinics = [
  { id: 1, name: 'Laboratório Exame Plus', address: 'Av. Paulista, 1000', rating: 4.8 },
  { id: 2, name: 'Clínica Diagnóstico Avançado', address: 'Rua Augusta, 500', rating: 4.6 },
  { id: 3, name: 'Lab Saúde Total', address: 'Av. Brigadeiro Faria Lima, 2000', rating: 4.7 },
  { id: 4, name: 'Centro Médico Vida', address: 'Rua Oscar Freire, 800', rating: 4.9 },
  { id: 5, name: 'Laboratório São Lucas', address: 'Av. Rebouças, 1500', rating: 4.5 },
  { id: 6, name: 'Clínica Bem Estar', address: 'Rua Haddock Lobo, 300', rating: 4.4 },
  { id: 7, name: 'Lab Medicina Diagnóstica', address: 'Av. Angélica, 1200', rating: 4.8 },
  { id: 8, name: 'Instituto de Imagem', address: 'Rua da Consolação, 2500', rating: 4.6 },
  { id: 9, name: 'Laboratório DNA', address: 'Av. São João, 500', rating: 4.7 },
  { id: 10, name: 'Clínica Preventiva', address: 'Rua Maria Paula, 100', rating: 4.5 },
];

// Lista de médicos
const doctors = [
  { id: 1, name: 'Dra. Ana Silva', specialty: 'Clínico Geral' },
  { id: 2, name: 'Dr. Carlos Santos', specialty: 'Cardiologista' },
  { id: 3, name: 'Dra. Mariana Oliveira', specialty: 'Endocrinologista' },
  { id: 4, name: 'Dr. Roberto Almeida', specialty: 'Gastroenterologista' },
  { id: 5, name: 'Dra. Patrícia Costa', specialty: 'Ginecologista' },
  { id: 6, name: 'Dr. Fernando Lima', specialty: 'Ortopedista' },
  { id: 7, name: 'Dra. Beatriz Souza', specialty: 'Dermatologista' },
  { id: 8, name: 'Dr. Ricardo Pereira', specialty: 'Neurologista' },
];

interface PDFFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

export default function RegisterExamScreen() {
  const [loading, setLoading] = useState(false);
  
  // Campos do formulário
  const [patientName, setPatientName] = useState('');
  const [examType, setExamType] = useState('');
  const [customExam, setCustomExam] = useState('');
  const [showCustomExam, setShowCustomExam] = useState(false);
  const [examDate, setExamDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [laboratory, setLaboratory] = useState('');
  const [results, setResults] = useState('');
  const [observations, setObservations] = useState('');
  
  // Campos para anexo
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR');
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExamDate(selectedDate);
    }
  };

  // Função para selecionar PDF no Expo
  const selectPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setPdfFile({
          uri: asset.uri,
          name: asset.name,
          size: asset.size || 0,
          mimeType: asset.mimeType || 'application/pdf',
        });
        
        Alert.alert('Sucesso', `PDF "${asset.name}" selecionado com sucesso!`);
      } else {
        console.log('Usuário cancelou a seleção');
      }
    } catch (err) {
      console.error('Erro ao selecionar PDF:', err);
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo PDF');
    }
  };

  // Função para remover PDF
  const removePDF = () => {
    setPdfFile(null);
    Alert.alert('Removido', 'PDF removido com sucesso');
  };

  // Função para testar conexão com o servidor
  const testServerConnection = async (): Promise<boolean> => {
    try {
      console.log('🔍 Testando conexão com o servidor...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://192.168.0.13:3000/health', {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('✅ Servidor respondendo na porta 3000');
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Servidor não responde:', errorMessage);
      return false;
    }
  };

  const handleRegisterExam = async () => {
    // Validações
    if (!patientName.trim()) {
      Alert.alert('Erro', 'Por favor, digite o nome do paciente.');
      return;
    }

    let finalExamType = examType;
    if (showCustomExam && customExam.trim()) {
      finalExamType = customExam.trim();
    } else if (!examType) {
      Alert.alert('Erro', 'Por favor, selecione ou digite o tipo do exame.');
      return;
    }

    if (!doctorName) {
      Alert.alert('Erro', 'Por favor, selecione o médico solicitante.');
      return;
    }

    if (!laboratory) {
      Alert.alert('Erro', 'Por favor, selecione o laboratório/clínica.');
      return;
    }

    setLoading(true);
    
    // Testar conexão primeiro
    const isConnected = await testServerConnection();
    if (!isConnected) {
      Alert.alert(
        'Erro de Conexão',
        'Não foi possível conectar ao servidor.\n\nVerifique:\n✓ O backend está rodando (npm start)\n✓ O IP está correto: ' + API_URL + '\n✓ Celular e computador estão na mesma rede Wi-Fi\n✓ Firewall não está bloqueando a porta 3000'
      );
      setLoading(false);
      return;
    }

    try {
      // Criar FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('paciente_nome', patientName.trim());
      formData.append('tipo_exame', finalExamType);
      formData.append('data_exame', examDate.toISOString().split('T')[0]);
      formData.append('medico_solicitante', doctorName);
      formData.append('laboratorio', laboratory);
      
      if (results.trim()) {
        formData.append('resultados', results.trim());
      }
      
      if (observations.trim()) {
        formData.append('observacoes', observations.trim());
      }
      
      // Adicionar PDF se existir
      if (pdfFile) {
        setUploadingPdf(true);
        
        // Para React Native, precisamos criar um objeto de arquivo no formato esperado
        const fileToUpload = {
          uri: pdfFile.uri,
          type: pdfFile.mimeType,
          name: pdfFile.name,
        } as any;
        
        formData.append('pdf', fileToUpload);
        console.log('📎 PDF adicionado ao FormData:', pdfFile.name);
      }
      
      console.log('📡 Enviando requisição POST com FormData...');
      console.log('📡 URL:', API_URL);
      console.log('📡 Dados:', {
        paciente_nome: patientName.trim(),
        tipo_exame: finalExamType,
        data_exame: examDate.toISOString().split('T')[0],
        medico_solicitante: doctorName,
        laboratorio: laboratory,
        possui_pdf: !!pdfFile,
        pdf_nome: pdfFile?.name
      });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          // Não definir Content-Type aqui - o fetch vai definir automaticamente com o boundary correto
        },
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📡 Status da resposta:', response.status);
      
      const textResponse = await response.text();
      console.log('📡 Resposta RAW:', textResponse);
      
      if (!textResponse || textResponse.trim() === '') {
        throw new Error('Servidor retornou resposta vazia.');
      }
      
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError);
        throw new Error('Resposta do servidor inválida.');
      }
      
      if (response.status === 400) {
        Alert.alert('Erro de Validação', data.erro || 'Dados inválidos');
        return;
      }
      
      if (response.status === 409) {
        Alert.alert('Erro', data.erro || 'Exame já cadastrado');
        return;
      }
      
      if (!response.ok) {
        throw new Error(data.erro || `Erro ${response.status}: Falha ao cadastrar exame`);
      }
      
      Alert.alert(
        'Sucesso!', 
        pdfFile ? 'Exame cadastrado com PDF anexado com sucesso!' : 'Exame cadastrado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              setPatientName('');
              setExamType('');
              setCustomExam('');
              setShowCustomExam(false);
              setExamDate(new Date());
              setDoctorName('');
              setLaboratory('');
              setResults('');
              setObservations('');
              setPdfFile(null);
              router.push('/exames');
            }
          }
        ]
      );
      
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      const errorName = error instanceof Error ? error.name : '';
      
      console.error('❌ Erro detalhado:', error);
      
      if (errorName === 'AbortError') {
        Alert.alert(
          'Timeout', 
          'A requisição demorou muito tempo. Verifique sua conexão.'
        );
      } else if (errorMessage === 'Network request failed') {
        Alert.alert(
          'Erro de Rede',
          'Não foi possível conectar ao servidor.\n\nVerifique:\n✓ O backend está rodando\n✓ O IP está correto: ' + API_URL + '\n✓ O celular está na mesma rede Wi-Fi\n✓ O firewall não está bloqueando a porta 3000'
        );
      } else {
        Alert.alert('Erro', errorMessage || 'Erro ao cadastrar exame.');
      }
    } finally {
      setLoading(false);
      setUploadingPdf(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      <View style={styles.backgroundCircle} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../img/logomk.png')}
            style={styles.logo}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Cadastro de Exame Médico</Text>
          <Text style={styles.subtitle}>Registre os dados do exame realizado</Text>

          <Text style={styles.label}>Nome do Paciente *</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome completo do paciente"
            value={patientName}
            onChangeText={setPatientName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Tipo de Exame *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={examType}
              onValueChange={(itemValue: string) => {
                setExamType(itemValue);
                if (itemValue === 'outro') {
                  setShowCustomExam(true);
                } else {
                  setShowCustomExam(false);
                  setCustomExam('');
                }
              }}
              style={styles.picker}
            >
              <Picker.Item label="Selecione um exame..." value="" />
              {commonExams.map((exam) => (
                <Picker.Item key={exam.id} label={`${exam.name} (${exam.category})`} value={exam.name} />
              ))}
              <Picker.Item label="Outro (digitar manualmente)" value="outro" />
            </Picker>
          </View>

          {showCustomExam && (
            <TextInput
              style={[styles.input, styles.customInput]}
              placeholder="Digite o nome do exame"
              value={customExam}
              onChangeText={setCustomExam}
              autoCapitalize="words"
            />
          )}

          <Text style={styles.label}>Data do Exame *</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {formatDate(examDate)}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={examDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              locale="pt-BR"
            />
          )}

          <Text style={styles.label}>Médico Solicitante *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={doctorName}
              onValueChange={(itemValue: string) => setDoctorName(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecione um médico..." value="" />
              {doctors.map((doctor) => (
                <Picker.Item key={doctor.id} label={`${doctor.name} - ${doctor.specialty}`} value={doctor.name} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Laboratório / Clínica *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={laboratory}
              onValueChange={(itemValue: string) => setLaboratory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecione um laboratório/clínica..." value="" />
              {clinics.map((clinic) => (
                <Picker.Item key={clinic.id} label={`${clinic.name} - ⭐ ${clinic.rating}`} value={clinic.name} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Resultados do Exame</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva os resultados do exame"
            value={results}
            onChangeText={setResults}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Observações adicionais (preparo, contraindicações, etc.)"
            value={observations}
            onChangeText={setObservations}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Campo para anexar PDF */}
          <Text style={styles.label}>Anexar PDF do Exame</Text>
          {!pdfFile ? (
            <TouchableOpacity style={styles.attachButton} onPress={selectPDF}>
              <Text style={styles.attachButtonText}>📎 Selecionar arquivo PDF</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.pdfInfoContainer}>
              <View style={styles.pdfInfo}>
                <Text style={styles.pdfIcon}>📄</Text>
                <View style={styles.pdfDetails}>
                  <Text style={styles.pdfName} numberOfLines={1}>
                    {pdfFile.name}
                  </Text>
                  <Text style={styles.pdfSize}>
                    {(pdfFile.size / 1024).toFixed(2)} KB
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.removePdfButton} onPress={removePDF}>
                <Text style={styles.removePdfText}>❌ Remover</Text>
              </TouchableOpacity>
            </View>
          )}

          {uploadingPdf && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color="#8B0000" />
              <Text style={styles.uploadingText}>Enviando PDF...</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegisterExam}
            disabled={loading || uploadingPdf}
          >
            {(loading || uploadingPdf) ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>CADASTRAR EXAME</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.listButton} 
            onPress={() => router.push('/exames')}
          >
            <Text style={styles.listText}>Ver Lista de Exames</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B0000'
  },
  backgroundCircle: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#A52A2A',
    opacity: 0.5
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: 40
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10
  },
  logo: {
    width: 120,
    height: 120,
    tintColor: '#FFF',
    resizeMode: 'contain'
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
    marginLeft: 5
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16
  },
  customInput: {
    marginTop: -15,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 15,
    textAlignVertical: 'top'
  },
  dateButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333'
  },
  pickerContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden'
  },
  picker: {
    height: 50,
    width: '100%'
  },
  attachButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    alignItems: 'center'
  },
  attachButtonText: {
    fontSize: 16,
    color: '#8B0000',
    fontWeight: 'bold'
  },
  pdfInfoContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#8B0000',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  pdfInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  pdfIcon: {
    fontSize: 30,
    marginRight: 10
  },
  pdfDetails: {
    flex: 1
  },
  pdfName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  pdfSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  removePdfButton: {
    padding: 8
  },
  removePdfText: {
    fontSize: 14,
    color: '#FF0000'
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 10
  },
  uploadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#8B0000'
  },
  button: {
    backgroundColor: '#8B0000',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#8B0000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  listButton: {
    alignItems: 'center',
    marginTop: 20
  },
  listText: {
    color: '#8B0000',
    fontSize: 14,
    fontWeight: 'bold'
  }
});