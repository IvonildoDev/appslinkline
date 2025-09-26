import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { buscarTodosDados } from '../utils/database';


interface Equipe {
  operador?: string;
  auxiliar?: string;
  unidade?: string;
}

interface Operacao {
  servico: string;
  poco: string;
  horaInicio?: string;
  horaFim?: string;
  observacao?: string;
  operacaoConcluida?: boolean;
  precisouUcaq?: boolean;
  tipoDesparafinacao?: string;
}

export default function HistoricoPocoScreen() {
  const [dados, setDados] = useState<Operacao[]>([]);
  const [poços, setPocos] = useState<string[]>([]);
  const [pocoSelecionado, setPocoSelecionado] = useState<string>('');
  const [equipe, setEquipe] = useState<Equipe | null>(null);

  useEffect(() => {
    (async () => {
      const todos = await buscarTodosDados();
      // Buscar equipe
      const equipeData = todos.find(item => item.tela.toLowerCase() === 'equipe');
      setEquipe(equipeData?.dados || null);
      // Agrupar operações por poço
      const operacoes: Operacao[] = [];
      todos.forEach(item => {
        if (item.dados && item.dados.poco) {
          operacoes.push({ ...item.dados, servico: item.tela });
        }
      });
      setDados(operacoes);
      // Listar poços únicos
      setPocos([...new Set(operacoes.map(op => op.poco))]);
      if (operacoes.length && !pocoSelecionado) setPocoSelecionado(operacoes[0].poco);
    })();
  }, []);

  const historico = dados.filter(op => op.poco === pocoSelecionado);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Histórico do Poço</Text>
      {equipe && (
        <View style={styles.equipeBox}>
          <Text style={styles.equipeTitle}>Equipe</Text>
          <Text style={styles.equipeInfo}>Operador: {equipe.operador || '--'}</Text>
          <Text style={styles.equipeInfo}>Auxiliar: {equipe.auxiliar || '--'}</Text>
          <Text style={styles.equipeInfo}>Unidade: {equipe.unidade || '--'}</Text>
        </View>
      )}
      <Text style={styles.label}>Selecione o poço:</Text>
      <ScrollView horizontal style={{ marginBottom: 16 }}>
        {poços.map(poco => (
          <Text
            key={poco}
            style={[styles.pocoButton, pocoSelecionado === poco && styles.pocoButtonActive]}
            onPress={() => setPocoSelecionado(poco)}
          >
            {poco}
          </Text>
        ))}
      </ScrollView>
      {historico.length === 0 ? (
        <Text style={styles.empty}>Nenhuma operação registrada para este poço.</Text>
      ) : (
        historico.map((op, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.servico}>{op.servico}</Text>
            <Text style={styles.info}>Tempo: {op.horaInicio || '--'} - {op.horaFim || '--'}</Text>
            <Text style={styles.info}>Concluída: {op.operacaoConcluida === true ? 'Sim' : op.operacaoConcluida === false ? 'Não' : '--'}</Text>
            {op.precisouUcaq !== undefined && (
              <Text style={styles.info}>Auxílio UCAQ: {op.precisouUcaq ? 'Sim' : 'Não'}</Text>
            )}
            {op.tipoDesparafinacao && (
              <Text style={styles.info}>Tipo de desparafinação: {op.tipoDesparafinacao}</Text>
            )}
            {op.observacao && (
              <Text style={styles.obs}>Obs: {op.observacao}</Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  equipeBox: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  equipeTitle: {
    fontWeight: 'bold',
    color: '#2563eb',
    fontSize: 16,
    marginBottom: 4,
  },
  equipeInfo: {
    fontSize: 15,
    color: '#333',
    marginBottom: 2,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  pocoButton: {
    backgroundColor: '#e5e7eb',
    color: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    fontWeight: 'bold',
  },
  pocoButtonActive: {
    backgroundColor: '#2563eb',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  servico: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  info: {
    fontSize: 15,
    color: '#333',
    marginBottom: 2,
  },
  obs: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  empty: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
});
