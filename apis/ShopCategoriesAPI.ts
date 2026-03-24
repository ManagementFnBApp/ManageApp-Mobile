import { apiClient } from "@/configs/axios";

// ===== TYPES =====

export interface ShopCategoryItem {
  id: number;
  name: string;
}

// ===== HELPERS =====

function unwrap<T>(raw: unknown): T {
  if (raw != null && typeof raw === "object" && "data" in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

type ShopCategoryRaw = {
  category_id: number;
  category?: {
    id: number;
    category_name?: string;
    is_active?: boolean;
  };
};

function mapShopCategory(item: ShopCategoryRaw): ShopCategoryItem {
  return {
    id: item.category?.id ?? item.category_id,
    name: String(item.category?.category_name ?? ""),
  };
}

// ===== SHOP-CATEGORY APIs =====

/**
 * GET /shop-categories
 * SHOPOWNER + STAFF: danh mục đã được gắn vào shop (shop_id từ JWT).
 */
export const getShopCategories = async (): Promise<ShopCategoryItem[]> => {
  const res = await apiClient.get("/shop-categories");
  const list = unwrap<Array<{ category_id: number; category?: { id: number; category_name?: string } }>>(res.data);
  const arr = Array.isArray(list) ? list : [];
  return arr.map((item) => ({
    id: item.category?.id ?? item.category_id,
    name: String(item.category?.category_name ?? ""),
  }));
};

/**
 * POST /shop-categories
 * SHOPOWNER: gắn một hoặc nhiều category vào shop.
 */
export const addShopCategories = async (
  categoryIds: number[]
): Promise<boolean> => {
  const res = await apiClient.post("/shop-categories", {
    category_id: categoryIds,
  });
  const data = unwrap<unknown>(res.data);
  return data === true || (typeof data === "object" && data !== null);
};

/**
 * DELETE /shop-categories/:id
 * SHOPOWNER: gỡ một category khỏi shop.
 */
export const removeShopCategory = async (categoryId: number): Promise<void> => {
  await apiClient.delete(`/shop-categories/${categoryId}`);
};