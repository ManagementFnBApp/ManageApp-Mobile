// import { apiClient } from "../configs/axios";
// import type { Category } from "./ProductsAPI";

// // Re-export shared types & functions from productService to avoid duplication
// export { createCategory, getCategories } from "./ProductsAPI";
// export type { Category, CreateCategoryPayload } from "./ProductsAPI";

// // ===== SHOP-CATEGORY APIs =====

// interface ShopCategoryRaw {
//   shop_id: number;
//   category_id: number;
//   category: { id: number; category_name: string; is_active: boolean };
// }

// /** Lấy các category đã được gắn vào shop của user đang đăng nhập. */
// export const getShopCategories = async (): Promise<Category[]> => {
//   const res = await apiClient.get("/shop-categories");
//   const raw = res.data;
//   const list: ShopCategoryRaw[] = Array.isArray(raw)
//     ? raw
//     : Array.isArray(raw?.data)
//       ? raw.data
//       : [];
//   return list.map((item) => ({
//     id: item.category_id,
//     categoryName: item.category?.category_name ?? "",
//     isActive: item.category?.is_active ?? true,
//   }));
// };

// /** Gắn một hoặc nhiều category vào shop (chọn trong danh sách category tổng). */
// export const addShopCategories = async (
//   categoryIds: number[],
// ): Promise<void> => {
//   await apiClient.post("/shop-categories", { category_id: categoryIds });
// };