import { apiClient } from "@/configs/axios";

export type MenuItem = {
    PDid: string;
    PDname: string;
    PDprice: number;
    PDinStock: boolean;
    PDcategory: string;
    PDdescription?: string;
    PDimage?: string;
    PDcategoryOpen?: boolean;
}

const CATEGORIES = ['All', 'Coffee', 'Juice', 'Soft Drink', 'Tea', 'Snack'];

const MENU_ITEMS: MenuItem[] = [
    { PDid: '1', PDdescription: 'A strong and bold coffee', PDname: 'Espresso', PDprice: 25, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&q=80' },
    { PDid: '2', PDdescription: 'A creamy and smooth coffee with milk', PDname: 'Milk Coffee', PDprice: 29, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80' },
    { PDid: '3', PDdescription: 'A simple black coffee without milk or sugar', PDname: 'Black Coffee', PDprice: 20, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80' },
    { PDid: '4', PDdescription: 'A creamy coffee with steamed milk and foam on top', PDname: 'Latte', PDprice: 35, PDinStock: false, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&q=80' },
    { PDid: '5', PDdescription: 'A coffee with steamed milk and a layer of foam on top of it', PDname: 'Cappuccino', PDprice: 35, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&q=80' },
    { PDid: '6', PDdescription: 'A chocolate-flavored coffee drink made with espresso and steamed milk and topped with whipped cream.', PDname: 'Mocha', PDprice: 39, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&q=80' },
    { PDid: '7', PDdescription: 'Freshly squeezed orange juice', PDname: 'Orange Juice', PDprice: 25, PDinStock: true, PDcategory: 'Juice', PDimage: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80' },
    { PDid: '8', PDdescription: 'A refreshing carbonated soft drink', PDname: 'Coca Cola', PDprice: 15, PDinStock: true, PDcategory: 'Soft Drink', PDimage: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80' },
    { PDid: '9', PDdescription: 'A hot beverage made from steeping tea leaves in boiling water', PDname: 'Green Tea', PDprice: 20, PDinStock: true, PDcategory: 'Tea', PDimage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80' },
    { PDid: '10', PDdescription: 'A light and crispy snack, perfect for sharing', PDname: 'French Fries', PDprice: 30, PDinStock: false, PDcategory: 'Snack', PDimage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80' },
    { PDid: '11', PDdescription: 'A sweet and fluffy pastry filled with cream', PDname: 'Cream Puff', PDprice: 22, PDinStock: true, PDcategory: 'Snack', PDimage: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80' },
    { PDid: '12', PDdescription: 'A rich espresso topped with hot water for a smooth taste', PDname: 'Americano', PDprice: 28, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1527169402691-a19f59e4b6f8?w=400&q=80' },
    { PDid: '13', PDdescription: 'A strong Vietnamese coffee brewed with condensed milk', PDname: 'Vietnamese Iced Coffee', PDprice: 32, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1558126319-c9feecbf57ee?w=400&q=80' },
    { PDid: '14', PDdescription: 'A refreshing iced tea with lemon flavor', PDname: 'Lemon Iced Tea', PDprice: 22, PDinStock: true, PDcategory: 'Tea', PDimage: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80' },
    { PDid: '15', PDdescription: 'A creamy blended coffee served cold with ice', PDname: 'Frappuccino', PDprice: 42, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80' },
    { PDid: '16', PDdescription: 'Fresh watermelon juice served chilled', PDname: 'Watermelon Juice', PDprice: 27, PDinStock: true, PDcategory: 'Juice', PDimage: 'https://images.unsplash.com/photo-1571687949920-ecf1b39bce74?w=400&q=80' },
    { PDid: '17', PDdescription: 'Sweet mango smoothie blended with fresh milk', PDname: 'Mango Smoothie', PDprice: 33, PDinStock: false, PDcategory: 'Juice', PDimage: 'https://images.unsplash.com/photo-1589308078054-8327b9a4d37e?w=400&q=80' },
    { PDid: '18', PDdescription: 'Classic black tea with a strong aroma', PDname: 'Black Tea', PDprice: 18, PDinStock: true, PDcategory: 'Tea', PDimage: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&q=80' },
    { PDid: '19', PDdescription: 'Sparkling lemon soda with ice', PDname: 'Sprite', PDprice: 15, PDinStock: true, PDcategory: 'Soft Drink', PDimage: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&q=80' },
    { PDid: '20', PDdescription: 'A delicious chocolate chip cookie', PDname: 'Chocolate Cookie', PDprice: 18, PDinStock: true, PDcategory: 'Snack', PDimage: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80' },
    { PDid: '21', PDdescription: 'A crispy grilled sandwich with ham and cheese', PDname: 'Grilled Sandwich', PDprice: 40, PDinStock: true, PDcategory: 'Snack', PDimage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80' },
    { PDid: '22', PDdescription: 'Hot chocolate topped with whipped cream', PDname: 'Hot Chocolate', PDprice: 30, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&q=80' },
    { PDid: '23', PDdescription: 'A refreshing strawberry milkshake', PDname: 'Strawberry Milkshake', PDprice: 35, PDinStock: true, PDcategory: 'Juice', PDimage: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80' },
    { PDid: '24', PDdescription: 'Traditional Vietnamese iced tea', PDname: 'Peach Tea', PDprice: 26, PDinStock: true, PDcategory: 'Tea', PDimage: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&q=80' },
    { PDid: '25', PDdescription: 'A fizzy orange flavored soft drink', PDname: 'Fanta', PDprice: 15, PDinStock: true, PDcategory: 'Soft Drink', PDimage: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&q=80' },
    { PDid: '26', PDdescription: 'Fresh pineapple juice with natural sweetness', PDname: 'Pineapple Juice', PDprice: 28, PDinStock: false, PDcategory: 'Juice', PDimage: 'https://images.unsplash.com/photo-1571687949920-ecf1b39bce74?w=400&q=80' },
    { PDid: '27', PDdescription: 'A creamy avocado smoothie blended with condensed milk', PDname: 'Avocado Smoothie', PDprice: 36, PDinStock: true, PDcategory: 'Juice', PDimage: 'https://images.unsplash.com/photo-1584270354949-1a9f3e7a4d58?w=400&q=80' },
    { PDid: '28', PDdescription: 'Classic butter croissant, flaky and soft', PDname: 'Croissant', PDprice: 24, PDinStock: true, PDcategory: 'Snack', PDimage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
    { PDid: '29', PDdescription: 'A cold brew coffee steeped for 12 hours', PDname: 'Cold Brew', PDprice: 38, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&q=80' },
    { PDid: '30', PDdescription: 'A refreshing mint lemonade with crushed ice', PDname: 'Mint Lemonade', PDprice: 29, PDinStock: true, PDcategory: 'Juice', PDimage: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&q=80' },
    { PDid: '31', PDdescription: 'Classic salted potato chips', PDname: 'Potato Chips', PDprice: 20, PDinStock: true, PDcategory: 'Snack', PDimage: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80' },
];

export const getAllProducts = async () => {
    return MENU_ITEMS;
}

export const getAllCategories = async () => {
    return CATEGORIES;
}

// ===== TYPES =====

export interface Product {
  productId: number;
  categoryId: number;
  productName: string;
  sku: string;
  barcode?: string | null;
  description?: string | null;
  measureUnit?: string | null;
  /** Giá nhập (import price) - khớp với BE field importPrice */
  importPrice: number;
  /** Giá bán (list price) - khớp với BE field listPrice */
  listPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  categoryId: number;
  productName: string;
  sku: string;
  barcode?: string;
  description?: string;
  measureUnit?: string;
  /** Giá nhập kho */
  importPrice: number;
  /** Giá bán lẻ */
  listPrice: number;
  isActive?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

// ===== HELPERS =====

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function mapBackendProductToFrontend(raw: Record<string, unknown>): Product {
  return {
    productId: toNumber(raw.productId ?? raw.product_id ?? raw.id),
    categoryId: toNumber(raw.categoryId ?? raw.category_id),
    productName: String(raw.productName ?? raw.product_name ?? ''),
    sku: String(raw.sku ?? ''),
    barcode: raw.barcode != null ? String(raw.barcode) : null,
    description: raw.description != null ? String(raw.description) : null,
    measureUnit: raw.measureUnit != null
      ? String(raw.measureUnit)
      : raw.measure_unit != null
        ? String(raw.measure_unit)
        : null,
    importPrice: toNumber(raw.importPrice ?? raw.import_price),
    listPrice: toNumber(raw.listPrice ?? raw.list_price),
    isActive: Boolean(raw.isActive ?? raw.is_active),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? ''),
  };
}

function normalizeProductList(raw: unknown): Product[] {
  const unwrapped = unwrap<unknown>(raw);
  const list = Array.isArray(unwrapped) ? unwrapped : [];
  return list
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map(mapBackendProductToFrontend);
}

function normalizeSingleProduct(raw: unknown): Product {
  const unwrapped = unwrap<unknown>(raw);
  const obj = (typeof unwrapped === 'object' && unwrapped !== null)
    ? (unwrapped as Record<string, unknown>)
    : {};
  return mapBackendProductToFrontend(obj);
}

// ===== PRODUCT APIs =====

export const getProducts = async (isActive?: boolean): Promise<Product[]> => {
  const params = isActive !== undefined ? { isActive } : {};
  const res = await apiClient.get<Product[]>('/products', { params });
  return normalizeProductList(res.data);
  //return normalizeProductList(PRODUCT_SEED_DATA);
};

export const getActiveProducts = async (): Promise<Product[]> => {
  return getProducts(true);
};

export const getProductById = async (id: number): Promise<Product> => {
  const res = await apiClient.get(`/products/${id}`);
  return normalizeSingleProduct(res.data);
};

export const createProduct = async (payload: CreateProductPayload): Promise<Product> => {
  const res = await apiClient.post('/products', payload);
  return normalizeSingleProduct(res.data);
};

export const updateProduct = async (id: number, payload: UpdateProductPayload): Promise<Product> => {
  const res = await apiClient.patch(`/products/${id}`, payload);
  return normalizeSingleProduct(res.data);
};

export const softDeleteProduct = async (id: number): Promise<{ message: string }> => {
  const res = await apiClient.delete(`/products/${id}`);
  return res.data;
};

export const hardDeleteProduct = async (id: number): Promise<{ message: string }> => {
  const res = await apiClient.delete(`/products/${id}/hard`);
  return res.data;
};

export const CATEGORY_MAP: Record<string, number> = {
  Coffee: 1,
  Juice: 2,
  'Soft Drink': 3,
  Tea: 4,
  Snack: 5,
};

export const PRODUCT_SEED_DATA: CreateProductPayload[] = [
  // ── COFFEE ──────────────────────────────────────────────────────────────────
  {
    categoryId: CATEGORY_MAP['Coffee'],
    productName: 'Espresso',
    sku: 'COF-001',
    description: 'A strong and bold coffee',
    measureUnit: 'cup',
    importPrice: 10,
    listPrice: 25,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Coffee'],
    productName: 'Milk Coffee',
    sku: 'COF-002',
    description: 'A creamy and smooth coffee with milk',
    measureUnit: 'cup',
    importPrice: 12,
    listPrice: 29,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Coffee'],
    productName: 'Black Coffee',
    sku: 'COF-003',
    description: 'A simple black coffee without milk or sugar',
    measureUnit: 'cup',
    importPrice: 8,
    listPrice: 20,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Coffee'],
    productName: 'Latte',
    sku: 'COF-004',
    description: 'A creamy coffee with steamed milk and foam on top',
    measureUnit: 'cup',
    importPrice: 15,
    listPrice: 35,
    isActive: false, // out of stock
  },
  {
    categoryId: CATEGORY_MAP['Coffee'],
    productName: 'Cappuccino',
    sku: 'COF-005',
    description: 'A coffee with steamed milk and a layer of foam on top',
    measureUnit: 'cup',
    importPrice: 15,
    listPrice: 35,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Coffee'],
    productName: 'Mocha',
    sku: 'COF-006',
    description: 'A chocolate-flavored coffee drink made with espresso, steamed milk, and whipped cream',
    measureUnit: 'cup',
    importPrice: 17,
    listPrice: 39,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Coffee'],
    productName: 'Americano',
    sku: 'COF-007',
    description: 'A rich espresso topped with hot water for a smooth taste',
    measureUnit: 'cup',
    importPrice: 11,
    listPrice: 28,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Coffee'],
    productName: 'Vietnamese Iced Coffee',
    sku: 'COF-008',
    description: 'A strong Vietnamese coffee brewed with condensed milk',
    measureUnit: 'cup',
    importPrice: 13,
    listPrice: 32,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Coffee'],
    productName: 'Frappuccino',
    sku: 'COF-009',
    description: 'A creamy blended coffee served cold with ice',
    measureUnit: 'cup',
    importPrice: 18,
    listPrice: 42,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Coffee'],
    productName: 'Hot Chocolate',
    sku: 'COF-010',
    description: 'Hot chocolate topped with whipped cream',
    measureUnit: 'cup',
    importPrice: 12,
    listPrice: 30,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Coffee'],
    productName: 'Cold Brew',
    sku: 'COF-011',
    description: 'A cold brew coffee steeped for 12 hours',
    measureUnit: 'cup',
    importPrice: 16,
    listPrice: 38,
    isActive: true,
  },

  // ── JUICE ────────────────────────────────────────────────────────────────────
  {
    categoryId: CATEGORY_MAP['Juice'],
    productName: 'Orange Juice',
    sku: 'JUI-001',
    description: 'Freshly squeezed orange juice',
    measureUnit: 'glass',
    importPrice: 10,
    listPrice: 25,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Juice'],
    productName: 'Watermelon Juice',
    sku: 'JUI-002',
    description: 'Fresh watermelon juice served chilled',
    measureUnit: 'glass',
    importPrice: 11,
    listPrice: 27,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Juice'],
    productName: 'Mango Smoothie',
    sku: 'JUI-003',
    description: 'Sweet mango smoothie blended with fresh milk',
    measureUnit: 'glass',
    importPrice: 14,
    listPrice: 33,
    isActive: false, // out of stock
  },
  {
    categoryId: CATEGORY_MAP['Juice'],
    productName: 'Strawberry Milkshake',
    sku: 'JUI-004',
    description: 'A refreshing strawberry milkshake',
    measureUnit: 'glass',
    importPrice: 15,
    listPrice: 35,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Juice'],
    productName: 'Pineapple Juice',
    sku: 'JUI-005',
    description: 'Fresh pineapple juice with natural sweetness',
    measureUnit: 'glass',
    importPrice: 12,
    listPrice: 28,
    isActive: false, // out of stock
  },
  {
    categoryId: CATEGORY_MAP['Juice'],
    productName: 'Avocado Smoothie',
    sku: 'JUI-006',
    description: 'A creamy avocado smoothie blended with condensed milk',
    measureUnit: 'glass',
    importPrice: 16,
    listPrice: 36,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Juice'],
    productName: 'Mint Lemonade',
    sku: 'JUI-007',
    description: 'A refreshing mint lemonade with crushed ice',
    measureUnit: 'glass',
    importPrice: 12,
    listPrice: 29,
    isActive: true,
  },

  // ── SOFT DRINK ───────────────────────────────────────────────────────────────
  {
    categoryId: CATEGORY_MAP['Soft Drink'],
    productName: 'Coca Cola',
    sku: 'SDR-001',
    description: 'A refreshing carbonated soft drink',
    measureUnit: 'can',
    importPrice: 7,
    listPrice: 15,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Soft Drink'],
    productName: 'Sprite',
    sku: 'SDR-002',
    description: 'Sparkling lemon soda with ice',
    measureUnit: 'can',
    importPrice: 7,
    listPrice: 15,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Soft Drink'],
    productName: 'Fanta',
    sku: 'SDR-003',
    description: 'A fizzy orange flavored soft drink',
    measureUnit: 'can',
    importPrice: 7,
    listPrice: 15,
    isActive: true,
  },

  // ── TEA ──────────────────────────────────────────────────────────────────────
  {
    categoryId: CATEGORY_MAP['Tea'],
    productName: 'Green Tea',
    sku: 'TEA-001',
    description: 'A hot beverage made from steeping green tea leaves in boiling water',
    measureUnit: 'cup',
    importPrice: 8,
    listPrice: 20,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Tea'],
    productName: 'Lemon Iced Tea',
    sku: 'TEA-002',
    description: 'A refreshing iced tea with lemon flavor',
    measureUnit: 'glass',
    importPrice: 9,
    listPrice: 22,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Tea'],
    productName: 'Black Tea',
    sku: 'TEA-003',
    description: 'Classic black tea with a strong aroma',
    measureUnit: 'cup',
    importPrice: 7,
    listPrice: 18,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Tea'],
    productName: 'Peach Tea',
    sku: 'TEA-004',
    description: 'Traditional Vietnamese iced peach tea',
    measureUnit: 'glass',
    importPrice: 10,
    listPrice: 26,
    isActive: true,
  },

  // ── SNACK ────────────────────────────────────────────────────────────────────
  {
    categoryId: CATEGORY_MAP['Snack'],
    productName: 'French Fries',
    sku: 'SNK-001',
    description: 'A light and crispy snack, perfect for sharing',
    measureUnit: 'portion',
    importPrice: 12,
    listPrice: 30,
    isActive: false, // out of stock
  },
  {
    categoryId: CATEGORY_MAP['Snack'],
    productName: 'Cream Puff',
    sku: 'SNK-002',
    description: 'A sweet and fluffy pastry filled with cream',
    measureUnit: 'piece',
    importPrice: 9,
    listPrice: 22,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Snack'],
    productName: 'Chocolate Cookie',
    sku: 'SNK-003',
    description: 'A delicious chocolate chip cookie',
    measureUnit: 'piece',
    importPrice: 7,
    listPrice: 18,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Snack'],
    productName: 'Grilled Sandwich',
    sku: 'SNK-004',
    description: 'A crispy grilled sandwich with ham and cheese',
    measureUnit: 'piece',
    importPrice: 16,
    listPrice: 40,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Snack'],
    productName: 'Croissant',
    sku: 'SNK-005',
    description: 'Classic butter croissant, flaky and soft',
    measureUnit: 'piece',
    importPrice: 10,
    listPrice: 24,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP['Snack'],
    productName: 'Potato Chips',
    sku: 'SNK-006',
    description: 'Classic salted potato chips',
    measureUnit: 'bag',
    importPrice: 8,
    listPrice: 20,
    isActive: true,
  },
];