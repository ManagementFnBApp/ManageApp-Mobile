import { useEffect, useState } from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { ACTIVE_STATUSES, FilterTab, getAllOrders, Order, STATUS_COLORS } from '@/apis/OrdersAPI';
import { router } from "expo-router";
import { ArrowLeft, Bell } from "lucide-react-native";

const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || "#2596BE";

export default function OrdersHistory() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const fetchAllOrders = async () => {
        const allOrders = await getAllOrders();
        setOrders(allOrders);
    }
    fetchAllOrders()
  },[])

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchTab =
      activeTab === "All" ||
      (activeTab === "Active" && ACTIVE_STATUSES.includes(o.status)) ||
      (activeTab === "Completed" && o.status === "Completed");

    return matchSearch && matchTab;
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
        style={styles.backBtn}
        onPress={() => router.push('/Orders')}
        >
          <ArrowLeft />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders List</Text>
        <TouchableOpacity style={styles.bellBtn}>
          <Bell />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID or customer"
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(["All", "Active", "Completed"] as FilterTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section Label */}
      <Text style={styles.sectionLabel}>TODAY'S ORDERS</Text>

      {/* Orders List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const statusStyle = STATUS_COLORS[item.status];
          return (
            <TouchableOpacity style={styles.card} activeOpacity={0.85}>
              {/* Row 1: Order ID + Status */}
              <View style={styles.cardRow}>
                <Text style={styles.orderId}>#{item.orderId}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              {/* Row 2: Table or Customer */}
              {item.table ? (
                <Text style={styles.subInfo}>🍽 {item.table}</Text>
              ) : item.customer ? (
                <Text style={styles.subInfo}>👤 {item.customer}</Text>
              ) : null}

              {/* Divider */}
              <View style={styles.divider} />

              {/* Row 3: Time + Total */}
              <View style={styles.cardRow}>
                <View>
                  <Text style={styles.metaLabel}>Order Time</Text>
                  <Text style={styles.metaValue}>{item.time}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.metaLabel}>Total</Text>
                  <Text style={styles.totalValue}>${item.total.toFixed(2)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#f3f4f6",
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  bellBtn: {
    padding: 4,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 99,
    backgroundColor: "#e5e7eb",
  },
  tabActive: {
    backgroundColor: GREEN,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
  },
  tabTextActive: {
    color: "#fff",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9ca3af",
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  subInfo: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 12,
  },
  metaLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "700",
    color: GREEN,
  },
});