import { MenuItem } from '@/apis/ProductsAPI';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || '#35d07f';

interface ProductCardProps {
    item: MenuItem;
    index: number;
}

export default function ProductCard({ item, index }: ProductCardProps) {
    const router = useRouter();

    const handlePress = () => {
        router.push({
            pathname: '/Menu/detailProduct',
            params: {
                PDid: item.PDid,
                PDname: item.PDname,
                PDprice: item.PDprice,
                PDdescription: item.PDdescription || '',
                PDcategory: item.PDcategory,
                PDinStock: String(item.PDinStock),
                PDcategoryOpen: String(item.PDcategoryOpen || false), // default to false if undefined
            },
        });
    };

    return (
        <TouchableOpacity
            style={[styles.card, index % 2 === 0 ? { marginRight: 8 } : { marginLeft: 8 }]}
            onPress={handlePress}
            activeOpacity={0.85}
        >
            <View style={styles.imageWrapper}>
                <Image source={{ uri: item.PDimage }} style={styles.image} />
                {!item.PDinStock && (
                    <View style={styles.overlay}>
                        <Text style={styles.overlayText}>SOLD OUT</Text>
                    </View>
                )}
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.PDname}</Text>
                <Text style={styles.price}>{item.PDprice}.000 VND</Text>
                <View style={styles.stockRow}>
                    <View style={[styles.dot, { backgroundColor: item.PDinStock ? GREEN : '#e74c3c' }]} />
                    <Text style={[styles.stockText, { color: item.PDinStock ? GREEN : '#e74c3c' }]}>
                        {item.PDinStock ? 'IN STOCK' : 'SOLD OUT'}
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