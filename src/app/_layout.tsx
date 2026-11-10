import { Stack, router, usePathname } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { Platform } from 'react-native';

import { AppAuthProvider, useAuth } from '@/modules/auth';
import { AppCommentsProvider } from '@/modules/comments';
import { AppForumProvider } from '@/modules/forum';
import { STRINGS } from '@/shared/config/strings';
import { useAppFonts } from '@/shared/hooks/useAppFonts';
import { useHideSplashScreen } from '@/shared/hooks/useHideSplashScreen';
import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';
import { queryClient } from '@/shared/lib/queryClient';
import {
  DesktopSidebar,
  toDesktopNavRoute,
  type DesktopNavRoute,
} from '@/shared/ui/organisms/DesktopSidebar';
import { DesktopShell } from '@/shared/ui/templates/DesktopShell';

SplashScreen.preventAutoHideAsync();

const DESKTOP_ROUTE_HREFS = {
  index: '/',
  ecosystem: '/ecosystem',
  assistant: '/assistant',
  profile: '/profile',
} as const satisfies Record<DesktopNavRoute, string>;

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppAuthProvider>
        <AppForumProvider>
          <AppCommentsProvider>
            <Head>
              <title>{STRINGS.appName}</title>
            </Head>
            <StatusBar style="dark" />
            <RootNavigator />
          </AppCommentsProvider>
        </AppForumProvider>
      </AppAuthProvider>
    </QueryClientProvider>
  );
}

// The splash stays until fonts load and the saved session is restored, so the login
// never flashes for a signed-in user.
function RootNavigator() {
  const { status, user } = useAuth();
  const areFontsReady = useAppFonts();
  const pathname = usePathname();
  const { isDesktop } = useResponsiveLayout();
  const isReady = areFontsReady && status !== 'loading';
  useHideSplashScreen(isReady);

  if (!isReady) {
    return null;
  }

  const isSignedIn = status === 'signedIn';
  const isAdmin = user?.roles.includes('ADMIN') ?? false;
  return (
    <DesktopShell
      sidebar={
        isSignedIn && isDesktop ? (
          <DesktopSidebar
            activeRoute={toDesktopNavRoute(pathname)}
            profileInitials={user?.username.slice(0, 2).toUpperCase() ?? 'AS'}
            onNavigate={(route) => router.navigate(DESKTOP_ROUTE_HREFS[route])}
            onCreatePost={() => router.push('/posts/new')}
          />
        ) : null
      }
    >
      <Stack key={user?.username ?? 'guest'} screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isSignedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="users/[userId]" />
          <Stack.Screen name="users/[userId]/posts/[postId]" />
          <Stack.Screen
            name="posts/new"
            options={{ presentation: Platform.OS === 'web' ? 'transparentModal' : 'modal' }}
          />
          <Stack.Screen
            name="comments/[postId]"
            options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="profile/settings" />
          <Stack.Screen name="profile/followers" />
        </Stack.Protected>
        <Stack.Protected guard={isSignedIn && isAdmin}>
          <Stack.Screen name="admin/index" />
        </Stack.Protected>
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </DesktopShell>
  );
}
