// ...existing code...
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      {/* Tela index removida */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="relatorio"
        options={{
          title: 'Relatório',
          tabBarIcon: ({ color }) => <TabBarIcon name="file-text" color={color} />,
        }}
      />
      <Tabs.Screen
        name="equipe"
        options={{
          title: 'Equipe',
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
        }}
      />
      <Tabs.Screen
        name="deslocamento"
        options={{
          title: 'Deslocamento',
          tabBarIcon: ({ color }) => <TabBarIcon name="location-arrow" color={color} />,
        }}
      />
      <Tabs.Screen
        name="planejamento"
        options={{
          title: 'Planejamento',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar-check-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="equipamento"
        options={{
          title: 'Equipamento',
          tabBarIcon: ({ color }) => <TabBarIcon name="cogs" color={color} />,
        }}
      />
      <Tabs.Screen
        name="teste"
        options={{
          title: 'Teste',
          tabBarIcon: ({ color }) => <TabBarIcon name="flask" color={color} />,
        }}
      />
      <Tabs.Screen
        name="operacoes"
        options={{
          title: 'Operações',
          tabBarIcon: ({ color }) => <TabBarIcon name="wrench" color={color} />,
        }}
      />
      <Tabs.Screen
        name="turma"
        options={{
          title: 'Turma',
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
        }}
      />
      {/* Tela two removida */}
    </Tabs>
  );
}
