import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || "#35d07f";

interface ErrorPopupProps {
    message: string | null;
    onDismiss: () => void;
    autoDismissMs?: number; // optional: auto-dismiss after N ms
}

export default function ErrorPopup({ message, onDismiss, autoDismissMs }: ErrorPopupProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
        if (message) {
            // Animate in
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto-dismiss
            if (autoDismissMs) {
                const timer = setTimeout(() => handleDismiss(), autoDismissMs);
                return () => clearTimeout(timer);
            }
        }
    }, [message]);

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -20,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => onDismiss());
    };

    if (!message) return null;

    return (
        <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
            <View style={styles.iconWrapper}>
                <FontAwesome name="exclamation-circle" size={20} color="#ff4d4d" />
            </View>
            <Text style={styles.message} numberOfLines={3}>{message}</Text>
            <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
                <FontAwesome name="times" size={16} color="#888" />
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 40,
        left: 20,
        right: 20,
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a1a1a',
        borderLeftWidth: 4,
        borderLeftColor: '#ff4d4d',
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginHorizontal: 30,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    iconWrapper: {
        marginRight: 12,
    },
    message: {
        flex: 1,
        color: '#ffcccc',
        fontSize: 14,
        lineHeight: 20,
    },
    closeButton: {
        marginLeft: 10,
        padding: 4,
    },
});