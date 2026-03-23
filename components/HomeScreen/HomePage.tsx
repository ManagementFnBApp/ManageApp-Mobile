import { Feather, Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || "#2596BE";

export default function HomePage() {
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
                    <Ionicons name="notifications-outline" size={20} color="#111" />
                </View>
            </View>

            {/* STATS */}
            <View style={styles.row}>
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Today's Revenue</Text>
                    <Text style={styles.cardValue}>$2,480.00</Text>
                    <Text style={styles.cardGrowth}>↑ +14.2%</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Order Count</Text>
                    <Text style={styles.cardValue}>112</Text>
                    <Text style={styles.cardGrowth}>↑ +5.1%</Text>
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
                    <Text style={styles.bigMoney}>
                        $425.50 <Text style={styles.vs}>vs Yesterday</Text>
                    </Text>

                    <View style={styles.chart}>
                        {[30, 75, 45, 60, 80].map((h, i) => (
                            <View key={i} style={styles.barWrapper}>
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: `${h}%`,
                                            backgroundColor: i === 1 || i === 4 ? GREEN : "#e0e8e4",
                                        },
                                    ]}
                                />
                                <Text
                                    style={[
                                        styles.barLabel,
                                        (i === 1 || i === 4) && { color: GREEN, fontWeight: "700" },
                                    ]}
                                >
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
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#e74c3c" }]}>
                        <Feather name="shopping-cart" size={22} color="#fff" />
                        <Text style={styles.actionText}>New Order</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: GREEN }]}>
                        <Feather name="archive" size={22} color="#fff" />
                        <Text style={styles.actionText}>Inventory</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#2980e8" }]}>
                        <Feather name="bar-chart-2" size={22} color="#fff" />
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
        backgroundColor: "#f4f6f8",
        paddingHorizontal: 18,
        paddingTop: 10,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        paddingTop: 8,
    },

    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#d0e8dc",
        marginRight: 12,
    },

    subtitle: {
        color: "#888",
        fontSize: 11,
        fontWeight: "500",
    },

    title: {
        color: "#111",
        fontSize: 17,
        fontWeight: "700",
    },

    bell: {
        marginLeft: "auto",
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },

    card: {
        backgroundColor: "#fff",
        flex: 0.48,
        padding: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },

    cardLabel: {
        color: "#888",
        fontSize: 12,
        fontWeight: "500",
        marginBottom: 2,
    },

    cardValue: {
        color: "#111",
        fontSize: 22,
        fontWeight: "800",
        marginVertical: 4,
        letterSpacing: -0.5,
    },

    cardGrowth: {
        color: GREEN,
        fontSize: 12,
        fontWeight: "600",
    },

    section: {
        marginBottom: 24,
    },

    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },

    sectionTitle: {
        color: "#111",
        fontSize: 16,
        fontWeight: "700",
    },

    toggle: {
        flexDirection: "row",
        backgroundColor: "#eef0f2",
        borderRadius: 10,
        padding: 3,
    },

    toggleActive: {
        backgroundColor: "#fff",
        color: "#111",
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 8,
        fontSize: 12,
        fontWeight: "600",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 1,
    },

    toggleText: {
        color: "#888",
        paddingHorizontal: 14,
        paddingVertical: 5,
        fontSize: 12,
        fontWeight: "500",
    },

    chartCard: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },

    peak: {
        color: "#888",
        fontSize: 12,
        fontWeight: "500",
    },

    bigMoney: {
        color: "#111",
        fontSize: 24,
        fontWeight: "800",
        marginBottom: 16,
        letterSpacing: -0.5,
    },

    vs: {
        fontSize: 13,
        color: GREEN,
        fontWeight: "600",
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
        width: 40,
        borderRadius: 6,
    },

    barLabel: {
        color: "#aaa",
        fontSize: 10,
        marginTop: 6,
        fontWeight: "500",
    },

    actionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },

    actionBtn: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 22,
        borderRadius: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },

    actionText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
        marginTop: 8,
    },
});