import { Feather, Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || "#35d07f";

export default function Home() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View>
          <Text style={styles.subtitle}>Bistro Management</Text>
          <Text style={styles.title}>Main Dashboard</Text>
        </View>

        <View style={styles.bell}>
          <Ionicons name="notifications-outline" size={20} color="#fff" />
        </View>
      </View>

      {/* STATS */}
      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Today's Revenue</Text>
          <Text style={styles.cardValue}>$2,480.00</Text>
          <Text style={styles.cardGrowth}>+14.2%</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Order Count</Text>
          <Text style={styles.cardValue}>112</Text>
          <Text style={styles.cardGrowth}>+5.1%</Text>
        </View>
      </View>

      {/* SALES PERFORMANCE */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sales Performance</Text>
          <View style={styles.toggle}>
            <Text style={styles.toggleActive}>Daily</Text>
            <Text style={styles.toggleText}>Weekly</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.peak}>Peak Hour Performance</Text>
          <Text style={styles.bigMoney}>$425.50 <Text style={styles.vs}>vs Yesterday</Text></Text>

          <View style={styles.chart}>
            {[30, 75, 45, 60, 80].map((h, i) => (
              <View key={i} style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${h}%`,
                      backgroundColor: i === 1 || i === 4 ? GREEN : "#2f4f43",
                    },
                  ]}
                />
                <Text style={styles.barLabel}>
                  {["10AM", "12PM", "2PM", "6PM", "8PM"][i]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#134e2d" }]}>
            <Feather name="shopping-cart" size={22} color={GREEN} />
            <Text style={styles.actionText}>New Order</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Feather name="archive" size={22} color="#9aa" />
            <Text style={styles.actionText}>Inventory</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Feather name="bar-chart-2" size={22} color="#9aa" />
            <Text style={styles.actionText}>Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09241a",
    paddingHorizontal: 18,
    paddingTop: 60,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GREEN,
    marginRight: 12,
  },

  subtitle: {
    color: "#9ab",
    fontSize: 12,
  },

  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  bell: {
    marginLeft: "auto",
    backgroundColor: "#123c2b",
    padding: 10,
    borderRadius: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#123c2b",
    flex: 0.48,
    padding: 18,
    borderRadius: 18,
  },

  cardLabel: {
    color: "#9ab",
    fontSize: 12,
  },

  cardValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 6,
  },

  cardGrowth: {
    color: GREEN,
    fontSize: 12,
  },

  section: {
    marginBottom: 30,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  toggle: {
    flexDirection: "row",
    backgroundColor: "#123c2b",
    borderRadius: 12,
    padding: 4,
  },

  toggleActive: {
    backgroundColor: "#1c5e3b",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
  },

  toggleText: {
    color: "#9ab",
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 12,
  },

  chartCard: {
    backgroundColor: "#123c2b",
    padding: 18,
    borderRadius: 18,
  },

  peak: {
    color: "#9ab",
    fontSize: 12,
  },

  bigMoney: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  vs: {
    fontSize: 12,
    color: GREEN,
  },

  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 150,
  },

  barWrapper: {
    alignItems: "center",
    flex: 1,
  },

  bar: {
    width: 18,
    borderRadius: 8,
  },

  barLabel: {
    color: "#7a9",
    fontSize: 10,
    marginTop: 6,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  actionBtn: {
    flex: 1,
    backgroundColor: "#123c2b",
    marginHorizontal: 5,
    paddingVertical: 20,
    borderRadius: 18,
    alignItems: "center",
  },

  actionText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 8,
  },
});