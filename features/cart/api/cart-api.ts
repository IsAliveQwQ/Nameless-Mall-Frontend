import api from '@/lib/api/client';
import { Cart, AddToCartInput, UpdateCartItemInput } from '@/shared/types/cart';

export const cartApi = {
    // 獲取購物車
    getCart: () => {
        return api.get<Cart>('cart');
    },

    // 加入購物車
    addItem: (data: AddToCartInput) => {
        return api.post<Cart>('cart/items', data);
    },

    // 更新購物車項目 (數量) - 使用 variantId 作為路徑
    updateItem: (variantId: number, data: UpdateCartItemInput) => {
        return api.put<Cart>(`cart/items/${variantId}`, data);
    },

    // 移除購物車項目 - 支持批量移除
    removeItems: (variantIds: number[]) => {
        return api.delete<Cart>('cart/items', { data: { variantIds } });
    },

    // 清空購物車 (通常可用 removeItems 帶入全量 ID 達成)
    clearCart: () => {
        return api.delete<void>('cart');
    },

    // 合併購物車 (登入後同步)
    mergeCart: (items: AddToCartInput[]) => {
        return api.post<Cart>('cart/merge', { items });
    }
};
