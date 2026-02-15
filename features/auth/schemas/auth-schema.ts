import { z } from 'zod';

export const loginSchema = z.object({
    username: z.string().min(1, '請輸入帳號'),
    password: z.string().min(1, '請輸入密碼'),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    username: z.string().min(4, '帳號長度至少需 4 個字元').max(32, '帳號長度不可超過 32 個字元'),
    password: z.string().min(6, '密碼長度至少需 6 個字元').max(32, '密碼長度不可超過 32 個字元'),
}).refine((data) => !data.password.includes(' '), {
    message: "密碼不可包含空格",
    path: ["password"],
});

export type RegisterSchema = z.infer<typeof registerSchema>;
