
import { useColorScheme } from '@/components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { initDatabase } from '../utils/database';

export {
  ErrorBoundary
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const Drawer = createDrawerNavigator();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    // Initialize database
    initDatabase().then(() => {
      console.log('Database initialized successfully');
    }).catch((error) => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Drawer.Navigator
        initialRouteName="home"
        screenOptions={{
          headerShown: true,
          drawerStyle: { width: '50%' },
        }}
      >
        <Drawer.Screen name="home" options={{ title: 'Home' }} getComponent={() => require('./home').default} />
        <Drawer.Screen name="equipe" options={{ title: 'Equipe' }} getComponent={() => require('./equipe').default} />
        <Drawer.Screen name="deslocamento" options={{ title: 'Deslocamento' }} getComponent={() => require('./deslocamento').default} />
        <Drawer.Screen name="planejamento" options={{ title: 'Planejamento' }} getComponent={() => require('./planejamento').default} />
        <Drawer.Screen name="montagem" options={{ title: 'Montagem' }} getComponent={() => require('./montagem').default} />
        <Drawer.Screen name="teste" options={{ title: 'Teste' }} getComponent={() => require('./teste').default} />
        <Drawer.Screen name="operacoes" options={{ title: 'Operações' }} getComponent={() => require('./operacoes').default} />
        <Drawer.Screen name="desmontagem" options={{ title: 'Desmontagem' }} getComponent={() => require('./desmontagem').default} />
        <Drawer.Screen name="turma" options={{ title: 'Turma' }} getComponent={() => require('./turma').default} />
        <Drawer.Screen name="relatorio" options={{ title: 'Relatório' }} getComponent={() => require('./relatorio').default} />
        <Drawer.Screen name="modal" options={{ title: 'Modal', drawerItemStyle: { display: 'none' } }} getComponent={() => require('./modal').default} />
      </Drawer.Navigator>
    </ThemeProvider>
  );
}
