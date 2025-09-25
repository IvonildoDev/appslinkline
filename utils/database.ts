import * as SQLite from 'expo-sqlite';
import { Alert } from 'react-native';

const db = SQLite.openDatabaseSync('slikline.db');

// Inicializar tabela
export const initDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    try {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS relatorio (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          tela TEXT UNIQUE, 
          dados TEXT
        );
      `);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

// Salvar dados de uma tela
export const salvarDados = (nomeTela: string, dados: any) => {
  return new Promise<void>((resolve, reject) => {
    try {
      db.runSync(
        'INSERT OR REPLACE INTO relatorio (tela, dados) VALUES (?, ?);',
        [nomeTela, JSON.stringify(dados)]
      );
      Alert.alert('Sucesso', `Dados de ${nomeTela} salvos!`);
      resolve();
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível salvar: ' + error.message);
      reject(error);
    }
  });
};

// Buscar todos os dados
export const buscarTodosDados = () => {
  return new Promise<any[]>((resolve, reject) => {
    try {
      const result = db.getAllSync('SELECT * FROM relatorio;');
      const dados = result.map((row: any) => ({
        tela: row.tela,
        dados: JSON.parse(row.dados)
      }));
      resolve(dados);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar dados: ' + error.message);
      reject(error);
    }
  });
};

// Limpar todos os dados
export const limparDados = () => {
  return new Promise<void>((resolve, reject) => {
    try {
      db.runSync('DELETE FROM relatorio;');
      Alert.alert('Sucesso', 'Todos os dados foram apagados!');
      resolve();
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível limpar os dados: ' + error.message);
      reject(error);
    }
  });
};

// Excluir dados de uma tela específica
export const excluirDadosTela = (nomeTela: string) => {
  return new Promise<void>((resolve, reject) => {
    try {
      db.runSync('DELETE FROM relatorio WHERE tela = ?;', [nomeTela]);
      Alert.alert('Sucesso', `Dados de ${nomeTela} foram excluídos!`);
      resolve();
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível excluir os dados: ' + error.message);
      reject(error);
    }
  });
};