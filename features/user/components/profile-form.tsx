'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@/shared/types/user';
import { useUser } from '../hooks/use-user';
import { profileFormSchema, ProfileFormValues } from '../schemas/profile-schema';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Mail, Phone, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ProfileFormProps {
    user: User;
    isEditing: boolean;
    onToggleEdit: () => void;
}

export function ProfileForm({ user, isEditing, onToggleEdit }: ProfileFormProps) {
    const { updateProfile, isUpdating } = useUser();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            nickname: user.nickname || user.username || '',
            email: user.email || '',
            phone: user.phone || '',
        },
    });

    // 當外部 user 資料更新時，同步重置表單 (例如第一次載入或更新後)
    useEffect(() => {
        if (!isEditing) {
            form.reset({
                nickname: user.nickname || user.username || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user, form, isEditing]);

    const onSubmit = (data: ProfileFormValues) => {
        updateProfile(data, {
            onSuccess: () => {
                onToggleEdit();
            }
        });
    };

    return (
        <div className="flex flex-col h-full">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">

                    {/* Nickname Field */}
                    <FormField
                        control={form.control}
                        name="nickname"
                        render={({ field }) => (
                            <FormItem className="space-y-0">
                                <FormLabel className="text-[13px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-0.5 block">
                                    姓名 / 暱稱
                                </FormLabel>
                                <FormControl>
                                    {isEditing ? (
                                        <div className="relative group">
                                            <Input {...field} className="text-xl font-bold border-0 border-b-2 border-zinc-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-zinc-900 transition-all bg-transparent h-10 tracking-tight" placeholder="請輸入姓名" />
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left" />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col h-10 justify-center">
                                            <div className={cn(
                                                "text-xl font-bold tracking-tight text-zinc-900",
                                                !field.value && "text-zinc-300"
                                            )}>
                                                {field.value || '尚未填寫姓名'}
                                            </div>
                                        </div>
                                    )}
                                </FormControl>
                                <FormMessage className="text-xs font-bold text-red-500 uppercase" />
                            </FormItem>
                        )}
                    />

                    {/* Email Field */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="space-y-0">
                                <FormLabel className="text-[13px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-0.5 block">
                                    電子郵件
                                </FormLabel>
                                <FormControl>
                                    {isEditing ? (
                                        <div className="relative group">
                                            <Input {...field} className="text-xl font-bold border-0 border-b-2 border-zinc-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-zinc-900 transition-all bg-transparent h-10 tracking-tight" placeholder="email@example.com" />
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left" />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col h-10 justify-center">
                                            <div className={cn(
                                                "text-xl font-bold tracking-tight text-zinc-900",
                                                !field.value && "text-zinc-300"
                                            )}>
                                                {field.value || '尚未綁定郵件'}
                                            </div>
                                        </div>
                                    )}
                                </FormControl>
                                <FormMessage className="text-xs font-bold text-red-500 uppercase" />
                            </FormItem>
                        )}
                    />

                    {/* Phone Field */}
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem className="space-y-0">
                                <FormLabel className="text-[13px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-0.5 block">
                                    聯繫電話
                                </FormLabel>
                                <FormControl>
                                    {isEditing ? (
                                        <div className="relative group">
                                            <Input {...field} className="text-xl font-bold border-0 border-b-2 border-zinc-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-zinc-900 transition-all bg-transparent h-10 tracking-tight" placeholder="+886" />
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left" />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col h-10 justify-center">
                                            <div className={cn(
                                                "text-xl font-bold tracking-tight text-zinc-900",
                                                !field.value && "text-zinc-300"
                                            )}>
                                                {field.value || '尚未紀錄號碼'}
                                            </div>
                                        </div>
                                    )}
                                </FormControl>
                                <FormMessage className="text-xs font-bold text-red-500 uppercase" />
                            </FormItem>
                        )}
                    />

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex justify-end pt-8">
                            <Button type="submit" disabled={isUpdating} className="bg-zinc-900 text-white rounded-none px-10 h-12 font-bold tracking-widest text-[11px] uppercase hover:bg-zinc-800 transition-all active:scale-95 shadow-xl shadow-zinc-200">
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                儲存變更
                            </Button>
                        </div>
                    )}
                </form>
            </Form>
        </div>
    );
}
