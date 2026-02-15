import { z } from 'zod';

export const addressSchema = z.object({
    receiverName: z.string()
        .min(2, "收件人姓名至少需 2 個字元")
        .max(20, "收件人姓名過長"),
    receiverPhone: z.string()
        .regex(/^09\d{8}$/, "請輸入有效的手機號碼 (09xxxxxxxx)"),
    city: z.string()
        .min(1, "請選擇縣市"),
    district: z.string()
        .min(1, "請選擇區域"),
    detailAddress: z.string()
        .min(5, "詳細地址至少需 5 個字元")
        .max(100, "詳細地址過長"),
    isDefault: z.number().min(0).max(1).default(0),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
