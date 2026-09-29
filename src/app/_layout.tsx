import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Stack,
} from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/context/auth-context';
import { AppThemeProvider, useAppTheme } from '@/context/theme-context';
import { DeviceFrame } from '@/components/DeviceFrame';
import { appFontMap } from '@/theme/fonts';
import { Glass } from '@/constants/glass-theme';

/**
 * Holds the app until the bundled typefaces are ready, so no screen ever
 * flashes in a fallback font. `useFonts` also reports an error state — we
 * deliberately render anyway in that case, because a missing font must never
 * be able to block the app from starting.
 */
function FontGate({ children }: { children: React.ReactNode }) {
  const [loaded, error] = useFonts(appFontMap);

  if (!loaded && !error) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={Glass.purpleBright} />
      </View>
    );
  }

  return <>{children}</>;
}

function NavigationStack() {
  const { isDark } = useAppTheme();

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 220,
          contentStyle: { backgroundColor: Glass.bg },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(student)" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="food-court" />
        <Stack.Screen name="staff" />
        <Stack.Screen name="super-admin" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <FontGate>
        {/* On web this is the iPhone mockup; on native it is a passthrough. */}
        <DeviceFrame>
          <SafeAreaProvider>
            <AppThemeProvider>
              <AuthProvider>
                <NavigationStack />
              </AuthProvider>
            </AppThemeProvider>
          </SafeAreaProvider>
        </DeviceFrame>
      </FontGate>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Glass.bg,
  },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Glass.bg,
  },
});
