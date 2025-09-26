import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { buscarTodosDados, salvarDados } from '../utils/database';

const opcoesServicos = [
  'Desparafinação Mecânica',
  'BPV',
  'STV',
  'Sliding Sleeve',
  'Estampagem',
  'Teste plug',
  'Checagem de coluna',
  'Plug e Checagem de Coluna e Estampagem',
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
  const [tipoOperacaoBPV, setTipoOperacaoBPV] = useState<'Assentar BPV' | 'Desassentar BPV'>('Assentar BPV');
  const [tipoOperacaoSTV, setTipoOperacaoSTV] = useState<'Assentar STV' | 'Desassentar STV'>('Assentar STV');
  const [tipoOperacaoSlidingSleeve, setTipoOperacaoSlidingSleeve] = useState<'Abrir sliding sleeve' | 'Fechar sliding sleeve'>('Abrir sliding sleeve');
  const [tipoDesparafinacao, setTipoDesparafinacao] = useState<string>('');
  const [precisouUcaq, setPrecisouUcaq] = useState<null | boolean>(null);
  const [totalBBIUsado, setTotalBBIUsado] = useState('');
  const [temperaturaUCAQ, setTemperaturaUCAQ] = useState('');
  const [horaInicioUCAQ, setHoraInicioUCAQ] = useState('');
  const [horaFimUCAQ, setHoraFimUCAQ] = useState('');
  
  // Estados específicos para Teste plug, Estampagem e Checagem de coluna (todos com os mesmos campos)
  const [horaInicioModal, setHoraInicioModal] = useState('');
  const [horaFimModal, setHoraFimModal] = useState('');
  const [pressaoCabecaModal, setPressaoCabecaModal] = useState('');
  const [pressaoAnularModal, setPressaoAnularModal] = useState('');
  const [operacaoConcluidaModal, setOperacaoConcluidaModal] = useState<boolean|null>(null);
  
  // Estados para checkboxes individuais dos status
  const [supervisorioCienteChecked, setSupervisorioCienteChecked] = useState<boolean>(false);
  const [permaneceuAbertoChecked, setPermaneceuAbertoChecked] = useState<boolean>(false);
  const [pocoEntregueChecked, setPocoEntregueChecked] = useState<boolean>(false);
  
  const [observacaoModal, setObservacaoModal] = useState('');
  
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
    // Para modais específicos, usar os campos próprios
    const isModalEspecifico = ['Teste plug', 'Estampagem', 'Checagem de coluna'].includes(modalServico);
    
    if (isModalEspecifico) {
      if (!horaInicioModal.trim() || !horaFimModal.trim()) {
        Alert.alert('Erro', 'Por favor, preencha os horários');
        return;
      }
      
      if (!pressaoCabecaModal.trim() || !pressaoAnularModal.trim()) {
        Alert.alert('Erro', 'Por favor, preencha as pressões');
        return;
      }
      
      if (operacaoConcluidaModal === null) {
        Alert.alert('Erro', 'Informe se a operação foi concluída');
        return;
      }
      
      // Não precisa validar os checkboxes - eles são opcionais
    } else {
      if (!horaInicio.trim() || !horaFim.trim()) {
        Alert.alert('Erro', 'Por favor, preencha os horários');
        return;
      }
    }


    // Se for RPE, BPV, STV, Sliding Sleeve, Estampagem, Teste plug ou Checagem de coluna, validar campos de pressão
    if ((
      modalServico === 'RPE' ||
      modalServico === 'BPV' ||
      modalServico === 'STV' ||
      modalServico === 'Sliding Sleeve'
    ) && (!pressaoCabeca.trim() || !pressaoAnular.trim())) {
      Alert.alert('Erro', 'Para este serviço, preencha as pressões');
      return;
    }

    if (!isModalEspecifico && operacaoConcluida === null) {
      Alert.alert('Erro', 'Informe se a operação foi concluída');
      return;
    }

    if (!isModalEspecifico && !statusSelecionado) {
      Alert.alert('Erro', 'Selecione um status');
      return;
    }

    try {
      // Salvar dados do modal específico
      const agora = new Date();
      const dataAtual = `${agora.getDate().toString().padStart(2, '0')}/${(agora.getMonth() + 1).toString().padStart(2, '0')}/${agora.getFullYear()}`;
      
      // Para modais específicos (Teste plug, Estampagem, Checagem de coluna)
      if (isModalEspecifico) {
        const dadosModal = {
          servico: modalServico,
          poco: poco.trim(),
          horaInicio: horaInicioModal.trim(),
          horaFim: horaFimModal.trim(),
          pressaoCabeca: pressaoCabecaModal.trim(),
          pressaoAnular: pressaoAnularModal.trim(),
          operacaoConcluida: operacaoConcluidaModal,
          supervisorioCiente: supervisorioCienteChecked,
          permaneceuAberto: permaneceuAbertoChecked,
          pocoEntregue: pocoEntregueChecked,
          observacao: observacaoModal.trim(),
          dataOperacao: dataAtual,
        };

        await salvarDados(`Operações-${modalServico}`, dadosModal);
      } else {
        const dadosModal = {
          servico: modalServico,
          poco: poco.trim(),
          horaInicio: horaInicio.trim(),
          horaFim: horaFim.trim(),
          observacao: observacao.trim(),
          pressaoCabeca: pressaoCabeca.trim(),
          pressaoAnular: pressaoAnular.trim(),
          operacaoConcluida,
          statusSelecionado,
          dataOperacao: dataAtual, // Adicionar data da operação
          ...(['Desparafinação Mecânica', 'BPV', 'STV', 'Sliding Sleeve'].includes(modalServico) && { tipoDesparafinacao, precisouUcaq }),
          ...(modalServico === 'Desparafinação Mecânica' && precisouUcaq === true && { 
            totalBBIUsado, 
            temperaturaUCAQ, 
            horaInicioUCAQ, 
            horaFimUCAQ 
          }),
          ...(modalServico === 'BPV' && { tipoOperacaoBPV }),
          ...(modalServico === 'STV' && { tipoOperacaoSTV }),
          ...(modalServico === 'Sliding Sleeve' && { tipoOperacaoSlidingSleeve }),
        };

        await salvarDados(`Operações-${modalServico}`, dadosModal);
      }
      
      // Atualizar o serviço selecionado
      setServico(modalServico);
      setModalVisible(false);
      
      // Limpar campos do modal
      if (isModalEspecifico) {
        // Limpar campos específicos
        setHoraInicioModal('');
        setHoraFimModal('');
        setPressaoCabecaModal('');
        setPressaoAnularModal('');
        setOperacaoConcluidaModal(null);
        setSupervisorioCienteChecked(false);
        setPermaneceuAbertoChecked(false);
        setPocoEntregueChecked(false);
        setObservacaoModal('');
      } else {
        // Limpar campos gerais
        setHoraInicio('');
        setHoraFim('');
        setObservacao('');
        setPressaoCabeca('');
        setPressaoAnular('');
        setOperacaoConcluida(null);
        setStatusSelecionado('');
        setTipoDesparafinacao('');
        setPrecisouUcaq(null);
        setTipoOperacaoBPV('Assentar BPV');
        setTipoOperacaoSTV('Assentar STV');
        setTipoOperacaoSlidingSleeve('Abrir sliding sleeve');
        setTotalBBIUsado('');
        setTemperaturaUCAQ('');
        setHoraInicioUCAQ('');
        setHoraFimUCAQ('');
      }
    } catch (error) {
      console.error('Erro ao salvar dados do modal:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados do modal');
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
            <ScrollView showsVerticalScrollIndicator={true} style={{ maxHeight: '80%' }}>
            {modalServico === 'Desparafinação Mecânica' && (
              <>
                <Text style={styles.label}>Tipo de desparafinação</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
                    onPress={() => setTipoDesparafinacao('Sal')}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: tipoDesparafinacao === 'Sal' ? '#2563eb' : '#aaa',
                      backgroundColor: tipoDesparafinacao === 'Sal' ? '#2563eb' : '#fff',
                      marginRight: 6,
                    }} />
                    <Text>Sal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
                    onPress={() => setTipoDesparafinacao('Parafina')}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: tipoDesparafinacao === 'Parafina' ? '#2563eb' : '#aaa',
                      backgroundColor: tipoDesparafinacao === 'Parafina' ? '#2563eb' : '#fff',
                      marginRight: 6,
                    }} />
                    <Text>Parafina</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => setTipoDesparafinacao('Sal e Parafina')}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: tipoDesparafinacao === 'Sal e Parafina' ? '#2563eb' : '#aaa',
                      backgroundColor: tipoDesparafinacao === 'Sal e Parafina' ? '#2563eb' : '#fff',
                      marginRight: 6,
                    }} />
                    <Text>Sal e Parafina</Text>
                  </TouchableOpacity>
                </View>
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
                <Text style={styles.label}>Precisou de auxílio da UCAQ?</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
                    onPress={() => setPrecisouUcaq(true)}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: precisouUcaq === true ? '#2563eb' : '#aaa',
                      backgroundColor: precisouUcaq === true ? '#2563eb' : '#fff',
                      marginRight: 6,
                    }} />
                    <Text>Sim</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => setPrecisouUcaq(false)}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: precisouUcaq === false ? '#2563eb' : '#aaa',
                      backgroundColor: precisouUcaq === false ? '#2563eb' : '#fff',
                      marginRight: 6,
                    }} />
                    <Text>Não</Text>
                  </TouchableOpacity>
                </View>
                {precisouUcaq === true && (
                  <View style={{
                    borderWidth: 2,
                    borderColor: '#60a5fa',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                    backgroundColor: '#eff6ff'
                  }}>
                    <Text style={styles.label}>Total BBI usado</Text>
                    <TextInput
                      style={styles.input}
                      value={totalBBIUsado}
                      onChangeText={setTotalBBIUsado}
                      placeholder="Digite o total em BBI"
                      keyboardType="numeric"
                    />
                    <Text style={styles.label}>Temperatura °C</Text>
                    <TextInput
                      style={styles.input}
                      value={temperaturaUCAQ}
                      onChangeText={setTemperaturaUCAQ}
                      placeholder="Digite a temperatura em °C"
                      keyboardType="numeric"
                    />
                    <Text style={styles.label}>Hora início uso UCAQ</Text>
                    <TextInput
                      style={styles.input}
                      value={horaInicioUCAQ}
                      onChangeText={text => {
                        let cleaned = text.replace(/\D/g, '');
                        if (cleaned.length > 2) {
                          cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
                        }
                        if (cleaned.length > 5) {
                          cleaned = cleaned.slice(0, 5);
                        }
                        setHoraInicioUCAQ(cleaned);
                      }}
                      placeholder="Ex: 08:00"
                      keyboardType="numeric"
                      maxLength={5}
                    />
                    <Text style={styles.label}>Hora fim uso UCAQ</Text>
                    <TextInput
                      style={styles.input}
                      value={horaFimUCAQ}
                      onChangeText={text => {
                        let cleaned = text.replace(/\D/g, '');
                        if (cleaned.length > 2) {
                          cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
                        }
                        if (cleaned.length > 5) {
                          cleaned = cleaned.slice(0, 5);
                        }
                        setHoraFimUCAQ(cleaned);
                      }}
                      placeholder="Ex: 09:30"
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                )}
                
                <Text style={styles.label}>Pressão de cabeça (psi)</Text>
                <TextInput
                  style={styles.input}
                  value={pressaoCabeca}
                  onChangeText={setPressaoCabeca}
                  placeholder="Digite a pressão de cabeça em psi"
                  keyboardType="numeric"
                  maxLength={8}
                />
                
                <Text style={styles.label}>Pressão anular (psi)</Text>
                <TextInput
                  style={styles.input}
                  value={pressaoAnular}
                  onChangeText={setPressaoAnular}
                  placeholder="Digite a pressão anular em psi"
                  keyboardType="numeric"
                  maxLength={8}
                />
                
                <Text style={styles.label}>Operação concluída?</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
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
                <View style={{ marginBottom: 12 }}>
                  {statusList.map((status, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
                      onPress={() => setStatusSelecionado(status)}
                    >
                      <View style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: statusSelecionado === status ? '#2563eb' : '#aaa',
                        backgroundColor: statusSelecionado === status ? '#2563eb' : '#fff',
                        marginRight: 6,
                      }} />
                      <Text style={{ flex: 1 }}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>Observação</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  value={observacao}
                  onChangeText={setObservacao}
                  placeholder="Digite observação..."
                  multiline
                  numberOfLines={4}
                />
              </>
            )}
            {modalServico === 'BPV' && (
              <>
                <Text style={styles.label}>Tipo de operação BPV</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
                    onPress={() => setTipoOperacaoBPV('Assentar BPV')}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: tipoOperacaoBPV === 'Assentar BPV' ? '#2563eb' : '#aaa',
                      backgroundColor: tipoOperacaoBPV === 'Assentar BPV' ? '#2563eb' : '#fff',
                      marginRight: 6,
                    }} />
                    <Text>Assentar BPV</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => setTipoOperacaoBPV('Desassentar BPV')}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: tipoOperacaoBPV === 'Desassentar BPV' ? '#2563eb' : '#aaa',
                      backgroundColor: tipoOperacaoBPV === 'Desassentar BPV' ? '#2563eb' : '#fff',
                      marginRight: 6,
                    }} />
                    <Text>Desassentar BPV</Text>
                  </TouchableOpacity>
                </View>
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
                
                <Text style={styles.label}>Pressão de cabeça (psi)</Text>
                <TextInput
                  style={styles.input}
                  value={pressaoCabeca}
                  onChangeText={setPressaoCabeca}
                  placeholder="Digite a pressão de cabeça em psi"
                  keyboardType="numeric"
                  maxLength={8}
                />
                
                <Text style={styles.label}>Pressão anular (psi)</Text>
                <TextInput
                  style={styles.input}
                  value={pressaoAnular}
                  onChangeText={setPressaoAnular}
                  placeholder="Digite a pressão anular em psi"
                  keyboardType="numeric"
                  maxLength={8}
                />
                
                <Text style={styles.label}>Precisou de auxílio da UCAQ?</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
                    onPress={() => setPrecisouUcaq(true)}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: precisouUcaq === true ? '#2563eb' : '#aaa',
                      backgroundColor: precisouUcaq === true ? '#2563eb' : '#fff',
                      marginRight: 6,
                    }} />
                    <Text>Sim</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => setPrecisouUcaq(false)}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: precisouUcaq === false ? '#2563eb' : '#aaa',
                      backgroundColor: precisouUcaq === false ? '#2563eb' : '#fff',
                      marginRight: 6,
                    }} />
                    <Text>Não</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.label}>Operação concluída?</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
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
                <View style={{ marginBottom: 12 }}>
                  {statusList.map((status, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
                      onPress={() => setStatusSelecionado(status)}
                    >
                      <View style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: statusSelecionado === status ? '#2563eb' : '#aaa',
                        backgroundColor: statusSelecionado === status ? '#2563eb' : '#fff',
                        marginRight: 6,
                      }} />
                      <Text style={{ flex: 1 }}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>Observação</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  value={observacao}
                  onChangeText={setObservacao}
                  placeholder="Digite observação..."
                  multiline
                  numberOfLines={4}
                />
              </>
            )}

            {modalServico === 'STV' && (
              <>
                <Text style={styles.label}>Tipo de operação STV</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
                    onPress={() => setTipoOperacaoSTV('Assentar STV')}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: tipoOperacaoSTV === 'Assentar STV' ? '#2563eb' : '#aaa',
                      backgroundColor: tipoOperacaoSTV === 'Assentar STV' ? '#2563eb' : '#fff',
                      marginRight: 6,
                    }} />
                    <Text>Assentar STV</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => setTipoOperacaoSTV('Desassentar STV')}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: tipoOperacaoSTV === 'Desassentar STV' ? '#2563eb' : '#aaa',
                      backgroundColor: tipoOperacaoSTV === 'Desassentar STV' ? '#2563eb' : '#fff',
                      marginRight: 6,
                    }} />
                    <Text>Desassentar STV</Text>
                  </TouchableOpacity>
                </View>
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
                
                <Text style={styles.label}>Pressão de cabeça (psi)</Text>
                <TextInput
                  style={styles.input}
                  value={pressaoCabeca}
                  onChangeText={setPressaoCabeca}
                  placeholder="Digite a pressão de cabeça em psi"
                  keyboardType="numeric"
                  maxLength={8}
                />
                
                <Text style={styles.label}>Pressão anular (psi)</Text>
                <TextInput
                  style={styles.input}
                  value={pressaoAnular}
                  onChangeText={setPressaoAnular}
                  placeholder="Digite a pressão anular em psi"
                  keyboardType="numeric"
                  maxLength={8}
                />
                
                <Text style={styles.label}>Precisou de auxílio da UCAQ?</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
                    onPress={() => setPrecisouUcaq(true)}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: precisouUcaq === true ? '#2563eb' : '#aaa',
                      backgroundColor: precisouUcaq === true ? '#2563eb' : '#fff',
                      marginRight: 6,
                    }} />
                    <Text>Sim</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => setPrecisouUcaq(false)}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: precisouUcaq === false ? '#2563eb' : '#aaa',
                      backgroundColor: precisouUcaq === false ? '#2563eb' : '#fff',
                      marginRight: 6,
                    }} />
                    <Text>Não</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.label}>Operação concluída?</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
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
                <View style={{ marginBottom: 12 }}>
                  {statusList.map((status, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
                      onPress={() => setStatusSelecionado(status)}
                    >
                      <View style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: statusSelecionado === status ? '#2563eb' : '#aaa',
                        backgroundColor: statusSelecionado === status ? '#2563eb' : '#fff',
                        marginRight: 6,
                      }} />
                      <Text style={{ flex: 1 }}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>Observação</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  value={observacao}
                  onChangeText={setObservacao}
                  placeholder="Digite observação..."
                  multiline
                  numberOfLines={4}
                />
              </>
            )}

            {modalServico === 'Sliding Sleeve' && (
              <>
                <Text style={styles.label}>Tipo de operação Sliding Sleeve</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
                    onPress={() => setTipoOperacaoSlidingSleeve('Abrir sliding sleeve')}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: tipoOperacaoSlidingSleeve === 'Abrir sliding sleeve' ? '#2563eb' : '#aaa',
                      backgroundColor: tipoOperacaoSlidingSleeve === 'Abrir sliding sleeve' ? '#2563eb' : '#fff',
                      marginRight: 6,
                    }} />
                    <Text>Abrir sliding sleeve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => setTipoOperacaoSlidingSleeve('Fechar sliding sleeve')}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: tipoOperacaoSlidingSleeve === 'Fechar sliding sleeve' ? '#2563eb' : '#aaa',
                      backgroundColor: tipoOperacaoSlidingSleeve === 'Fechar sliding sleeve' ? '#2563eb' : '#fff',
                      marginRight: 6,
                    }} />
                    <Text>Fechar sliding sleeve</Text>
                  </TouchableOpacity>
                </View>
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
                
                <Text style={styles.label}>Pressão de cabeça (psi)</Text>
                <TextInput
                  style={styles.input}
                  value={pressaoCabeca}
                  onChangeText={setPressaoCabeca}
                  placeholder="Digite a pressão de cabeça em psi"
                  keyboardType="numeric"
                  maxLength={8}
                />
                
                <Text style={styles.label}>Pressão anular (psi)</Text>
                <TextInput
                  style={styles.input}
                  value={pressaoAnular}
                  onChangeText={setPressaoAnular}
                  placeholder="Digite a pressão anular em psi"
                  keyboardType="numeric"
                  maxLength={8}
                />
                
                <Text style={styles.label}>Precisou de auxílio da UCAQ?</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
                    onPress={() => setPrecisouUcaq(true)}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: precisouUcaq === true ? '#2563eb' : '#aaa',
                      backgroundColor: precisouUcaq === true ? '#2563eb' : '#fff',
                      marginRight: 6,
                    }} />
                    <Text>Sim</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => setPrecisouUcaq(false)}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: precisouUcaq === false ? '#2563eb' : '#aaa',
                      backgroundColor: precisouUcaq === false ? '#2563eb' : '#fff',
                      marginRight: 6,
                    }} />
                    <Text>Não</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.label}>Operação concluída?</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
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
                <View style={{ marginBottom: 12 }}>
                  {statusList.map((status, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
                      onPress={() => setStatusSelecionado(status)}
                    >
                      <View style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: statusSelecionado === status ? '#2563eb' : '#aaa',
                        backgroundColor: statusSelecionado === status ? '#2563eb' : '#fff',
                        marginRight: 6,
                      }} />
                      <Text style={{ flex: 1 }}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>Observação</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  value={observacao}
                  onChangeText={setObservacao}
                  placeholder="Digite observação..."
                  multiline
                  numberOfLines={4}
                />
              </>
            )}
            {/* Campos extras para RPE */}
            {modalServico === 'RPE' && (
              <>
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
                <Text style={styles.label}>Operação concluída?</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
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
                <View style={{ marginBottom: 12 }}>
                  {statusList.map((status, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
                      onPress={() => setStatusSelecionado(status)}
                    >
                      <View style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: statusSelecionado === status ? '#2563eb' : '#aaa',
                        backgroundColor: statusSelecionado === status ? '#2563eb' : '#fff',
                        marginRight: 6,
                      }} />
                      <Text style={{ flex: 1 }}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>Observação</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  value={observacao}
                  onChangeText={setObservacao}
                  placeholder="Digite observação..."
                  multiline
                  numberOfLines={4}
                />
              </>
            )}
            
            {/* Modais específicos: Teste plug, Estampagem e Checagem de coluna */}
            {(['Teste plug', 'Estampagem', 'Checagem de coluna'].includes(modalServico)) && (
              <>
                <Text style={styles.label}>Hora início</Text>
                <TextInput
                  style={styles.input}
                  value={horaInicioModal}
                  onChangeText={text => {
                    let cleaned = text.replace(/\D/g, '');
                    if (cleaned.length > 2) {
                      cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
                    }
                    if (cleaned.length > 5) {
                      cleaned = cleaned.slice(0, 5);
                    }
                    setHoraInicioModal(cleaned);
                  }}
                  placeholder="Ex: 08:00"
                  keyboardType="numeric"
                  maxLength={5}
                />
                
                <Text style={styles.label}>Hora fim</Text>
                <TextInput
                  style={styles.input}
                  value={horaFimModal}
                  onChangeText={text => {
                    let cleaned = text.replace(/\D/g, '');
                    if (cleaned.length > 2) {
                      cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
                    }
                    if (cleaned.length > 5) {
                      cleaned = cleaned.slice(0, 5);
                    }
                    setHoraFimModal(cleaned);
                  }}
                  placeholder="Ex: 09:30"
                  keyboardType="numeric"
                  maxLength={5}
                />
                
                <Text style={styles.label}>Pressão de cabeça (psi)</Text>
                <TextInput
                  style={styles.input}
                  value={pressaoCabecaModal}
                  onChangeText={setPressaoCabecaModal}
                  placeholder="Digite a pressão de cabeça"
                  keyboardType="numeric"
                  maxLength={8}
                />
                
                <Text style={styles.label}>Pressão anular (psi)</Text>
                <TextInput
                  style={styles.input}
                  value={pressaoAnularModal}
                  onChangeText={setPressaoAnularModal}
                  placeholder="Digite a pressão anular"
                  keyboardType="numeric"
                  maxLength={8}
                />
                
                <Text style={styles.label}>Operação concluída?</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
                    onPress={() => setOperacaoConcluidaModal(true)}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: operacaoConcluidaModal === true ? '#2563eb' : '#aaa',
                      backgroundColor: operacaoConcluidaModal === true ? '#2563eb' : '#fff',
                      marginRight: 6,
                    }} />
                    <Text>Sim</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => setOperacaoConcluidaModal(false)}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: operacaoConcluidaModal === false ? '#2563eb' : '#aaa',
                      backgroundColor: operacaoConcluidaModal === false ? '#2563eb' : '#fff',
                      marginRight: 6,
                    }} />
                    <Text>Não</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.label}>Status</Text>
                <View style={{ marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
                    onPress={() => setSupervisorioCienteChecked(!supervisorioCienteChecked)}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: supervisorioCienteChecked ? '#2563eb' : '#aaa',
                      backgroundColor: supervisorioCienteChecked ? '#2563eb' : '#fff',
                      marginRight: 8,
                    }} />
                    <Text>Supervisor Ciente</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
                    onPress={() => setPermaneceuAbertoChecked(!permaneceuAbertoChecked)}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: permaneceuAbertoChecked ? '#2563eb' : '#aaa',
                      backgroundColor: permaneceuAbertoChecked ? '#2563eb' : '#fff',
                      marginRight: 8,
                    }} />
                    <Text>Permaneceu aberto Supervisório Ciente</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
                    onPress={() => setPocoEntregueChecked(!pocoEntregueChecked)}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: pocoEntregueChecked ? '#2563eb' : '#aaa',
                      backgroundColor: pocoEntregueChecked ? '#2563eb' : '#fff',
                      marginRight: 8,
                    }} />
                    <Text>Poço entregue à Sonda</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.label}>Observação</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  value={observacaoModal}
                  onChangeText={setObservacaoModal}
                  placeholder="Digite suas observações..."
                  multiline
                  numberOfLines={4}
                />
              </>
            )}
            </ScrollView>
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
    paddingBottom: 100, // Espaço extra para não sobrepor o menu do Android
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
