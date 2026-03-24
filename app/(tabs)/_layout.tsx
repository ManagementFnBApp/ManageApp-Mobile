import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/providers/AuthProvider";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import PosBottomBar from "../../components/BottomBar";

export default function TabLayout() {
  const auth = useAuth();
  const subscription = useSubscription();
  const router = useRouter();

  const loading = auth?.loading || subscription?.loading; 

  useEffect(() => {
    if (!loading && (!auth || !auth.token)) {
      router.replace('/loginPage'); 
    }
  }, [loading, auth?.token]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!auth?.token) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <PosBottomBar {...props} />}
    >
      <Tabs.Screen name="Home" options={{ title: "Home" }} />
      <Tabs.Screen name="Menu/index" options={{ title: "Menu" }} />
      <Tabs.Screen name="Orders/index" options={{ title: "Orders" }} />
      <Tabs.Screen name="Schedule/index" options={{ title: "Schedule" }} />
      <Tabs.Screen name="Settings/index" options={{ title: "Settings" }} />
    </Tabs>
  );
}