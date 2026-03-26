import { getOrderReport, type OrderReportByDate } from "@/apis/OrdersAPI";
import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || "#2596BE";

const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH = now.getMonth() + 1;

const yearOptions = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

type ReportRow = {
    date: string;
    dateLabel: string;
    numberOfOrders: number;
    totalAmount: number;
};

function toReadableDate(dateIso: string): string {
    const date = new Date(dateIso);
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function mapAndSortRows(reportByDate: OrderReportByDate[]): ReportRow[] {
    return [...reportByDate]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((item) => ({
            date: item.date,
            dateLabel: toReadableDate(item.date),
            numberOfOrders: item.numberOfOrders,
            totalAmount: item.totalAmount,
        }));
}

function formatVND(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(amount);
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function MiniBarChart({ rows }: { rows: ReportRow[] }) {
    if (rows.length === 0) {
        return (
            <View style={chart.empty}>
                <Text style={chart.emptyText}>No chart data</Text>
            </View>
        );
    }

    const max = Math.max(...rows.map((r) => r.totalAmount), 1);
    // Show at most 10 bars to keep it readable
    const visible = rows.slice(-10);

    return (
        <View style={chart.wrapper}>
            {visible.map((row, i) => {
                const ratio = row.totalAmount / max;
                const isHighest = row.totalAmount === max;
                return (
                    <View key={row.date} style={chart.barCol}>
                        <View style={chart.barTrack}>
                            <View
                                style={[
                                    chart.bar,
                                    {
                                        height: `${Math.max(ratio * 100, 4)}%`,
                                        backgroundColor: isHighest ? GREEN : "#d1e8f0",
                                    },
                                ]}
                            />
                        </View>
                        <Text style={[chart.label, isHighest && { color: GREEN }]}>
                            {row.dateLabel.slice(0, 5)}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

// ─── Scroll picker (year / month) — uses Modal so dropdown floats above everything ──
function Picker<T extends number>({
    label,
    options,
    value,
    onChange,
    renderOption,
}: {
    label: string;
    options: T[];
    value: T;
    onChange: (v: T) => void;
    renderOption: (v: T) => string;
}) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<View>(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

    const openDropdown = () => {
        btnRef.current?.measureInWindow((x, y, width, height) => {
            setDropdownPos({ top: y + height + 4, left: x, width });
            setOpen(true);
        });
    };

    return (
        <View style={picker.wrap}>
            <Text style={picker.label}>{label}</Text>
            <TouchableOpacity ref={btnRef} style={picker.btn} onPress={openDropdown}>
                <Text style={picker.btnText}>{renderOption(value)}</Text>
                <Ionicons name={open ? "chevron-up" : "chevron-down"} size={14} color="#64748b" />
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
                <TouchableWithoutFeedback onPress={() => setOpen(false)}>
                    <View style={picker.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View
                                style={[
                                    picker.dropdown,
                                    { top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width },
                                ]}
                            >
                                <ScrollView style={{ maxHeight: 200 }}>
                                    {options.map((opt) => (
                                        <TouchableOpacity
                                            key={opt}
                                            style={[picker.option, opt === value && picker.optionActive]}
                                            onPress={() => {
                                                onChange(opt);
                                                setOpen(false);
                                            }}
                                        >
                                            <Text style={[picker.optionText, opt === value && picker.optionTextActive]}>
                                                {renderOption(opt)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function HomePage() {
    const auth = useAuth()
    const [year, setYear] = useState(CURRENT_YEAR);
    const [month, setMonth] = useState(CURRENT_MONTH);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rows, setRows] = useState<ReportRow[]>([]);
    const [numberOfOrders, setNumberOfOrders] = useState(0);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getOrderReport(year, month);
            setNumberOfOrders(data?.numberOfOrders ?? 0);
            setRows(mapAndSortRows(data?.reportByDate ?? []));
        } catch (err: unknown) {
            setRows([]);
            setNumberOfOrders(0);
            setError(err instanceof Error ? err.message : "Failed to generate report.");
        } finally {
            setLoading(false);
        }
    }, [year, month]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const totalRevenue = useMemo(
        () => rows.reduce((sum, r) => sum + r.totalAmount, 0),
        [rows]
    );

    return (
        <ScrollView
            style={s.container}
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
        >
            {/* ── Header ── */}
            <View style={styles.header}>
                <View style={styles.avatar} />
                <View>
                    <Text style={styles.subtitle}>{auth?.user?.username}</Text>
                    <Text style={styles.title}>Main Dashboard</Text>
                </View>

                <View style={styles.bell}>
                    <Ionicons name="notifications-outline" size={20} color="#111" />
                </View>
            </View>

            <View style={s.headerSection}>
                <View>
                    <Text style={s.pageTitle}>Report</Text>
                    <Text style={s.pageSubtitle}>View daily order & revenue by month</Text>
                </View>
            </View>

            {/* ── Filters ── */}
            <View style={s.filterCard}>
                <View style={s.filterRow}>
                    <Picker
                        label="Year"
                        options={yearOptions}
                        value={year}
                        onChange={setYear}
                        renderOption={(y) => String(y)}
                    />
                    <Picker
                        label="Month"
                        options={monthOptions}
                        value={month}
                        onChange={setMonth}
                        renderOption={(m) => `Month ${m}`}
                    />
                    <View style={s.refreshWrap}>
                        <Text style={s.refreshLabel}> </Text>
                        <TouchableOpacity
                            style={s.refreshBtn}
                            onPress={fetchReport}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Ionicons name="refresh" size={18} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {error ? (
                    <View style={s.errorBox}>
                        <Text style={s.errorText}>{error}</Text>
                    </View>
                ) : null}
            </View>

            {/* ── Stat cards ── */}
            <View style={s.statsRow}>
                <View style={s.statCard}>
                    <View style={s.statTop}>
                        <View style={[s.statIcon, { backgroundColor: "#eff6ff" }]}>
                            <Ionicons name="bar-chart-outline" size={18} color="#3b82f6" />
                        </View>
                    </View>
                    <Text style={s.statLabel}>Total Orders</Text>
                    <Text style={s.statValue}>{numberOfOrders}</Text>
                </View>

                <View style={s.statCard}>
                    <View style={s.statTop}>
                        <View style={[s.statIcon, { backgroundColor: "#ecfdf5" }]}>
                            <Ionicons name="cash-outline" size={18} color="#10b981" />
                        </View>
                    </View>
                    <Text style={s.statLabel}>Total Revenue</Text>
                    <Text style={[s.statValue, { fontSize: 16 }]}>
                        {formatVND(totalRevenue)}
                    </Text>
                </View>
            </View>

            {/* ── Chart ── */}
            <View style={s.card}>
                <View style={s.cardHeader}>
                    <Ionicons name="document-text-outline" size={15} color="#64748b" />
                    <Text style={s.cardTitle}>Revenue per day</Text>
                </View>
                {loading ? (
                    <ActivityIndicator style={{ marginVertical: 40 }} color={GREEN} />
                ) : (
                    <MiniBarChart rows={rows} />
                )}
            </View>

            {/* ── Table ── */}
            <View style={s.card}>
                <Text style={s.cardTitle}>Report Details</Text>

                {/* Table head */}
                <View style={[s.tableRow, s.tableHead]}>
                    <Text style={[s.tableCell, s.headCell, { flex: 1.4 }]}>Date</Text>
                    <Text style={[s.tableCell, s.headCell, { flex: 1 }]}>Orders</Text>
                    <Text style={[s.tableCell, s.headCell, { flex: 1.6 }]}>Amount</Text>
                </View>

                {loading ? (
                    <ActivityIndicator style={{ marginVertical: 24 }} color={GREEN} />
                ) : rows.length === 0 ? (
                    <Text style={s.emptyText}>No data for selected month.</Text>
                ) : (
                    rows.map((row, idx) => (
                        <View
                            key={row.date}
                            style={[s.tableRow, idx % 2 === 0 && s.tableRowEven]}
                        >
                            <Text style={[s.tableCell, { flex: 1.4, color: "#374151" }]}>
                                {row.dateLabel}
                            </Text>
                            <Text style={[s.tableCell, { flex: 1, fontWeight: "600", color: "#111827" }]}>
                                {row.numberOfOrders}
                            </Text>
                            <Text style={[s.tableCell, { flex: 1.6, fontWeight: "600", color: "#059669" }]}>
                                {formatVND(row.totalAmount)}
                            </Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    }
})

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    headerSection: {
        marginBottom: 14,
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#0f172a",
        letterSpacing: -0.4,
    },
    pageSubtitle: {
        fontSize: 12,
        color: "#94a3b8",
        marginTop: 2,
    },
    filterCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    filterRow: {
        flexDirection: "row",
        gap: 8,
        alignItems: "flex-end",
    },
    refreshWrap: {
        flexDirection: "column",
    },
    refreshLabel: {
        fontSize: 12,
        marginBottom: 6,
    },
    refreshBtn: {
        height: 40,
        width: 48,
        backgroundColor: "#0f172a",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    errorBox: {
        marginTop: 10,
        backgroundColor: "#fef2f2",
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: "#fecaca",
    },
    errorText: {
        color: "#dc2626",
        fontSize: 12,
    },
    statsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 14,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    statTop: {
        alignItems: "flex-end",
        marginBottom: 8,
    },
    statIcon: {
        padding: 8,
        borderRadius: 10,
    },
    statLabel: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: "500",
    },
    statValue: {
        fontSize: 22,
        fontWeight: "800",
        color: "#0f172a",
        marginTop: 4,
        letterSpacing: -0.5,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 14,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#374151",
        marginBottom: 12,
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    tableRowEven: {
        backgroundColor: "#f8fafc",
    },
    tableHead: {
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    tableCell: {
        fontSize: 12,
        paddingHorizontal: 4,
    },
    headCell: {
        color: "#64748b",
        fontWeight: "600",
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },
    emptyText: {
        textAlign: "center",
        color: "#94a3b8",
        fontSize: 13,
        paddingVertical: 24,
    },
});

const chart = StyleSheet.create({
    wrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
        height: 140,
        gap: 4,
    },
    barCol: {
        flex: 1,
        alignItems: "center",
        height: "100%",
        justifyContent: "flex-end",
    },
    barTrack: {
        flex: 1,
        width: "100%",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    bar: {
        width: "70%",
        borderRadius: 5,
        minHeight: 4,
    },
    label: {
        fontSize: 9,
        color: "#94a3b8",
        marginTop: 4,
        textAlign: "center",
    },
    empty: {
        height: 100,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        color: "#94a3b8",
        fontSize: 13,
    },
});

const picker = StyleSheet.create({
    wrap: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        fontWeight: "600",
        color: "#475569",
        marginBottom: 6,
    },
    btn: {
        height: 40,
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 10,
        paddingHorizontal: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
    },
    btnText: {
        fontSize: 13,
        color: "#0f172a",
    },
    dropdown: {
        position: "absolute",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 16,
    },
    option: {
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    optionActive: {
        backgroundColor: "#f0f9ff",
    },
    optionText: {
        fontSize: 13,
        color: "#374151",
    },
    optionTextActive: {
        color: GREEN,
        fontWeight: "700",
    },
});