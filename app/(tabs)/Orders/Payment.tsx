import { getAllProducts, MenuItem } from "@/apis/ProductsAPI";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type CartItem = {
    product: MenuItem,
    qty: number;
};

const TAX_RATE = 0.1;

const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || "#2596BE";

export default function Payment() {
    const router = useRouter()

    const cart = useCartStore((s) => s.cart);
    const setCart = useCartStore((s) => s.setCart);

    const [items, setItems] = useState<CartItem[]>([]);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        const fetchAllProducts = async () => {
            const allProducts = await getAllProducts();
            if (!allProducts) return;

            const cartItems: CartItem[] = Object.entries(cart)
                .map(([id, qty]) => {
                    const product = allProducts.find((p) => p.PDid === id);
                    if (!product) return null;
                    return { product, qty };
                })
                .filter((item): item is CartItem => item !== null);

            setItems(cartItems);
        };

        fetchAllProducts();
    }, [cart]);

    const updateQty = (id: string, delta: number) => {
        const next = Math.max(0, (cart[id] || 0) + delta);
        const { [id]: _, ...rest } = cart;
        setCart(next === 0 ? rest : { ...rest, [id]: next });
    };

    const clearCart = () => {
        setCart({});
        router.push('/Orders')
    };

    const subtotal = items.reduce((sum, i) => sum + i.product.PDprice * i.qty, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    const totalItems = items.reduce((sum, i) => sum + i.qty, 0);

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
                <Text style={styles.headerTitle}>Current Order</Text>
                <View style={{ width: 32 }} />
            </View>

            <FlatList
                data={items}
                keyExtractor={(item) => item.product.PDid}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                ListHeaderComponent={
                    <>
                        {/* Selected Items Header */}
                        <View style={styles.sectionRow}>
                            <Text style={styles.sectionTitle}>Selected Items</Text>
                            <Text style={styles.itemCount}>{totalItems} Items</Text>
                        </View>
                    </>
                }
                renderItem={({ item }) => (
                    <View style={styles.itemCard}>
                        <Image source={{ uri: item.product.PDimage }} style={styles.itemImg} />
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.product.PDname}</Text>
                            <Text style={styles.itemPrice}>${item.product.PDprice.toFixed(2)}</Text>
                        </View>
                        <View style={styles.qtyRow}>
                            <TouchableOpacity
                                onPress={() => updateQty(item.product.PDid, -1)}
                                style={styles.qtyBtn}
                            >
                                <Text style={styles.qtyBtnText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.qtyNum}>{item.qty}</Text>
                            <TouchableOpacity
                                onPress={() => updateQty(item.product.PDid, 1)}
                                style={[styles.qtyBtn, styles.qtyBtnActive]}
                            >
                                <Text style={[styles.qtyBtnText, styles.qtyBtnTextActive]}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListFooterComponent={
                    <>
                        {/* Order Notes */}
                        <Text style={styles.sectionTitle}>Order Notes</Text>
                        <View style={styles.notesWrapper}>
                            <TextInput
                                style={styles.notesInput}
                                placeholder="Add special instructions (e.g., allergies, seat number)..."
                                placeholderTextColor="#9ca3af"
                                multiline
                                numberOfLines={4}
                                value={notes}
                                onChangeText={setNotes}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Bill Details */}
                        <Text style={styles.sectionTitle}>Bill Details</Text>
                        <View style={styles.billCard}>
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Subtotal</Text>
                                <Text style={styles.billValue}>${subtotal.toFixed(2)}</Text>
                            </View>
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Tax (VAT 10%)</Text>
                                <Text style={styles.billValue}>${tax.toFixed(2)}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.billRow}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                            </View>
                        </View>

                        <View style={{ height: 100 }} />
                    </>
                }
            />

            {/* Proceed to Payment */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.payBtn}
                    activeOpacity={0.85}
                    onPress={() => clearCart()}
                >
                    <Text style={styles.payIcon}>💳</Text>
                    <Text style={styles.payText}>Proceed to Payment</Text>
                </TouchableOpacity>
            </View>
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
        width: 32,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    sectionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        marginTop: 16,
        marginBottom: 10,
    },
    itemCount: {
        fontSize: 13,
        fontWeight: "600",
        color: GREEN,
        marginBottom: 4,
    },
    itemCard: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    itemImg: {
        width: 56,
        height: 56,
        borderRadius: 10,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 13,
        color: "#6b7280",
    },
    qtyRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#f3f4f6",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: "#e5e7eb",
        alignItems: "center",
        justifyContent: "center",
    },
    qtyBtnActive: {
        backgroundColor: GREEN,
    },
    qtyBtnText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#6b7280",
        lineHeight: 20,
    },
    qtyBtnTextActive: {
        color: "#fff",
    },
    qtyNum: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
        minWidth: 16,
        textAlign: "center",
    },
    notesWrapper: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 14,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    notesInput: {
        fontSize: 14,
        color: "#111827",
        minHeight: 90,
    },
    billCard: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        gap: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    billRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    billLabel: {
        fontSize: 14,
        color: "#6b7280",
    },
    billValue: {
        fontSize: 14,
        fontWeight: "500",
        color: "#111827",
    },
    divider: {
        height: 1,
        backgroundColor: "#f3f4f6",
    },
    totalLabel: {
        fontSize: 15,
        fontWeight: "700",
        color: "#111827",
    },
    totalValue: {
        fontSize: 16,
        fontWeight: "700",
        color: GREEN,
    },
    footer: {
        position: "absolute",
        bottom: 12,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: "#f3f4f6",
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },
    payBtn: {
        backgroundColor: GREEN,
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        shadowColor: GREEN,
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    payIcon: {
        fontSize: 18,
    },
    payText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
});