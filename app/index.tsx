import { Redirect } from "expo-router";
import { useAuth } from "../providers/AuthProvider";

export default function Index() {
  const auth = useAuth();

  // Still restoring token from SecureStore — render nothing to avoid flash
  if (auth?.loading) return null;

  if (!auth?.token) {
    return <Redirect href="/loginPage" />;
  }

  // Redirect based on role
  if (auth.user?.role === 'ADMIN') {
    return <Redirect href="/loginPage" />;
  }

  if (auth.user?.role === 'SHOP_OWNER') {
    return <Redirect href="/(tabs)/Home" />;
  }

  // New user with no active subscription — send to subscription page
  return <Redirect href="/SubscriptionPage" />;
}