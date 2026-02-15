export type PaymentStatus = 'WAIT_PAY' | 'SUCCESS' | 'CLOSED' | 'REFUNDED';
export type PaymentMethod = 'BANK_TRANSFER' | 'COD' | 'LINE_PAY' | 'ECPAY_CREDIT';

export interface PaymentVO {
    id: number;
    paymentSn: string;
    orderSn: string;
    amount: number;
    method: PaymentMethod;
    paymentStatus: PaymentStatus;
    redirectUrl?: string; // 第三方跳轉 URL
    redirectType?: 'URL_REDIRECT' | 'FORM_POST' | 'NONE'; // [RFC-012] 導向類型
    formData?: string; // [RFC-012] ECPay 自動提交表單 HTML
    bankCode?: string;
    bankName?: string;
    accountInfo?: string; // 銀行轉帳後五碼
    paidAt?: string;
    createdAt: string;
    expiredAt?: string;
}

export interface PaymentCreateInput {
    orderSn: string;
    payType?: number; // 舊版相容
    method: PaymentMethod;
    accountInfo?: string;
}

export interface PaymentConfirmInput {
    paymentSn: string;
    accountInfo: string;
}
