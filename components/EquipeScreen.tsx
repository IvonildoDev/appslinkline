import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { salvarDados } from '../utils/database';

export default function EquipeScreen() {
  const [turno, setTurno] = useState('diurno');
  const [operador, setOperador] = useState('');
  const [auxiliar, setAuxiliar] = useState('');
  const [unidade, setUnidade] = useState('USL-15');

  const salvarNoBanco = async () => {
    if (!operador.trim() || !auxiliar.trim()) {
      Alert.alert('Erro', 'Por favor, preencha os campos de operador e auxiliar');
      return;
    }

    try {
      const agora = new Date();
      const dataAtual = `${agora.getDate().toString().padStart(2, '0')}/${(agora.getMonth() + 1).toString().padStart(2, '0')}/${agora.getFullYear()}`;
      
      const dados = {
        turno,
        operador: operador.trim(),
        auxiliar: auxiliar.trim(),
        unidade: unidade.trim(),
        dataRegistro: dataAtual
      };

      await salvarDados('equipe', dados);
      Alert.alert('Sucesso', 'Dados da equipe salvos com sucesso!');
      
      // Limpar campos após salvamento
      setOperador('');
      setAuxiliar('');
    } catch (error) {
      console.error('Erro ao salvar dados da equipe:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Equipe</Text>
        
        {/* Seletor de Turno */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Turno</Text>
          <View style={styles.turnoContainer}>
            <TouchableOpacity
              style={[styles.turnoButton, turno === 'diurno' && styles.turnoButtonActive]}
              onPress={() => setTurno('diurno')}
            >
              <Text style={[styles.turnoText, turno === 'diurno' && styles.turnoTextActive]}>
                Diurno
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.turnoButton, turno === 'noturno' && styles.turnoButtonActive]}
              onPress={() => setTurno('noturno')}
            >
              <Text style={[styles.turnoText, turno === 'noturno' && styles.turnoTextActive]}>
                Noturno
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Unidade */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unidade</Text>
          <TextInput
            style={styles.input}
            value={unidade}
            onChangeText={setUnidade}
            placeholder="Ex: USL-15"
          />
        </View>

        {/* Operador */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operador</Text>
          <TextInput
            style={styles.input}
            value={operador}
            onChangeText={setOperador}
            placeholder="Nome do operador"
          />
        </View>

        {/* Auxiliar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Auxiliar</Text>
          <TextInput
            style={styles.input}
            value={auxiliar}
            onChangeText={setAuxiliar}
            placeholder="Nome do auxiliar"
          />
        </View>

        {/* Resumo */}
        <View style={styles.resumoContainer}>
          <Text style={styles.resumoTitle}>Resumo da Equipe</Text>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoLabel}>Turno:</Text>
            <Text style={styles.resumoValue}>{turno.charAt(0).toUpperCase() + turno.slice(1)}</Text>
          </View>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoLabel}>Unidade:</Text>
            <Text style={styles.resumoValue}>{unidade || 'Não definida'}</Text>
          </View>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoLabel}>Operador:</Text>
            <Text style={styles.resumoValue}>{operador || 'Não definido'}</Text>
          </View>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoLabel}>Auxiliar:</Text>
            <Text style={styles.resumoValue}>{auxiliar || 'Não definido'}</Text>
          </View>
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
    paddingBottom: 100, // Espaçamento extra para evitar sobreposição com menu nativo do Android
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  turnoContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  turnoButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  turnoButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#1d4ed8',
  },
  turnoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  turnoTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  resumoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resumoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 15,
    textAlign: 'center',
  },
  resumoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resumoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  resumoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
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