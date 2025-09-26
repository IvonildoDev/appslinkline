import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { salvarDados } from '../utils/database';

export default function DesmontagemScreen() {
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const frasePadrao = 'Desmontagem do equipamento';

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
        dataRegistro: dataAtual
      };

      await salvarDados('Desmontagem', dados);
      Alert.alert('Sucesso', 'Desmontagem registrada com sucesso!');
      
      // Limpar campos após salvamento
      setHoraInicio('');
      setHoraFim('');
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Desmontagem</Text>
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
            placeholder="Ex: 17:00"
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
            placeholder="Ex: 18:00"
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Frase padrão</Text>
          <Text style={styles.frase}>{frasePadrao}</Text>
        </View>
        <View style={styles.resumoContainer}>
          <Text style={styles.resumoTitle}>Resumo</Text>
          <Text style={styles.resumoItem}>Hora início: {horaInicio || '---'}</Text>
          <Text style={styles.resumoItem}>Hora fim: {horaFim || '---'}</Text>
          <Text style={styles.resumoItem}>Frase: {frasePadrao}</Text>
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
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  frase: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  resumoContainer: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  resumoTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  resumoItem: {
    fontSize: 15,
    marginBottom: 4,
  },
  registrarButton: {
    marginTop: 24,
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  registrarButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
