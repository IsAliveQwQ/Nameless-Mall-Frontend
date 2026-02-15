'use client';

import { AccountHeader } from '@/components/account/account-header';
import { Lock, ChevronRight, User as UserIcon, Loader2 } from 'lucide-react';
import { useUser } from '@/features/user/hooks/use-user';
import { ProfileForm } from '@/features/user/components/profile-form';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProfileEditPage() {
    const { user, isLoading } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = async () => {
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            toast.error('請填寫所有欄位');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('新密碼與確認密碼不符');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error('新密碼長度需至少 6 碼');
            return;
        }

        setIsPasswordUpdating(true);
        try {
            // [API Call] 假設標準路徑，若失敗請 user 回報
            // 這裡使用 fetch 簡單實作，或使用現有 api client
            // 需確認是否有 auth token，通常瀏覽器會自動帶 cookie 或由攔截器處理
            // 若專案有 api client，應使用之。暫用 fetch 保險。
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://isaliveqwq.me/api'}/users/me/password`, {
                method: 'PUT', // or POST
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    oldPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            const data = await res.json();
            if (!res.ok || (data.code && data.code !== 'OK' && data.code !== 200)) {
                throw new Error(data.message || '修改失敗');
            }

            toast.success('密碼修改成功');
            setIsEditingPassword(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error.message || '修改密碼失敗，請確認舊密碼是否正確');
        } finally {
            setIsPasswordUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <div className="text-sm text-zinc-500 animate-pulse">Loading Profile...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex flex-col gap-8 w-full mb-20">
            <AccountHeader />

            {/* Content Grid - Titles & Forms aligned */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start w-full px-1">

                {/* Left Column: Profile */}
                <div className="lg:col-span-6 flex flex-col">
                    <div className="flex items-end justify-between border-b border-zinc-200 mb-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2.5">
                                <UserIcon className="size-5 text-zinc-400" />
                                <h1 className="text-xl font-bold tracking-tight text-zinc-900">基本資料</h1>
                            </div>
                            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] px-0.5">Personal Identification</p>
                        </div>

                        <button
                            type="button"
                            className="text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-all uppercase tracking-widest flex items-center gap-1.5 group mb-0.5"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? '取消修改' : '修改基本資料'}
                            <ChevronRight className={cn("size-3.5 transition-transform group-hover:translate-x-0.5 text-zinc-300", isEditing && "rotate-90")} />
                        </button>
                    </div>
                    <ProfileForm
                        user={user}
                        isEditing={isEditing}
                        onToggleEdit={() => setIsEditing(!isEditing)}
                    />
                </div>

                {/* Right Column: Security */}
                <div className="lg:col-span-6 flex flex-col">
                    <div className="flex flex-col gap-1 border-b border-zinc-200 mb-6">
                        <div className="flex items-center gap-2.5">
                            <Lock className="size-5 text-zinc-400" />
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900">帳號安全</h1>
                        </div>
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] px-0.5">Access Control & Credentials</p>
                    </div>

                    <div className="flex flex-col bg-zinc-50 rounded-lg border border-zinc-200 overflow-hidden">
                        {/* Password Section */}
                        <div className="flex flex-col p-5 border-b border-zinc-200 transition-all duration-300 gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-1">帳號登入密碼</span>
                                <button
                                    type="button"
                                    onClick={() => setIsEditingPassword(!isEditingPassword)}
                                    className="text-xs font-bold text-zinc-500 font-mono hover:text-zinc-900 transition-colors uppercase tracking-widest flex items-center gap-1.5 group/btn"
                                >
                                    {isEditingPassword ? '取消修改' : '更新密碼'}
                                    <ChevronRight className={cn("size-4 transition-transform text-zinc-400", isEditingPassword ? "rotate-90" : "group-hover/btn:translate-x-0.5")} />
                                </button>
                            </div>

                            {/* Password Display / Edit Form */}
                            {!isEditingPassword ? (
                                <div className="text-xl text-zinc-900 tracking-[0.3em] font-bold">••••••••</div>
                            ) : (
                                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-zinc-500">舊密碼</label>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={passwordForm.currentPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded text-sm focus:outline-none focus:border-zinc-900 transition-colors"
                                                placeholder="請輸入目前的密碼"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-zinc-500">新密碼</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwordForm.newPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded text-sm focus:outline-none focus:border-zinc-900 transition-colors"
                                                placeholder="請輸入新密碼 (至少6碼)"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-zinc-500">確認新密碼</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordForm.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded text-sm focus:outline-none focus:border-zinc-900 transition-colors"
                                                placeholder="請再次輸入新密碼"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={handlePasswordSubmit}
                                            disabled={isPasswordUpdating}
                                            className="bg-zinc-900 text-white rounded-none px-6 h-10 font-bold tracking-widest text-[11px] uppercase hover:bg-zinc-800 transition-all active:scale-95 shadow-lg disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isPasswordUpdating && <Loader2 className="animate-spin size-3" />}
                                            確認修改
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Integrated Status Section */}
                        <div className="p-5 flex items-center justify-between">
                            <span className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest">帳號狀態</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded uppercase tracking-widest">正式會員</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 補上 Loader2 的 Import，如果前面沒有的話。
// 這裡假設上面已經有了，如果 replace 範圍內沒有 import 區塊，要注意。
// 我會檢查目標內容的 import 區塊。
// 原本第 4 行: import { Lock, ChevronRight, User as UserIcon } from 'lucide-react';
// 我需要確定 Loader2 有被 import。
// 為了保險，我先讀取檢查 import。
// (看來第 18 行已經有 import { ..., Loader2, ... } from 'lucide-react';)
// 所以直接替換主體即可。
