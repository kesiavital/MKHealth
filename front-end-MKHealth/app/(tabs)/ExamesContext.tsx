// app/_context/ExamesContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

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

interface ExamesContextData {
  listaExames: Exame[];
  loading: boolean;
  carregarExames: () => Promise<void>;
  deletarExame: (id: number) => Promise<void>;
}

const ExamesContext = createContext<ExamesContextData>({} as ExamesContextData);

// URL do backend - ALTERE PARA O IP DO SEU COMPUTADOR
const API_URL = 'http://192.168.0.13:3000/api/exames';

export const ExamesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [listaExames, setListaExames] = useState<Exame[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarExames = async () => {
    setLoading(true);
    try {
      console.log('📱 Buscando lista de exames...');
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

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
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar exame');
      }

      Alert.alert('Sucesso', 'Exame deletado com sucesso!');
      await carregarExames(); // Recarregar a lista
    } catch (error) {
      console.error('❌ Erro ao deletar exame:', error);
      Alert.alert('Erro', 'Não foi possível deletar o exame');
    }
  };

  useEffect(() => {
    carregarExames();
  }, []);

  return (
    <ExamesContext.Provider value={{ listaExames, loading, carregarExames, deletarExame }}>
      {children}
    </ExamesContext.Provider>
  );
};

export const useExames = () => {
  const context = useContext(ExamesContext);
  if (!context) {
    throw new Error('useExames deve ser usado dentro de um ExamesProvider');
  }
  return context;
};