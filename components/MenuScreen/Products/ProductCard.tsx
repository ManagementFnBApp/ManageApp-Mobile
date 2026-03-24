import { Product } from '@/apis/ProductsAPI';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || '#2596BE';

interface ProductCardProps {
    item: Product;
    index: number;
}

export default function ProductCard({ item, index }: ProductCardProps) {
    const router = useRouter();

    const handlePress = () => {
        router.push({
            pathname: '/Menu/detailProduct',
            params: {
                // ✅ Required params (from your DetailProductPage props)
                PDid: item.productId.toString(),
                PDname: item.productName,
                PDbarcode: item.barcode || '',
                PDprice: item.listPrice,

                // ✅ Additional fields for full edit support
                PDcategory: item.categoryId || '', // Category name for dropdown
                PDdescription: item.description || '',
                PDisActive: (item.isActive).toString() || '',
                PDimage: item.image || '',

                // ✅ Extra for UX (optional)
                PDcategoryId: item.categoryId.toString(),
                PDimportPrice: item.importPrice,
                PDlistPrice: item.listPrice,
                PDmeasureUnit: item.measureUnit || 'ly',
            },
        });
    };

    const inStock = item.isActive;

    return (
        <TouchableOpacity
            style={[styles.card, index % 2 === 0 ? { marginRight: 8 } : { marginLeft: 8 }]}
            onPress={handlePress}
            activeOpacity={0.85}
        >
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.image}
                />
                {!inStock && (
                    <View style={styles.overlay}>
                        <Text style={styles.overlayText}>SOLD OUT</Text>
                    </View>
                )}
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.productName}</Text>
                <Text style={styles.price}>{item.listPrice} VND</Text>
                <View style={styles.stockRow}>
                    <View style={[styles.dot, { backgroundColor: inStock ? GREEN : '#e74c3c' }]} />
                    <Text style={[styles.stockText, { color: inStock ? GREEN : '#e74c3c' }]}>
                        {inStock ? 'IS ACTIVE' : 'DE-ACTIVE'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        maxWidth: '50%',
        backgroundColor: '#fff',
        borderRadius: 14,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 2,
    },
    imageWrapper: {
        width: '100%',
        height: 130,
        backgroundColor: '#eee',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 13,
        letterSpacing: 1,
    },
    info: {
        padding: 10,
    },
    name: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111',
        marginBottom: 3,
    },
    price: {
        fontSize: 13,
        fontWeight: '700',
        color: GREEN,
        marginBottom: 5,
    },
    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    stockText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});