import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionProvider } from '@/providers/SubscriptionProvider';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from "../providers/AuthProvider";

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <SubscriptionProvider>
          <RootNav />
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootNav() {
  const auth = useAuth();
  const subscription = useSubscription();

  if (auth?.loading || subscription?.loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      {!auth?.token ? (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="loginPage" />
        </Stack>
      ) : (
        <>
          {((auth.user?.role !== undefined && auth.user?.role === "SHOPOWNER") || !auth?.loading || !subscription?.loading) ? (
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
            </Stack>
          ) : (
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="SubscriptionPage" />
              <Stack.Screen name="CheckoutPage" />
            </Stack >
          )}
        </>
      )}
    </>
  );
}