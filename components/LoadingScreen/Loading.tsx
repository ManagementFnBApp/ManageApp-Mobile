import { ActivityIndicator, StyleSheet, View } from "react-native";

interface Props {
  visible: boolean;
}

export default function Loading({ visible }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#2596BE" />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});