import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from "../providers/AuthProvider";

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useState } from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootNav />
      </AuthProvider>
      {/* <StatusBar style="auto" /> */}
    </ThemeProvider>
  );
}

function RootNav() {
  const [token, setToken] = useState<string | null>(null);
  const auth = useAuth();
  const loading = auth?.loading;
  
  //console.log('Auth token:', token);
  useEffect(() => {
    if (auth) {
      setToken(auth.token);
    }
  }, [loading]);

  if (loading) return null;
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!token ? (
        // <Stack.Screen name="loginPage" />
        <Stack.Screen name="loginPage" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}
