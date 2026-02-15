'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '../hooks/use-cart';
import { CartItem as CartItemType } from '@/shared/types/cart';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface CartItemProps {
    item: CartItemType;
    className?: string;
}

export function CartItem({ item, className }: CartItemProps) {
    const { updateItem, removeItem } = useCart();
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdateQuantity = async (newQuantity: number) => {
        if (newQuantity < 1) return;
        setIsUpdating(true);
        try {
            await updateItem(item.variantId, { quantity: newQuantity });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemove = async () => {
        setIsUpdating(true);
        try {
            await removeItem(item.variantId);
        } finally {
            setIsUpdating(false);
        }
    };

    const displayName = item.productName || "載入中...";
    const displayImage = item.productPic || item.productImage || 'https://placehold.co/150x150?text=No+Image';

    return (
        <div className={cn("flex gap-5 group/item", className)}>
            {/* Image Box - Fixed 96px */}
            <div className="w-24 h-24 bg-slate-50 rounded-md overflow-hidden shrink-0 border border-slate-200 relative">
                <Image
                    src={displayImage}
                    alt={displayName}
                    fill
                    className="object-cover"
                    sizes="96px"
                />
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col justify-between py-0.5 min-w-0">
                <div className="space-y-1">
                    <div className="flex justify-between items-start gap-4">
                        <Link
                            href={`/product/${item.productId}`}
                            className="text-[#18181B] font-bold text-base leading-tight hover:text-blue-600 transition-colors line-clamp-2"
                        >
                            {displayName}
                        </Link>
                        <button
                            onClick={handleRemove}
                            className="text-zinc-300 hover:text-red-500 transition-colors p-1 -mr-2 -mt-1"
                            disabled={isUpdating}
                        >
                            <X className="h-5 w-5 stroke-[1.5px]" />
                        </button>
                    </div>
                    {/* 規格文字 - 優先顯示後端組裝好的 specInfo */}
                    <p className="text-zinc-500 text-sm font-medium">{item.specInfo || item.skuCode || 'Standard Collection'}</p>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    {/* 價格 - 恢復 Bold 份量感 */}
                    <div className="flex flex-col items-start gap-1">
                        <div className="flex items-baseline gap-2">
                            {item.originalPrice && item.originalPrice > item.price && (
                                <span className="text-xs text-zinc-400 line-through decoration-zinc-300 font-mono">
                                    ${item.originalPrice.toLocaleString()}
                                </span>
                            )}
                            <div className="text-[#18181B] font-mono text-lg font-bold">
                                $ {item.price.toLocaleString()}
                            </div>
                        </div>
                        {/* 促銷標籤 (Showcase) */}
                        {item.promotionName && (
                            <span className="text-xs text-red-700 bg-red-50/80 px-2 py-0.5 rounded border border-red-100 font-bold whitespace-nowrap tracking-wide">
                                {item.promotionName}
                                {item.discountAmount && item.discountAmount > 0 ? ` (-$${item.discountAmount.toLocaleString()})` : ''}
                            </span>
                        )}
                    </div>

                    {/* Counter (h-8) - 穩定的工業風 */}
                    <div className="flex items-center border border-zinc-200 rounded-md h-8 overflow-hidden bg-white shadow-sm">
                        <button
                            className="px-2 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-50 h-full border-r border-zinc-100 flex items-center justify-center transition-colors px-2.5"
                            onClick={() => handleUpdateQuantity(item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating}
                        >
                            <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-sm font-mono font-bold text-zinc-800 min-w-[2rem] text-center">
                            {item.quantity}
                        </span>
                        <button
                            className="px-2 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-50 h-full border-l border-zinc-200 text-xs transition-colors flex items-center justify-center px-2.5"
                            onClick={() => handleUpdateQuantity(item.quantity + 1)}
                            disabled={isUpdating}
                        >
                            <Plus className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
