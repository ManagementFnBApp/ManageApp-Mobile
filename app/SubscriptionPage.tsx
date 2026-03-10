import {
  BILLING_CYCLE_LABEL,
  formatServicePrice,
  getFeatureList,
  SubscriptionPlan,
  useSubscription,
} from '@/hooks/useSubscription';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const GREEN = '#35d07f';
const BG = '#f7f8fa';
const CARD_BG = '#ffffff';
const BORDER = '#e8eaed';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6b7280';
const TEXT_MUTED = '#9ca3af';

export default function SubscriptionPage() {
  const { plans, loading, error } = useSubscription();
  const auth = useAuth();
  const router = useRouter();

  const isLoggedIn = !!auth?.token;
  const isShopOwner = auth?.user?.role === 'SHOP_OWNER';

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!isLoggedIn) {
      router.push('/loginPage');
      return;
    }
    router.push({
      pathname: '/CheckoutPage',
      params: {
        subscriptionId: plan.subscription_id,
        packageCode: plan.package_code,
        price: plan.price,
        billing: plan.billing_cycle,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>DỊCH VỤ</Text>
          <Text style={styles.title}>Chọn gói{'\n'}phù hợp</Text>
          <Text style={styles.subtitle}>
            Mở rộng kinh doanh với hệ thống quản lý thông minh
          </Text>
          {isShopOwner && (
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerBadgeText}>✅ Bạn đã là Shop Owner</Text>
            </View>
          )}
        </View>

        {/* Plans */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={GREEN} />
            <Text style={styles.loadingText}>Đang tải gói dịch vụ...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : plans.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>Chưa có gói dịch vụ nào.</Text>
          </View>
        ) : (
          <View style={styles.plansContainer}>
            {plans.map((plan, index) => {
              const isPopular = index === Math.floor(plans.length / 2);
              const featureList = getFeatureList(plan.features);
              const periodLabel = BILLING_CYCLE_LABEL[plan.billing_cycle] ?? '';

              return (
                <View
                  key={plan.subscription_id}
                  style={[styles.card, isPopular && styles.cardPopular]}
                >
                  {isPopular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>PHỔ BIẾN NHẤT</Text>
                    </View>
                  )}

                  <View style={styles.packageCodeBadge}>
                    <Text style={styles.packageCodeText}>{plan.package_code}</Text>
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={[styles.price, isPopular && styles.pricePopular]}>
                      {formatServicePrice(plan.price)}
                    </Text>
                    {periodLabel ? (
                      <Text style={styles.period}>{periodLabel}</Text>
                    ) : null}
                  </View>

                  {plan.description ? (
                    <Text style={styles.description}>{plan.description}</Text>
                  ) : null}

                  {featureList.length > 0 && (
                    <View style={styles.featureList}>
                      {featureList.map((f, fi) => (
                        <View key={fi} style={styles.featureRow}>
                          <Text style={styles.featureCheck}>✓</Text>
                          <Text style={styles.featureText}>{f}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {isShopOwner ? (
                    <View style={styles.ownedButton}>
                      <Text style={styles.ownedButtonText}>✅ Bạn đã có gói dịch vụ</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.selectButton, isPopular && styles.selectButtonPopular]}
                      onPress={() => handleSelectPlan(plan)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.selectButtonText, isPopular && styles.selectButtonTextPopular]}>
                        {isLoggedIn ? 'Mua ngay' : 'Đăng nhập để mua'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Addons */}
        <View style={styles.addonsSection}>
          <Text style={styles.addonsTitle}>Dịch vụ bổ sung</Text>
          {[
            { name: 'Website bán hàng', price: '299.000đ/tháng', desc: 'Website riêng với tên miền của bạn' },
            { name: 'App mobile branded', price: '499.000đ/tháng', desc: 'App với logo và thương hiệu của bạn' },
            { name: 'Tích hợp Shopee/Lazada', price: '199.000đ/tháng', desc: 'Đồng bộ đơn hàng và tồn kho tự động' },
            { name: 'SMS Marketing', price: 'Theo gói', desc: 'Gửi tin nhắn khuyến mãi cho khách hàng' },
          ].map((addon, i) => (
            <View key={i} style={styles.addonCard}>
              <View style={styles.addonInfo}>
                <Text style={styles.addonName}>{addon.name}</Text>
                <Text style={styles.addonDesc}>{addon.desc}</Text>
              </View>
              <Text style={styles.addonPrice}>{addon.price}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <Text style={styles.ctaTitle}>Bắt đầu ngay hôm nay</Text>
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            onPress={() => router.push(isLoggedIn ? '/(tabs)/Home' : '/loginPage')}
          >
            <Text style={styles.ctaButtonText}>
              {isLoggedIn ? 'Vào hệ thống' : 'Đăng ký miễn phí'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 32,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    color: GREEN,
    marginBottom: 10,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    lineHeight: 48,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    lineHeight: 22,
  },
  ownerBadge: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ownerBadgeText: {
    color: '#15803d',
    fontWeight: '700',
    fontSize: 13,
  },

  // Loading / Error / Empty
  center: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: { color: TEXT_MUTED, fontSize: 14 },
  errorText: { color: '#ef4444', fontSize: 14 },
  emptyText: { color: TEXT_MUTED, fontSize: 14 },

  // Plans
  plansContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPopular: {
    borderColor: GREEN,
    borderWidth: 2,
  },
  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: GREEN,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 14,
  },
  popularBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  packageCodeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 14,
  },
  packageCodeText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
    gap: 4,
  },
  price: {
    fontSize: 36,
    fontWeight: '800',
    color: TEXT_PRIMARY,
  },
  pricePopular: {
    color: GREEN,
  },
  period: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 16,
  },
  featureList: {
    gap: 8,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  featureCheck: {
    color: GREEN,
    fontWeight: '700',
    fontSize: 14,
    marginTop: 1,
  },
  featureText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  selectButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  selectButtonPopular: {
    backgroundColor: GREEN,
  },
  selectButtonText: {
    color: TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 15,
  },
  selectButtonTextPopular: {
    color: '#fff',
  },
  ownedButton: {
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ownedButtonText: {
    color: '#15803d',
    fontWeight: '700',
    fontSize: 14,
  },

  // Addons
  addonsSection: {
    marginTop: 40,
    paddingHorizontal: 16,
  },
  addonsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  addonCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  addonInfo: {
    flex: 1,
    marginRight: 12,
  },
  addonName: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 3,
  },
  addonDesc: {
    fontSize: 12,
    color: TEXT_MUTED,
    lineHeight: 17,
  },
  addonPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: GREEN,
    flexShrink: 0,
  },

  // CTA
  cta: {
    marginTop: 40,
    marginHorizontal: 16,
    backgroundColor: GREEN,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  ctaButtonText: {
    color: GREEN,
    fontWeight: '800',
    fontSize: 15,
  },
});