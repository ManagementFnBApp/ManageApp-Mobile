import { useAuth } from "@/providers/AuthProvider";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import PosBottomBar from "../../components/BottomBar";

export default function TabLayout() {
  const auth = useAuth();
  // const subscription = useSubscription();
  const router = useRouter();

  useEffect(() => {
    if (!auth?.loading && (!auth || !auth.token)) {
      auth.logout()
    } else if (auth.user?.role !== 'SHOPOWNER') {
      auth.logout()
      router.replace({
        pathname: '/loginPage',
        params: { errorMessage: encodeURIComponent('Please buy a Subscription on our website.') }
      });
    }
  }, []);

  if (auth?.loading) {
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
      <Tabs.Screen name="Home/index" options={{ title: "Home" }} />
      <Tabs.Screen name="Menu/index" options={{ title: "Menu" }} />
      <Tabs.Screen name="Orders/index" options={{ title: "Inventory" }} />
      <Tabs.Screen name="Schedule/index" options={{ title: "Schedule" }} />
      <Tabs.Screen name="Settings/index" options={{ title: "Settings" }} />
    </Tabs>
  );
}