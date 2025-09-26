import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { salvarDados } from '../utils/database';

export default function TurmaScreen() {
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const frasePadrao = 'Realizando passagem de serviço.';

  const salvarNoBanco = async () => {
    if (!horaInicio.trim() || !horaFim.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos de horário');
      return;
    }

    try {
      const agora = new Date();
      const dataAtual = `${agora.getDate().toString().padStart(2, '0')}/${(agora.getMonth() + 1).toString().padStart(2, '0')}/${agora.getFullYear()}`;
      
      const dados = {
        horaInicio: horaInicio.trim(),
        horaFim: horaFim.trim(),
        frasePadrao,
        observacoes: observacoes.trim(),
        dataRegistro: dataAtual
      };

      await salvarDados('Turma', dados);
      // Limpar campos após salvamento
      setHoraInicio('');
      setHoraFim('');
      setObservacoes('');
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Turma</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Hora início</Text>
          <TextInput
            style={styles.input}
            value={horaInicio}
            onChangeText={text => {
              let cleaned = text.replace(/\D/g, '');
              if (cleaned.length > 2) {
                cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
              }
              if (cleaned.length > 5) {
                cleaned = cleaned.slice(0, 5);
              }
              setHoraInicio(cleaned);
            }}
            placeholder="Ex: 08:00"
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Hora fim</Text>
          <TextInput
            style={styles.input}
            value={horaFim}
            onChangeText={text => {
              let cleaned = text.replace(/\D/g, '');
              if (cleaned.length > 2) {
                cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
              }
              if (cleaned.length > 5) {
                cleaned = cleaned.slice(0, 5);
              }
              setHoraFim(cleaned);
            }}
            placeholder="Ex: 09:30"
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Frase padrão</Text>
          <Text style={styles.frase}>{frasePadrao}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Observações (opcional)</Text>
          <TextInput
            style={[styles.input, {height: 80}]}
            value={observacoes}
            onChangeText={setObservacoes}
            placeholder="Digite observações..."
            multiline
            maxLength={150}
          />
          <Text style={{alignSelf: 'flex-end', color: '#888', fontSize: 12}}>{observacoes.length}/150</Text>
        </View>
        <View style={styles.resumoContainer}>
          <Text style={styles.resumoTitle}>Resumo</Text>
          <Text style={styles.resumoItem}>Hora início: {horaInicio || '---'}</Text>
          <Text style={styles.resumoItem}>Hora fim: {horaFim || '---'}</Text>
          <Text style={styles.resumoItem}>Frase: {frasePadrao}</Text>
          <Text style={styles.resumoItem}>Observações: {observacoes || '---'}</Text>
        </View>
        <TouchableOpacity style={styles.registrarButton} onPress={salvarNoBanco}>
          <Text style={styles.registrarButtonText}>Registrar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  frase: {
    fontSize: 16,
    color: '#2563eb',
    fontStyle: 'italic',
    marginTop: 4,
  },
  resumoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  resumoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 10,
    textAlign: 'center',
  },
  resumoItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  registrarButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 24,
    marginBottom: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  registrarButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
