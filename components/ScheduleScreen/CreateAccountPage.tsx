import { createManagedUser } from '@/apis/adminAPI';
import { useRouter } from 'expo-router';
import {
    ArrowLeft,
    Briefcase,
    Eye,
    EyeOff,
    ShoppingBag,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const getErrorMessage = (e: unknown): string => {
    const err = e as {
      message?: string;
      originalError?: {
        code?: string;
        message?: string;
        response?: { data?: { message?: string | string[] } };
      };
      response?: { data?: { message?: string | string[] } };
    };
    const msg = err?.message ?? err?.originalError?.message;
    if (
      msg === "Network Error" ||
      err?.originalError?.code === "ERR_NETWORK" ||
      (typeof msg === "string" &&
        (msg.includes("CORS") || msg.includes("blocked")))
    ) {
      return "Không thể kết nối tới server. Backend (localhost:2999) cần cấu hình CORS cho phép method PATCH.";
    }
    if (typeof msg === "string" && msg.trim()) return msg;
    const data = err?.response?.data ?? err?.originalError?.response?.data;
    const apiMsg = data?.message;
    if (Array.isArray(apiMsg)) return apiMsg.join(", ");
    if (typeof apiMsg === "string") return apiMsg;
    return "Đã xảy ra lỗi. Vui lòng thử lại.";
  };

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
    <View style={styles.sectionTitleWrap}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
);

const InputField: React.FC<{
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (v: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address';
    rightIcon?: React.ReactNode;
}> = ({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType, rightIcon }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.inputWrapper}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={TEXT_PLACEHOLDER}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType ?? 'default'}
                autoCapitalize="none"
            />
            {rightIcon && <View style={styles.inputRight}>{rightIcon}</View>}
        </View>
    </View>
);

const RoleButton: React.FC<{
    role: any;
    selected: boolean;
    onPress: () => void;
}> = ({ role, selected, onPress }) => (
    <TouchableOpacity
        style={[styles.roleBtn, selected && styles.roleBtnActive]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        {role === 'STAFF' ? (
            <Briefcase
                size={16}
                color={selected ? PRIMARY : TEXT_MID}
                strokeWidth={2}
                style={{ marginRight: 6 }}
            />
        ) : (
            <ShoppingBag
                size={16}
                color={selected ? PRIMARY : TEXT_MID}
                strokeWidth={2}
                style={{ marginRight: 6 }}
            />
        )}
        <Text style={[styles.roleBtnText, selected && styles.roleBtnTextActive]}>
            {role === 'STAFF' ? 'Staff' : 'Shop Owner'}
        </Text>
    </TouchableOpacity>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const CreateAccountPage: React.FC = () => {
    // ✅ Added missing state variables
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // ✅ Added
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // ✅ Added
    const [role, setRole] = useState<'STAFF' | 'SHOPOWNER'>('STAFF');
    const [submitting, setSubmitting] = useState(false); // ✅ Added
    const [success, setSuccess] = useState(''); // ✅ Added
    const [formError, setFormError] = useState(''); // ✅ Added

    const router = useRouter();

    // ─── Validation ────────────────────────────────────────────────────────
    const validate = (): string | null => {
        if (!fullName.trim()) return 'Full name is required.';
        if (!email.trim()) return 'Email or username is required.';
        if (password.length < 6) return 'Password must be at least 6 characters.';
        if (password !== confirmPassword) return 'Password confirmation does not match.';
        return null;
    };

    const handleCreate = async () => {
        const error = validate();
        if (error) {
            Alert.alert('Validation Error', error);
            return;
        }

        setSubmitting(true);
        setFormError('');

        try {
            const result = await createManagedUser({
                email: email.trim(),
                username: fullName.trim(),
                password: password,
                role_code: role,
            });

            // Reset form
            setFullName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setRole('STAFF');

            setSuccess('Tài khoản đã tạo. Thông tin đăng nhập đã được gửi đến email của người dùng.');

            // Navigate to allStaff screen
            router.push('/Schedule/allStaff');

            // Clear success message
            setTimeout(() => setSuccess(''), 5000);

        } catch (e: unknown) {
            const err = e as any;
            const errorMsg = getErrorMessage(e);

            console.error('Create managed user error:', {
                status: err?.status,
                message: err?.message,
                originalError: err?.originalError,
            });

            if (err?.status === 401) {
                Alert.alert(
                    'Lỗi xác thực',
                    'Bạn không đủ quyền hoặc phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
                );
            } else if (err?.status === 400) {
                Alert.alert('Lỗi', `Lỗi: ${errorMsg}`);
            } else {
                Alert.alert('Lỗi', errorMsg);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/Schedule/allStaff');
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    activeOpacity={0.7}
                    onPress={() => router.push('/Schedule/allStaff')}
                >
                    <ArrowLeft size={20} color={TEXT_DARK} strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add New Member</Text>
                <View style={{ width: 36 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // ✅ Fixed incomplete syntax
            >
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── Personal Information ── */}
                    <SectionTitle title="Personal Information" />

                    <InputField
                        label="Full Name"
                        placeholder="e.g. John Doe"
                        value={fullName}
                        onChangeText={setFullName}
                    />
                    <InputField
                        label="Email / Username"
                        placeholder="john.doe@fnb-app.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                    />
                    <InputField
                        label="Password"
                        placeholder="Create a strong password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        rightIcon={
                            <Pressable onPress={() => setShowPassword(p => !p)} hitSlop={8}>
                                {showPassword
                                    ? <EyeOff size={18} color={TEXT_PLACEHOLDER} strokeWidth={1.8} />
                                    : <Eye size={18} color={TEXT_PLACEHOLDER} strokeWidth={1.8} />
                                }
                            </Pressable>
                        }
                    />
                    {/* ✅ Added Confirm Password field */}
                    <InputField
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        rightIcon={
                            <Pressable onPress={() => setShowConfirmPassword(p => !p)} hitSlop={8}>
                                {showConfirmPassword
                                    ? <EyeOff size={18} color={TEXT_PLACEHOLDER} strokeWidth={1.8} />
                                    : <Eye size={18} color={TEXT_PLACEHOLDER} strokeWidth={1.8} />
                                }
                            </Pressable>
                        }
                    />

                    {/* ── Role ── */}
                    <SectionTitle title="Role" />
                    <View style={styles.roleRow}>
                        <RoleButton role="STAFF" selected={role === 'STAFF'} onPress={() => setRole('STAFF')} />
                        <RoleButton role="SHOPOWNER" selected={role === 'SHOPOWNER'} onPress={() => setRole('SHOPOWNER')} />
                    </View>

                    {/* ── Shift Assignment ── */}
                    {/* <SectionTitle
                        title="Shift Assignment"
                        subtitle="Select one or more shifts for this member"
                    />
                    <View style={styles.shiftGrid}>
                        {SHIFTS.map(shift => (
                            <ShiftCard
                                key={shift.key}
                                shift={shift}
                                selected={selectedShifts.has(shift.key)}
                                onPress={() => toggleShift(shift.key)}
                            />
                        ))}
                    </View> */}

                    {/* ✅ Show error/success messages */}
                    {formError ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{formError}</Text>
                        </View>
                    ) : success ? (
                        <View style={styles.successContainer}>
                            <Text style={styles.successText}>{success}</Text>
                        </View>
                    ) : null}

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* ── Footer Actions ── */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.cancelBtn}
                    activeOpacity={0.7}
                    onPress={handleCancel}
                >
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.createBtn,
                        submitting && styles.createBtnDisabled
                    ]}
                    onPress={handleCreate}
                    activeOpacity={submitting ? 1 : 0.85}
                    disabled={submitting}
                >
                    <Text style={styles.createText}>
                        {submitting ? 'Creating...' : 'Create Account'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const PRIMARY = '#2596BE';
const PRIMARY_LIGHT = '#e8f6fb';
const TEXT_DARK = '#1a1a2e';
const TEXT_MID = '#6b7280';
const TEXT_PLACEHOLDER = '#b0b8c4';
const BORDER = '#efefef';
const SURFACE = '#f7f8fa';

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#fff',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
        backgroundColor: '#fff',
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: SURFACE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: TEXT_DARK,
        letterSpacing: 0.2,
    },

    // Scroll
    scroll: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },

    // Section title
    sectionTitleWrap: {
        marginBottom: 14,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: TEXT_DARK,
        letterSpacing: 0.1,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: TEXT_MID,
        marginTop: 3,
        fontWeight: '400',
    },

    // Input
    inputGroup: {
        marginBottom: 14,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: TEXT_DARK,
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: SURFACE,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: BORDER,
        paddingHorizontal: 14,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: TEXT_DARK,
        paddingVertical: Platform.OS === 'ios' ? 13 : 10,
        fontWeight: '400',
    },
    inputRight: {
        paddingLeft: 8,
    },

    // ✅ Added error/success styles
    errorContainer: {
        backgroundColor: '#fef2f2',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
    },
    errorText: {
        color: '#dc2626',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
    successContainer: {
        backgroundColor: '#f0fdf4',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#10b981',
    },
    successText: {
        color: '#059669',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },

    // Role
    roleRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 22,
    },
    roleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: BORDER,
        backgroundColor: SURFACE,
    },
    roleBtnActive: {
        borderColor: PRIMARY,
        backgroundColor: PRIMARY_LIGHT,
    },
    roleBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: TEXT_MID,
    },
    roleBtnTextActive: {
        color: PRIMARY,
    },

    // Shifts
    shiftGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 8,
    },
    shiftCard: {
        width: '47.5%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: BORDER,
        backgroundColor: SURFACE,
        gap: 10,
    },
    shiftCardActive: {
        borderColor: PRIMARY,
        backgroundColor: PRIMARY_LIGHT,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#d0d5dd',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    checkboxActive: {
        borderColor: PRIMARY,
        backgroundColor: PRIMARY,
    },
    checkboxInner: {
        width: 8,
        height: 8,
        borderRadius: 2,
        backgroundColor: '#fff',
    },
    shiftInfo: {
        flex: 1,
    },
    shiftLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: TEXT_DARK,
        marginBottom: 2,
    },
    shiftLabelActive: {
        color: PRIMARY,
    },
    shiftTime: {
        fontSize: 11,
        color: TEXT_MID,
        fontWeight: '400',
    },
    shiftTimeActive: {
        color: PRIMARY,
        opacity: 0.8,
    },
    footer: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: BORDER,
    },
    cancelBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: BORDER,
        backgroundColor: SURFACE,
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: TEXT_MID,
    },
    createBtn: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: PRIMARY,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    // ✅ Added disabled button style
    createBtnDisabled: {
        backgroundColor: '#9ca3af',
        shadowOpacity: 0.1,
    },
    createText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
});

export default CreateAccountPage;