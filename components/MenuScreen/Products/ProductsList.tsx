import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Product } from '@/apis/ProductsAPI';
import ProductCard from './ProductCard';

interface ProductsListProps {
    items: Product[];
}

export default function ProductsList({ items }: ProductsListProps) {
    return (
        <FlatList
            data={items}
            keyExtractor={item => String(item.productId)}
            numColumns={2}
            renderItem={({ item, index }) => (
                <ProductCard item={item} index={index} />
            )}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <View style={styles.emptyState}>
                    <Feather name="coffee" size={40} color="#ccc" />
                    <Text style={styles.emptyText}>No products found</Text>
                </View>
            }
        />
        
    );
}

const styles = StyleSheet.create({
    grid: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    row: {
        justifyContent: 'flex-start',
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
        gap: 12,
    },
    emptyText: {
        color: '#bbb',
        fontSize: 15,
        fontWeight: '500',
    },
});