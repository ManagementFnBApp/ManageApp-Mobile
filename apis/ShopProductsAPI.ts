import { apiClient } from "@/configs/axios";
import type { Product } from "./ProductsAPI";

/**
 * API cho /shop-products — SHOPOWNER tạo/quản lý sản phẩm riêng của shop.
 * Backend lấy shop_id từ JWT tự động, không cần gửi trong body.
 *
 * Phân quyền backend:
 *   POST   /shop-products         → SHOPOWNER (shop_id từ JWT)
 *   GET    /shop-products         → SHOPOWNER + STAFF (shop_id từ JWT)
 *   PATCH  /shop-products/:id     → SHOPOWNER + ADMIN
 *   DELETE /shop-products/:id     → SHOPOWNER
 *
 * ⚠️  POST và PATCH dùng multipart/form-data vì backend có FileInterceptor('image').
 *     Trường 'image' là file bắt buộc khi POST, tuỳ chọn khi PATCH.
 */

// ===== PAYLOAD TYPES =====

export interface CreateShopProductPayload {
  categoryId: number;
  productName: string;
  /** File ảnh — bắt buộc khi tạo mới (backend yêu cầu file.path) */
  image: {
    uri: string;
    name: string;
    type: string; // e.g. "image/jpeg"
  };
  barcode?: string;
  description?: string;
  measureUnit?: string;
  importPrice: number;
  listPrice: number;
  isActive?: boolean;
}

export interface UpdateShopProductPayload {
  categoryId?: number;
  productName?: string;
  /** File ảnh — tuỳ chọn khi cập nhật */
  image?: {
    uri: string;
    name: string;
    type: string;
  };
  barcode?: string;
  description?: string;
  measureUnit?: string;
  importPrice?: number;
  listPrice?: number;
  isActive?: boolean;
}

// ===== HELPERS =====

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

/**
 * Map backend ShopProductResponseDto → frontend Product.
 * Matches ProductsAPI.Product shape (createdAt/updatedAt as string).
 */
function mapShopProduct(raw: Record<string, unknown>): Product {
  return {
    productId: toNumber(raw.id ?? raw.productId),
    categoryId: toNumber(raw.category_id ?? raw.categoryId),
    productName: String(raw.product_name ?? raw.productName ?? ""),
    image: String(raw.image ?? ""),
    sku: String(raw.sku ?? ""),
    barcode: raw.barcode != null ? String(raw.barcode) : null,
    description: raw.description != null ? String(raw.description) : null,
    measureUnit:
      raw.measure_unit != null
        ? String(raw.measure_unit)
        : raw.measureUnit != null
          ? String(raw.measureUnit)
          : null,
    importPrice: toNumber(raw.import_price ?? raw.importPrice),
    listPrice: toNumber(raw.list_price ?? raw.listPrice),
    isActive: Boolean(raw.is_active ?? raw.isActive ?? true),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ""),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? ""),
  };
}

function normalizeShopProductList(raw: unknown): Product[] {
  const unwrapped = unwrap<unknown>(raw);
  const list = Array.isArray(unwrapped) ? unwrapped : [];
  return list
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    )
    .map(mapShopProduct);
}

// ===== SHOP-PRODUCT APIs =====

/**
 * GET /shop-products
 * SHOPOWNER + STAFF: lấy danh sách sản phẩm của shop mình.
 * Filtering by isActive is done client-side since BE returns all.
 */
export const getShopProducts = async (
  isActive?: boolean,
): Promise<Product[]> => {
  const res = await apiClient.get("/shop-products");
  const raw = unwrap<unknown>(res.data);
  const arr = Array.isArray(raw) ? raw : [];
  const products = arr.map((item) =>
    mapShopProduct((item as Record<string, unknown>) ?? {}),
  );
  if (isActive !== undefined) {
    return products.filter((p) => p.isActive === isActive);
  }
  return products;
};

export const getActiveShopProducts = async (): Promise<Product[]> =>
  getShopProducts(true);

/**
 * POST /shop-products
 * SHOPOWNER: tạo sản phẩm mới cho shop. Backend tự gắn shop_id từ JWT.
 * Gửi multipart/form-data vì backend dùng FileInterceptor('image').
 * 'image' là file bắt buộc — backend sẽ lỗi nếu thiếu file.path.
 */
export const createShopProduct = async (
  payload: CreateShopProductPayload
): Promise<Product> => {
  const form = new FormData();

  // Append image file — required by backend (file.path is used, not optional)
  form.append("image", {
    uri: payload.image.uri,
    name: payload.image.name,
    type: payload.image.type,
  } as unknown as Blob);

  form.append("categoryId", String(payload.categoryId));
  form.append("productName", payload.productName.trim());
  form.append("listPrice", String(payload.listPrice));
  form.append("importPrice", String(payload.importPrice));
  form.append("isActive", String(payload.isActive ?? true));

  if (payload.barcode?.trim()) form.append("barcode", payload.barcode.trim() || '');
  if (payload.description?.trim()) form.append("description", payload.description.trim());
  if (payload.measureUnit?.trim()) form.append("measureUnit", payload.measureUnit.trim());

  const res = await apiClient.post("/shop-products", form);
  const raw = unwrap<Record<string, unknown>>(res.data);
  return mapShopProduct(raw ?? {});
};

/**
 * PATCH /shop-products/:id
 * SHOPOWNER: cập nhật sản phẩm.
 * Gửi multipart/form-data — 'image' là tuỳ chọn (file?.path trong BE).
 */
export const updateShopProduct = async (
  id: number,
  payload: UpdateShopProductPayload
): Promise<Product> => {
  const form = new FormData();

  // Append image only if provided (backend uses file?.path — optional)
  if (payload.image) {
    form.append("image", {
      uri: payload.image.uri,
      name: payload.image.name,
      type: payload.image.type,
    } as unknown as Blob);
  }

  if (payload.categoryId !== undefined) form.append("categoryId", String(payload.categoryId));
  if (payload.productName !== undefined) form.append("productName", payload.productName.trim());
  if (payload.listPrice !== undefined) form.append("listPrice", String(payload.listPrice));
  if (payload.importPrice !== undefined) form.append("importPrice", String(payload.importPrice));
  if (payload.isActive !== undefined) form.append("isActive", String(payload.isActive));
  if (payload.barcode !== undefined) form.append("barcode", payload.barcode.trim());
  if (payload.description !== undefined) form.append("description", payload.description.trim());
  if (payload.measureUnit !== undefined) form.append("measureUnit", payload.measureUnit.trim());

  const res = await apiClient.patch(`/shop-products/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const raw = unwrap<Record<string, unknown>>(res.data);
  return mapShopProduct(raw ?? {});
};

/**
 * DELETE /shop-products/:id
 * SHOPOWNER: xóa sản phẩm khỏi shop.
 */
export const deleteShopProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/shop-products/${id}`);
};