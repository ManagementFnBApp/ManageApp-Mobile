import { apiClient } from '@/configs/axios';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import * as z from 'zod';

// ─── Constants (match SettingsPage palette) ───────────────────────────────────
const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || '#2596BE';
const BG = '#f7f8fa';
const CARD = '#ffffff';
const BORDER = '#e8eaed';
const TEXT_PRIMARY = '#111111';
const TEXT_SECONDARY = '#888888';
const TEXT_LABEL = '#aaaaaa';
const DANGER = '#e74c3c';

// ─── Zod schema (mirrors web) ─────────────────────────────────────────────────
const ProfileSchema = z.object({
    user_id: z.union([z.string(), z.number(), z.null()]).optional(),
    profile_id: z.union([z.string(), z.number(), z.null()]).optional(),
    full_name: z.string().nullish(),
    avatar: z.string().nullish(),
    phone: z.string().nullish(),
});

type Profile = z.infer<typeof ProfileSchema>;

// ─── API helpers (inline, mirrors web api/profile.ts) ────────────────────────
async function getProfile(): Promise<Profile> {
    const res = await apiClient.get('/profiles/detail');
    return ProfileSchema.parse(res.data?.data);
}

async function createProfile(profile: Partial<Profile> = {}): Promise<Profile> {
    const res = await apiClient.post('/profiles', profile);
    return ProfileSchema.parse(res.data?.data);
}

async function updateProfile(id: string, profile: Partial<Profile>): Promise<Profile> {
    const res = await apiClient.put(`/profiles/${id}`, profile);
    return ProfileSchema.parse(res.data);
}

// ─── Reusable Field component ─────────────────────────────────────────────────
type FieldProps = {
    label: string;
    value: string;
    onChangeText: (v: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'phone-pad' | 'url';
    autoCapitalize?: 'none' | 'words' | 'sentences';
};

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', autoCapitalize = 'sentences' }: FieldProps) {
    const [focused, setFocused] = useState(false);
    return (
        <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput
                style={[styles.fieldInput, focused && styles.fieldInputFocused]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={TEXT_LABEL}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
        </View>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
    const router = useRouter();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({
        full_name: '',
        avatar: '',
        phone: '',
    });

    // ── Fetch on mount ──────────────────────────────────────────────────────
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfile();
                setProfile(data);
                setForm({
                    full_name: data.full_name || '',
                    avatar: data.avatar || '',
                    phone: data.phone || '',
                });
            } catch (error: any) {
                if (error.message && error.message.includes('not found')) {
                    try {
                        const data = await createProfile({});
                        setProfile(data);
                        setForm({
                            full_name: data.full_name || '',
                            avatar: data.avatar || '',
                            phone: data.phone || '',
                        });
                    } catch (e: any) {
                        Alert.alert('Lỗi', e.message || 'Tạo profile thất bại');
                    }
                } else {
                    Alert.alert('Lỗi', error.message || 'Không thể tải thông tin');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // ── Validation ──────────────────────────────────────────────────────────
    const validatePhone = (phone: string) =>
        /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone);

    // ── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!form.full_name.trim()) {
            Alert.alert('Lỗi', 'Họ và tên không được để trống');
            return;
        }
        if (form.phone && !validatePhone(form.phone)) {
            Alert.alert(
                'Lỗi',
                'Số điện thoại phải có 10 số và bắt đầu bằng 03, 05, 07, 08, 09',
            );
            return;
        }

        setIsSaving(true);
        try {
            await updateProfile(String(profile?.profile_id!), form);
            const refreshed = await getProfile();
            setProfile(refreshed);
            Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Cập nhật thất bại');
        } finally {
            setIsSaving(false);
        }
    };

    // ── Loading state ───────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={GREEN} />
                <Text style={styles.loadingText}>Đang tải thông tin...</Text>
            </SafeAreaView>
        );
    }

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={BG} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Feather name="arrow-left" size={20} color={TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
                {/* Spacer to center title */}
                <View style={styles.headerBtn} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Card */}
                    <View style={styles.card}>
                        <Field
                            label="Họ và tên"
                            value={form.full_name}
                            onChangeText={(v) => setForm((p) => ({ ...p, full_name: v }))}
                            placeholder="Nhập họ và tên"
                            autoCapitalize="words"
                        />

                        <View style={styles.divider} />

                        <Field
                            label="Số điện thoại"
                            value={form.phone}
                            onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
                            placeholder="Nhập số điện thoại (VD: 0912345678)"
                            keyboardType="phone-pad"
                            autoCapitalize="none"
                        />

                        <View style={styles.divider} />

                        <Field
                            label="Ảnh đại diện (URL)"
                            value={form.avatar}
                            onChangeText={(v) => setForm((p) => ({ ...p, avatar: v }))}
                            placeholder="https://example.com/avatar.jpg"
                            keyboardType="url"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Read-only info */}
                    {profile && (
                        <View style={styles.card}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>User ID</Text>
                                <Text style={styles.infoValue}>{profile.user_id ?? '—'}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Profile ID</Text>
                                <Text style={styles.infoValue}>{profile.profile_id ?? '—'}</Text>
                            </View>
                        </View>
                    )}

                    {/* Save button */}
                    <TouchableOpacity
                        style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={isSaving}
                        activeOpacity={0.8}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: 32 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    centered: {
        flex: 1,
        backgroundColor: BG,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        color: TEXT_SECONDARY,
        fontSize: 14,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    headerBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: TEXT_PRIMARY,
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    scroll: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },

    // Card
    card: {
        backgroundColor: CARD,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: BORDER,
        overflow: 'hidden',
        marginBottom: 16,
    },

    divider: {
        height: 1,
        backgroundColor: BORDER,
        marginLeft: 16,
    },

    // Field
    fieldWrapper: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    fieldLabel: {
        color: TEXT_LABEL,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    fieldInput: {
        backgroundColor: '#f7f8fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: BORDER,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === 'ios' ? 12 : 9,
        fontSize: 14,
        color: TEXT_PRIMARY,
    },
    fieldInputFocused: {
        borderColor: GREEN,
        backgroundColor: '#fff',
    },

    // Read-only info rows
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    infoLabel: {
        color: TEXT_SECONDARY,
        fontSize: 14,
        fontWeight: '500',
    },
    infoValue: {
        color: TEXT_LABEL,
        fontSize: 13,
    },

    // Save button
    saveBtn: {
        backgroundColor: DANGER,
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    saveBtnDisabled: {
        backgroundColor: '#ccc',
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});