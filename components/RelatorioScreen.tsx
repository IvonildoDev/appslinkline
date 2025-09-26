import { useFocusEffect } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { buscarTodosDados, excluirDadosTela, excluirDadosComPadrao } from '../utils/database';

function useAllData() {
  const [dados, setDados] = useState<Record<string, any>>({});
  const [carregando, setCarregando] = useState(true);
  
  const carregarDados = async () => {
    try {
      setCarregando(true);
      const todosDados = await buscarTodosDados();
      
      // Convert array to object for easier access
      const dadosObj = todosDados.reduce((acc, item) => {
        const chave = item.tela.toLowerCase();
        // Se for uma operação específica (ex: "Operações-RPE"), consolidar em "operações"
        if (item.tela.startsWith('Operações-')) {
          // Se já existe dados de operações, garantir que é array
          if (!Array.isArray(acc['operações'])) {
            acc['operações'] = acc['operações'] ? [acc['operações']] : [];
          }
          acc['operações'].push({
            ...item.dados,
            tipoOperacao: item.tela.replace('Operações-', '') // Guardar o tipo
          });
        } else {
          // Para outras telas, usar a chave normal
          acc[chave] = item.dados;
        }
        return acc;
      }, {} as Record<string, any>);
      
      setDados(dadosObj);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setCarregando(false);
    }
  };
  
  useEffect(() => {
    carregarDados();
  }, []);

  // Recarregar dados quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );
  
  return { dados, carregando, recarregar: carregarDados };
}

function Card({ 
  title, 
  children, 
  onEdit, 
  onDelete, 
  screenName 
}: { 
  title: string; 
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  screenName?: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.cardButtons}>
          {onEdit && (
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <Text style={styles.buttonText}>✏️ Editar</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Text style={styles.buttonText}>🗑️ Excluir</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {children}
    </View>
  );
}

export default function RelatorioScreen() {
  const { dados, carregando, recarregar } = useAllData();
  const [dataFiltro, setDataFiltro] = useState('');
  const [dadosFiltrados, setDadosFiltrados] = useState<Record<string, any>>({});

  const formatarDataHoje = () => {
    const hoje = new Date();
    const dia = hoje.getDate().toString().padStart(2, '0');
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
    const ano = hoje.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const selecionarHoje = () => {
    const hoje = formatarDataHoje();
    setDataFiltro(hoje);
  };

  const filtrarDadosPorData = () => {
    if (!dataFiltro.trim()) {
      setDadosFiltrados(dados);
      return;
    }

    const dadosFiltr = Object.keys(dados).reduce((acc, chave) => {
      const item = dados[chave];
      
      // Se for um array (como operações), filtrar cada item
      if (Array.isArray(item)) {
        const itensFiltrados = item.filter((operacao) => {
          const dataOperacao = operacao.dataOperacao || operacao.data;
          return dataOperacao && dataOperacao.includes(dataFiltro);
        });
        if (itensFiltrados.length > 0) {
          acc[chave] = itensFiltrados;
        }
      } else if (item && typeof item === 'object') {
        // Para objetos únicos, verificar se tem data que bate com o filtro
        const dataItem = item.dataOperacao || item.data || item.dataRegistro;
        if (dataItem && dataItem.includes(dataFiltro)) {
          acc[chave] = item;
        }
      }
      return acc;
    }, {} as Record<string, any>);

    setDadosFiltrados(dadosFiltr);
  };

  // Atualizar filtro quando dados ou dataFiltro mudarem
  useEffect(() => {
    filtrarDadosPorData();
  }, [dados, dataFiltro]);

  const handleEdit = (tela: string) => {
    // Navegar para a tela correspondente usando Expo Router
    const screenRoutes: { [key: string]: string } = {
      'Equipe': '/(tabs)/',
      'Deslocamento': '/(tabs)/',
      'Planejamento': '/(tabs)/',
      'Montagem': '/(tabs)/',
      'Teste': '/(tabs)/',
      'Operações': '/operacoes',
      'Desmontagem': '/(tabs)/',
      'Turma': '/(tabs)/',
    };

    const route = screenRoutes[tela];
    if (route) {
      router.push(route as any);
    }
  };

  const handleDelete = async (tela: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir todos os dados da seção ${tela}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Para operações, deletar tanto 'Operações' quanto todas as variações 'Operações-*'
              if (tela === 'Operações') {
                await excluirDadosComPadrao('Operações%');
              } else {
                await excluirDadosTela(tela);
              }
              // Recarregar dados
              recarregar();
              Alert.alert('Sucesso', 'Dados excluídos com sucesso!');
            } catch (error) {
              console.error('Erro ao excluir dados:', error);
              Alert.alert('Erro', 'Não foi possível excluir os dados.');
            }
          }
        }
      ]
    );
  };

  const compartilharWhatsApp = async () => {
    try {
      let mensagem = '📋 RELATÓRIO GERAL SLIKLINE\n\n';
      
      if (dadosFiltrados.equipe) {
        mensagem += `👥 EQUIPE:\n`;
        mensagem += `• Turno: ${dadosFiltrados.equipe.turno}\n`;
        mensagem += `• Operador: ${dadosFiltrados.equipe.operador}\n`;
        mensagem += `• Auxiliar: ${dadosFiltrados.equipe.auxiliar}\n`;
        mensagem += `• Unidade: ${dadosFiltrados.equipe.unidade}\n\n`;
      }
      
      if (dadosFiltrados.deslocamento) {
        mensagem += `🚗 DESLOCAMENTO:\n`;
        mensagem += `• Origem: ${dadosFiltrados.deslocamento.origem}\n`;
        mensagem += `• Destino: ${dadosFiltrados.deslocamento.destino}\n`;
        mensagem += `• Hora início: ${dadosFiltrados.deslocamento.horaInicio}\n`;
        mensagem += `• Hora fim: ${dadosFiltrados.deslocamento.horaFim}\n\n`;
      }
      
      if (dadosFiltrados.planejamento) {
        mensagem += `📋 PLANEJAMENTO:\n`;
        mensagem += `• Hora início: ${dadosFiltrados.planejamento.horaInicio}\n`;
        mensagem += `• Hora fim: ${dadosFiltrados.planejamento.horaFim}\n`;
        mensagem += `• Frase: ${dadosFiltrados.planejamento.frase}\n`;
        if (dadosFiltrados.planejamento.observacoes) {
          mensagem += `• Observações: ${dadosFiltrados.planejamento.observacoes}\n`;
        }
        mensagem += '\n';
      }
      
      if (dadosFiltrados.montagem) {
        mensagem += `🔧 MONTAGEM:\n`;
        mensagem += `• Hora início: ${dadosFiltrados.montagem.horaInicio}\n`;
        mensagem += `• Hora fim: ${dadosFiltrados.montagem.horaFim}\n`;
        mensagem += `• Frase: ${dadosFiltrados.montagem.frase}\n\n`;
      }
      
      if (dadosFiltrados.teste) {
        mensagem += `🧪 TESTE:\n`;
        mensagem += `• Hora início: ${dadosFiltrados.teste.horaInicio}\n`;
        mensagem += `• Hora fim: ${dadosFiltrados.teste.horaFim}\n`;
        mensagem += `• 500 psi: ${dadosFiltrados.teste.psi500}\n`;
        mensagem += `• 3000 psi: ${dadosFiltrados.teste.psi3000}\n`;
        mensagem += `• Frase: ${dadosFiltrados.teste.frasePadrao}\n\n`;
      }
      
      if (dadosFiltrados.operações) {
        mensagem += `⚙️ OPERAÇÕES:\n`;
        // Função para exibir todos os campos do objeto operação
        const traduzirCampo = (chave: string, valor: any) => {
          switch (chave) {
            case 'servico': return `• Serviço: ${valor}`;
            case 'tipoOperacao': return `• Tipo: ${valor}`;
            case 'poco': return `• Poço: ${valor}`;
            case 'horaInicio': return `• Hora início: ${valor}`;
            case 'horaFim': return `• Hora fim: ${valor}`;
            case 'pressaoCabeca': return `• Pressão cabeça: ${valor} psi`;
            case 'pressaoAnular': return `• Pressão anular: ${valor} psi`;
            case 'operacaoConcluida': return `• Operação concluída: ${valor ? 'Sim' : 'Não'}`;
            case 'statusSelecionado': return `• Status: ${valor}`;
            case 'observacao': return `• Observação: ${valor}`;
            case 'tipoDesparafinacao': return `• Tipo de desparafinação: ${valor}`;
            case 'precisouUcaq': return `• Auxílio UCAQ: ${valor ? 'Sim' : 'Não'}`;
            default:
              if (typeof valor === 'boolean') return `• ${chave}: ${valor ? 'Sim' : 'Não'}`;
              if (valor !== undefined && valor !== null && valor !== '') return `• ${chave}: ${valor}`;
              return '';
          }
        };
        if (Array.isArray(dadosFiltrados.operações)) {
          dadosFiltrados.operações.forEach((operacao, index) => {
            if (index > 0) mensagem += `\n`;
            mensagem += `🔧 ${operacao.tipoOperacao || operacao.servico}:\n`;
            Object.entries(operacao).forEach(([chave, valor]) => {
              if (chave === 'tipoOperacao') return; // já exibido no título
              const linha = traduzirCampo(chave, valor);
              if (linha) mensagem += linha + '\n';
            });
          });
        } else {
          // Formato antigo (fallback)
          Object.entries(dadosFiltrados.operações).forEach(([chave, valor]) => {
            const linha = traduzirCampo(chave, valor);
            if (linha) mensagem += linha + '\n';
          });
        }
        mensagem += '\n';
      }
      
      if (dadosFiltrados.desmontagem) {
        mensagem += `🔨 DESMONTAGEM:\n`;
        mensagem += `• Hora início: ${dadosFiltrados.desmontagem.horaInicio}\n`;
        mensagem += `• Hora fim: ${dadosFiltrados.desmontagem.horaFim}\n`;
        mensagem += `• Frase: ${dadosFiltrados.desmontagem.frasePadrao}\n\n`;
      }
      
      if (dadosFiltrados.turma) {
        mensagem += `👨‍👩‍👧‍👦 TURMA:\n`;
        mensagem += `• Hora início: ${dadosFiltrados.turma.horaInicio}\n`;
        mensagem += `• Hora fim: ${dadosFiltrados.turma.horaFim}\n`;
        mensagem += `• Frase: ${dadosFiltrados.turma.frasePadrao}\n`;
        if (dadosFiltrados.turma.observacoes) {
          mensagem += `• Observações: ${dadosFiltrados.turma.observacoes}\n`;
        }
        mensagem += '\n';
      }
      
      mensagem += '📱 Gerado pelo App Slikline';
      
      const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
    }
  };

  if (carregando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Relatório Geral</Text>
      
      {/* Filtros */}
      <View style={styles.filtroContainer}>
        <Text style={styles.filtroLabel}>Filtrar por data:</Text>
        <View style={styles.filtroRow}>
          <TextInput
            style={styles.filtroInput}
            value={dataFiltro}
            onChangeText={setDataFiltro}
            placeholder="dd/mm/aaaa"
            maxLength={10}
          />
          <TouchableOpacity style={styles.hojeButton} onPress={selecionarHoje}>
            <Text style={styles.hojeButtonText}>Hoje</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {Object.keys(dadosFiltrados).length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum dado salvo ainda.</Text>
          <Text style={styles.emptySubText}>Preencha as telas para visualizar o relatório aqui.</Text>
        </View>
      ) : (
        <>
          {/* Botão de recarregar */}
          <TouchableOpacity style={styles.recarregarButton} onPress={recarregar}>
            <Text style={styles.recarregarButtonText}>🔄 Recarregar Dados</Text>
          </TouchableOpacity>

          {/* Botão de compartilhar */}
          <TouchableOpacity style={styles.whatsappButton} onPress={compartilharWhatsApp}>
            <Text style={styles.whatsappButtonText}>📱 Compartilhar no WhatsApp</Text>
          </TouchableOpacity>
        </>
      )}
      {dadosFiltrados.equipe && (
        <Card 
          title="👥 Equipe"
          onEdit={() => handleEdit('Equipe')}
          onDelete={() => handleDelete('equipe')}
        >
          <Text style={styles.cardText}>Turno: {dadosFiltrados.equipe.turno}</Text>
          <Text style={styles.cardText}>Operador: {dadosFiltrados.equipe.operador}</Text>
          <Text style={styles.cardText}>Auxiliar: {dadosFiltrados.equipe.auxiliar}</Text>
          <Text style={styles.cardText}>Unidade: {dadosFiltrados.equipe.unidade}</Text>
        </Card>
      )}
      {dadosFiltrados.deslocamento && (
        <Card 
          title="🚗 Deslocamento"
          onEdit={() => handleEdit('Deslocamento')}
          onDelete={() => handleDelete('deslocamento')}
        >
          <Text style={styles.cardText}>Origem: {dadosFiltrados.deslocamento.origem}</Text>
          <Text style={styles.cardText}>Destino: {dadosFiltrados.deslocamento.destino}</Text>
          <Text style={styles.cardText}>Hora início: {dadosFiltrados.deslocamento.horaInicio}</Text>
          <Text style={styles.cardText}>Hora fim: {dadosFiltrados.deslocamento.horaFim}</Text>
        </Card>
      )}
      {dadosFiltrados.planejamento && (
        <Card 
          title="📋 Planejamento"
          onEdit={() => handleEdit('Planejamento')}
          onDelete={() => handleDelete('planejamento')}
        >
          <Text style={styles.cardText}>Hora início: {dadosFiltrados.planejamento.horaInicio}</Text>
          <Text style={styles.cardText}>Hora fim: {dadosFiltrados.planejamento.horaFim}</Text>
          <Text style={styles.cardText}>Frase: {dadosFiltrados.planejamento.frase}</Text>
          {dadosFiltrados.planejamento.observacoes && (
            <Text style={styles.cardText}>Observações: {dadosFiltrados.planejamento.observacoes}</Text>
          )}
        </Card>
      )}
      {dadosFiltrados.montagem && (
        <Card 
          title="🔧 Montagem"
          onEdit={() => handleEdit('Montagem')}
          onDelete={() => handleDelete('montagem')}
        >
          <Text style={styles.cardText}>Hora início: {dadosFiltrados.montagem.horaInicio}</Text>
          <Text style={styles.cardText}>Hora fim: {dadosFiltrados.montagem.horaFim}</Text>
          <Text style={styles.cardText}>Frase: {dadosFiltrados.montagem.frase}</Text>
        </Card>
      )}
      {dadosFiltrados.teste && (
        <Card 
          title="🧪 Teste"
          onEdit={() => handleEdit('Teste')}
          onDelete={() => handleDelete('Teste')}
        >
          <Text style={styles.cardText}>Hora início: {dadosFiltrados.teste.horaInicio}</Text>
          <Text style={styles.cardText}>Hora fim: {dadosFiltrados.teste.horaFim}</Text>
          <Text style={styles.cardText}>500 psi: {dadosFiltrados.teste.psi500}</Text>
          <Text style={styles.cardText}>3000 psi: {dadosFiltrados.teste.psi3000}</Text>
          <Text style={styles.cardText}>Frase: {dadosFiltrados.teste.frasePadrao}</Text>
        </Card>
      )}
      {dadosFiltrados.operações && (
        <Card 
          title="⚙️ Operações"
          onEdit={() => handleEdit('Operações')}
          onDelete={() => handleDelete('Operações')}
        >
          {Array.isArray(dadosFiltrados.operações) ? (
            dadosFiltrados.operações.map((operacao, index) => (
              <View key={index} style={[styles.subCard, index > 0 && { marginTop: 12 }]}>
                <Text style={styles.subCardTitle}>🔧 {operacao.tipoOperacao}</Text>
                <Text style={styles.cardText}>Serviço: {operacao.servico}</Text>
                {operacao.poco && (
                  <Text style={styles.cardText}>Poço: {operacao.poco}</Text>
                )}
                {operacao.horaInicio && (
                  <>
                    <Text style={styles.cardText}>Hora início: {operacao.horaInicio}</Text>
                    <Text style={styles.cardText}>Hora fim: {operacao.horaFim}</Text>
                  </>
                )}
                {operacao.pressaoCabeca && (
                  <Text style={styles.cardText}>Pressão cabeça: {operacao.pressaoCabeca} psi</Text>
                )}
                {operacao.pressaoAnular && (
                  <Text style={styles.cardText}>Pressão anular: {operacao.pressaoAnular} psi</Text>
                )}
                {operacao.operacaoConcluida !== undefined && (
                  <Text style={styles.cardText}>Operação concluída: {operacao.operacaoConcluida ? 'Sim' : 'Não'}</Text>
                )}
                {operacao.statusSelecionado && (
                  <Text style={styles.cardText}>Status: {operacao.statusSelecionado}</Text>
                )}
                {operacao.observacao && (
                  <Text style={styles.cardText}>Observação: {operacao.observacao}</Text>
                )}
              </View>
            ))
          ) : (
            // Fallback para formato antigo
            <>
              <Text style={styles.cardText}>Serviço: {dadosFiltrados.operações.servico}</Text>
              <Text style={styles.cardText}>Poço: {dadosFiltrados.operações.poco}</Text>
              {dadosFiltrados.operações.horaInicio && (
                <>
                  <Text style={styles.cardText}>Hora início: {dadosFiltrados.operações.horaInicio}</Text>
                  <Text style={styles.cardText}>Hora fim: {dadosFiltrados.operações.horaFim}</Text>
                </>
              )}
              {dadosFiltrados.operações.pressaoCabeca && (
                <Text style={styles.cardText}>Pressão cabeça: {dadosFiltrados.operações.pressaoCabeca} psi</Text>
              )}
              {dadosFiltrados.operações.pressaoAnular && (
                <Text style={styles.cardText}>Pressão anular: {dadosFiltrados.operações.pressaoAnular} psi</Text>
              )}
              {dadosFiltrados.operações.operacaoConcluida !== undefined && (
                <Text style={styles.cardText}>Operação concluída: {dadosFiltrados.operações.operacaoConcluida ? 'Sim' : 'Não'}</Text>
              )}
              {dadosFiltrados.operações.statusSelecionado && (
                <Text style={styles.cardText}>Status: {dadosFiltrados.operações.statusSelecionado}</Text>
              )}
              {dadosFiltrados.operações.observacao && (
                <Text style={styles.cardText}>Observação: {dadosFiltrados.operações.observacao}</Text>
              )}
            </>
          )}
        </Card>
      )}
      {dadosFiltrados.desmontagem && (
        <Card 
          title="🔨 Desmontagem"
          onEdit={() => handleEdit('Desmontagem')}
          onDelete={() => handleDelete('Desmontagem')}
        >
          <Text style={styles.cardText}>Hora início: {dadosFiltrados.desmontagem.horaInicio}</Text>
          <Text style={styles.cardText}>Hora fim: {dadosFiltrados.desmontagem.horaFim}</Text>
          <Text style={styles.cardText}>Frase: {dadosFiltrados.desmontagem.frasePadrao}</Text>
        </Card>
      )}
      {dadosFiltrados.turma && (
        <Card 
          title="👨‍👩‍👧‍👦 Turma"
          onEdit={() => handleEdit('Turma')}
          onDelete={() => handleDelete('Turma')}
        >
          <Text style={styles.cardText}>Hora início: {dadosFiltrados.turma.horaInicio}</Text>
          <Text style={styles.cardText}>Hora fim: {dadosFiltrados.turma.horaFim}</Text>
          <Text style={styles.cardText}>Frase: {dadosFiltrados.turma.frasePadrao}</Text>
          {dadosFiltrados.turma.observacoes && (
            <Text style={styles.cardText}>Observações: {dadosFiltrados.turma.observacoes}</Text>
          )}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 18,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  recarregarButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  recarregarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    paddingVertical: 16,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    lineHeight: 22,
  },
  subCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  subCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  filtroContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  filtroLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  filtroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filtroInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  hojeButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  hojeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
