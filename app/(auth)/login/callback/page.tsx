'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import api from '@/lib/api/client';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface UserInfo {
    id: number;
    username: string;
    email?: string;
    phone?: string;
    nickname?: string;
    avatar?: string;
    createdAt?: string;
    // status and roles are not in UserDTO
}

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setAuth = useAuthStore((state) => state.setAuth);
    const hasExecuted = useRef(false);

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('正在驗證您的身份...');

    useEffect(() => {
        if (hasExecuted.current) return;
        hasExecuted.current = true;

        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            setStatus('error');
            setMessage('登入失敗：' + decodeURIComponent(error));
            setTimeout(() => router.push('/login'), 3000);
            return;
        }

        if (!token) {
            setStatus('error');
            setMessage('無效的登入請求');
            setTimeout(() => router.push('/login'), 3000);
            return;
        }

        const verifyToken = async () => {
            try {
                // [Critical Fix] 先將 Token 設入 Store，確保 API 攔截器能獲取 Token
                // 這解決了 OAuth 回調時 API 請求沒有帶 Token 導致 401 的問題
                useAuthStore.getState().setToken(token);
                localStorage.setItem('accessToken', token);

                // 2. 獲取用戶資料 (API 返回完整 User 物件)
                const user = await api.get<UserInfo>('/users/me');

                // 3. 更新 Store (傳遞完整用戶資料)
                // 3. 更新 Store (傳遞完整用戶資料)
                setAuth(token, {
                    id: String(user.id),
                    username: user.username,
                    email: user.email || '',
                    // 根據 UserDTO 與 User 介面調整:
                    // roles 與 status 不在 UserDTO 中，但 User 介面定義為 optional
                    // 若需要這些欄位，應從 Token 解析或另行獲取。暫時保持與 DTO 一致。
                    createdAt: user.createdAt || new Date().toISOString(),
                    // updatedAt 不在 UserDTO 中，User 介面若無此定義則不傳
                    phone: user.phone,   // UserDTO.phone
                    avatar: user.avatar, // UserDTO.avatar
                    nickname: user.nickname
                } as any); // 使用型別斷言暫時通過，隨後應修正 setAuth 的參數型別定義

                setStatus('success');
                setMessage('驗證成功，即將跳轉...');

                // 4. 延遲跳轉以展示 Success 狀態 (UX 優化)
                setTimeout(() => router.push('/'), 800);

            } catch (err: any) {
                console.error('Callback verify failed:', err);
                setStatus('error');
                setMessage('驗證失敗，請重新登入');
                localStorage.removeItem('accessToken');
                setTimeout(() => router.push('/login'), 3000);
            }
        };

        verifyToken();
    }, [searchParams, router, setAuth]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center space-y-4 text-center p-8 bg-card/80 backdrop-blur-xl rounded-2xl border shadow-xl max-w-sm w-full"
        >
            <div className="relative flex items-center justify-center h-16 w-16">
                {status === 'loading' && (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <Loader2 className="h-10 w-10 text-primary" />
                    </motion.div>
                )}

                {status === 'success' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    >
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    >
                        <XCircle className="h-12 w-12 text-destructive" />
                    </motion.div>
                )}
            </div>

            <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                    {status === 'loading' && '登入中'}
                    {status === 'success' && '登入成功'}
                    {status === 'error' && '登入失敗'}
                </h2>
                <p className="text-sm text-muted-foreground animate-pulse">
                    {message}
                </p>
            </div>
        </motion.div>
    );
}

export default function CallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>載入中...</p>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
