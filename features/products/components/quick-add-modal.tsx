'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ShoppingBag, Loader2, Minus, Plus, ChevronDown, Check, Info } from 'lucide-react';
import { useQuickAddStore } from '../stores/quick-add-store';
import { useProductDetail } from '../hooks/use-products';
import { useVariantSelector } from '../hooks/use-variant-selector';
import { useCart } from '@/features/cart/hooks/use-cart';

export function QuickAddModal() {
    const { isOpen, activeProductId, closeQuickAdd } = useQuickAddStore();
    const { data: product, isLoading } = useProductDetail(activeProductId || 0);
    const { addItem } = useCart();
    const [quantity, setQuantity] = React.useState(1);
    const [showFullDesc, setShowFullDesc] = React.useState(false);

    // Hook for variant selection logic
    const {
        selectedOptions,
        toggleOption,
        selectedVariant,
        allUniqueOptions,
        isOptionDisabled,
        isFullySelected
    } = useVariantSelector(product?.variants || []);

    const handleAddToCart = () => {
        if (!product || !selectedVariant) return;

        addItem({
            productId: product.id,
            variantId: selectedVariant.id,
            quantity
        });

        closeQuickAdd();
        setQuantity(1);
    };

    React.useEffect(() => {
        if (!isOpen) {
            setQuantity(1);
            setShowFullDesc(false);
        }
    }, [isOpen]);

    if (!activeProductId) return null;

    // Pricing Logic (Compatible with Detail Page)
    const basePrice = product?.originalPrice || product?.price || 0;
    const currentPrice = selectedVariant?.price ?? product?.price ?? 0;
    const variantOriginalPrice = selectedVariant?.originalPrice;

    // Use variant original price if available, otherwise product original price
    const comparePrice = variantOriginalPrice || basePrice;
    const hasDiscount = comparePrice > currentPrice;
    const discountRate = hasDiscount ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100) : 0;

    const currentStock = selectedVariant?.stock ?? product?.stock ?? 0;
    const canAdd = isFullySelected && currentStock > 0;
    const sku = selectedVariant?.sku || `SPU-${product?.id}`;

    return (
        <Dialog open={isOpen} onOpenChange={closeQuickAdd}>
            <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden bg-white gap-0 border-none shadow-2xl h-[85vh] flex flex-col md:flex-row">
                {isLoading || !product ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
                    </div>
                ) : (
                    <>
                        {/* Left: Gallery (Sticky on Desktop) */}
                        <div className="w-full md:w-[45%] bg-[#FAFAFA] relative flex flex-col justify-center items-center p-8 shrink-0">
                            <div className="relative w-full aspect-square max-w-[400px]">
                                {product.mainImage ? (
                                    <Image
                                        src={product.mainImage}
                                        alt={product.name}
                                        fill
                                        className="object-contain mix-blend-multiply"
                                        sizes="(max-width: 768px) 100vw, 400px"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-300 font-mono text-sm">NO IMAGE</div>
                                )}
                            </div>

                            <div className="absolute top-6 left-6 flex gap-2">
                                {product.isNew && <Badge variant="secondary" className="bg-white/90 backdrop-blur text-xs">NEW ARRIVAL</Badge>}
                            </div>
                        </div>

                        {/* Right: Info Scroll Area */}
                        <ScrollArea className="flex-1 h-full bg-white">
                            <div className="p-8 flex flex-col gap-8 min-h-full">

                                {/* Header Info */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
                                        <span>{product.categoryName}</span>
                                        <span className="w-px h-3 bg-zinc-200" />
                                        <span>SKU: {sku}</span>
                                    </div>

                                    <h2 className="text-3xl font-bold text-[#18181B] tracking-tight leading-none">{product.name}</h2>
                                    <p className="text-sm text-zinc-500 font-medium">{product.title}</p>

                                    <div className="flex items-center gap-3 pt-2">
                                        <span className={cn(
                                            "text-2xl font-mono font-medium",
                                            hasDiscount ? "text-red-700 font-bold" : "text-[#18181B] font-medium"
                                        )}>
                                            ${currentPrice.toLocaleString()}
                                        </span>
                                        {hasDiscount && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-mono text-zinc-400 line-through decoration-zinc-300">
                                                    ${comparePrice.toLocaleString()}
                                                </span>
                                                <Badge variant="destructive" className="bg-red-600 hover:bg-red-700 text-[10px] h-5 px-1.5 flex items-center gap-1">
                                                    <span>SALE</span>
                                                    <span className="w-px h-2 bg-white/30" />
                                                    <span>-{discountRate}%</span>
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                {/* Description */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-[#18181B] uppercase tracking-wider">產品簡介</h3>
                                    <div className={cn("prose prose-sm text-zinc-600 leading-relaxed text-justify", !showFullDesc && "line-clamp-3")}>
                                        {product.description}
                                    </div>
                                    {product.description && product.description.length > 150 && (
                                        <button
                                            onClick={() => setShowFullDesc(!showFullDesc)}
                                            className="text-xs font-bold text-zinc-900 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-900 transition-all flex items-center gap-1 mt-1"
                                        >
                                            {showFullDesc ? '收起' : '閱讀更多'} <ChevronDown className={cn("w-3 h-3 transition-transform", showFullDesc && "rotate-180")} />
                                        </button>
                                    )}
                                </div>

                                {/* Variant Selectors (Enlarged) */}
                                <div className="space-y-6">
                                    {Object.entries(allUniqueOptions).map(([optionName, values]) => (
                                        <div key={optionName} className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-bold text-[#18181B] tracking-wider uppercase">{optionName}</span>
                                                <span className="text-sm text-[#52525B] font-mono">{selectedOptions[optionName]}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2.5">
                                                {values.map((value) => {
                                                    const disabled = isOptionDisabled(optionName, value);
                                                    const selected = selectedOptions[optionName] === value;

                                                    return (
                                                        <button
                                                            key={value}
                                                            onClick={() => !disabled && toggleOption(optionName, value)}
                                                            disabled={disabled}
                                                            className={cn(
                                                                "px-5 py-2.5 text-sm font-medium border transition-all rounded-sm relative overflow-hidden group",
                                                                selected
                                                                    ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                                                                    : "bg-white text-zinc-700 border-[#E4E4E7] hover:border-zinc-400",
                                                                disabled && "opacity-20 cursor-not-allowed grayscale bg-zinc-50"
                                                            )}
                                                        >
                                                            {value}
                                                            {selected && (
                                                                <motion.div layoutId={`check-${optionName}`} className="absolute top-0 right-0 p-0.5">
                                                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                                </motion.div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Additional Specs/Details Info Box */}
                                <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-sm space-y-2">
                                    <div className="flex items-start gap-2">
                                        <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                                        <p className="text-xs text-zinc-500 leading-relaxed">
                                            {isFullySelected
                                                ? `庫存狀態: ${currentStock > 0 ? '現貨供應' : '暫時缺貨'}`
                                                : '請選擇完整規格以查看庫存狀態'}
                                        </p>
                                    </div>
                                </div>

                                {/* Sticky Bottom Actions Mockup (Padding for scroll) */}
                                <div className="h-20" />
                            </div>
                        </ScrollArea>

                        {/* Bottom Actions Bar (Fixed) */}
                        <div className="absolute bottom-0 right-0 w-full md:w-[55%] bg-white/80 backdrop-blur-md border-t border-zinc-100 p-6 flex gap-4 z-20">
                            <div className="w-32 border border-[#E4E4E7] rounded flex items-center justify-between px-3 bg-white hover:border-zinc-400 transition-colors group">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="text-zinc-400 hover:text-zinc-900 transition-colors p-2"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-mono text-sm font-medium select-none">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="text-zinc-400 hover:text-zinc-900 transition-colors p-2"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <Button
                                onClick={handleAddToCart}
                                disabled={!canAdd}
                                className={cn(
                                    "flex-1 h-12 rounded text-sm font-medium transition-all gap-3 shadow-lg uppercase tracking-widest",
                                    canAdd ? "bg-zinc-900 hover:bg-zinc-800 text-white shadow-zinc-200/50" : "bg-zinc-100 text-zinc-400"
                                )}
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span>
                                    {!isFullySelected
                                        ? '請選擇規格'
                                        : currentStock === 0
                                            ? '暫無庫存'
                                            : `加入購物車 • $${(currentPrice * quantity).toLocaleString()}`}
                                </span>
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
