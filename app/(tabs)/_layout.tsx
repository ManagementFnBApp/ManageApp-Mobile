import { Tabs } from "expo-router";
import PosBottomBar from "../../components/BottomBar";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <PosBottomBar {...props} />}
    >
      <Tabs.Screen name="Home" options={{ title: "Home" }} />
      <Tabs.Screen name="Menu" options={{ title: "Menu" }} />
      <Tabs.Screen name="Orders" options={{ title: "Orders" }} />
      <Tabs.Screen name="Tables" options={{ title: "Tables" }} />
      <Tabs.Screen name="Settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}