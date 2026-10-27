import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';

import { AppAuthProvider, useAuth } from '@/modules/auth';
import { AppForumProvider } from '@/modules/forum';
import { useAppFonts } from '@/shared/hooks/useAppFonts';
import { useHideSplashScreen } from '@/shared/hooks/useHideSplashScreen';
import { queryClient } from '@/shared/lib/queryClient';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppAuthProvider>
        <AppForumProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </AppForumProvider>
      </AppAuthProvider>
    </QueryClientProvider>
  );
}

// The splash stays until fonts load and the saved session is restored, so the login
// never flashes for a signed-in user.
function RootNavigator() {
  const { status } = useAuth();
  const areFontsReady = useAppFonts();
  const isReady = areFontsReady && status !== 'loading';
  useHideSplashScreen(isReady);

  if (!isReady) {
    return null;
  }

  const isSignedIn = status === 'signedIn';
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
