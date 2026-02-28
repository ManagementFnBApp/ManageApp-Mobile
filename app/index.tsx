import { Redirect } from "expo-router";
import { useAuth } from "../providers/AuthProvider";

export default function Index() {
  const auth = useAuth();
  if (!auth?.token) {
    return <Redirect href="/loginPage" />;
  }

  return <Redirect href="/(tabs)/Home" />;
}