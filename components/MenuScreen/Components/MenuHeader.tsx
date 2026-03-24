import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MenuHeader({ editMode, title }: { editMode: boolean, title: string }) {
    const router = useRouter();
    return (
        <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/Menu')} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={22} color="#111" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
                {editMode ? 'Edit Menu Item' : 'Add New Menu Item'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 56 : 20,
        paddingBottom: 14,
        backgroundColor: '#f7f8fa',
    },
    backBtn: {
        marginRight: 12,
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
    },
})