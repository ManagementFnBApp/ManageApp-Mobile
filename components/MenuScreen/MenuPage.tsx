import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ClipboardPlus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { getAllCategories, getAllProducts, MenuItem } from '@/apis/ProductsAPI';
import ProductsList from './Products/ProductsList';

const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || '#35d07f';

export default function MenuPage() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const [ categories, setCategories ] = useState<string[]>(['All']);
    const [products, setProducts] = useState<MenuItem[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchProducts = async () => {
            const allProducts = await getAllProducts()
            setProducts(allProducts)
        }
        const fetchCategories = async () => {
            const allCategories = await getAllCategories()
            setCategories(allCategories)
        }
        fetchProducts()
        fetchCategories()
    }, [])

    const filtered = products.filter(item => {
        const matchCategory = activeCategory === 'All' || item.PDcategory.trim() === activeCategory;
        const matchSearch = item.PDname.toLowerCase().includes(search.toLowerCase());
        return matchCategory && matchSearch;
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f7f8fa" />

            {/* Search Bar — fixed, never moves */}
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
                        key={cat}
                        style={[styles.pill, activeCategory === cat && styles.pillActive]}
                        onPress={() => setActiveCategory(cat)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.pillText, activeCategory === cat && styles.pillTextActive]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Product Grid — fills remaining space */}
            <View style={styles.list}>
                <ProductsList items={filtered} />
            </View>

            {/* FAB */}
            <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => router.push('/Menu/detailProduct')}>
                <ClipboardPlus size={28} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f8fa',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 12,
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
    list: {
        flex: 1,   // fills remaining space below pills, never overlaps them
    },
    fab: {
        position: 'absolute',
        bottom: 28,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: GREEN,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: GREEN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
});