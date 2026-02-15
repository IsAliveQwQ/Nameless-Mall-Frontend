'use client';

import { useState } from 'react';
import { Plus, Phone, MapPin, Loader2, Edit2, Check } from 'lucide-react';
import { useAddress } from '@/features/user/hooks/use-address';
import { AddressForm } from '@/features/user/components/address-form';
import { Address } from '@/shared/types/address';

export default function AddressPage() {
    const {
        addresses,
        isLoading,
        deleteAddress,
        setDefaultAddress,
        isDeleting,
        isSettingDefault
    } = useAddress();

    const [isAdding, setIsAdding] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const handleAdd = () => {
        setEditingAddress(null);
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEdit = (address: Address) => {
        setIsAdding(false);
        setEditingAddress(address);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingAddress(null);
    };

    const handleSuccess = () => {
        setIsAdding(false);
        setEditingAddress(null);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex items-end justify-between mb-6 border-b border-zinc-200">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                        <MapPin className="size-5 text-zinc-400" />
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">地址管理</h1>
                    </div>
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] px-1">Shipping & Contact Logistics</p>
                </div>
                {!isAdding && !editingAddress && (
                    <button
                        onClick={handleAdd}
                        className="group flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-xs font-bold rounded-[6px] hover:bg-zinc-800 transition-all shadow-md active:scale-95 uppercase tracking-widest"
                    >
                        <Plus className="size-4 group-hover:rotate-90 transition-transform duration-300" />
                        新增送貨地址
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {/* Inline Adding Form */}
                {isAdding && (
                    <div className="mb-10">
                        <AddressForm
                            onCancel={handleCancel}
                            onSuccess={handleSuccess}
                        />
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="size-8 animate-spin text-zinc-200" />
                        <p className="text-sm text-zinc-400 font-mono">LOADING DATA...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses.length === 0 && !isAdding ? (
                            <div className="text-center py-20 bg-white rounded-[6px] border border-dashed border-zinc-200 shadow-soft">
                                <MapPin className="size-12 text-zinc-100 mx-auto mb-4" />
                                <p className="text-sm text-zinc-400 mb-6">目前沒有已存儲的地址</p>
                                <button
                                    onClick={handleAdd}
                                    className="text-xs font-bold text-zinc-900 border-b-2 border-zinc-900 pb-1 hover:text-zinc-500 hover:border-zinc-300 transition-all uppercase tracking-widest"
                                >
                                    立即新增第一個地址
                                </button>
                            </div>
                        ) : (
                            addresses.map((addr) => (
                                editingAddress?.id === addr.id ? (
                                    <div key={addr.id} className="mb-6">
                                        <AddressForm
                                            address={addr}
                                            onCancel={handleCancel}
                                            onSuccess={handleSuccess}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        key={addr.id}
                                        className={`group bg-white border rounded-[6px] p-6 hover:border-zinc-900 hover:shadow-soft transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${addr.isDefault === 1 ? 'border-zinc-200 shadow-soft' : 'border-zinc-100'}`}
                                    >
                                        {addr.isDefault === 1 && (
                                            <div className="absolute top-0 left-0 w-1 h-full bg-zinc-900"></div>
                                        )}

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 flex-1 w-full sm:w-auto">
                                            <div className={`w-28 shrink-0 ${addr.isDefault === 1 ? 'pl-2' : ''}`}>
                                                <h3 className="font-bold text-base text-zinc-900 tracking-tight mb-1">{addr.receiverName}</h3>
                                                {addr.isDefault === 1 ? (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-50 px-2 py-1 rounded-[2px] w-fit border border-zinc-100">
                                                        <Check className="size-3" />
                                                        預設地址
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-zinc-300 font-mono uppercase tracking-widest">備用地址</span>
                                                )}
                                            </div>

                                            <div className="hidden sm:block h-10 w-px bg-zinc-50"></div>

                                            <div className="flex flex-col gap-2 text-sm text-zinc-600 flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <Phone className="size-4 text-zinc-300" />
                                                    <span className="font-mono text-zinc-900 font-medium">{addr.receiverPhone}</span>
                                                </div>
                                                <div className="flex items-start gap-3 min-w-0">
                                                    <MapPin className="size-4 text-zinc-300 shrink-0 mt-0.5" />
                                                    <span className="leading-relaxed">
                                                        <span className="font-mono text-zinc-400 mr-2">[{addr.postalCode || 'ZIP'}]</span>
                                                        {addr.city}{addr.district}{addr.detailAddress}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 sm:pl-6 sm:border-l border-zinc-50 shrink-0 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                                            {addr.isDefault !== 1 && (
                                                <button
                                                    disabled={isSettingDefault}
                                                    onClick={() => setDefaultAddress(addr.id)}
                                                    className="text-[11px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest disabled:opacity-30"
                                                >
                                                    設為預設
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEdit(addr)}
                                                className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-widest"
                                            >
                                                <Edit2 className="size-3" />
                                                編輯
                                            </button>
                                            {addr.isDefault !== 1 && (
                                                <button
                                                    disabled={isDeleting}
                                                    onClick={() => {
                                                        if (window.confirm('確定要永久刪除此收貨地址嗎？')) {
                                                            deleteAddress(addr.id);
                                                        }
                                                    }}
                                                    className="text-[11px] font-bold text-zinc-400 hover:text-red-500 transition-colors uppercase tracking-widest disabled:opacity-30"
                                                >
                                                    刪除
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
