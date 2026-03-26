import { Box, Calendar, Clipboard, LayoutGrid, Settings } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || "#2596BE";

export default function PosBottomBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  const tabs = [
    { name: "Home/index", icon: <LayoutGrid size={22} color="rgb(114, 134, 134)" />},
    { name: "Menu/index", icon: <Clipboard size={22} color="rgb(114, 134, 134)" /> },
    { name: "Orders/index", icon: <Box size={36} color="rgb(255, 255, 255)" /> }, // FAB
    { name: "Schedule/index", icon: <Calendar size={22} color="rgb(114, 134, 134)" /> },
    { name: "Settings/index", icon: <Settings size={22} color="rgb(114, 134, 134)" /> },
  ];

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      <View style={styles.container}>
        {tabs.map((tab, index) => {
          const isFocused = state.index === index;

          if (tab.name === "Orders/index") {
            return (
              <TouchableOpacity
                key={index}
                style={styles.fabWrapper}
                onPress={() => navigation.navigate(tab.name)}
              >
                <View style={styles.fab}>
                  {tab.icon}
                </View>
                <Text style={[styles.label, isFocused && styles.active]}>Inventory</Text>
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
                {tab.name.split("/")[0]}
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
    backgroundColor: "#97b79d",
  },
  container: {
    flexDirection: "row",
    height: 70,
    justifyContent: "space-around",
    alignItems: "flex-end",
    backgroundColor: "#fcfcfc",

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
    color: "rgb(114, 134, 134)",
    marginTop: 4,
    marginBottom: 8,
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