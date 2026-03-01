import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ClipboardPlus } from 'lucide-react-native';
import React, { useState } from 'react';
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

import { MenuItem } from './Products/ProductCard';
import ProductsList from './Products/ProductsList';

const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || '#35d07f';

const CATEGORIES = ['All', 'Coffee', 'Juice', 'Soft Drink', 'Tea', 'Snack'];

const MENU_ITEMS: MenuItem[] = [
    { PDid: '1', PDdescription: 'A strong and bold coffee', PDname: 'Espresso', PDprice: 25, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&q=80' },
    { PDid: '2', PDdescription: 'A creamy and smooth coffee with milk', PDname: 'Milk Coffee', PDprice: 29, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80' },
    { PDid: '3', PDdescription: 'A simple black coffee without milk or sugar', PDname: 'Black Coffee', PDprice: 20, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80' },
    { PDid: '4', PDdescription: 'A creamy coffee with steamed milk and foam on top', PDname: 'Latte', PDprice: 35, PDinStock: false, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&q=80' },
    { PDid: '5', PDdescription: 'A coffee with steamed milk and a layer of foam on top of it', PDname: 'Cappuccino', PDprice: 35, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&q=80' },
    { PDid: '6', PDdescription: 'A chocolate-flavored coffee drink made with espresso and steamed milk and topped with whipped cream.', PDname: 'Mocha', PDprice: 39, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&q=80' },
    { PDid: '7', PDdescription: 'Freshly squeezed orange juice', PDname: 'Orange Juice', PDprice: 25, PDinStock: true, PDcategory: 'Juice', PDimage: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80' },
    { PDid: '8', PDdescription: 'A refreshing carbonated soft drink', PDname: 'Coca Cola', PDprice: 15, PDinStock: true, PDcategory: 'Soft Drink', PDimage: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80' },
    { PDid: '9', PDdescription: 'A hot beverage made from steeping tea leaves in boiling water', PDname: 'Green Tea', PDprice: 20, PDinStock: true, PDcategory: 'Tea', PDimage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80' },
    { PDid: '10', PDdescription: 'A light and crispy snack, perfect for sharing', PDname: 'French Fries', PDprice: 30, PDinStock: false, PDcategory: 'Snack', PDimage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80' },
    { PDid: '11', PDdescription: 'A sweet and fluffy pastry filled with cream', PDname: 'Cream Puff', PDprice: 22, PDinStock: true, PDcategory: 'Snack', PDimage: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80' },
];

export default function MenuPage() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const router = useRouter();

    const filtered = MENU_ITEMS.filter(item => {
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
                {CATEGORIES.map(cat => (
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