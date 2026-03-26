import {
  createInventory,
  createInventoryItem,
  deleteInventory,
  deleteInventoryItem,
  getInventories,
  getInventoryItems,
  normalizeApiError,
  updateInventory,
  updateInventoryItem,
  type Inventory,
  type InventoryItem,
} from '@/apis/inventoryAPI';
import { getProducts, type Product } from '@/apis/ProductsAPI';
import { getShopProducts } from '@/apis/ShopProductsAPI';
import { useAuth } from '@/providers/AuthProvider';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
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

// ─── Palette (matches SettingsPage) ──────────────────────────────────────────
const GREEN = process.env.EXPO_PUBLIC_MAIN_COLOR || '#2596BE';
const BG = '#f7f8fa';
const CARD = '#ffffff';
const BORDER = '#e8eaed';
const TEXT_PRIMARY = '#111111';
const TEXT_SECONDARY = '#888888';
const TEXT_LABEL = '#aaaaaa';
const DANGER = '#e74c3c';
const SUCCESS = '#10b981';
const WARNING = '#f59e0b';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProductOption {
  id: number;
  name: string;
  source: 'SYSTEM' | 'SHOP';
}

interface InventoryOption {
  inventoryId: number;
  shopId: number;
}

type ToastType = 'success' | 'error';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDateTime(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ type, message, onClose }: { type: ToastType; message: string; onClose: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2800),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => onClose());
  }, []);

  return (
    <Animated.View style={[styles.toast, type === 'success' ? styles.toastSuccess : styles.toastError, { opacity }]}>
      <Feather name={type === 'success' ? 'check-circle' : 'alert-circle'} size={16} color={type === 'success' ? SUCCESS : DANGER} />
      <Text style={[styles.toastText, { color: type === 'success' ? '#065f46' : '#991b1b' }]} numberOfLines={2}>{message}</Text>
      <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Feather name="x" size={14} color={TEXT_SECONDARY} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <View style={[styles.statCard, accent && styles.statCardAccent]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, onAdd, addLabel }: { title: string; onAdd?: () => void; addLabel?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onAdd && (
        <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.8}>
          <Feather name="plus" size={14} color="#fff" />
          <Text style={styles.addBtnText}>{addLabel ?? 'Thêm'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Inventory Card ───────────────────────────────────────────────────────────
function InventoryCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Inventory;
  onView?: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isLow = item.currentQuantity < item.minimumThreshold;
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemCardHeader}>
        <View style={styles.itemCardIdBadge}>
          <Text style={styles.itemCardIdText}>INV-{item.inventoryId}</Text>
        </View>
        {isLow && (
          <View style={styles.lowStockBadge}>
            <Feather name="alert-triangle" size={10} color={WARNING} />
            <Text style={styles.lowStockText}>Sắp hết</Text>
          </View>
        )}
      </View>

      <View style={styles.itemCardGrid}>
        <InfoCell label="Shop ID" value={String(item.shopId)} />
        <InfoCell label="Tồn kho" value={String(item.currentQuantity)} highlight={isLow} />
        <InfoCell label="Tối thiểu" value={String(item.minimumThreshold)} />
        <InfoCell label="Nhập lại" value={String(item.reorderQuantity)} />
      </View>

      <View style={styles.itemCardFooter}>
        <Text style={styles.itemCardDate}>Nhập lần cuối: {formatDateTime(item.lastRestockAt)}</Text>
        <View style={styles.itemCardActions}>
          {/* <ActionButton icon="eye" onPress={onView} color={GREEN} /> */}
          <ActionButton icon="edit-2" onPress={onEdit} color={TEXT_SECONDARY} />
          <ActionButton icon="trash-2" onPress={onDelete} color={DANGER} />
        </View>
      </View>
    </View>
  );
}

// ─── Inventory Item Card ──────────────────────────────────────────────────────
function InventoryItemCard({
  item,
  getProductName,
  getProductBarcode,
  onEdit,
  onDelete,
}: {
  item: InventoryItem;
  getProductName: (row: InventoryItem) => string;
  getProductBarcode: (row: InventoryItem) => string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemCardHeader}>
        <View style={styles.itemCardIdBadge}>
          <Text style={styles.itemCardIdText}>ITEM-{item.inventoryItemId}</Text>
        </View>
        <View style={[styles.lowStockBadge, { backgroundColor: item.productType === 'SHOP' ? '#eff6ff' : '#f0fdf4' }]}>
          <Text style={[styles.lowStockText, { color: item.productType === 'SHOP' ? GREEN : '#16a34a' }]}>
            {item.productType === 'SHOP' ? 'Cửa hàng' : 'Hệ thống'}
          </Text>
        </View>
      </View>

      <Text style={styles.productName} numberOfLines={1}>{getProductName(item)}</Text>
      <Text style={styles.productBarcode} numberOfLines={1}>{getProductBarcode(item)}</Text>

      <View style={styles.itemCardGrid}>
        <InfoCell label="Inventory ID" value={String(item.inventoryId)} />
        <InfoCell label="Số lượng" value={String(item.quantity)} />
        <InfoCell label="Dự trữ" value={String(item.reservedQuantity)} />
        <InfoCell label="Cập nhật" value={formatDateTime(item.updatedAt)} small />
      </View>

      <View style={[styles.itemCardFooter, { justifyContent: 'flex-end' }]}>
        <View style={styles.itemCardActions}>
          <ActionButton icon="edit-2" onPress={onEdit} color={TEXT_SECONDARY} />
          <ActionButton icon="trash-2" onPress={onDelete} color={DANGER} />
        </View>
      </View>
    </View>
  );
}

function InfoCell({ label, value, highlight, small }: { label: string; value: string; highlight?: boolean; small?: boolean }) {
  return (
    <View style={styles.infoCell}>
      <Text style={styles.infoCellLabel}>{label}</Text>
      <Text style={[styles.infoCellValue, highlight && styles.infoCellValueDanger, small && { fontSize: 11 }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function ActionButton({ icon, onPress, color }: { icon: any; onPress: () => void; color: string }) {
  return (
    <TouchableOpacity style={[styles.actionBtn, { borderColor: color + '33' }]} onPress={onPress} activeOpacity={0.7}>
      <Feather name={icon} size={13} color={color} />
    </TouchableOpacity>
  );
}

// ─── Form Field ───────────────────────────────────────────────────────────────
function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.formField}>
      <Text style={styles.formFieldLabel}>{label}</Text>
      <TextInput
        style={[styles.formFieldInput, focused && styles.formFieldInputFocused]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={TEXT_LABEL}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

// ─── Select Field ─────────────────────────────────────────────────────────────
function SelectField<T extends string | number>({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: T | '';
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.formField}>
      <Text style={styles.formFieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.selectBtn, disabled && styles.selectBtnDisabled]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={disabled ? 1 : 0.8}
      >
        <Text style={[styles.selectBtnText, !selected && { color: TEXT_LABEL }]} numberOfLines={1}>
          {selected ? selected.label : (placeholder ?? 'Chọn...')}
        </Text>
        <Feather name="chevron-down" size={14} color={TEXT_SECONDARY} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.selectOverlay} onPress={() => setOpen(false)}>
          <View style={styles.selectSheet}>
            <Text style={styles.selectSheetTitle}>{label}</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={[styles.selectOption, opt.value === value && styles.selectOptionActive]}
                  onPress={() => { onChange(opt.value); setOpen(false); }}
                >
                  <Text style={[styles.selectOptionText, opt.value === value && styles.selectOptionTextActive]} numberOfLines={2}>
                    {opt.label}
                  </Text>
                  {opt.value === value && <Feather name="check" size={14} color={GREEN} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Inventory Modal ──────────────────────────────────────────────────────────
function InventoryFormModal({
  visible,
  mode,
  initialValues,
  fixedShopId,
  loading,
  onSubmit,
  onClose,
}: {
  visible: boolean;
  mode: 'create' | 'update';
  initialValues?: Partial<Inventory>;
  fixedShopId?: number;
  loading: boolean;
  onSubmit: (payload: any) => void;
  onClose: () => void;
}) {
  const [currentQuantity, setCurrentQuantity] = useState('');
  const [minimumThreshold, setMinimumThreshold] = useState('');
  const [reorderQuantity, setReorderQuantity] = useState('');

  useEffect(() => {
    if (visible) {
      setCurrentQuantity(String(initialValues?.currentQuantity ?? ''));
      setMinimumThreshold(String(initialValues?.minimumThreshold ?? ''));
      setReorderQuantity(String(initialValues?.reorderQuantity ?? ''));
    }
  }, [visible, initialValues]);

  const handleSubmit = () => {
    onSubmit({
      shopId: fixedShopId ?? initialValues?.shopId ?? 0,
      currentQuantity: currentQuantity !== '' ? Number(currentQuantity) : undefined,
      minimumThreshold: minimumThreshold !== '' ? Number(minimumThreshold) : undefined,
      reorderQuantity: reorderQuantity !== '' ? Number(reorderQuantity) : undefined,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{mode === 'create' ? 'Tạo kho' : 'Cập nhật kho'}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={20} color={TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalInfoRow}>
            <Text style={styles.modalInfoLabel}>Shop ID</Text>
            <Text style={styles.modalInfoValue}>{fixedShopId ?? initialValues?.shopId ?? '-'}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.formGrid}>
              <FormField label="Số lượng hiện tại" value={currentQuantity} onChangeText={setCurrentQuantity} keyboardType="numeric" placeholder="0" />
              <FormField label="Mức tồn tối thiểu" value={minimumThreshold} onChangeText={setMinimumThreshold} keyboardType="numeric" placeholder="0" />
              <FormField label="Số lượng nhập lại" value={reorderQuantity} onChangeText={setReorderQuantity} keyboardType="numeric" placeholder="0" />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Feather name="save" size={14} color="#fff" />}
              <Text style={styles.submitBtnText}>{mode === 'create' ? 'Tạo kho' : 'Lưu thay đổi'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Inventory Item Modal ─────────────────────────────────────────────────────
function InventoryItemFormModal({
  visible,
  mode,
  initialValues,
  productOptions,
  inventoryOptions,
  productsLoading,
  loading,
  onSubmit,
  onClose,
}: {
  visible: boolean;
  mode: 'create' | 'update';
  initialValues?: Partial<InventoryItem>;
  productOptions: ProductOption[];
  inventoryOptions: InventoryOption[];
  productsLoading: boolean;
  loading: boolean;
  onSubmit: (payload: any) => void;
  onClose: () => void;
}) {
  const [productSelection, setProductSelection] = useState('');
  const [inventoryId, setInventoryId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reservedQuantity, setReservedQuantity] = useState('');

  useEffect(() => {
    if (visible) {
      const sel =
        initialValues?.productType === 'SHOP' && initialValues.shopProductId != null
          ? `SHOP:${initialValues.shopProductId}`
          : initialValues?.productId != null
          ? `SYSTEM:${initialValues.productId}`
          : '';
      setProductSelection(sel);
      setInventoryId(String(initialValues?.inventoryId ?? ''));
      setQuantity(String(initialValues?.quantity ?? ''));
      setReservedQuantity(String(initialValues?.reservedQuantity ?? ''));
    }
  }, [visible, initialValues]);

  const productSelectOptions = useMemo(
    () =>
      productOptions.map((p) => ({
        label: `[${p.source === 'SYSTEM' ? 'Hệ thống' : 'Cửa hàng'}] #${p.id} - ${p.name}`,
        value: `${p.source}:${p.id}`,
      })),
    [productOptions],
  );

  const inventorySelectOptions = useMemo(
    () =>
      inventoryOptions.map((inv) => ({
        label: `#${inv.inventoryId} - Shop ${inv.shopId}`,
        value: inv.inventoryId,
      })),
    [inventoryOptions],
  );

  const handleSubmit = () => {
    if (!productSelection || !inventoryId) {
      Alert.alert('Lỗi', 'Vui lòng chọn sản phẩm và kho.');
      return;
    }
    const [source, rawId] = productSelection.split(':');
    const selectedId = Number(rawId);
    onSubmit({
      productId: source === 'SYSTEM' ? selectedId : undefined,
      shopProductId: source === 'SHOP' ? selectedId : undefined,
      inventoryId: Number(inventoryId),
      quantity: quantity !== '' ? Number(quantity) : undefined,
      reservedQuantity: reservedQuantity !== '' ? Number(reservedQuantity) : undefined,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{mode === 'create' ? 'Thêm mục hàng' : 'Cập nhật mục hàng'}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={20} color={TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <SelectField
              label="Sản phẩm"
              value={productSelection}
              options={productSelectOptions}
              onChange={(v) => setProductSelection(v as string)}
              placeholder={productsLoading ? 'Đang tải sản phẩm...' : 'Chọn sản phẩm'}
              disabled={productsLoading}
            />
            <SelectField
              label="Kho"
              value={Number(inventoryId) || ''}
              options={inventorySelectOptions}
              onChange={(v) => setInventoryId(String(v))}
              placeholder="Chọn kho"
              disabled={inventorySelectOptions.length === 0}
            />
            <View style={styles.formGrid}>
              <FormField label="Số lượng" value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="0" />
              <FormField label="Dự trữ" value={reservedQuantity} onChangeText={setReservedQuantity} keyboardType="numeric" placeholder="0" />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Feather name="save" size={14} color="#fff" />}
              <Text style={styles.submitBtnText}>{mode === 'create' ? 'Thêm' : 'Lưu'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmDeleteModal({
  visible,
  title,
  description,
  loading,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  description: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { paddingBottom: 24 }]}>
          <View style={styles.deleteIconWrap}>
            <Feather name="alert-triangle" size={28} color={DANGER} />
          </View>
          <Text style={styles.deleteTitle}>{title}</Text>
          <Text style={styles.deleteDesc}>{description}</Text>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.deleteBtn, loading && styles.submitBtnDisabled]} onPress={onConfirm} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Feather name="trash-2" size={14} color="#fff" />}
              <Text style={styles.submitBtnText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({
  productName,
  onProductNameChange,
  productId,
  onProductIdChange,
  onSearch,
  onReset,
}: {
  productName: string;
  onProductNameChange: (v: string) => void;
  productId: string;
  onProductIdChange: (v: string) => void;
  onSearch: () => void;
  onReset: () => void;
}) {
  return (
    <View style={styles.filterBar}>
      <View style={styles.filterRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.formFieldLabel}>Tên sản phẩm</Text>
          <TextInput
            style={styles.formFieldInput}
            value={productName}
            onChangeText={onProductNameChange}
            placeholder="Nhập tên sản phẩm"
            placeholderTextColor={TEXT_LABEL}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.formFieldLabel}>Product ID</Text>
          <TextInput
            style={styles.formFieldInput}
            value={productId}
            onChangeText={onProductIdChange}
            placeholder="Nhập ID"
            placeholderTextColor={TEXT_LABEL}
            keyboardType="numeric"
          />
        </View>
      </View>
      <View style={styles.filterActions}>
        <TouchableOpacity style={styles.filterResetBtn} onPress={onReset}>
          <Feather name="rotate-ccw" size={13} color={TEXT_SECONDARY} />
          <Text style={styles.filterResetText}>Đặt lại</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterSearchBtn} onPress={onSearch}>
          <Feather name="search" size={13} color="#fff" />
          <Text style={styles.filterSearchText}>Lọc</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.emptyState}>
      <MaterialIcons name="inventory" size={36} color={GREEN} style={{ opacity: 0.5 }} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDesc}>{description}</Text>
    </View>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const router = useRouter();
  const auth = useAuth()

  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [systemProducts, setSystemProducts] = useState<Product[]>([]);
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [currentShopId, setCurrentShopId] = useState<number | null>(null);

  const [productNameFilter, setProductNameFilter] = useState('');
  const [productIdFilter, setProductIdFilter] = useState('');
  const [appliedProductNameFilter, setAppliedProductNameFilter] = useState('');
  const [appliedProductIdFilter, setAppliedProductIdFilter] = useState<number | null>(null);

  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);

  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const [inventoryModal, setInventoryModal] = useState<{ open: boolean; mode: 'create' | 'update'; data?: Inventory }>({ open: false, mode: 'create' });
  const [itemModal, setItemModal] = useState<{ open: boolean; mode: 'create' | 'update'; data?: InventoryItem }>({ open: false, mode: 'create' });
  const [confirmDeleteInventory, setConfirmDeleteInventory] = useState<Inventory | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<InventoryItem | null>(null);

  // Active tab: 'inventories' | 'items'
  const [activeTab, setActiveTab] = useState<'inventories' | 'items'>('inventories');

  const showToast = (type: ToastType, message: string) => setToast({ type, message });

  // ── Load shopId from AsyncStorage ───────────────────────────────────────────
  useEffect(() => {
    SecureStore.getItemAsync('shopId').then((raw) => {
      const parsed = Number(raw) || Number(auth.user?.shop_id);
      if (!raw || isNaN(parsed) || parsed <= 0) {
        setCurrentShopId(null);
        showToast('error', 'Không tìm thấy shopId. Vui lòng đăng nhập lại.');
        setInventoryLoading(false);
        setItemsLoading(false);
        return;
      }
      setCurrentShopId(parsed);
    });
  }, []);

  const fetchInventories = useCallback(async (shopId?: number) => {
    setInventoryLoading(true);
    try {
      const data = await getInventories(shopId);
      setInventories(data);
    } catch (error) {
      showToast('error', normalizeApiError(error).message);
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  const fetchItems = useCallback(async (params?: { inventoryId?: number; productId?: number }) => {
    setItemsLoading(true);
    try {
      const data = await getInventoryItems(params);
      setInventoryItems(data);
    } catch (error) {
      showToast('error', normalizeApiError(error).message);
    } finally {
      setItemsLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const [system, shop] = await Promise.all([getProducts(true), getShopProducts(true)]);
      setSystemProducts(system);
      setShopProducts(shop);
    } catch {
      setSystemProducts([]);
      setShopProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentShopId) return;
    fetchInventories(currentShopId);
    fetchItems();
    fetchProducts();
  }, [currentShopId]);

  // ── Derived data ────────────────────────────────────────────────────────────
  const currentShopInventoryIds = useMemo(() => new Set(inventories.map((inv) => inv.inventoryId)), [inventories]);

  const visibleInventoryItems = useMemo(
    () => inventoryItems.filter((item) => currentShopInventoryIds.has(item.inventoryId)),
    [currentShopInventoryIds, inventoryItems],
  );

  const productNameByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of systemProducts) map.set(`SYSTEM:${p.productId}`, p.productName);
    for (const p of shopProducts) map.set(`SHOP:${p.productId}`, p.productName);
    return map;
  }, [systemProducts, shopProducts]);

  const productBarcodeByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of systemProducts) map.set(`SYSTEM:${p.productId}`, p.barcode ?? '');
    for (const p of shopProducts) map.set(`SHOP:${p.productId}`, p.barcode ?? '');
    return map;
  }, [systemProducts, shopProducts]);

  const resolveProductName = useCallback(
    (row: InventoryItem) => {
      const source = row.productType === 'SHOP' ? 'SHOP' : 'SYSTEM';
      const id = source === 'SHOP' ? row.shopProductId : row.productId;
      if (id == null) return '-';
      return productNameByKey.get(`${source}:${id}`) ?? `Product #${id}`;
    },
    [productNameByKey],
  );

  const resolveProductBarcode = useCallback(
    (row: InventoryItem) => {
      const source = row.productType === 'SHOP' ? 'SHOP' : 'SYSTEM';
      const id = source === 'SHOP' ? row.shopProductId : row.productId;
      if (id == null) return '-';
      return productBarcodeByKey.get(`${source}:${id}`) ?? '-';
    },
    [productBarcodeByKey],
  );

  const filteredInventoryItems = useMemo(() => {
    const keyword = appliedProductNameFilter.trim().toLowerCase();
    return visibleInventoryItems.filter((item) => {
      const matchById = appliedProductIdFilter == null || item.productId === appliedProductIdFilter || item.shopProductId === appliedProductIdFilter;
      const matchByName = keyword === '' || resolveProductName(item).toLowerCase().includes(keyword);
      return matchById && matchByName;
    });
  }, [appliedProductIdFilter, appliedProductNameFilter, resolveProductName, visibleInventoryItems]);

  const productOptions = useMemo<ProductOption[]>(
    () => [
      ...systemProducts.map((p) => ({ id: p.productId, name: p.productName, source: 'SYSTEM' as const })),
      ...shopProducts.map((p) => ({ id: p.productId, name: p.productName, source: 'SHOP' as const })),
    ],
    [systemProducts, shopProducts],
  );

  const inventoryOptions = useMemo<InventoryOption[]>(
    () => inventories.map((inv) => ({ inventoryId: inv.inventoryId, shopId: inv.shopId })),
    [inventories],
  );

  // Stats
  const totalInventory = inventories.length;
  const lowStockItems = inventories.filter((i) => i.currentQuantity < i.minimumThreshold).length;
  const totalCurrentQty = inventories.reduce((s, i) => s + (i.currentQuantity || 0), 0);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSearchItem = () => {
    const id = Number(productIdFilter);
    if (productIdFilter && isNaN(id)) {
      showToast('error', 'Product ID không hợp lệ.');
      return;
    }
    setAppliedProductIdFilter(productIdFilter ? id : null);
    setAppliedProductNameFilter(productNameFilter.trim());
  };

  const handleResetItem = () => {
    setProductNameFilter('');
    setProductIdFilter('');
    setAppliedProductNameFilter('');
    setAppliedProductIdFilter(null);
    fetchItems();
  };

  const submitInventory = async (payload: any) => {
    setModalLoading(true);
    try {
      if (inventoryModal.mode === 'create') {
        await createInventory(payload);
        showToast('success', 'Tạo kho thành công.');
      } else if (inventoryModal.data) {
        await updateInventory(inventoryModal.data.inventoryId, payload);
        showToast('success', 'Cập nhật kho thành công.');
      }
      setInventoryModal({ open: false, mode: 'create' });
      await fetchInventories(currentShopId ?? undefined);
    } catch (error) {
      showToast('error', normalizeApiError(error).message);
    } finally {
      setModalLoading(false);
    }
  };

  const submitInventoryItem = async (payload: any) => {
    setModalLoading(true);
    try {
      if (itemModal.mode === 'create') {
        await createInventoryItem(payload);
        showToast('success', 'Thêm mục hàng thành công.');
      } else if (itemModal.data) {
        await updateInventoryItem(itemModal.data.inventoryItemId, payload);
        showToast('success', 'Cập nhật mục hàng thành công.');
      }
      setItemModal({ open: false, mode: 'create' });
      await fetchItems();
    } catch (error) {
      showToast('error', normalizeApiError(error).message);
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDeleteInventoryAction = async () => {
    if (!confirmDeleteInventory) return;
    const hasItems = visibleInventoryItems.some((i) => i.inventoryId === confirmDeleteInventory.inventoryId);
    if (hasItems) {
      showToast('error', 'Kho đang có sản phẩm. Vui lòng xóa sản phẩm trước!');
      setConfirmDeleteInventory(null);
      return;
    }
    setModalLoading(true);
    try {
      await deleteInventory(confirmDeleteInventory.inventoryId);
      showToast('success', 'Đã xóa kho.');
      setConfirmDeleteInventory(null);
      await fetchInventories(currentShopId ?? undefined);
    } catch (error) {
      showToast('error', normalizeApiError(error).message);
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDeleteItemAction = async () => {
    if (!confirmDeleteItem) return;
    setModalLoading(true);
    try {
      await deleteInventoryItem(confirmDeleteItem.inventoryItemId);
      showToast('success', 'Đã xóa mục hàng trong kho.');
      setConfirmDeleteItem(null);
      await fetchItems();
    } catch (error) {
      showToast('error', normalizeApiError(error).message);
    } finally {
      setModalLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* Toast */}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBtn} />
        <Text style={styles.headerTitle}>Quản lý kho</Text>
        <View style={styles.headerBtn} />
      </View>

      {/* Stat Cards */}
      <View style={styles.statsRow}>
        <StatCard label="Tổng kho" value={totalInventory} />
        <StatCard label="Sắp hết" value={lowStockItems} accent />
        <StatCard label="Tổng tồn" value={totalCurrentQty} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'inventories' && styles.tabActive]}
          onPress={() => setActiveTab('inventories')}
        >
          <Text style={[styles.tabText, activeTab === 'inventories' && styles.tabTextActive]}>Kho hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'items' && styles.tabActive]}
          onPress={() => setActiveTab('items')}
        >
          <Text style={[styles.tabText, activeTab === 'items' && styles.tabTextActive]}>Mục hàng</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'inventories' ? (
        <View style={{ flex: 1 }}>
          <SectionHeader
            title={`Danh sách kho (${inventories.length})`}
            onAdd={() => setInventoryModal({ open: true, mode: 'create' })}
            addLabel="Tạo kho"
          />
          {inventoryLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={GREEN} size="large" />
              <Text style={styles.loadingText}>Đang tải danh sách kho...</Text>
            </View>
          ) : inventories.length === 0 ? (
            <EmptyState title="Chưa có kho" description="Tạo kho đầu tiên để bắt đầu quản lý tồn kho." />
          ) : (
            <FlatList
              data={inventories}
              keyExtractor={(item) => String(item.inventoryId)}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <InventoryCard
                  item={item}
                  // onView={() => router.push(`/inventory/${item.inventoryId}`)}
                  onEdit={() => setInventoryModal({ open: true, mode: 'update', data: item })}
                  onDelete={() => setConfirmDeleteInventory(item)}
                />
              )}
            />
          )}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <SectionHeader
            title={`Mục hàng trong kho (${filteredInventoryItems.length})`}
            onAdd={() => setItemModal({ open: true, mode: 'create' })}
            addLabel="Thêm mục"
          />
          <FilterBar
            productName={productNameFilter}
            onProductNameChange={setProductNameFilter}
            productId={productIdFilter}
            onProductIdChange={setProductIdFilter}
            onSearch={handleSearchItem}
            onReset={handleResetItem}
          />
          {itemsLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={GREEN} size="large" />
              <Text style={styles.loadingText}>Đang tải mục hàng...</Text>
            </View>
          ) : filteredInventoryItems.length === 0 ? (
            <EmptyState title="Chưa có mục hàng" description="Thêm mục hàng để quản lý số lượng theo sản phẩm." />
          ) : (
            <FlatList
              data={filteredInventoryItems}
              keyExtractor={(item) => String(item.inventoryItemId)}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <InventoryItemCard
                  item={item}
                  getProductName={resolveProductName}
                  getProductBarcode={resolveProductBarcode}
                  onEdit={() => setItemModal({ open: true, mode: 'update', data: item })}
                  onDelete={() => setConfirmDeleteItem(item)}
                />
              )}
            />
          )}
        </View>
      )}

      {/* Modals */}
      <InventoryFormModal
        visible={inventoryModal.open}
        mode={inventoryModal.mode}
        initialValues={inventoryModal.data}
        fixedShopId={currentShopId ?? undefined}
        loading={modalLoading}
        onSubmit={submitInventory}
        onClose={() => setInventoryModal({ open: false, mode: 'create' })}
      />

      <InventoryItemFormModal
        visible={itemModal.open}
        mode={itemModal.mode}
        initialValues={itemModal.data}
        productOptions={productOptions}
        inventoryOptions={inventoryOptions}
        productsLoading={productsLoading}
        loading={modalLoading}
        onSubmit={submitInventoryItem}
        onClose={() => setItemModal({ open: false, mode: 'create' })}
      />

      <ConfirmDeleteModal
        visible={!!confirmDeleteInventory}
        title="Xóa kho"
        description={`Bạn chắc chắn muốn xóa kho #${confirmDeleteInventory?.inventoryId ?? ''}?`}
        loading={modalLoading}
        onCancel={() => setConfirmDeleteInventory(null)}
        onConfirm={confirmDeleteInventoryAction}
      />

      <ConfirmDeleteModal
        visible={!!confirmDeleteItem}
        title="Xóa mục hàng"
        description={`Bạn chắc chắn muốn xóa mục hàng #${confirmDeleteItem?.inventoryItemId ?? ''}?`}
        loading={modalLoading}
        onCancel={() => setConfirmDeleteItem(null)}
        onConfirm={confirmDeleteItemAction}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 60 },
  loadingText: { color: TEXT_SECONDARY, fontSize: 13 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  headerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: TEXT_PRIMARY, fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 12 },
  statCardAccent: { borderColor: WARNING + '66', backgroundColor: '#fffbeb' },
  statLabel: { fontSize: 10, fontWeight: '700', color: TEXT_LABEL, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '800', color: TEXT_PRIMARY },
  statValueAccent: { color: WARNING },

  // Tabs
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9 },
  tabActive: { backgroundColor: GREEN },
  tabText: { fontSize: 13, fontWeight: '600', color: TEXT_SECONDARY },
  tabTextActive: { color: '#fff' },

  // Section Header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: GREEN, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },

  // Item Card
  itemCard: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14 },
  itemCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  itemCardIdBadge: { backgroundColor: GREEN + '15', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  itemCardIdText: { color: GREEN, fontSize: 12, fontWeight: '700' },
  lowStockBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef9c3', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  lowStockText: { color: WARNING, fontSize: 11, fontWeight: '600' },
  itemCardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0, marginBottom: 10 },
  itemCardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 10 },
  itemCardDate: { fontSize: 11, color: TEXT_LABEL, flex: 1 },
  itemCardActions: { flexDirection: 'row', gap: 6 },
  actionBtn: { width: 30, height: 30, borderRadius: 7, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  // Info Cell
  infoCell: { width: '50%', paddingVertical: 4, paddingRight: 8 },
  infoCellLabel: { fontSize: 10, color: TEXT_LABEL, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  infoCellValue: { fontSize: 13, fontWeight: '600', color: TEXT_PRIMARY },
  infoCellValueDanger: { color: DANGER },

  // Product name/barcode
  productName: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY, marginBottom: 2 },
  productBarcode: { fontSize: 11, color: TEXT_LABEL, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginBottom: 10 },

  // Filter Bar
  filterBar: { marginHorizontal: 16, marginBottom: 10, backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 12 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  filterActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  filterResetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: BORDER, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  filterResetText: { color: TEXT_SECONDARY, fontSize: 12, fontWeight: '600' },
  filterSearchBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: GREEN, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  filterSearchText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Empty State
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY },
  emptyDesc: { fontSize: 13, color: TEXT_SECONDARY, textAlign: 'center', paddingHorizontal: 32 },

  // Form
  formField: { marginBottom: 14 },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  formFieldLabel: { fontSize: 11, fontWeight: '700', color: TEXT_LABEL, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  formFieldInput: { backgroundColor: BG, borderRadius: 9, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 13, paddingVertical: Platform.OS === 'ios' ? 11 : 8, fontSize: 14, color: TEXT_PRIMARY },
  formFieldInputFocused: { borderColor: GREEN, backgroundColor: '#fff' },

  // Select
  selectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: BG, borderRadius: 9, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 13, paddingVertical: Platform.OS === 'ios' ? 11 : 8 },
  selectBtnDisabled: { opacity: 0.5 },
  selectBtnText: { fontSize: 14, color: TEXT_PRIMARY, flex: 1, marginRight: 8 },
  selectOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  selectSheet: { backgroundColor: CARD, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  selectSheetTitle: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY, marginBottom: 12 },
  selectOption: { paddingVertical: 13, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: BORDER, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectOptionActive: { backgroundColor: GREEN + '10' },
  selectOptionText: { fontSize: 14, color: TEXT_PRIMARY, flex: 1, marginRight: 8 },
  selectOptionTextActive: { color: GREEN, fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: CARD, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: TEXT_PRIMARY },
  modalInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: BG, borderRadius: 9, paddingHorizontal: 13, paddingVertical: 10, marginBottom: 14 },
  modalInfoLabel: { fontSize: 12, fontWeight: '600', color: TEXT_SECONDARY },
  modalInfoValue: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },
  modalFooter: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 10, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: TEXT_SECONDARY },
  submitBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: GREEN, borderRadius: 10, paddingVertical: 13 },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  deleteBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: DANGER, borderRadius: 10, paddingVertical: 13 },

  // Delete modal
  deleteIconWrap: { alignItems: 'center', marginBottom: 12 },
  deleteTitle: { fontSize: 17, fontWeight: '700', color: TEXT_PRIMARY, textAlign: 'center', marginBottom: 6 },
  deleteDesc: { fontSize: 13, color: TEXT_SECONDARY, textAlign: 'center', marginBottom: 4, paddingHorizontal: 8 },

  // Toast
  toast: { position: 'absolute', top: 56, left: 16, right: 16, zIndex: 999, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 8 },
  toastSuccess: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  toastError: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  toastText: { flex: 1, fontSize: 13, fontWeight: '600' },
});