import { apiClient } from "@/configs/axios";

// ===== CATEGORY TYPES =====

export interface Category {
  id: number;
  categoryName: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryPayload {
  categoryName: string;
  isActive?: boolean;
}

// ===== PRODUCT TYPES =====

export interface Product {
  productId: number;
  categoryId: number;
  productName: string;
  image: string;
  sku: string;
  barcode?: string | null;
  description?: string | null;
  measureUnit?: string | null;
  importPrice: number;
  listPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  categoryId: number;
  productName: string;
  image?: string;
  sku?: string;
  barcode?: string;
  description?: string;
  measureUnit?: string;
  importPrice: number;
  listPrice: number;
  isActive?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

// ===== MENU ITEM TYPE =====

export type MenuItem = {
  PDid: string;
  PDname: string;
  PDprice: number;
  PDinStock: boolean;
  PDcategory: string;
  PDdescription?: string;
  PDimage?: string;
  PDcategoryOpen?: boolean;
};

// ===== HELPERS =====

/** Unwrap backend { data: T } envelope if present */
function unwrap<T>(raw: unknown): T {
  if (raw != null && typeof raw === "object" && "data" in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// ===== CATEGORY HELPERS =====

function mapBackendCategoryToFrontend(raw: Record<string, unknown>): Category {
  return {
    id: Number(raw.id ?? raw.categoryId),
    categoryName: String(raw.categoryName ?? raw.category_name ?? ""),
    isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ""),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? ""),
  };
}

// ===== CATEGORY APIs =====

export const getCategories = async (): Promise<Category[]> => {
  const res = await apiClient.get("/categories");
  const list = unwrap<Record<string, unknown>[]>(res.data);
  const arr = Array.isArray(list) ? list : [];

  return arr.map(mapBackendCategoryToFrontend);
};

export const createCategory = async (
  payload: CreateCategoryPayload
): Promise<Category> => {
  const res = await apiClient.post("/categories", {
    category_name: payload.categoryName,
    is_active: payload.isActive ?? true,
  });
  const raw = unwrap<Record<string, unknown>>(res.data);
  return mapBackendCategoryToFrontend(raw ?? {});
};

/** Returns ['All', ...active category names] for filter tabs */
export const getAllCategories = async (): Promise<string[]> => {
  const categories = await getCategories();
  return [
    "All",
    ...categories.filter((c) => c.isActive).map((c) => c.categoryName),
  ];
};

// ===== PRODUCT HELPERS =====

function mapBackendProductToFrontend(raw: Record<string, unknown>): Product {
  return {
    productId: toNumber(raw.productId ?? raw.product_id ?? raw.id),
    categoryId: toNumber(raw.categoryId ?? raw.category_id),
    productName: String(raw.productName ?? raw.product_name ?? ""),
    image: String(raw.image ?? ""),
    sku: String(raw.sku ?? ""),
    barcode: raw.barcode != null ? String(raw.barcode) : null,
    description: raw.description != null ? String(raw.description) : null,
    measureUnit:
      raw.measureUnit != null
        ? String(raw.measureUnit)
        : raw.measure_unit != null
          ? String(raw.measure_unit)
          : null,
    importPrice: toNumber(raw.importPrice ?? raw.import_price),
    listPrice: toNumber(raw.listPrice ?? raw.list_price),
    isActive: Boolean(raw.isActive ?? raw.is_active),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ""),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? ""),
  };
}

function normalizeProductList(raw: unknown): Product[] {
  const unwrapped = unwrap<unknown>(raw);
  const list = Array.isArray(unwrapped) ? unwrapped : [];
  return list
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    )
    .map(mapBackendProductToFrontend);
}

function normalizeSingleProduct(raw: unknown): Product {
  const unwrapped = unwrap<unknown>(raw);
  const obj =
    typeof unwrapped === "object" && unwrapped !== null
      ? (unwrapped as Record<string, unknown>)
      : {};
  return mapBackendProductToFrontend(obj);
}

// ===== MENU ITEM MAPPER =====

export function mapToMenuItem(
  product: Product,
  categoryMap: Map<number, string>
): MenuItem {
  return {
    PDid: String(product.productId),
    PDname: product.productName,
    PDprice: product.listPrice,
    PDinStock: product.isActive,
    PDcategory:
      categoryMap.get(product.categoryId) ?? String(product.categoryId),
    PDdescription: product.description ?? undefined,
    PDimage: product.image || undefined,
  };
}

// ===== PRODUCT APIs =====

export const getProducts = async (isActive?: boolean): Promise<Product[]> => {
  try {
    const params: Record<string, string> = {};
    if (isActive === true) params.isActive = "true";
    else if (isActive === false) params.isActive = "false";
    const res = await apiClient.get("/products", { params });
    return normalizeProductList(res.data);
  } catch (error) {
    console.error('getProducts: ', error);
    return normalizeProductList(PRODUCT_SEED_DATA)
  } 
};

export const getActiveProducts = async (): Promise<Product[]> =>
  getProducts(true);

export const getProductById = async (id: number): Promise<Product> => {
  const res = await apiClient.get(`/products/${id}`);
  return normalizeSingleProduct(res.data);
};

export const createProduct = async (
  payload: CreateProductPayload
): Promise<Product> => {
  const res = await apiClient.post("/products", payload);
  return normalizeSingleProduct(res.data);
};

export const updateProduct = async (
  id: number,
  payload: UpdateProductPayload
): Promise<Product> => {
  const res = await apiClient.patch(`/products/${id}`, payload);
  return normalizeSingleProduct(res.data);
};

export const softDeleteProduct = async (
  id: number
): Promise<{ message: string }> => {
  const res = await apiClient.delete(`/products/${id}`);
  return res.data;
};

export const hardDeleteProduct = async (
  id: number
): Promise<{ message: string }> => {
  const res = await apiClient.delete(`/products/${id}/hard`);
  return res.data;
};

/** Fetch all active products and map them to MenuItem[], joined with category names */
export const getAllProducts = async (
  isActive?: boolean
): Promise<MenuItem[]> => {
  const params: Record<string, string> = {};
  if (isActive === true) params.isActive = "true";
  else if (isActive === false) params.isActive = "false";

  const [products, categories] = await Promise.all([
    getProducts(isActive),
    getCategories(),
  ]);

  const categoryMap = new Map<number, string>(
    categories.map((c) => [c.id, c.categoryName])
  );

  return products.map((p) => mapToMenuItem(p, categoryMap));
};

// ===== SEED DATA =====

export const CATEGORY_MAP: Record<string, number> = {
  Coffee: 1,
  Juice: 2,
  "Soft Drink": 3,
  Tea: 4,
  Snack: 5,
};

export const PRODUCT_SEED_DATA: CreateProductPayload[] = [
  // ── COFFEE ──────────────────────────────────────────────────────────────────
  {
    categoryId: CATEGORY_MAP["Coffee"],
    productName: "Espresso",
    sku: "COF-001",
    description: "A strong and bold coffee",
    measureUnit: "cup",
    importPrice: 10,
    listPrice: 25,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Coffee"],
    productName: "Milk Coffee",
    sku: "COF-002",
    description: "A creamy and smooth coffee with milk",
    measureUnit: "cup",
    importPrice: 12,
    listPrice: 29,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Coffee"],
    productName: "Black Coffee",
    sku: "COF-003",
    description: "A simple black coffee without milk or sugar",
    measureUnit: "cup",
    importPrice: 8,
    listPrice: 20,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Coffee"],
    productName: "Latte",
    sku: "COF-004",
    description: "A creamy coffee with steamed milk and foam on top",
    measureUnit: "cup",
    importPrice: 15,
    listPrice: 35,
    isActive: false,
  },
  {
    categoryId: CATEGORY_MAP["Coffee"],
    productName: "Cappuccino",
    sku: "COF-005",
    description: "A coffee with steamed milk and a layer of foam on top",
    measureUnit: "cup",
    importPrice: 15,
    listPrice: 35,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Coffee"],
    productName: "Mocha",
    sku: "COF-006",
    description:
      "A chocolate-flavored coffee drink made with espresso, steamed milk, and whipped cream",
    measureUnit: "cup",
    importPrice: 17,
    listPrice: 39,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Coffee"],
    productName: "Americano",
    sku: "COF-007",
    description: "A rich espresso topped with hot water for a smooth taste",
    measureUnit: "cup",
    importPrice: 11,
    listPrice: 28,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Coffee"],
    productName: "Vietnamese Iced Coffee",
    sku: "COF-008",
    description: "A strong Vietnamese coffee brewed with condensed milk",
    measureUnit: "cup",
    importPrice: 13,
    listPrice: 32,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Coffee"],
    productName: "Frappuccino",
    sku: "COF-009",
    description: "A creamy blended coffee served cold with ice",
    measureUnit: "cup",
    importPrice: 18,
    listPrice: 42,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Coffee"],
    productName: "Hot Chocolate",
    sku: "COF-010",
    description: "Hot chocolate topped with whipped cream",
    measureUnit: "cup",
    importPrice: 12,
    listPrice: 30,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Coffee"],
    productName: "Cold Brew",
    sku: "COF-011",
    description: "A cold brew coffee steeped for 12 hours",
    measureUnit: "cup",
    importPrice: 16,
    listPrice: 38,
    isActive: true,
  },

  // ── JUICE ────────────────────────────────────────────────────────────────────
  {
    categoryId: CATEGORY_MAP["Juice"],
    productName: "Orange Juice",
    sku: "JUI-001",
    description: "Freshly squeezed orange juice",
    measureUnit: "glass",
    importPrice: 10,
    listPrice: 25,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Juice"],
    productName: "Watermelon Juice",
    sku: "JUI-002",
    description: "Fresh watermelon juice served chilled",
    measureUnit: "glass",
    importPrice: 11,
    listPrice: 27,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Juice"],
    productName: "Mango Smoothie",
    sku: "JUI-003",
    description: "Sweet mango smoothie blended with fresh milk",
    measureUnit: "glass",
    importPrice: 14,
    listPrice: 33,
    isActive: false,
  },
  {
    categoryId: CATEGORY_MAP["Juice"],
    productName: "Strawberry Milkshake",
    sku: "JUI-004",
    description: "A refreshing strawberry milkshake",
    measureUnit: "glass",
    importPrice: 15,
    listPrice: 35,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Juice"],
    productName: "Pineapple Juice",
    sku: "JUI-005",
    description: "Fresh pineapple juice with natural sweetness",
    measureUnit: "glass",
    importPrice: 12,
    listPrice: 28,
    isActive: false,
  },
  {
    categoryId: CATEGORY_MAP["Juice"],
    productName: "Avocado Smoothie",
    sku: "JUI-006",
    description: "A creamy avocado smoothie blended with condensed milk",
    measureUnit: "glass",
    importPrice: 16,
    listPrice: 36,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Juice"],
    productName: "Mint Lemonade",
    sku: "JUI-007",
    description: "A refreshing mint lemonade with crushed ice",
    measureUnit: "glass",
    importPrice: 12,
    listPrice: 29,
    isActive: true,
  },

  // ── SOFT DRINK ───────────────────────────────────────────────────────────────
  {
    categoryId: CATEGORY_MAP["Soft Drink"],
    productName: "Coca Cola",
    sku: "SDR-001",
    description: "A refreshing carbonated soft drink",
    measureUnit: "can",
    importPrice: 7,
    listPrice: 15,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Soft Drink"],
    productName: "Sprite",
    sku: "SDR-002",
    description: "Sparkling lemon soda with ice",
    measureUnit: "can",
    importPrice: 7,
    listPrice: 15,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Soft Drink"],
    productName: "Fanta",
    sku: "SDR-003",
    description: "A fizzy orange flavored soft drink",
    measureUnit: "can",
    importPrice: 7,
    listPrice: 15,
    isActive: true,
  },

  // ── TEA ──────────────────────────────────────────────────────────────────────
  {
    categoryId: CATEGORY_MAP["Tea"],
    productName: "Green Tea",
    sku: "TEA-001",
    description:
      "A hot beverage made from steeping green tea leaves in boiling water",
    measureUnit: "cup",
    importPrice: 8,
    listPrice: 20,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Tea"],
    productName: "Lemon Iced Tea",
    sku: "TEA-002",
    description: "A refreshing iced tea with lemon flavor",
    measureUnit: "glass",
    importPrice: 9,
    listPrice: 22,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Tea"],
    productName: "Black Tea",
    sku: "TEA-003",
    description: "Classic black tea with a strong aroma",
    measureUnit: "cup",
    importPrice: 7,
    listPrice: 18,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Tea"],
    productName: "Peach Tea",
    sku: "TEA-004",
    description: "Traditional Vietnamese iced peach tea",
    measureUnit: "glass",
    importPrice: 10,
    listPrice: 26,
    isActive: true,
  },

  // ── SNACK ────────────────────────────────────────────────────────────────────
  {
    categoryId: CATEGORY_MAP["Snack"],
    productName: "French Fries",
    sku: "SNK-001",
    description: "A light and crispy snack, perfect for sharing",
    measureUnit: "portion",
    importPrice: 12,
    listPrice: 30,
    isActive: false,
  },
  {
    categoryId: CATEGORY_MAP["Snack"],
    productName: "Cream Puff",
    sku: "SNK-002",
    description: "A sweet and fluffy pastry filled with cream",
    measureUnit: "piece",
    importPrice: 9,
    listPrice: 22,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Snack"],
    productName: "Chocolate Cookie",
    sku: "SNK-003",
    description: "A delicious chocolate chip cookie",
    measureUnit: "piece",
    importPrice: 7,
    listPrice: 18,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Snack"],
    productName: "Grilled Sandwich",
    sku: "SNK-004",
    description: "A crispy grilled sandwich with ham and cheese",
    measureUnit: "piece",
    importPrice: 16,
    listPrice: 40,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Snack"],
    productName: "Croissant",
    sku: "SNK-005",
    description: "Classic butter croissant, flaky and soft",
    measureUnit: "piece",
    importPrice: 10,
    listPrice: 24,
    isActive: true,
  },
  {
    categoryId: CATEGORY_MAP["Snack"],
    productName: "Potato Chips",
    sku: "SNK-006",
    description: "Classic salted potato chips",
    measureUnit: "bag",
    importPrice: 8,
    listPrice: 20,
    isActive: true,
  },
];