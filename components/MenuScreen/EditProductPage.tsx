import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { ShopCategoryItem, getShopCategories } from '@/apis/ShopCategoriesAPI';
import {
    createShopProduct,
    deleteShopProduct,
    updateShopProduct,
} from '@/apis/ShopProductsAPI';
import MenuHeader from './Components/MenuHeader';

const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || '#35d07f';

export type DetailProductParams = {
    PDid?: string;
    PDname?: string;
    PDprice?: number;
    PDcategory?: string;
    PDdescription?: string;
    PDinStock?: boolean;
    PDcategoryOpen?: boolean;
    PDimage?: string;
};

type ImageFile = {
    uri: string;
    name: string;
    type: string;
};

export default function DetailProductPage({
    PDid,
    PDname,
    PDprice,
    PDcategory,
    PDdescription,
    PDinStock,
    PDcategoryOpen,
    PDimage,
}: DetailProductParams) {
    const router = useRouter();

    const [name, setName] = useState(PDname || '');
    const [price, setPrice] = useState(PDprice ? PDprice.toString() : '');
    const [category, setCategory] = useState(PDcategory || '');
    const [description, setDescription] = useState(PDdescription || '');
    const [inStock, setInStock] = useState(PDinStock ?? false);
    const [categoryOpen, setCategoryOpen] = useState(PDcategoryOpen ?? false);
    const [imageFile, setImageFile] = useState<ImageFile | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(PDimage || null);
    const [loading, setLoading] = useState(false);

    const [editMode, setEditMode] = useState(!!PDid);
    const [allCategories, setAllCategories] = useState<ShopCategoryItem[]>([]);

    useEffect(() => {
        getShopCategories()
            .then(setAllCategories)
            .catch((err) => console.error('Failed to load categories:', err));
    }, []);

    useEffect(() => {
        setName(PDname || '');
        setPrice(PDprice ? PDprice.toString() : '');
        setCategory(PDcategory || '');
        setDescription(PDdescription || '');
        setInStock(PDinStock ?? false);
        setCategoryOpen(PDcategoryOpen ?? false);
        setImageFile(null);
        setImagePreview(PDimage || null);
        setEditMode(!!PDid);
    }, [PDid, PDname, PDprice, PDcategory, PDdescription, PDinStock, PDcategoryOpen, PDimage]);

    // ===== IMAGE PICKER =====

    const handleUploadImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission required', 'Please allow access to your photo library.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled && result.assets.length > 0) {
            const asset = result.assets[0];
            const ext = asset.uri.split('.').pop() ?? 'jpg';
            setImageFile({
                uri: asset.uri,
                name: asset.fileName ?? `photo_${Date.now()}.${ext}`,
                type: asset.mimeType ?? `image/${ext}`,
            });
            setImagePreview(asset.uri);
        }
    };

    // ===== VALIDATION =====

    const validate = (): boolean => {
        if (!name.trim()) {
            Alert.alert('Validation', 'Please enter an item name');
            return false;
        }
        if (!price.trim() || isNaN(Number(price))) {
            Alert.alert('Validation', 'Please enter a valid price');
            return false;
        }
        if (!category) {
            Alert.alert('Validation', 'Please select a category');
            return false;
        }
        return true;
    };

    const getCategoryId = (): number => {
        const found = allCategories.find((c) => c.name === category);
        return found?.id ?? 0;
    };

    // ===== HANDLERS =====

    const handleSave = async () => {
        if (!validate()) return;
        if (!imageFile) {
            Alert.alert('Validation', 'Please select an image for the product');
            return;
        }
        const categoryId = getCategoryId();
        if (!categoryId) {
            Alert.alert('Validation', 'Selected category is invalid');
            return;
        }
        setLoading(true);
        try {
            await createShopProduct({
                productName: name.trim(),
                categoryId,
                image: imageFile,
                listPrice: Number(price),
                importPrice: Number(price), // importPrice not exposed in UI — default to listPrice
                description: description.trim() || undefined,
                isActive: inStock,
            });
            Alert.alert('Success', 'Product created successfully');
            router.back();
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!validate()) return;
        const productId = Number(PDid);
        if (!productId) {
            Alert.alert('Error', 'Invalid product ID');
            return;
        }
        const categoryId = getCategoryId();
        if (!categoryId) {
            Alert.alert('Validation', 'Selected category is invalid');
            return;
        }
        setLoading(true);
        try {
            await updateShopProduct(productId, {
                productName: name.trim(),
                categoryId,
                image: imageFile ?? undefined, // only send if user picked a new image
                listPrice: Number(price),
                importPrice: Number(price),
                description: description.trim() || undefined,
                isActive: inStock,
            });
            Alert.alert('Success', 'Product updated successfully');
            router.back();
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Item',
            'Are you sure you want to delete this item? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const productId = Number(PDid);
                        if (!productId) return;
                        setLoading(true);
                        try {
                            await deleteShopProduct(productId);
                            router.back();
                        } catch (err: any) {
                            Alert.alert('Error', err?.message ?? 'Failed to delete product');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleAddCategory = () => {
        Alert.alert('Add Category', 'Category creation coming soon');
    };

    // ===== RENDER =====

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <MenuHeader editMode={editMode} />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Image Upload */}
                <TouchableOpacity style={styles.imageUpload} onPress={handleUploadImage} activeOpacity={0.8}>
                    {imagePreview ? (
                        <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Feather name="camera" size={28} color="#bbb" />
                            <Text style={styles.imagePlaceholderText}>Tap to upload image</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Item Name */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Item Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Signature Phở Special"
                        placeholderTextColor="#bbb"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                {/* Price */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Price</Text>
                    <View style={styles.priceWrapper}>
                        <TextInput
                            style={styles.priceInput}
                            placeholder="0"
                            placeholderTextColor="#bbb"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                        />
                        <Text style={styles.currency}>VND</Text>
                    </View>
                </View>

                {/* Category */}
                <View style={styles.fieldGroup}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Category</Text>
                        <TouchableOpacity style={styles.addCategoryBtn} onPress={handleAddCategory}>
                            <Ionicons name="add-circle" size={14} color={GREEN} />
                            <Text style={styles.addCategoryText}>Add New Category</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.dropdown}
                        onPress={() => setCategoryOpen((o) => !o)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.dropdownText, !category && { color: '#bbb' }]}>
                            {category || 'Select a category'}
                        </Text>
                        <Feather name={categoryOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#888" />
                    </TouchableOpacity>

                    {categoryOpen && (
                        <View style={styles.dropdownList}>
                            {allCategories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.dropdownItem, category === cat.name && styles.dropdownItemActive]}
                                    onPress={() => { setCategory(cat.name); setCategoryOpen(false); }}
                                >
                                    <Text style={[styles.dropdownItemText, category === cat.name && styles.dropdownItemTextActive]}>
                                        {cat.name}
                                    </Text>
                                    {category === cat.name && <Feather name="check" size={14} color={GREEN} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Description */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={styles.textarea}
                        placeholder="Briefly describe the ingredients or taste profile..."
                        placeholderTextColor="#bbb"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                {/* In Stock Toggle */}
                <View style={styles.toggleRow}>
                    <View style={styles.toggleIcon}>
                        <MaterialIcons name="inventory" size={20} color={GREEN} />
                    </View>
                    <View style={styles.toggleLabels}>
                        <Text style={styles.toggleTitle}>Available / In Stock</Text>
                        <Text style={styles.toggleSubtitle}>Item will be visible on the menu</Text>
                    </View>
                    <Switch
                        value={inStock}
                        onValueChange={setInStock}
                        trackColor={{ false: '#e0e0e0', true: GREEN }}
                        thumbColor="#fff"
                    />
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                {editMode ? (
                    <>
                        <TouchableOpacity
                            style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
                            onPress={handleUpdate}
                            activeOpacity={0.85}
                            disabled={loading}
                        >
                            <Feather name="save" size={18} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.primaryBtnText}>
                                {loading ? 'Updating...' : 'Update Item'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.deleteBtn, loading && { opacity: 0.6 }]}
                            onPress={handleDelete}
                            activeOpacity={0.85}
                            disabled={loading}
                        >
                            <MaterialIcons name="delete-outline" size={18} color="#e74c3c" style={{ marginRight: 8 }} />
                            <Text style={styles.deleteBtnText}>Delete Item</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
                        onPress={handleSave}
                        activeOpacity={0.85}
                        disabled={loading}
                    >
                        <Feather name="save" size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.primaryBtnText}>
                            {loading ? 'Saving...' : 'Save Item'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#f7f8fa',
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    imageUpload: {
        marginVertical: 16,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e4e7ec',
        backgroundColor: '#fff',
        height: 180,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    imagePlaceholderText: {
        fontSize: 13,
        color: '#bbb',
    },
    fieldGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    addCategoryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    addCategoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: GREEN,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e4e7ec',
        paddingHorizontal: 14,
        paddingVertical: 13,
        fontSize: 14,
        color: '#111',
    },
    priceWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e4e7ec',
        paddingHorizontal: 14,
    },
    priceInput: {
        flex: 1,
        fontSize: 14,
        color: '#111',
        paddingVertical: 13,
    },
    currency: {
        fontSize: 13,
        fontWeight: '600',
        color: '#888',
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e4e7ec',
        paddingHorizontal: 14,
        paddingVertical: 13,
    },
    dropdownText: {
        fontSize: 14,
        color: '#111',
    },
    dropdownList: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e4e7ec',
        marginTop: 4,
        overflow: 'hidden',
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f3f5',
    },
    dropdownItemActive: {
        backgroundColor: '#f0fdf6',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#333',
    },
    dropdownItemTextActive: {
        color: GREEN,
        fontWeight: '600',
    },
    textarea: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e4e7ec',
        paddingHorizontal: 14,
        paddingVertical: 13,
        fontSize: 14,
        color: '#111',
        minHeight: 100,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: '#e4e7ec',
        gap: 12,
        marginBottom: 8,
    },
    toggleIcon: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: '#f0fdf6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleLabels: {
        flex: 1,
    },
    toggleTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
    },
    toggleSubtitle: {
        fontSize: 11,
        color: '#aaa',
        marginTop: 2,
    },
    footer: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#f7f8fa',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        gap: 10,
        marginBottom: 24,
    },
    primaryBtn: {
        backgroundColor: GREEN,
        borderRadius: 14,
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: GREEN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    deleteBtn: {
        borderRadius: 14,
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#e74c3c',
        backgroundColor: '#fff',
    },
    deleteBtnText: {
        color: '#e74c3c',
        fontSize: 15,
        fontWeight: '700',
    },
});