import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/shared/types/product';
import { Button } from '@/components/ui/button';
import { useCart } from '@/features/cart/hooks/use-cart';
import { motion } from 'framer-motion';
import { useQuickAddStore } from '../stores/quick-add-store';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';
import Image from 'next/image';

interface ProductCardProps {
    product: Product;
    className?: string; // [Modified] 支援外部傳入 className
    customDiscountRate?: number; // e.g. 0.88 for 88折
    customLabel?: string; // e.g. "-12%"
}

export function ProductCard({ product, className, customDiscountRate, customLabel }: ProductCardProps) {
    const { openQuickAdd } = useQuickAddStore();
    const router = useRouter();

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        openQuickAdd(product.id);
    };

    // [New] Campaign Pricing Logic
    const basePrice = product.originalPrice || product.price;
    const hasDiscount = !!customDiscountRate && customDiscountRate < 1;
    const finalPrice = hasDiscount ? Math.floor(basePrice * customDiscountRate!) : product.price;
    const discountText = customLabel || (hasDiscount ? `-${Math.round((1 - customDiscountRate!) * 100)}%` : '');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={cn(
                "group relative bg-[#FBFBFB] hover:bg-white transition-colors flex flex-col h-full",
                className
            )}
        >
            <Link href={`/product/${product.id}`} className="flex flex-col h-full">
                {/* Image Container - Aspect Square as per Industrial Grid */}
                <div className="relative aspect-square overflow-hidden bg-[#F4F4F5]">
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                        {product.stock > 0 ? (
                            <span className="w-2 h-2 rounded-full bg-green-500 block ring-2 ring-white" title="In Stock" />
                        ) : (
                            <span className="w-2 h-2 rounded-full bg-red-500 block ring-2 ring-white" title="Out of Stock" />
                        )}
                    </div>

                    {product.isNew && !hasDiscount && (
                        <div className="absolute top-4 left-4 z-10">
                            <span className="bg-zinc-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-sm uppercase tracking-tighter shadow-sm">New Arrival</span>
                        </div>
                    )}

                    {/* Campaign/Discount Badge */}
                    {hasDiscount && (
                        <div className="absolute top-4 left-4 z-10">
                            <span className="bg-zinc-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-sm uppercase tracking-tighter shadow-sm font-bold">
                                {discountText}
                            </span>
                        </div>
                    )}

                    <Image
                        src={product.mainImage || 'https://placehold.co/600x600/f4f4f5/71717a?text=No+Image'}
                        alt={product.name}
                        fill
                        priority={true}
                        className="object-cover transition-transform duration-1000 group-hover:scale-105 mix-blend-multiply"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                </div>

                {/* Content Area */}
                <div className="p-5 md:p-6 flex flex-col gap-2 flex-grow">
                    <div className="flex justify-between items-baseline gap-2">
                        <h4 className="text-[20px] font-medium text-[#18181b] group-hover:text-zinc-600 transition-colors line-clamp-1">
                            {product.name}
                        </h4>
                        <div className="flex flex-col items-end">
                            {hasDiscount ? (
                                <>
                                    <span className="font-mono text-sm font-bold text-zinc-900">
                                        ${finalPrice.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                    </span>
                                    <span className="font-mono text-xs text-zinc-400 line-through">
                                        ${basePrice.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                    </span>
                                </>
                            ) : (
                                <span className="font-mono text-sm font-bold text-[#18181b]">
                                    ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            )}
                        </div>
                    </div>

                    <p className="text-[11px] text-[#71717A] font-normal truncate uppercase tracking-[0.1em] mb-4 antialiased">
                        {product.title || product.categoryName}
                    </p>

                    <button
                        onClick={handleQuickAdd}
                        className="mt-auto w-full border border-[#E4E4E7] rounded-sm py-2.5 text-xs font-bold uppercase tracking-[0.1em] hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all flex items-center justify-center gap-2 group/btn antialiased"
                    >
                        <span>加入購物車</span>
                        <ShoppingBag className="size-3 opacity-60 group-hover/btn:opacity-100" />
                    </button>
                </div>
            </Link>
        </motion.div>
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="bg-[#FBFBFB] flex flex-col h-full animate-pulse">
            <div className="aspect-square bg-zinc-100" />
            <div className="p-5 md:p-6 space-y-4">
                <div className="flex justify-between">
                    <div className="h-4 w-1/2 bg-zinc-100 rounded" />
                    <div className="h-4 w-1/4 bg-zinc-100 rounded" />
                </div>
                <div className="h-3 w-1/3 bg-zinc-100 rounded" />
                <div className="mt-4 h-10 w-full bg-zinc-100 rounded" />
            </div>
        </div>
    );
}

