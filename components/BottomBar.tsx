import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Clipboard, LayoutGrid, Plus, Settings } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || "#35d07f";

export default function PosBottomBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  const tabs = [
    { name: "Home", icon: <LayoutGrid size={22} color="#9aa" />},
    { name: "Menu", icon: <Clipboard size={22} color="#9aa" /> },
    { name: "Orders", icon: <Plus size={36} color="#000" /> }, // FAB
    { name: "Tables", icon: <MaterialCommunityIcons name="table-furniture" size={22} color="#9aa" /> },
    { name: "Settings", icon: <Settings size={22} color="#9aa" /> },
  ];

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      <View style={styles.container}>
        {tabs.map((tab, index) => {
          const isFocused = state.index === index;

          if (tab.name === "Orders") {
            return (
              <TouchableOpacity
                key={index}
                style={styles.fabWrapper}
                onPress={() => navigation.navigate(tab.name)}
              >
                <View style={styles.fab}>
                  {tab.icon}
                </View>
                <Text style={styles.label}>Orders</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={index}
              style={styles.tab}
              onPress={() => navigation.navigate(tab.name)}
            >
              <View style={{ opacity: isFocused ? 1 : 0.5 }}>
                {React.cloneElement(tab.icon, { color: isFocused ? GREEN : tab.icon.props.color })}
              </View>
              <Text style={[styles.label, isFocused && styles.active]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#0b2b1f",
  },
  container: {
    flexDirection: "row",
    height: 70,
    justifyContent: "space-around",
    alignItems: "flex-end",
    backgroundColor: "#0b2b1f",

    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingBottom: 8,
  },
  label: {
    fontSize: 11,
    color: "#9aa",
    marginTop: 8,
    marginBottom: 4,
  },
  active: {
    color: GREEN,
  },

  fabWrapper: {
    alignItems: "center",
    flex: 1,
  },
  fab: {
    position: "absolute",
    top: -62,
    width: 58,
    height: 58,
    borderRadius: 30,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: GREEN,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
});