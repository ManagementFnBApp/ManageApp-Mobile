import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function ImageUpload({ handleUploadImage }: { handleUploadImage: () => void }) {
    return (
        <TouchableOpacity style={styles.imageUpload} onPress={handleUploadImage} activeOpacity={0.7}>
            <Feather name="camera" size={32} color="#bbb" />
            <Text style={styles.imageUploadText}>Tap to upload item image</Text>
            <Text style={styles.imageUploadHint}>Recommended: 1200 × 800px</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    imageUpload: {
        borderWidth: 1.5,
        borderColor: '#dde0e5',
        borderStyle: 'dashed',
        borderRadius: 14,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        marginBottom: 20,
        gap: 6,
    },
    imageUploadText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#888',
        marginTop: 4,
    },
    imageUploadHint: {
        fontSize: 11,
        color: '#bbb',
    },
});