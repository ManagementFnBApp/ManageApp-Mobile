import { Category, getCategories, Product } from "@/apis/ProductsAPI";
import { getShopProducts } from "@/apis/ShopProductsAPI";
import { useCartStore } from "@/store/cartStore";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { History, Menu } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import ProductsList from "./Products/ProductsList";

const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || "#2596BE";

export default function OrderPage() {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState<Category>(
        {
            id: 0,
            categoryName: 'All',
            isActive: true
        }
    );
    const [search, setSearch] = useState("");

    const cart = useCartStore((s) => s.cart);
    const setCart = useCartStore((s) => s.setCart);

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const filtered = products.filter(p => {
        const matchCat = activeCategory.categoryName === "All" || p.categoryId === activeCategory.id;
        const matchSearch = p.productName.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    // const filtered = products.filter(item => {
    //     const matchCategory = activeCategory === 'All' || item.categoryId === activeCategory;
    //     const matchSearch = item.productName.toLowerCase().includes(search.toLowerCase());
    //     return matchCategory && matchSearch;
    // });

    useEffect(() => {
        const fetchProducts = async () => {
            const allProducts = await getShopProducts()
            setProducts(allProducts)
        }
        const fetchCategories = async () => {
            const allCategories = await getCategories()
            setCategories(allCategories)
        }
        fetchProducts()
        fetchCategories()
    }, [])

    const updateCart = (id: string, delta: number) => {
        const next = Math.max(0, (cart[id] || 0) + delta);
        const { [id]: _, ...rest } = cart;
        setCart(next === 0 ? rest : { ...rest, [id]: next });
    };

    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
    const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
        const product = products.find((p) => p.productId === Number(id));
        return sum + (product?.listPrice || 0) * qty;
    }, 0);

    // Pair products into rows of 2
    const rows: Product[][] = [];
    for (let i = 0; i < filtered.length; i += 2) {
        rows.push(filtered.slice(i, i + 2));
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.page}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Menu />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Order</Text>
                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => router.push('/Orders/OrdersHistory')}
                    >
                        <History />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <Feather name="search" size={16} color="#aaa" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products..."
                        placeholderTextColor="#aaa"
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Feather name="x" size={16} color="#aaa" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Category Pills — fixed, never moves */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                    contentContainerStyle={styles.categoryContent}
                >
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.pill, activeCategory === cat && styles.pillActive]}
                            onPress={() => setActiveCategory(cat)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.pillText, activeCategory === cat && styles.pillTextActive]}>
                                {cat.categoryName}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Product Grid */}
                <View style={styles.list}>
                    <ProductsList rows={rows} cart={cart} updateCart={updateCart} />
                </View>

                {/* Bottom Bar */}
                {totalItems > 0 && (
                    <View style={styles.bottomBar}>
                        <View>
                            <Text style={styles.bottomLabel}>Current Order ({totalItems} items)</Text>
                            <Text style={styles.bottomTotal}>{formatPrice(totalPrice)}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.checkoutBtn}
                            onPress={() => router.push('/Orders/Payment')}
                        >
                            <Text style={styles.checkoutText}>Thanh toán →</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const formatPrice = (p: number) => p.toLocaleString("vi-VN") + "đ";

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#f3f4f6",
    },
    page: {
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
    headerTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 4,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        padding: 0,
    },
    iconBtn: {
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
    categoryScroll: {
        flexGrow: 0,     // prevent ScrollView from expanding vertically
        marginTop: 10,
        marginBottom: 4,
    },
    categoryContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    pill: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e8eaed',
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pillActive: {
        backgroundColor: GREEN,
        borderColor: GREEN,
    },
    pillText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#555',
    },
    pillTextActive: {
        color: '#fff',
    },
    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: -3 },
        elevation: 10,
    },
    bottomLabel: {
        fontSize: 12,
        color: "#6b7280",
    },
    bottomTotal: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
        marginTop: 2,
    },
    checkoutBtn: {
        backgroundColor: GREEN,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 22,
    },
    checkoutText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
    },
    list: {
        flex: 1
    }
});