'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Address, AddressInput } from '@/shared/types/address';
import { addressSchema, AddressFormValues } from '../schemas/address-schema';
import { useAddress } from '../hooks/use-address';
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
import { TAIWAN_REGIONS } from '@/shared/data/taiwan-regions';
import { Loader2, X, ChevronDown } from 'lucide-react';
import { useEffect, useMemo } from 'react';

interface AddressFormProps {
    address?: Address | null;
    onCancel: () => void;
    onSuccess: () => void;
}

export function AddressForm({ address, onCancel, onSuccess }: AddressFormProps) {
    const { createAddress, updateAddress, isCreating, isUpdating } = useAddress();
    const isEditing = !!address;

    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            receiverName: '',
            receiverPhone: '',
            city: '',
            district: '',
            detailAddress: '',
            isDefault: 0,
        },
    });

    const selectedCity = form.watch('city');

    const availableDistricts = useMemo(() => {
        const region = TAIWAN_REGIONS.find(r => r.name === selectedCity);
        return region ? region.districts : [];
    }, [selectedCity]);

    // 當城市改變時，重置區域
    useEffect(() => {
        if (selectedCity && !availableDistricts.includes(form.getValues('district'))) {
            form.setValue('district', '');
        }
    }, [selectedCity, availableDistricts, form]);

    useEffect(() => {
        if (address) {
            form.reset({
                receiverName: address.receiverName,
                receiverPhone: address.receiverPhone,
                city: address.city,
                district: address.district,
                detailAddress: address.detailAddress,
                isDefault: address.isDefault,
            });
        }
    }, [address, form]);

    const onSubmit = (data: AddressFormValues) => {
        const input: AddressInput = {
            ...data,
            isDefault: data.isDefault,
        };

        if (isEditing && address) {
            updateAddress({ id: address.id, data: input }, {
                onSuccess
            });
        } else {
            createAddress(input, {
                onSuccess
            });
        }
    };

    return (
        <div className="mx-auto max-w-3xl bg-white border border-zinc-200 rounded-[8px] p-10 md:p-12 shadow-soft animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center justify-between mb-12">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
                        <span className="w-1.5 h-7 bg-zinc-900 rounded-full"></span>
                        {isEditing ? '編輯地址資訊' : '新增收件地址'}
                    </h2>
                    <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-[0.25em] pl-4.5">
                        {isEditing ? 'Update existing delivery point' : 'Add new specialized destination'}
                    </p>
                </div>
                <button
                    onClick={onCancel}
                    className="p-3 hover:bg-zinc-50 rounded-full transition-all duration-300 group"
                >
                    <X className="size-6 text-zinc-200 group-hover:text-zinc-900 group-hover:rotate-90 transition-all" />
                </button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        <FormField
                            control={form.control}
                            name="receiverName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3 block">收件人姓名 / RECIPIENT</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="請輸入姓名"
                                            className="h-12 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-0 rounded-[2px] transition-all duration-300 placeholder:text-zinc-300 text-sm font-medium"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] uppercase font-bold text-red-400 pt-2" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="receiverPhone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3 block">手機號碼 / CONTACT</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="09xxxxxxxx"
                                            className="h-12 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-0 rounded-[2px] transition-all duration-300 placeholder:text-zinc-300 text-sm font-mono tracking-wider"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] uppercase font-bold text-red-400 pt-2" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-x-12">
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3 block">縣市 / REGION</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <select
                                                {...field}
                                                className="w-full h-12 bg-white border border-zinc-200 rounded-[2px] px-4 text-sm font-medium focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>選擇縣市</option>
                                                {TAIWAN_REGIONS.map(r => (
                                                    <option key={r.name} value={r.name}>{r.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-zinc-300 group-hover:text-zinc-900 transition-colors pointer-events-none" />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-[10px] uppercase font-bold text-red-400 pt-2" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="district"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3 block">區域 / DISTRICT</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <select
                                                {...field}
                                                disabled={!selectedCity}
                                                className="w-full h-12 bg-white border border-zinc-200 rounded-[2px] px-4 text-sm font-medium focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all appearance-none cursor-pointer disabled:bg-zinc-50 disabled:text-zinc-300 disabled:cursor-not-allowed"
                                            >
                                                <option value="" disabled>選擇區域</option>
                                                {availableDistricts.map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-zinc-300 group-hover:text-zinc-900 transition-colors pointer-events-none" />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-[10px] uppercase font-bold text-red-400 pt-2" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="detailAddress"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3 block">詳細地址 / ADDRESS LINE</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="請輸入完整的街道門牌資訊"
                                        className="h-11 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-0 rounded-[2px] transition-all duration-300 placeholder:text-zinc-300 text-sm font-medium"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px] uppercase font-bold text-red-400 pt-1" />
                            </FormItem>
                        )}
                    />

                    <div className="flex items-center justify-between pt-8 border-t border-zinc-100 mt-10">
                        <FormField
                            control={form.control}
                            name="isDefault"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                                    <FormControl>
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                className="peer size-5 opacity-0 absolute cursor-pointer"
                                                checked={field.value === 1}
                                                onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                                            />
                                            <div className={`size-5 border rounded-[2px] flex items-center justify-center transition-all duration-300 ${field.value === 1 ? 'bg-zinc-900 border-zinc-900' : 'bg-white border-zinc-200 group-hover:border-zinc-400'}`}>
                                                {field.value === 1 && <span className="text-white text-[12px]">✓</span>}
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-zinc-500 cursor-pointer select-none">
                                        設定為預設地址
                                    </FormLabel>
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500 hover:text-zinc-900 transition-colors px-4"
                                onClick={onCancel}
                            >
                                取消 / DISCARD
                            </button>
                            <Button
                                type="submit"
                                className="px-8 h-12 bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-md active:scale-95 rounded-[2px] text-[11px] font-bold uppercase tracking-[0.15em]"
                                disabled={isCreating || isUpdating}
                            >
                                {(isCreating || isUpdating) && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                                確認儲存 / SAVE CHANGES
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}
