import api from '@/lib/api/client';
import {
    OrderVO,
    OrderDetailVO,
    OrderSubmitInput,
    Page
} from '../types';

export const orderApi = {
    /**
     * 獲取防重送 Token
     */
    generateToken: () => {
        return api.get<string>('orders/token');
    },

    /**
     * 創建訂單
     */
    create: (data: OrderSubmitInput) => {
        return api.post<OrderVO>('orders', data);
    },

    /**
     * 輪詢訂單建立狀態（異步下單用）
     * 返回輕量級 OrderVO，僅含 status + failReason
     */
    getStatus: (orderSn: string) => {
        return api.get<OrderVO>(`orders/${orderSn}/status`);
    },

    /**
     * 獲取訂單列表
     */
    getList: (params: { pageNum?: number; pageSize?: number; status?: number } = {}) => {
        return api.get<Page<OrderVO>>('orders', { params });
    },

    /**
     * 獲取訂單詳情
     */
    getDetail: (orderSn: string) => {
        return api.get<OrderDetailVO>(`orders/${orderSn}`);
    },

    /**
     * 取消訂單
     */
    cancel: (orderSn: string) => {
        return api.put<void>(`orders/${orderSn}/cancel`);
    },

    /**
     * 確認收貨
     */
    confirmReceipt: (orderSn: string) => {
        return api.put<void>(`orders/${orderSn}/confirm-receipt`);
    }
};
