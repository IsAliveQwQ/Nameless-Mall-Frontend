import api from '@/lib/api/client';
import {
    PaymentVO,
    PaymentCreateInput,
    PaymentConfirmInput
} from '../types';

export const paymentApi = {
    /**
     * 發起支付（創建支付單）
     */
    create: (data: PaymentCreateInput) => {
        return api.post<PaymentVO>('payments', data);
    },

    /**
     * 查詢支付詳情與狀態
     */
    getDetail: (paymentSn: string) => {
        return api.get<PaymentVO>(`payments/${paymentSn}`);
    },

    /**
     * 確認付款（針對銀行轉帳，填寫後五碼）
     */
    confirm: (data: PaymentConfirmInput) => {
        return api.post<void>('payments/confirm', data);
    },

    /**
     * 處理金流回調（如 LINE Pay 確認、ECPay 回傳）
     */
    processCallback: (provider: string, params: Record<string, string>) => {
        return api.post<any>(`payments/callback/${provider}`, params);
    }
};
