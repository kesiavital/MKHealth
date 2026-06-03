import React, { createContext, ReactNode, useContext, useState } from 'react';

// Agora o exame aceita 'arquivoUri' (onde está o arquivo) e 'arquivoNome'
type Exame = {
  id: string;
  pacienteCpf: string;
  titulo: string;
  data: string;
  medico: string;
  arquivoUri?: string;  // Novo
  arquivoNome?: string; // Novo
};

const ExamesContext = createContext<any>(null);

export function ExamesProvider({ children }: { children: ReactNode }) {
  const [listaExames, setListaExames] = useState<Exame[]>([
    { 
      id: '1', 
      pacienteCpf: '000.000.000-00', 
      titulo: 'Hemograma Completo', 
      data: '24/11/2025', 
      medico: 'Dr. Silva',
      arquivoNome: 'hemograma_exemplo.pdf' 
    }
  ]);

  const adicionarExame = (novoExame: Exame) => {
    setListaExames((listaAtual) => [novoExame, ...listaAtual]);
  };

  return (
    <ExamesContext.Provider value={{ listaExames, adicionarExame }}>
      {children}
    </ExamesContext.Provider>
  );
}

export function useExames() {
  return useContext(ExamesContext);
}