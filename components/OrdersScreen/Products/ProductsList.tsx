import { MenuItem } from "@/apis/ProductsAPI";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || '#35d07f';

type Props = {
    rows: MenuItem[][],
    cart: Record<string, number>,
    updateCart: (id: string, qty: number) => void
}

export default function ProductsList({rows, cart, updateCart}: Props) {
    return (
        <FlatList
            data={rows}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: row }) => (
                <View style={styles.row}>
                    {row.map((product: MenuItem) => {
                        const qty = cart[product.PDid] || 0;
                        return (
                            <View key={product.PDid} style={styles.card}>
                                <Image source={{ uri: product.PDimage }} style={styles.cardImg} />
                                <Text style={styles.cardName}>{product.PDname}</Text>
                                <Text style={styles.cardPrice}>{formatPrice(product.PDprice)}</Text>
                                <View style={styles.cardFooter}>
                                    {qty > 0 ? (
                                        <View style={styles.qtyRow}>
                                            <TouchableOpacity
                                                onPress={() => updateCart(product.PDid, -1)}
                                                style={styles.qtyBtn}
                                            >
                                                <Text style={styles.qtyBtnText}>−</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.qtyNum}>{qty}</Text>
                                            <TouchableOpacity
                                                onPress={() => updateCart(product.PDid, 1)}
                                                style={styles.qtyBtn}
                                            >
                                                <Text style={styles.qtyBtnText}>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => updateCart(product.PDid, 1)}
                                            style={styles.addBtn}
                                        >
                                            <Text style={styles.addBtnText}>+</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                    {/* Fill empty slot if odd number */}
                    {row.length === 1 && <View style={styles.cardEmpty} />}
                </View>
            )}
        />
    )
}

const formatPrice = (p: number) => p.toLocaleString("vi-VN") + ".000 VND";

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 14,
    },
    row: {
        flexDirection: "row",
        gap: 14,
        marginBottom: 14,
    },
    card: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 14,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardEmpty: {
        flex: 1,
    },
    cardImg: {
        width: "100%",
        height: 120,
    },
    cardName: {
        marginTop: 10,
        marginHorizontal: 12,
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
    },
    cardPrice: {
        marginHorizontal: 12,
        marginTop: 2,
        marginBottom: 10,
        fontWeight: '700',
        fontSize: 13,
        color: GREEN,
    },
    cardFooter: {
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
    qtyRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#eff6ff",
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    qtyBtn: {
        backgroundColor: GREEN,
        width: 26,
        height: 26,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
    },
    qtyBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        lineHeight: 20,
    },
    qtyNum: {
        color: GREEN,
        fontSize: 14,
        fontWeight: "600",
    },
    addBtn: {
        backgroundColor: GREEN,
        borderRadius: 8,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    addBtnText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        lineHeight: 24,
    },
});