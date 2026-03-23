import {
    confirmPayment,
    createSubscriptionPayment,
    createSubscriptionTenant,
} from '@/apis/SubscriptionAPI';
import { useAuth } from '@/providers/AuthProvider';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
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

// ─── Constants ────────────────────────────────────────────────────────────────

const GREEN = '#2596BE';
const BG = '#f7f8fa';
const CARD_BG = '#ffffff';
const BORDER = '#e8eaed';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6b7280';
const TEXT_MUTED = '#9ca3af';

const PAYMENT_METHODS = [
    { id: 'BANK_TRANSFER', label: 'Chuyển khoản', icon: 'credit-card' as const },
    { id: 'MOMO', label: 'Ví MoMo', icon: 'smartphone' as const },
    { id: 'VNPAY', label: 'VNPay', icon: 'layers' as const },
    { id: 'CASH', label: 'Tiền mặt', icon: 'dollar-sign' as const },
];

type Step = 'form' | 'processing' | 'success' | 'error';

const formatPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
    const router = useRouter();
    const auth = useAuth();
    const params = useLocalSearchParams<{
        subscriptionId: string;
        packageCode: string;
        price: string;
        billing: string;
    }>();

    const subscriptionId = Number(params.subscriptionId);
    const packageCode = params.packageCode || '';
    const price = Number(params.price || 0);
    const billing = params.billing || 'MONTHLY';
    const username = auth?.user?.username || 'Người dùng';

    const [step, setStep] = useState<Step>('form');
    const [selectedMethod, setSelectedMethod] = useState('BANK_TRANSFER');
    const [shopName, setShopName] = useState('');
    const [shopNameTouched, setShopNameTouched] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [finalShopName, setFinalShopName] = useState('');

    const billingLabel = billing === 'YEARLY' ? '/năm' : billing === 'MONTHLY' ? '/tháng' : '';

    // Guard: invalid params
    if (!subscriptionId || !packageCode) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.stateCard}>
                    <Text style={styles.stateIcon}>⚠️</Text>
                    <Text style={styles.stateTitle}>Thông tin gói không hợp lệ</Text>
                    <Text style={styles.stateSubtitle}>Vui lòng chọn lại gói từ trang dịch vụ.</Text>
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/SubscriptionPage')}>
                        <Text style={styles.primaryBtnText}>Xem các gói dịch vụ</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleConfirm = async () => {
        if (!shopName.trim()) {
            setShopNameTouched(true);
            return;
        }
        setStep('processing');
        setErrorMsg('');

        try {
            // Step 1: Create shop + subscription
            const shopSub = await createSubscriptionTenant(subscriptionId, shopName.trim());

            // Step 2: Create pending payment
            const payment = await createSubscriptionPayment(
                shopSub.sub_shop_id,
                selectedMethod,
                price,
            );

            // Step 3: Confirm → activates shop + upgrades role
            await confirmPayment(payment.sub_payment_id);

            setFinalShopName(payment.shop?.shop_name || shopName.trim());
            setStep('success');
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                'Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.';
            setErrorMsg(msg);
            setStep('error');
        }
    };

    // ── States ─────────────────────────────────────────────────────────────────

    if (step === 'processing') {
        return (
            <SafeAreaView style={styles.safe}>
                <StatusBar barStyle="dark-content" backgroundColor={BG} />
                <View style={styles.stateCard}>
                    <View style={[styles.stateIconCircle, { backgroundColor: '#eff6ff' }]}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                    </View>
                    <Text style={styles.stateTitle}>Đang xử lý thanh toán...</Text>
                    <Text style={styles.stateSubtitle}>Vui lòng chờ trong giây lát</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (step === 'success') {
        return (
            <SafeAreaView style={styles.safe}>
                <StatusBar barStyle="dark-content" backgroundColor={BG} />
                <ScrollView contentContainerStyle={styles.stateScroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.stateCard}>
                        <View style={[styles.stateIconCircle, { backgroundColor: '#dcfce7' }]}>
                            <Feather name="check" size={36} color={GREEN} />
                        </View>
                        <Text style={styles.stateTitle}>Thanh toán thành công!</Text>
                        <Text style={styles.stateSubtitle}>
                            Chào mừng <Text style={{ fontWeight: '700', color: TEXT_PRIMARY }}>{username}</Text>!{'\n'}
                            Tài khoản đã được nâng cấp lên{' '}
                            <Text style={{ fontWeight: '700', color: GREEN }}>Shop Owner</Text>.
                        </Text>

                        {/* Summary card */}
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Gói dịch vụ</Text>
                                <Text style={styles.summaryValue}>{packageCode}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Tên cửa hàng</Text>
                                <Text style={styles.summaryValue}>{finalShopName}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Phương thức</Text>
                                <Text style={styles.summaryValue}>
                                    {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.label}
                                </Text>
                            </View>
                            <View style={[styles.summaryRow, styles.summaryRowLast]}>
                                <Text style={styles.summaryLabel}>Số tiền</Text>
                                <Text style={[styles.summaryValue, { color: GREEN, fontSize: 16 }]}>
                                    {formatPrice(price)}{billingLabel}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={() => router.replace('/(tabs)/Home')}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.primaryBtnText}>Vào hệ thống quản lý →</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (step === 'error') {
        return (
            <SafeAreaView style={styles.safe}>
                <StatusBar barStyle="dark-content" backgroundColor={BG} />
                <View style={styles.stateCard}>
                    <View style={[styles.stateIconCircle, { backgroundColor: '#fee2e2' }]}>
                        <Feather name="x" size={36} color="#ef4444" />
                    </View>
                    <Text style={styles.stateTitle}>Có lỗi xảy ra</Text>
                    <Text style={[styles.stateSubtitle, { color: '#ef4444' }]}>{errorMsg}</Text>
                    <View style={styles.errorBtnRow}>
                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            onPress={() => setStep('form')}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.secondaryBtnText}>Thử lại</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={() => router.push('/SubscriptionPage')}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.primaryBtnText}>Chọn gói khác</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // ── FORM ───────────────────────────────────────────────────────────────────

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={BG} />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Back */}
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Feather name="arrow-left" size={18} color={TEXT_SECONDARY} />
                        <Text style={styles.backText}>Quay lại xem gói</Text>
                    </TouchableOpacity>

                    {/* Order Summary Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Thông tin đơn hàng</Text>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Gói dịch vụ</Text>
                            <Text style={styles.summaryValue}>{packageCode}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Chu kỳ</Text>
                            <Text style={styles.summaryValue}>
                                {billing === 'YEARLY' ? 'Hàng năm' : billing === 'MONTHLY' ? 'Hàng tháng' : 'Một lần'}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tài khoản</Text>
                            <Text style={[styles.summaryValue, { color: GREEN }]}>{username}</Text>
                        </View>

                        {/* Shop name input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Tên cửa hàng <Text style={{ color: '#ef4444' }}>*</Text>
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    shopNameTouched && !shopName.trim() && styles.inputError,
                                ]}
                                placeholder="VD: Cà phê Sài Gòn, Bánh mì 37..."
                                placeholderTextColor={TEXT_MUTED}
                                value={shopName}
                                onChangeText={(t) => { setShopName(t); setShopNameTouched(false); }}
                                onBlur={() => setShopNameTouched(true)}
                                returnKeyType="done"
                            />
                            {shopNameTouched && !shopName.trim() && (
                                <Text style={styles.inputErrorText}>Vui lòng nhập tên cửa hàng.</Text>
                            )}
                        </View>

                        {/* Total */}
                        <View style={[styles.summaryRow, styles.summaryRowLast]}>
                            <Text style={[styles.summaryLabel, { fontWeight: '700', color: TEXT_PRIMARY }]}>Tổng cộng</Text>
                            <Text style={[styles.summaryValue, { color: GREEN, fontSize: 20, fontWeight: '800' }]}>
                                {formatPrice(price)}<Text style={{ fontSize: 13, fontWeight: '400', color: TEXT_MUTED }}>{billingLabel}</Text>
                            </Text>
                        </View>

                        {/* Security note */}
                        <View style={styles.securityNote}>
                            <Feather name="lock" size={14} color={GREEN} />
                            <Text style={styles.securityText}>
                                Thanh toán an toàn & bảo mật. Tài khoản kích hoạt ngay sau khi thanh toán.
                            </Text>
                        </View>
                    </View>

                    {/* Payment Method Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Phương thức thanh toán</Text>

                        <View style={styles.methodGrid}>
                            {PAYMENT_METHODS.map(method => (
                                <TouchableOpacity
                                    key={method.id}
                                    style={[
                                        styles.methodBtn,
                                        selectedMethod === method.id && styles.methodBtnActive,
                                    ]}
                                    onPress={() => setSelectedMethod(method.id)}
                                    activeOpacity={0.8}
                                >
                                    <Feather
                                        name={method.icon}
                                        size={20}
                                        color={selectedMethod === method.id ? GREEN : TEXT_MUTED}
                                    />
                                    <Text style={[
                                        styles.methodLabel,
                                        selectedMethod === method.id && styles.methodLabelActive,
                                    ]}>
                                        {method.label}
                                    </Text>
                                    {selectedMethod === method.id && (
                                        <View style={styles.methodCheck}>
                                            <Feather name="check" size={10} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Instructions */}
                        <View style={styles.instructions}>
                            <Text style={styles.instructionsTitle}>💡 Hướng dẫn thanh toán</Text>
                            {selectedMethod === 'BANK_TRANSFER' && (
                                <>
                                    <Text style={styles.instructionsText}><Text style={styles.bold}>Ngân hàng:</Text> Vietcombank</Text>
                                    <Text style={styles.instructionsText}><Text style={styles.bold}>Số tài khoản:</Text> 1234 5678 9012</Text>
                                    <Text style={styles.instructionsText}><Text style={styles.bold}>Chủ TK:</Text> MANAGE APP CO., LTD</Text>
                                    <Text style={styles.instructionsText}><Text style={styles.bold}>Nội dung CK:</Text> MANAGEAPP {username.toUpperCase()}</Text>
                                </>
                            )}
                            {selectedMethod === 'MOMO' && (
                                <Text style={styles.instructionsText}>Quét mã QR MoMo hoặc chuyển đến số: <Text style={styles.bold}>0901 234 567</Text></Text>
                            )}
                            {selectedMethod === 'VNPAY' && (
                                <Text style={styles.instructionsText}>Bạn sẽ được chuyển đến cổng thanh toán VNPay sau khi xác nhận.</Text>
                            )}
                            {selectedMethod === 'CASH' && (
                                <Text style={styles.instructionsText}>Vui lòng đến văn phòng ManageApp để thanh toán tiền mặt. Địa chỉ: 123 Nguyễn Văn Linh, Đà Nẵng.</Text>
                            )}
                        </View>
                    </View>

                    {/* Terms */}
                    <Text style={styles.terms}>
                        Bằng cách nhấn "Xác nhận thanh toán", bạn đồng ý với{' '}
                        <Text style={{ color: GREEN }}>điều khoản dịch vụ</Text> của ManageApp.
                    </Text>

                    {/* Submit */}
                    <TouchableOpacity
                        style={styles.submitBtn}
                        onPress={handleConfirm}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.submitBtnText}>
                            Xác nhận thanh toán — {formatPrice(price)}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },
    scroll: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 48 },

    // State screens
    stateScroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    stateCard: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
    stateIconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    stateIcon: { fontSize: 48, marginBottom: 8 },
    stateTitle: { fontSize: 22, fontWeight: '800', color: TEXT_PRIMARY, textAlign: 'center' },
    stateSubtitle: { fontSize: 14, color: TEXT_SECONDARY, textAlign: 'center', lineHeight: 22 },
    errorBtnRow: { flexDirection: 'row', gap: 12, marginTop: 8, width: '100%' },

    // Back
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    backText: { fontSize: 14, color: TEXT_SECONDARY, fontWeight: '500' },

    // Cards
    card: { backgroundColor: CARD_BG, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: BORDER, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    cardTitle: { fontSize: 16, fontWeight: '800', color: TEXT_PRIMARY, marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: BORDER },

    // Summary rows
    summaryCard: { width: '100%', backgroundColor: '#f0fdf4', borderRadius: 16, padding: 16, marginVertical: 16, gap: 10 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
    summaryRowLast: { borderTopWidth: 1, borderTopColor: BORDER, marginTop: 6, paddingTop: 12 },
    summaryLabel: { fontSize: 13, color: TEXT_SECONDARY },
    summaryValue: { fontSize: 13, fontWeight: '600', color: TEXT_PRIMARY, textAlign: 'right', flex: 1, marginLeft: 16 },

    // Input
    inputGroup: { marginTop: 12 },
    inputLabel: { fontSize: 13, color: TEXT_SECONDARY, marginBottom: 6 },
    input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: TEXT_PRIMARY },
    inputError: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
    inputErrorText: { color: '#ef4444', fontSize: 12, marginTop: 4 },

    // Security
    securityNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 16, backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12 },
    securityText: { fontSize: 12, color: '#15803d', lineHeight: 18, flex: 1 },

    // Payment methods
    methodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
    methodBtn: { flex: 1, minWidth: '45%', flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: BORDER, backgroundColor: '#f9fafb', position: 'relative' },
    methodBtnActive: { borderColor: GREEN, backgroundColor: '#f0fdf4' },
    methodLabel: { fontSize: 13, fontWeight: '600', color: TEXT_SECONDARY },
    methodLabelActive: { color: GREEN },
    methodCheck: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center' },

    // Instructions
    instructions: { backgroundColor: '#fefce8', borderWidth: 1, borderColor: '#fde68a', borderRadius: 14, padding: 14, gap: 4 },
    instructionsTitle: { fontSize: 13, fontWeight: '700', color: '#92400e', marginBottom: 4 },
    instructionsText: { fontSize: 13, color: '#92400e', lineHeight: 20 },
    bold: { fontWeight: '700' },

    // Terms
    terms: { fontSize: 12, color: TEXT_MUTED, textAlign: 'center', marginBottom: 16, lineHeight: 18 },

    // Buttons
    submitBtn: { backgroundColor: GREEN, borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    primaryBtn: { backgroundColor: GREEN, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', width: '100%' },
    primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    secondaryBtn: { flex: 1, borderWidth: 2, borderColor: BORDER, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    secondaryBtnText: { color: TEXT_PRIMARY, fontWeight: '700', fontSize: 15 },
});