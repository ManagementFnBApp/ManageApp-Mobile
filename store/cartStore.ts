import { create } from "zustand";

type CartStore = {
  cart: Record<string, number>;
  setCart: (cart: Record<string, number>) => void;
};

export const useCartStore = create<CartStore>((set) => ({
  cart: {},
  setCart: (cart) => set({ cart }),
}));