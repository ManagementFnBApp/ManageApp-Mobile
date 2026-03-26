import { Redirect } from "expo-router";
import { useAuth } from "../providers/AuthProvider";

export default function Index() {
  const auth = useAuth();

  // Still restoring token from SecureStore — render nothing to avoid flash
  if (auth?.loading) return null;

  if (!auth?.token) {
    return <Redirect href="/loginPage" />;
  }

  if (auth.user?.role === 'SHOPOWNER') {
    return <Redirect href="/(tabs)/Home" />;
  } else {
    return <Redirect href="/loginPage" />;
  }

}