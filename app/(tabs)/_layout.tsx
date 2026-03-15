import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/providers/AuthProvider";
import { Tabs, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import PosBottomBar from "../../components/BottomBar";

export default function TabLayout() {
  const auth = useAuth();
  const subscription = useSubscription();
  const router = useRouter()

  // if (subscription?.plans[0]?.is_active) {
  //   router.push('/SubscriptionPage')
  // }

  if (auth?.loading && subscription?.loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else {
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
}