
import * as Linking from 'expo-linking';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { buscarTodosDados, salvarDados } from '../utils/database';

const opcoesServicos = [
  'Desparafinação Mecânica',
  'Dessassentar BPV',
  'RPE',
];

// Estilos do modal como objetos JS
import type { TextStyle, ViewStyle } from 'react-native';
const modalOverlay: ViewStyle = {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.3)',
  justifyContent: 'center',
  alignItems: 'center',
};
const modalContent: ViewStyle = {
  width: '90%',
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 24,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 5,
};
const modalTitle: TextStyle = {
  fontSize: 22,
  fontWeight: 'bold',
  color: '#2563eb',
  marginBottom: 16,
  textAlign: 'center',
};

export default function OperacoesScreen() {
  const [servico, setServico] = useState(opcoesServicos[0]);
  const [poco, setPoco] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalServico, setModalServico] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [observacao, setObservacao] = useState('');
  const [pressaoCabeca, setPressaoCabeca] = useState('');
  const [pressaoAnular, setPressaoAnular] = useState('');
  const [operacaoConcluida, setOperacaoConcluida] = useState<boolean|null>(null); // null, true, false
  const [statusSelecionado, setStatusSelecionado] = useState('');
  const statusList = [
    'Supervisório ciente',
    'Permaneceu aberto Supervisório ciente',
    'Poço entregue à sonda.'
  ];

  // Carregar dados salvos ao iniciar
  useEffect(() => {
    (async () => {
      try {
        const dados = await buscarTodosDados();
        const operacoesData = dados.find(item => item.tela === 'Operações');
        if (operacoesData) {
          setServico(operacoesData.dados.servico || opcoesServicos[0]);
          setPoco(operacoesData.dados.poco || '');
        }
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
      }
    })();
  }, []);

  const salvarNoBanco = async () => {
    if (!poco.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o nome do poço');
      return;
    }

    try {
      const dados = {
        servico,
        poco: poco.trim(),
        horaInicio: horaInicio.trim(),
        horaFim: horaFim.trim(),
        observacao: observacao.trim(),
        pressaoCabeca: pressaoCabeca.trim(),
        pressaoAnular: pressaoAnular.trim(),
        operacaoConcluida,
        statusSelecionado
      };

      await salvarDados('Operações', dados);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados');
    }
  };

  // Salvar dados do modal
  const salvarModal = async () => {
    if (!horaInicio.trim() || !horaFim.trim()) {
      Alert.alert('Erro', 'Por favor, preencha os horários');
      return;
    }

    // Se for RPE, validar campos de pressão
    if (modalServico === 'RPE' && (!pressaoCabeca.trim() || !pressaoAnular.trim())) {
      Alert.alert('Erro', 'Para RPE, preencha as pressões');
      return;
    }

    if (operacaoConcluida === null) {
      Alert.alert('Erro', 'Informe se a operação foi concluída');
      return;
    }

    if (!statusSelecionado) {
      Alert.alert('Erro', 'Selecione um status');
      return;
    }

    try {
      // Salvar dados do modal específico
      const dadosModal = {
        servico: modalServico,
        poco: poco.trim(),
        horaInicio: horaInicio.trim(),
        horaFim: horaFim.trim(),
        observacao: observacao.trim(),
        pressaoCabeca: pressaoCabeca.trim(),
        pressaoAnular: pressaoAnular.trim(),
        operacaoConcluida,
        statusSelecionado
      };

      await salvarDados(`Operações-${modalServico}`, dadosModal);
      
      // Atualizar o serviço selecionado
      setServico(modalServico);
      setModalVisible(false);
      
      // Limpar campos do modal
      setHoraInicio('');
      setHoraFim('');
      setObservacao('');
      setPressaoCabeca('');
      setPressaoAnular('');
      setOperacaoConcluida(null);
      setStatusSelecionado('');
    } catch (error) {
      console.error('Erro ao salvar dados do modal:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados do modal');
    }
  };

  // Função para compartilhar via WhatsApp
  const compartilharWhatsApp = async () => {
    let msg = `Serviço: ${servico}\nPoço: ${poco}`;
    try {
      const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[modalOverlay]}>
          <View style={[modalContent]}>
            <Text style={[modalTitle]}>{modalServico}</Text>
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
            {/* Campos extras para RPE */}
            {modalServico === 'RPE' && (
              <>
                <Text style={styles.label}>Pressão em psi cabeça</Text>
                <TextInput
                  style={styles.input}
                  value={pressaoCabeca}
                  onChangeText={setPressaoCabeca}
                  placeholder="Digite a pressão em psi (cabeça)"
                  keyboardType="numeric"
                  maxLength={8}
                />
                <Text style={styles.label}>Pressão em psi anular</Text>
                <TextInput
                  style={styles.input}
                  value={pressaoAnular}
                  onChangeText={setPressaoAnular}
                  placeholder="Digite a pressão em psi (anular)"
                  keyboardType="numeric"
                  maxLength={8}
                />
              </>
            )}
            <Text style={styles.label}>Operação concluída?</Text>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 20,
                }}
                onPress={() => setOperacaoConcluida(true)}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: operacaoConcluida === true ? '#2563eb' : '#aaa',
                  backgroundColor: operacaoConcluida === true ? '#2563eb' : '#fff',
                  marginRight: 6,
                }} />
                <Text>Sim</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center' }}
                onPress={() => setOperacaoConcluida(false)}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: operacaoConcluida === false ? '#2563eb' : '#aaa',
                  backgroundColor: operacaoConcluida === false ? '#2563eb' : '#fff',
                  marginRight: 6,
                }} />
                <Text>Não</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Status</Text>
            {statusList.map((status) => (
              <TouchableOpacity
                key={status}
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
                onPress={() => setStatusSelecionado(status)}
              >
                <View style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  borderWidth: 2,
                  borderColor: statusSelecionado === status ? '#2563eb' : '#aaa',
                  backgroundColor: statusSelecionado === status ? '#2563eb' : '#fff',
                  marginRight: 6,
                }} />
                <Text>{status}</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.label}>Observação</Text>
            <TextInput
              style={[styles.input, {height: 60}]}
              value={observacao}
              onChangeText={setObservacao}
              placeholder="Digite observação..."
              multiline
              maxLength={250}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <Pressable
                style={[styles.registrarButton, { flex: 1, marginRight: 8 }]}
                onPress={salvarModal}
              >
                <Text style={styles.registrarButtonText}>Salvar</Text>
              </Pressable>
              <Pressable
                style={[styles.registrarButton, { backgroundColor: '#aaa', flex: 1, marginLeft: 8 }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.registrarButtonText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
  <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Operações</Text>
          <View style={styles.section}>
            <Text style={styles.label}>Nome do poço</Text>
            <TextInput
              style={styles.input}
              value={poco}
              onChangeText={setPoco}
              placeholder="Ex: POÇO-01"
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Serviço</Text>
            <View style={styles.servicosContainer}>
              {opcoesServicos.map((opcao) => (
                <TouchableOpacity
                  key={opcao}
                  style={[styles.servicoButton, servico === opcao && styles.servicoButtonActive]}
                  onPress={() => {
                    setModalServico(opcao);
                    setModalVisible(true);
                  }}
                >
                  <Text style={[styles.servicoText, servico === opcao && styles.servicoTextActive]}>{opcao}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.resumoContainer}>
            <Text style={styles.resumoTitle}>Resumo</Text>
            <Text style={styles.resumoItem}>Serviço: {servico}</Text>
            <Text style={styles.resumoItem}>Poço: {poco || '---'}</Text>
          </View>
          <TouchableOpacity style={styles.registrarButton} onPress={salvarNoBanco}>
            <Text style={styles.registrarButtonText}>Registrar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.registrarButton, { backgroundColor: '#25D366', marginTop: 12 }]} onPress={compartilharWhatsApp}>
            <Text style={[styles.registrarButtonText, { color: '#fff' }]}>Compartilhar WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 16,
    textAlign: 'center',
  },
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
  servicosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  servicoButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  servicoButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#1d4ed8',
  },
  servicoText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  servicoTextActive: {
    color: '#fff',
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
