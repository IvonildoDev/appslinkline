import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SobreScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="information" size={48} color="#2563eb" style={{ marginBottom: 8 }} />
          <Text style={styles.appName}>Slikline Operações</Text>
        </View>
        <Text style={styles.title}>Sobre o App</Text>
        <Text style={styles.text}>
          O <Text style={styles.bold}>Slikline Operações</Text> foi criado para facilitar o registro, acompanhamento e geração de relatórios de operações de campo, como:
        </Text>
        <View style={styles.listBox}>
          <Text style={styles.listItem}>• Desparafinação Mecânica</Text>
          <Text style={styles.listItem}>• BPV</Text>
          <Text style={styles.listItem}>• STV</Text>
          <Text style={styles.listItem}>• Sliding Sleeve</Text>
          <Text style={styles.listItem}>• Estampagem</Text>
          <Text style={styles.listItem}>• Teste plug</Text>
          <Text style={styles.listItem}>• Checagem de coluna</Text>
          <Text style={styles.listItem}>• RPE</Text>
        </View>
        <Text style={styles.text}>
          Funcionalidades principais:
        </Text>
        <View style={styles.listBox}>
          <Text style={styles.listItem}>• Registro rápido e padronizado das operações</Text>
          <Text style={styles.listItem}>• Armazenamento local seguro</Text>
          <Text style={styles.listItem}>• Geração de relatórios detalhados</Text>
          <Text style={styles.listItem}>• Consulta de históricos</Text>
        </View>
        <Text style={styles.title}>Como usar o app</Text>
        <View style={styles.listBox}>
          <Text style={styles.listItem}>1. Acesse o menu lateral para navegar entre as telas.</Text>
          <Text style={styles.listItem}>2. Em cada tela, preencha os campos obrigatórios e salve as informações.</Text>
          <Text style={styles.listItem}>3. Utilize a tela Operações para registrar atividades de campo.</Text>
          <Text style={styles.listItem}>4. Consulte o histórico e relatórios para acompanhar o andamento das operações.</Text>
          <Text style={styles.listItem}>5. Use a tela Planejamento para organizar as próximas etapas do serviço.</Text>
        </View>
        <Text style={styles.text}>
          <Text style={styles.bold}>Desenvolvedor:</Text> Ivonildo Lima
        </Text>
        <Text style={styles.agradecimento}>
          Obrigado por utilizar o app! Seu feedback é muito importante para melhorias contínuas.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7faff',
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 14,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    textAlign: 'justify',
  },
  bold: {
    fontWeight: 'bold',
    color: '#2563eb',
  },
  listBox: {
    marginBottom: 12,
    marginLeft: 8,
  },
  listItem: {
    fontSize: 15,
    color: '#444',
    marginBottom: 3,
  },
  agradecimento: {
    fontSize: 15,
    color: '#2563eb',
    marginTop: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
