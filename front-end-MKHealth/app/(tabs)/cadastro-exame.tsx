import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import IP from '../../service/api';

const API_URL = `http://${IP}/api/exames`;

// Lista de exames comuns (mantenha igual)
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

interface AttachmentFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

export default function RegisterExamScreen() {
  const [loading, setLoading] = useState(false);

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

  const [attachment, setAttachment] = useState<AttachmentFile | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const [showScanner, setShowScanner] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [attachmentMethod, setAttachmentMethod] = useState<'file' | 'scan' | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR');
  };

  const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExamDate(selectedDate);
    }
  };

  const selectPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setAttachment({
          uri: asset.uri,
          name: asset.name,
          size: asset.size || 0,
          mimeType: 'application/pdf',
        });
        setAttachmentMethod('file');
        Alert.alert('Sucesso', `PDF "${asset.name}" selecionado com sucesso!`);
      }
    } catch (err) {
      console.error('Erro ao selecionar PDF:', err);
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo PDF');
    }
  };

  const scanDocument = async () => {
    const hasPermission = await requestPermission();
    
    if (hasPermission.granted) {
      setShowScanner(true);
    } else {
      Alert.alert('Erro', 'É necessário permitir o acesso à câmera para escanear documentos');
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      setProcessingImage(true);
      
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });

        if (photo) {
          // Processar imagem para melhor qualidade
          const processedImage = await ImageManipulator.manipulateAsync(
            photo.uri,
            [
              { resize: { width: 1024 } },
            ],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
          );

          const imageName = `scan_${Date.now()}.jpg`;
          
          // Obter o tamanho do arquivo
          let fileSize = 0;
          try {
            const response = await fetch(processedImage.uri);
            const blob = await response.blob();
            fileSize = blob.size;
          } catch (error) {
            console.log('Erro ao obter tamanho:', error);
          }
          
          setAttachment({
            uri: processedImage.uri,
            name: imageName,
            size: fileSize,
            mimeType: 'image/jpeg',
          });
          setAttachmentMethod('scan');
          setShowScanner(false);
          
          Alert.alert('Sucesso', 'Documento escaneado com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao escanear:', error);
        Alert.alert('Erro', 'Não foi possível escanear o documento. Tente novamente.');
      } finally {
        setProcessingImage(false);
      }
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentMethod(null);
    Alert.alert('Removido', 'Anexo removido com sucesso');
  };

  const handleRegisterExam = async () => {
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

    try {
      const formData = new FormData();

      formData.append('paciente_nome', patientName.trim());
      formData.append('tipo_exame', finalExamType);
      formData.append('data_exame', formatDateForAPI(examDate));
      formData.append('medico_solicitante', doctorName);
      formData.append('laboratorio', laboratory);

      if (results.trim()) {
        formData.append('resultados', results.trim());
      }

      if (observations.trim()) {
        formData.append('observacoes', observations.trim());
      }

      if (attachment) {
        setUploadingFile(true);

        const fileToUpload = {
          uri: attachment.uri,
          type: attachment.mimeType,
          name: attachment.name,
        } as any;

        formData.append('pdf', fileToUpload);
        console.log(`📎 Enviando ${attachmentMethod === 'scan' ? 'imagem escaneada' : 'PDF'}:`, attachment.name);
      }

      console.log('📡 Enviando para:', API_URL);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let data;
      const responseText = await response.text();

      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Erro ao parsear JSON:', e);
        throw new Error('Resposta inválida do servidor');
      }

      if (response.status === 201 || response.status === 200) {
        Alert.alert(
          'Sucesso!',
          data.mensagem || 'Exame cadastrado com sucesso!',
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
                setAttachment(null);
                setAttachmentMethod(null);
                router.push('/exames');
              }
            }
          ]
        );
      } else {
        Alert.alert('Erro', data.erro || 'Erro ao cadastrar exame');
      }

    } catch (error: any) {
      console.error('❌ Erro:', error);

      if (error.name === 'AbortError') {
        Alert.alert('Timeout', 'A requisição demorou muito tempo. Verifique sua conexão.');
      } else if (error.message === 'Network request failed') {
        Alert.alert(
          'Erro de Rede',
          `Não foi possível conectar ao servidor em:\n${API_URL}\n\nVerifique:\n• O backend está rodando\n• O IP está correto\n• Celular e computador estão na mesma rede Wi-Fi`
        );
      } else {
        Alert.alert('Erro', error.message || 'Erro ao cadastrar exame');
      }
    } finally {
      setLoading(false);
      setUploadingFile(false);
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

          <Text style={styles.label}>Anexar Documento</Text>
          
          {!attachment ? (
            <View style={styles.attachmentOptions}>
              <TouchableOpacity style={styles.attachButton} onPress={selectPDF}>
                <Text style={styles.attachButtonText}>📁 Selecionar PDF</Text>
                <Text style={styles.attachSubtext}>do dispositivo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.scanButton} onPress={scanDocument}>
                <Text style={styles.scanButtonText}>📷 Escanear Documento</Text>
                <Text style={styles.scanSubtext}>físico com a câmera</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.attachmentInfoContainer}>
              <View style={styles.attachmentInfo}>
                <Text style={styles.attachmentIcon}>
                  {attachmentMethod === 'scan' ? '📷' : '📄'}
                </Text>
                <View style={styles.attachmentDetails}>
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {attachment.name}
                  </Text>
                  <Text style={styles.attachmentType}>
                    {attachmentMethod === 'scan' ? 'Documento escaneado' : 'PDF do dispositivo'} • 
                    {(attachment.size / 1024).toFixed(2)} KB
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.removeButton} onPress={removeAttachment}>
                <Text style={styles.removeText}>❌ Remover</Text>
              </TouchableOpacity>
            </View>
          )}

          {uploadingFile && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color="#8B0000" />
              <Text style={styles.uploadingText}>Enviando documento...</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegisterExam}
            disabled={loading || uploadingFile}
          >
            {(loading || uploadingFile) ? (
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

      <Modal
        animationType="slide"
        transparent={false}
        visible={showScanner}
        onRequestClose={() => setShowScanner(false)}
      >
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.cameraFull}
            facing="back"
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.scanFrameContainer}>
                <View style={styles.scanFrame}>
                  <View style={styles.scanCornerTL} />
                  <View style={styles.scanCornerTR} />
                  <View style={styles.scanCornerBL} />
                  <View style={styles.scanCornerBR} />
                </View>
                <Text style={styles.scanInstruction}>
                  Posicione o documento dentro da moldura
                </Text>
              </View>
              
              <View style={styles.cameraControls}>
                <TouchableOpacity 
                  style={styles.cancelScanButton}
                  onPress={() => setShowScanner(false)}
                >
                  <Text style={styles.cancelScanText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.captureScanButton}
                  onPress={takePicture}
                  disabled={processingImage}
                >
                  {processingImage ? (
                    <ActivityIndicator size="large" color="#FFF" />
                  ) : (
                    <View style={styles.captureButtonInner} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ... (mantenha os mesmos styles do código anterior)
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
  attachmentOptions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  attachButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    alignItems: 'center'
  },
  attachButtonText: {
    fontSize: 14,
    color: '#8B0000',
    fontWeight: 'bold'
  },
  attachSubtext: {
    fontSize: 10,
    color: '#666',
    marginTop: 2
  },
  scanButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    borderWidth: 2,
    borderColor: '#8B0000',
    alignItems: 'center'
  },
  scanButtonText: {
    fontSize: 14,
    color: '#8B0000',
    fontWeight: 'bold'
  },
  scanSubtext: {
    fontSize: 10,
    color: '#666',
    marginTop: 2
  },
  attachmentInfoContainer: {
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
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  attachmentIcon: {
    fontSize: 30,
    marginRight: 10
  },
  attachmentDetails: {
    flex: 1
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  attachmentType: {
    fontSize: 11,
    color: '#666',
    marginTop: 2
  },
  removeButton: {
    padding: 8
  },
  removeText: {
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
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraFull: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'space-between',
  },
  scanFrameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: '85%',
    height: '45%',
    position: 'relative',
  },
  scanCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#8B0000',
  },
  scanCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#8B0000',
  },
  scanCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#8B0000',
  },
  scanCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#8B0000',
  },
  scanInstruction: {
    color: '#FFF',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 8,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 30,
    marginBottom: 30,
  },
  cancelScanButton: {
    padding: 15,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelScanText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  captureScanButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
  },
});