import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

import { Category, getCategories } from '@/apis/ProductsAPI';
import {
    createShopProduct,
    deleteShopProduct,
    updateShopProduct,
} from '@/apis/ShopProductsAPI';
import MenuHeader from './Components/MenuHeader';

const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || '#2596BE';

export type DetailProductParams = {
    // Core (required)
    PDid?: string;
    PDname?: string;
    PDbarcode?: string;
    PDprice?: number;

    // ✅ New from handlePress
    PDimportPrice?: number;
    PDlistPrice?: number;
    PDcategory?: string;
    PDcategoryId?: string;
    PDdescription?: string;
    PDinStock?: boolean;
    PDimage?: string;
    PDmeasureUnit?: string;
    PDisActive?: boolean;
};

type ImageFile = {
    uri: string;
    name: string;
    type: string;
};

type FormError = string | null;

export default function DetailProductPage({
    PDid,
    PDname,
    PDbarcode,
    PDimportPrice,
    PDlistPrice,
    PDcategory,
    PDdescription,
    PDinStock,
    PDisActive,
    PDimage,
}: DetailProductParams) {
    const router = useRouter();

    // Form state
    const [name, setName] = useState(PDname || '');
    const [barcode, setBarcode] = useState(PDbarcode || '');
    const [price, setPrice] = useState(PDlistPrice ? PDlistPrice.toString() : '');
    const [importPrice, setImportPrice] = useState(PDimportPrice ? PDimportPrice.toString() : ''); // Added separate import price
    const [category, setCategory] = useState(PDcategory || '');
    const [description, setDescription] = useState(PDdescription || '');
    const [inStock, setInStock] = useState(PDinStock ?? true);
    const [isActive, setIsActive] = useState(PDisActive ?? true);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [imageFile, setImageFile] = useState<ImageFile | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(PDimage || null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(!!PDid);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [formError, setFormError] = useState<FormError>(null);

    const fetchCategories = useCallback(async () => {
        try {
            const categories = await getCategories();
            setAllCategories(categories);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            Alert.alert('Error', 'Failed to load categories');
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Reset form when params change
    useEffect(() => {
        setName(PDname || '');
        setBarcode(PDbarcode || '');
        setPrice(PDlistPrice ? PDlistPrice.toString() : '');
        setImportPrice(PDimportPrice ? PDimportPrice.toString() : '');
        setCategory(PDcategory || '');
        setDescription(PDdescription || '');
        setIsActive(PDisActive ?? true);
        setImageFile(null);
        setImagePreview(PDimage || null);
        setEditMode(!!PDid);
        setFormError(null);
    }, [PDid, PDname, PDbarcode, PDimportPrice, PDcategory, PDdescription, PDisActive, PDimage]);

    // ===== IMAGE PICKER =====
    const handleUploadImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
            aspect: [1, 1],
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];

            // ✅ PERFECT format for Multer
            const imageFile = {
                uri: asset.uri, // Keep as-is (file:// or content://)
                name: asset.fileName || `product-${Date.now()}.jpg`,
                type: asset.mimeType || 'image/jpeg',
            } as ImageFile;

            console.log('📱 Created imageFile:', imageFile);
            setImageFile(imageFile);
            setImagePreview(asset.uri);
        }
    };

    // ===== VALIDATION =====
    const validate = (): boolean => {
        if (!name.trim()) {
            setFormError('Product name is required');
            return false;
        }
        if (!barcode.trim()) {
            setFormError('Barcode is required');
            return false;
        }
        if (!price.trim() || Number(price) <= 0) {
            setFormError('Selling price must be greater than 0');
            return false;
        }
        if (editMode && !importPrice.trim()) {
            setFormError('Import price is required');
            return false;
        }
        if (!category) {
            setFormError('Please select a category');
            return false;
        }
        if (!editMode && !imageFile) {
            setFormError('Please select a product image');
            return false;
        }
        return true;
    };

    const getCategoryId = useCallback((): number => {
        const found = allCategories.find((c) => c.categoryName === category);
        return found?.id ?? 0;
    }, [allCategories, category]);

    const getApiErrorMessage = useCallback((err: unknown): string => {
        const e = err as { message?: string };
        return e?.message ?? 'Something went wrong. Please try again.';
    }, []);

    // ===== SAVE/UPDATE =====
    const handleSave = async () => {
        if (!validate()) return;

        const categoryId = getCategoryId();
        if (!categoryId) {
            setFormError('Selected category is invalid');
            return;
        }

        if (!imageFile && !editMode) {
            setFormError('Please select an image');
            return;
        }

        setLoading(true);
        setFormError(null);

        try {
            await createShopProduct({
                productName: name.trim(),
                categoryId,
                image: imageFile!,
                barcode: barcode.trim(),
                description: description.trim() || undefined,
                measureUnit: 'ly', // default like web
                importPrice: Number(importPrice || price),
                listPrice: Number(price),
                isActive: Boolean(isActive),
            });

            Alert.alert('Success', 'Product created successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (err: unknown) {
            const errorMsg = getApiErrorMessage(err);
            setFormError(errorMsg);
            Alert.alert('Error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!validate()) return;

        const productId = Number(PDid);
        if (!productId || isNaN(productId)) {
            setFormError('Invalid product ID');
            return;
        }

        setLoading(true);
        setFormError(null);

        try {
            await updateShopProduct(productId, {
                // ✅ All fields with proper handling
                productName: name.trim(),

                // ✅ Image only if new file selected
                ...(imageFile ? { image: imageFile } : {}),

                // ✅ Always send barcode (even if empty)
                barcode: barcode.trim(),

                // ✅ Fixed syntax error + proper null handling
                ...(description.trim() ? { description: description.trim() } : {}),

                // ✅ Prices with safe Number conversion
                importPrice: Number(importPrice) || 0,
                listPrice: Number(price),
            });

            Alert.alert('Success', 'Product updated successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (err: unknown) {
            const errorMsg = getApiErrorMessage(err);
            setFormError(errorMsg);
            Alert.alert('Error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // ===== DELETE =====
    const handleDelete = () => {
        Alert.alert(
            'Delete Product',
            'This action cannot be undone!',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const productId = Number(PDid);
                        if (!productId || isNaN(productId)) return;

                        setLoading(true);
                        console.warn('Deleting:', PDid)
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

    const selectedCategoryId = useMemo(() => getCategoryId(), [getCategoryId]);

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <MenuHeader editMode={editMode} title={editMode ? `Edit: ${PDname}` : 'Add Product'} />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Form Error */}
                {formError && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{formError}</Text>
                    </View>
                )}

                {/* Image Upload */}
                <TouchableOpacity
                    style={styles.imageUpload}
                    onPress={handleUploadImage}
                    activeOpacity={0.8}
                    disabled={loading}
                >
                    {imagePreview ? (
                        <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Feather name="camera" size={28} color="#bbb" />
                            <Text style={styles.imagePlaceholderText}>
                                {editMode ? 'Tap to change image' : 'Tap to upload image'}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Product Name */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Product Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Cà phê sữa đá"
                        value={name}
                        onChangeText={setName}
                        editable={!loading}
                    />
                </View>

                {/* Barcode */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Barcode *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. CF-SUA-DA-001"
                        value={barcode}
                        onChangeText={setBarcode}
                        editable={!loading}
                    />
                </View>

                {/* Prices */}
                <View style={styles.priceSection}>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Import Price</Text>
                        <View style={styles.priceWrapper}>
                            <TextInput
                                style={styles.priceInput}
                                placeholder="0"
                                value={importPrice}
                                onChangeText={setImportPrice}
                                keyboardType="numeric"
                                editable={!loading}
                            />
                            <Text style={styles.currency}>VND</Text>
                        </View>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Selling Price *</Text>
                        <View style={styles.priceWrapper}>
                            <TextInput
                                style={styles.priceInput}
                                placeholder="0"
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                                editable={!loading}
                            />
                            <Text style={styles.currency}>VND</Text>
                        </View>
                    </View>
                </View>

                {/* Category */}
                <View style={styles.fieldGroup}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Category *</Text>
                        <TouchableOpacity
                            style={styles.addCategoryBtn}
                            onPress={() => Alert.alert('Coming soon', 'Category management coming soon')}
                            disabled={loading}
                        >
                            <Ionicons name="add-circle" size={14} color={GREEN} />
                            <Text style={styles.addCategoryText}>Add Category</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.dropdown,
                            !selectedCategoryId && styles.dropdownDisabled
                        ]}
                        onPress={() => !loading && setCategoryOpen((o) => !o)}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        <Text style={[
                            styles.dropdownText,
                            !category && { color: '#bbb' }
                        ]}>
                            {category || 'Select a category'}
                        </Text>
                        <Feather
                            name={categoryOpen ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color="#888"
                        />
                    </TouchableOpacity>

                    {categoryOpen && (
                        <View style={styles.dropdownList}>
                            {allCategories.map((cat) => {
                                const isSelected = category === cat.categoryName;
                                return (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.dropdownItem,
                                            isSelected && styles.dropdownItemActive
                                        ]}
                                        onPress={() => {
                                            setCategory(cat.categoryName);
                                            setCategoryOpen(false);
                                            setFormError(null);
                                        }}
                                        disabled={loading}
                                    >
                                        <Text style={[
                                            styles.dropdownItemText,
                                            isSelected && styles.dropdownItemTextActive
                                        ]}>
                                            {cat.categoryName}
                                        </Text>
                                        {isSelected && <Feather name="check" size={14} color={GREEN} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Description */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={styles.textarea}
                        placeholder="Briefly describe the product..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        editable={!loading}
                    />
                </View>

                {/* In Stock Toggle */}
                <View style={styles.toggleRow}>
                    <View style={styles.toggleIcon}>
                        <MaterialIcons name="inventory" size={20} color={GREEN} />
                    </View>
                    <View style={styles.toggleLabels}>
                        <Text style={styles.toggleTitle}>Available</Text>
                        <Text style={styles.toggleSubtitle}>
                            {isActive ? 'Product is visible on menu' : 'Product is hidden from menu'}
                        </Text>
                    </View>
                    <Switch
                        value={isActive}
                        onValueChange={setIsActive}
                        trackColor={{ false: '#e0e0e0', true: GREEN }}
                        thumbColor="#fff"
                        disabled={loading}
                    />
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                {editMode ? (
                    <>
                        <TouchableOpacity
                            style={[styles.primaryBtn, loading && styles.disabledBtn]}
                            onPress={handleUpdate}
                            activeOpacity={0.85}
                            disabled={loading}
                        >
                            <Feather name="save" size={18} color="#fff" style={styles.icon} />
                            <Text style={styles.primaryBtnText}>
                                {loading ? 'Updating...' : 'Update Product'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.deleteBtn, loading && styles.disabledBtn]}
                            onPress={handleDelete}
                            activeOpacity={0.85}
                            disabled={loading}
                        >
                            <MaterialIcons name="delete-outline" size={18} color="#e74c3c" style={styles.icon} />
                            <Text style={styles.deleteBtnText}>Delete</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={[styles.primaryBtn, loading && styles.disabledBtn]}
                        onPress={handleSave}
                        activeOpacity={0.85}
                        disabled={loading}
                    >
                        <Feather name="plus" size={18} color="#fff" style={styles.icon} />
                        <Text style={styles.primaryBtnText}>
                            {loading ? 'Creating...' : 'Create Product'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

// Updated styles with error states and improvements
const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#f7f8fa',
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    errorContainer: {
        backgroundColor: '#fee2e2',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
    },
    errorText: {
        color: '#dc2626',
        fontSize: 14,
        lineHeight: 20,
    },
    imageUpload: {
        marginVertical: 16,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#e4e7ec',
        borderStyle: 'dashed',
        backgroundColor: '#fff',
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        alignItems: 'center',
        gap: 8,
    },
    imagePlaceholderText: {
        fontSize: 13,
        color: '#bbb',
        textAlign: 'center',
    },
    fieldGroup: {
        marginBottom: 18,
        flex: 1
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
        paddingVertical: 4,
        paddingHorizontal: 8,
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
    priceSection: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 18,
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
        marginLeft: 8,
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
    dropdownDisabled: {
        borderColor: '#e4e7ec',
        backgroundColor: '#fafbfc',
    },
    dropdownText: {
        fontSize: 14,
        color: '#111',
        flex: 1,
    },
    dropdownList: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e4e7ec',
        marginTop: 4,
        maxHeight: 200,
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
        textAlignVertical: 'top',
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
    disabledBtn: {
        opacity: 0.6,
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
    icon: {
        marginRight: 8,
    },
})