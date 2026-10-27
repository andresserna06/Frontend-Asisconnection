import { Tabs } from 'expo-router';

import { useAuth } from '@/modules/auth';
import { BottomNavBar } from '@/shared/ui/organisms/BottomNavBar';

export default function TabsLayout() {
  const { user } = useAuth();
  const profileInitials = user?.username.slice(0, 2).toUpperCase() ?? 'AS';

  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarShowLabel: false }}
      tabBar={({ state, navigation }) => (
        <BottomNavBar
          activeRoute={state.routes[state.index]?.name ?? 'index'}
          profileInitials={profileInitials}
          onNavigate={(route) => navigation.navigate(route)}
        />
      )}
    >
      <Tabs.Screen name="index" options={{ title: 'Foros' }} />
      <Tabs.Screen name="ecosystem" options={{ title: 'Ecosistema' }} />
      <Tabs.Screen name="assistant" options={{ title: 'Asistente' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
      <Tabs.Screen name="notifications" options={{ href: null, title: 'Notificaciones' }} />
    </Tabs>
  );
}
