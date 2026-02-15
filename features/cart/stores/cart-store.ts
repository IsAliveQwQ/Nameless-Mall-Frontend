import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Cart, CartItem } from '@/shared/types/cart';

interface CartState {
    // State
    cart: Cart | null;
    isOpen: boolean;    // Cart Drawer 狀態

    // Actions
    setCart: (cart: Cart) => void;
    setOpen: (open: boolean) => void;
    clearLocalCart: () => void;

    // Optimistic Updates (暫存，後續由 React Query 同步)
    optimisticAddItem: (item: CartItem) => void;
    optimisticRemoveItem: (variantId: number) => void;
    optimisticUpdateItem: (variantId: number, quantity: number) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            cart: null,
            isOpen: false,

            setCart: (cart) => set({ cart }),
            setOpen: (open) => set({ isOpen: open }),
            clearLocalCart: () => set({ cart: null }),

            // 樂觀更新：立即反應 UI，假設 API 會成功
            optimisticAddItem: (newItem) => set((state) => {
                const currentCart = state.cart || { items: [], totalAmount: 0, totalQuantity: 0 };

                // 根據 variantId 檢查是否已存在
                const existingItemIndex = currentCart.items.findIndex(i => i.variantId === newItem.variantId);

                let updatedItems;
                if (existingItemIndex >= 0) {
                    updatedItems = [...currentCart.items];
                    const existingItem = updatedItems[existingItemIndex];
                    updatedItems[existingItemIndex] = {
                        ...existingItem,
                        quantity: existingItem.quantity + newItem.quantity
                    };
                } else {
                    updatedItems = [...currentCart.items, newItem];
                }

                // 計算總數量與總金額
                const totalQuantity = updatedItems.reduce((acc, item) => acc + item.quantity, 0);
                const totalAmount = updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

                return {
                    cart: {
                        ...currentCart,
                        items: updatedItems,
                        totalQuantity,
                        totalAmount
                    }
                };
            }),

            optimisticRemoveItem: (variantId) => set((state) => {
                if (!state.cart) return state;
                const updatedItems = state.cart.items.filter(item => item.variantId !== variantId);
                const totalQuantity = updatedItems.reduce((acc, item) => acc + item.quantity, 0);
                const totalAmount = updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

                return {
                    cart: {
                        ...state.cart,
                        items: updatedItems,
                        totalQuantity,
                        totalAmount
                    }
                };
            }),

            optimisticUpdateItem: (variantId, quantity) => set((state) => {
                if (!state.cart) return state;
                const updatedItems = state.cart.items.map(item =>
                    item.variantId === variantId ? { ...item, quantity } : item
                );
                const totalQuantity = updatedItems.reduce((acc, item) => acc + item.quantity, 0);
                const totalAmount = updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

                return {
                    cart: {
                        ...state.cart,
                        items: updatedItems,
                        totalQuantity,
                        totalAmount
                    }
                };
            })
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ cart: state.cart }), // 只持久化購物車資料
        }
    )
);
