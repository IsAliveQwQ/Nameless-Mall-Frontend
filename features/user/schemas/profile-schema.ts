import { z } from 'zod';

export const profileFormSchema = z.object({
    nickname: z.string()
        .min(2, "暱稱至少需要 2 個字元")
        .max(30, "暱稱不能超過 30 個字元"),
    email: z.string()
        .email("請輸入有效的電子信箱格式"),
    phone: z.string()
        .transform((val) => val.replace(/\D/g, '')) // Remove all non-digits first
        .refine((val) => val === '' || /^09\d{8}$/.test(val), {
            message: "請輸入有效的手機號碼 (09xxxxxxxx)"
        })
        .optional()
        .or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
