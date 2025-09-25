import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EquipamentoScreen() {
  const [montagemInicio, setMontagemInicio] = useState('');
  const [montagemFim, setMontagemFim] = useState('');
  const [desmontagemInicio, setDesmontagemInicio] = useState('');
  const [desmontagemFim, setDesmontagemFim] = useState('');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Equipamento</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Montagem - Hora início</Text>
          <TextInput
            style={styles.input}
            value={montagemInicio}
            onChangeText={text => {
              let cleaned = text.replace(/\D/g, '');
              if (cleaned.length > 2) {
                cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
              }
              if (cleaned.length > 5) {
                cleaned = cleaned.slice(0, 5);
              }
              setMontagemInicio(cleaned);
            }}
            placeholder="Ex: 08:00"
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Montagem - Hora fim</Text>
          <TextInput
            style={styles.input}
            value={montagemFim}
            onChangeText={text => {
              let cleaned = text.replace(/\D/g, '');
              if (cleaned.length > 2) {
                cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
              }
              if (cleaned.length > 5) {
                cleaned = cleaned.slice(0, 5);
              }
              setMontagemFim(cleaned);
            }}
            placeholder="Ex: 09:00"
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Desmontagem - Hora início</Text>
          <TextInput
            style={styles.input}
            value={desmontagemInicio}
            onChangeText={text => {
              let cleaned = text.replace(/\D/g, '');
              if (cleaned.length > 2) {
                cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
              }
              if (cleaned.length > 5) {
                cleaned = cleaned.slice(0, 5);
              }
              setDesmontagemInicio(cleaned);
            }}
            placeholder="Ex: 17:00"
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Desmontagem - Hora fim</Text>
          <TextInput
            style={styles.input}
            value={desmontagemFim}
            onChangeText={text => {
              let cleaned = text.replace(/\D/g, '');
              if (cleaned.length > 2) {
                cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
              }
              if (cleaned.length > 5) {
                cleaned = cleaned.slice(0, 5);
              }
              setDesmontagemFim(cleaned);
            }}
            placeholder="Ex: 18:00"
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        <View style={styles.resumoContainer}>
          <Text style={styles.resumoTitle}>Resumo</Text>
          <Text style={styles.resumoItem}>Montagem: {montagemInicio || '---'} às {montagemFim || '---'}</Text>
          <Text style={styles.resumoItem}>Desmontagem: {desmontagemInicio || '---'} às {desmontagemFim || '---'}</Text>
        </View>

        <TouchableOpacity style={styles.registrarButton} onPress={() => {}}>
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
