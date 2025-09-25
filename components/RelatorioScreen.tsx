
import { useFocusEffect } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { buscarTodosDados, excluirDadosTela } from '../utils/database';

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
          // Se já existe dados de operações, criar array, senão criar novo
          if (!acc['operações']) {
            acc['operações'] = [];
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
              await excluirDadosTela(tela);
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
      
      if (dados.equipe) {
        mensagem += `👥 EQUIPE:\n`;
        mensagem += `• Turno: ${dados.equipe.turno}\n`;
        mensagem += `• Operador: ${dados.equipe.operador}\n`;
        mensagem += `• Auxiliar: ${dados.equipe.auxiliar}\n`;
        mensagem += `• Unidade: ${dados.equipe.unidade}\n\n`;
      }
      
      if (dados.deslocamento) {
        mensagem += `🚗 DESLOCAMENTO:\n`;
        mensagem += `• Origem: ${dados.deslocamento.origem}\n`;
        mensagem += `• Destino: ${dados.deslocamento.destino}\n`;
        mensagem += `• Hora início: ${dados.deslocamento.horaInicio}\n`;
        mensagem += `• Hora fim: ${dados.deslocamento.horaFim}\n\n`;
      }
      
      if (dados.planejamento) {
        mensagem += `📋 PLANEJAMENTO:\n`;
        mensagem += `• Hora início: ${dados.planejamento.horaInicio}\n`;
        mensagem += `• Hora fim: ${dados.planejamento.horaFim}\n`;
        mensagem += `• Frase: ${dados.planejamento.frase}\n`;
        if (dados.planejamento.observacoes) {
          mensagem += `• Observações: ${dados.planejamento.observacoes}\n`;
        }
        mensagem += '\n';
      }
      
      if (dados.montagem) {
        mensagem += `🔧 MONTAGEM:\n`;
        mensagem += `• Hora início: ${dados.montagem.horaInicio}\n`;
        mensagem += `• Hora fim: ${dados.montagem.horaFim}\n`;
        mensagem += `• Frase: ${dados.montagem.frase}\n\n`;
      }
      
      if (dados.teste) {
        mensagem += `🧪 TESTE:\n`;
        mensagem += `• Hora início: ${dados.teste.horaInicio}\n`;
        mensagem += `• Hora fim: ${dados.teste.horaFim}\n`;
        mensagem += `• 500 psi: ${dados.teste.psi500}\n`;
        mensagem += `• 3000 psi: ${dados.teste.psi3000}\n`;
        mensagem += `• Frase: ${dados.teste.frasePadrao}\n\n`;
      }
      
      if (dados.operações) {
        mensagem += `⚙️ OPERAÇÕES:\n`;
        if (Array.isArray(dados.operações)) {
          dados.operações.forEach((operacao, index) => {
            if (index > 0) mensagem += `\n`;
            mensagem += `🔧 ${operacao.tipoOperacao}:\n`;
            mensagem += `• Serviço: ${operacao.servico}\n`;
            if (operacao.poco) {
              mensagem += `• Poço: ${operacao.poco}\n`;
            }
            if (operacao.horaInicio) {
              mensagem += `• Hora início: ${operacao.horaInicio}\n`;
              mensagem += `• Hora fim: ${operacao.horaFim}\n`;
            }
            if (operacao.pressaoCabeca) {
              mensagem += `• Pressão cabeça: ${operacao.pressaoCabeca} psi\n`;
            }
            if (operacao.pressaoAnular) {
              mensagem += `• Pressão anular: ${operacao.pressaoAnular} psi\n`;
            }
            if (operacao.operacaoConcluida !== undefined) {
              mensagem += `• Operação concluída: ${operacao.operacaoConcluida ? 'Sim' : 'Não'}\n`;
            }
            if (operacao.statusSelecionado) {
              mensagem += `• Status: ${operacao.statusSelecionado}\n`;
            }
            if (operacao.observacao) {
              mensagem += `• Observação: ${operacao.observacao}\n`;
            }
          });
        } else {
          // Formato antigo (fallback)
          mensagem += `• Serviço: ${dados.operações.servico}\n`;
          mensagem += `• Poço: ${dados.operações.poco}\n`;
          if (dados.operações.horaInicio) {
            mensagem += `• Hora início: ${dados.operações.horaInicio}\n`;
            mensagem += `• Hora fim: ${dados.operações.horaFim}\n`;
          }
          if (dados.operações.pressaoCabeca) {
            mensagem += `• Pressão cabeça: ${dados.operações.pressaoCabeca} psi\n`;
          }
          if (dados.operações.pressaoAnular) {
            mensagem += `• Pressão anular: ${dados.operações.pressaoAnular} psi\n`;
          }
          if (dados.operações.operacaoConcluida !== undefined) {
            mensagem += `• Operação concluída: ${dados.operações.operacaoConcluida ? 'Sim' : 'Não'}\n`;
          }
          if (dados.operações.statusSelecionado) {
            mensagem += `• Status: ${dados.operações.statusSelecionado}\n`;
          }
          if (dados.operações.observacao) {
            mensagem += `• Observação: ${dados.operações.observacao}\n`;
          }
        }
        mensagem += '\n';
      }
      
      if (dados.desmontagem) {
        mensagem += `🔨 DESMONTAGEM:\n`;
        mensagem += `• Hora início: ${dados.desmontagem.horaInicio}\n`;
        mensagem += `• Hora fim: ${dados.desmontagem.horaFim}\n`;
        mensagem += `• Frase: ${dados.desmontagem.frasePadrao}\n\n`;
      }
      
      if (dados.turma) {
        mensagem += `👨‍👩‍👧‍👦 TURMA:\n`;
        mensagem += `• Hora início: ${dados.turma.horaInicio}\n`;
        mensagem += `• Hora fim: ${dados.turma.horaFim}\n`;
        mensagem += `• Frase: ${dados.turma.frasePadrao}\n`;
        if (dados.turma.observacoes) {
          mensagem += `• Observações: ${dados.turma.observacoes}\n`;
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
      
      {Object.keys(dados).length === 0 ? (
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
      {dados.equipe && (
        <Card 
          title="👥 Equipe"
          onEdit={() => handleEdit('Equipe')}
          onDelete={() => handleDelete('Equipe')}
        >
          <Text style={styles.cardText}>Turno: {dados.equipe.turno}</Text>
          <Text style={styles.cardText}>Operador: {dados.equipe.operador}</Text>
          <Text style={styles.cardText}>Auxiliar: {dados.equipe.auxiliar}</Text>
          <Text style={styles.cardText}>Unidade: {dados.equipe.unidade}</Text>
        </Card>
      )}
      {dados.deslocamento && (
        <Card 
          title="🚗 Deslocamento"
          onEdit={() => handleEdit('Deslocamento')}
          onDelete={() => handleDelete('Deslocamento')}
        >
          <Text style={styles.cardText}>Origem: {dados.deslocamento.origem}</Text>
          <Text style={styles.cardText}>Destino: {dados.deslocamento.destino}</Text>
          <Text style={styles.cardText}>Hora início: {dados.deslocamento.horaInicio}</Text>
          <Text style={styles.cardText}>Hora fim: {dados.deslocamento.horaFim}</Text>
        </Card>
      )}
      {dados.planejamento && (
        <Card 
          title="📋 Planejamento"
          onEdit={() => handleEdit('Planejamento')}
          onDelete={() => handleDelete('Planejamento')}
        >
          <Text style={styles.cardText}>Hora início: {dados.planejamento.horaInicio}</Text>
          <Text style={styles.cardText}>Hora fim: {dados.planejamento.horaFim}</Text>
          <Text style={styles.cardText}>Frase: {dados.planejamento.frase}</Text>
          {dados.planejamento.observacoes && (
            <Text style={styles.cardText}>Observações: {dados.planejamento.observacoes}</Text>
          )}
        </Card>
      )}
      {dados.montagem && (
        <Card 
          title="🔧 Montagem"
          onEdit={() => handleEdit('Montagem')}
          onDelete={() => handleDelete('Montagem')}
        >
          <Text style={styles.cardText}>Hora início: {dados.montagem.horaInicio}</Text>
          <Text style={styles.cardText}>Hora fim: {dados.montagem.horaFim}</Text>
          <Text style={styles.cardText}>Frase: {dados.montagem.frase}</Text>
        </Card>
      )}
      {dados.teste && (
        <Card 
          title="🧪 Teste"
          onEdit={() => handleEdit('Teste')}
          onDelete={() => handleDelete('Teste')}
        >
          <Text style={styles.cardText}>Hora início: {dados.teste.horaInicio}</Text>
          <Text style={styles.cardText}>Hora fim: {dados.teste.horaFim}</Text>
          <Text style={styles.cardText}>500 psi: {dados.teste.psi500}</Text>
          <Text style={styles.cardText}>3000 psi: {dados.teste.psi3000}</Text>
          <Text style={styles.cardText}>Frase: {dados.teste.frasePadrao}</Text>
        </Card>
      )}
      {dados.operações && (
        <Card 
          title="⚙️ Operações"
          onEdit={() => handleEdit('Operações')}
          onDelete={() => handleDelete('Operações')}
        >
          {Array.isArray(dados.operações) ? (
            dados.operações.map((operacao, index) => (
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
              <Text style={styles.cardText}>Serviço: {dados.operações.servico}</Text>
              <Text style={styles.cardText}>Poço: {dados.operações.poco}</Text>
              {dados.operações.horaInicio && (
                <>
                  <Text style={styles.cardText}>Hora início: {dados.operações.horaInicio}</Text>
                  <Text style={styles.cardText}>Hora fim: {dados.operações.horaFim}</Text>
                </>
              )}
              {dados.operações.pressaoCabeca && (
                <Text style={styles.cardText}>Pressão cabeça: {dados.operações.pressaoCabeca} psi</Text>
              )}
              {dados.operações.pressaoAnular && (
                <Text style={styles.cardText}>Pressão anular: {dados.operações.pressaoAnular} psi</Text>
              )}
              {dados.operações.operacaoConcluida !== undefined && (
                <Text style={styles.cardText}>Operação concluída: {dados.operações.operacaoConcluida ? 'Sim' : 'Não'}</Text>
              )}
              {dados.operações.statusSelecionado && (
                <Text style={styles.cardText}>Status: {dados.operações.statusSelecionado}</Text>
              )}
              {dados.operações.observacao && (
                <Text style={styles.cardText}>Observação: {dados.operações.observacao}</Text>
              )}
            </>
          )}
        </Card>
      )}
      {dados.desmontagem && (
        <Card 
          title="🔨 Desmontagem"
          onEdit={() => handleEdit('Desmontagem')}
          onDelete={() => handleDelete('Desmontagem')}
        >
          <Text style={styles.cardText}>Hora início: {dados.desmontagem.horaInicio}</Text>
          <Text style={styles.cardText}>Hora fim: {dados.desmontagem.horaFim}</Text>
          <Text style={styles.cardText}>Frase: {dados.desmontagem.frasePadrao}</Text>
        </Card>
      )}
      {dados.turma && (
        <Card 
          title="👨‍👩‍👧‍👦 Turma"
          onEdit={() => handleEdit('Turma')}
          onDelete={() => handleDelete('Turma')}
        >
          <Text style={styles.cardText}>Hora início: {dados.turma.horaInicio}</Text>
          <Text style={styles.cardText}>Hora fim: {dados.turma.horaFim}</Text>
          <Text style={styles.cardText}>Frase: {dados.turma.frasePadrao}</Text>
          {dados.turma.observacoes && (
            <Text style={styles.cardText}>Observações: {dados.turma.observacoes}</Text>
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
});
