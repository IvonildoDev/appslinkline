import { Image, StyleSheet, Text, View } from 'react-native';


export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')}
        style={{ width: 120, height: 120, borderRadius: 16 }}
        resizeMode="contain"
      />
      <Text style={styles.welcome}>Bem-vindo ao app Slikline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  welcome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563eb',
    marginTop: 24,
    textAlign: 'center',
  },
});
