'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { promotionApi } from '@/lib/api/promotion-client';
import {
    Minus, Plus, Heart, Share2, Construction, Leaf, FileText,
    Ruler, Info, ShieldCheck, Truck, Verified, ChevronRight
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { useProductDetail, useCategories } from '@/features/products/hooks/use-products';
import { useVariantSelector } from '@/features/products/hooks/use-variant-selector';
import { useCart } from '@/features/cart/hooks/use-cart';
import { PRODUCT_STATIC_SPECS } from '@/features/products/config/product-specs';

export default function ProductDetailPage() {
    const params = useParams();
    const productId = Number(params.id);

    // 1. Data Fetching
    const { data: product, isLoading, error } = useProductDetail(productId);
    const { data: categoriesData } = useCategories();
    const { addItem } = useCart();

    const categoryPath = React.useMemo(() => {
        if (!product?.categoryId || !categoriesData) return [];
        const path: any[] = [];
        const findPath = (list: any[], targetId: number): boolean => {
            for (const cat of list) {
                if (cat.id === targetId) {
                    path.push({ id: cat.id, name: cat.name });
                    return true;
                }
                if (cat.children && findPath(cat.children, targetId)) {
                    path.unshift({ id: cat.id, name: cat.name });
                    return true;
                }
            }
            return false;
        };
        findPath(categoriesData, product.categoryId);
        return path;
    }, [categoriesData, product?.categoryId]);

    const { data: flashSale } = useQuery({
        queryKey: ['flash-sale-current'],
        queryFn: () => promotionApi.getCurrentFlashSaleSession(),
        staleTime: 60000
    });

    // 1.5. Dynamic Static Data (Merging UI content)
    const staticSpec = product ? PRODUCT_STATIC_SPECS[product.id] : null;

    // 2. Logic Hooks
    const {
        selectedOptions,
        toggleOption,
        selectedVariant,
        allUniqueOptions,
        isOptionDisabled,
        isFullySelected
    } = useVariantSelector(product?.variants || []);

    // 3. UI States
    const [activeImage, setActiveImage] = React.useState(0);
    const [quantity, setQuantity] = React.useState(1);

    // 1.7. Dynamic Price Calculation (Real-time) - MOVED UP to follow Hooks rules
    const currentVariantOrProductOriginalPrice = selectedVariant?.originalPrice ?? product?.originalPrice ?? selectedVariant?.price ?? product?.price;
    const currentVariantId = selectedVariant?.id;

    const { data: realTimePriceList } = useQuery({
        queryKey: ['price-check', productId, currentVariantId, currentVariantOrProductOriginalPrice],
        queryFn: async () => {
            if (!product) return null;
            const payload = [{
                productId: productId,
                categoryId: product.categoryId,
                variantId: currentVariantId || 0,
                originalPrice: currentVariantOrProductOriginalPrice || 0
            }];
            return await promotionApi.calculatePrices(payload);
        },
        enabled: !!product // Only fetch when product is loaded
    });

    if (isLoading) return <div className="min-h-screen flex items-center justify-center font-mono text-sm tracking-widest text-muted-foreground animate-pulse">LOADING ARCHITECTURAL DATA...</div>;
    if (error || !product) return <div className="min-h-screen flex items-center justify-center font-bold text-destructive">PRODUCT NOT FOUND</div>;

    const realTimePrice = realTimePriceList?.[0];

    // Derived values
    const selectedVariantId = selectedVariant?.id;
    const flashSaleItem = flashSale?.products.find(p =>
        p.productId === productId &&
        (selectedVariantId ? p.variantId === selectedVariantId : true)
    );
    const isFlashSaleActive = !!flashSaleItem && (flashSaleItem.stockStatus !== '售罄');

    // Priority: Flash Sale > Real-time Calculation > Legacy DB Price
    const currentPrice = (isFlashSaleActive
        ? (flashSaleItem.flashPrice ?? flashSaleItem.flashSalePrice)
        : (realTimePrice?.finalPrice ?? currentVariantOrProductOriginalPrice)) || 0;

    // Promotion Meta (For Badge)
    const activePromotionName = isFlashSaleActive
        ? (flashSale?.name || realTimePrice?.promotionName || '')
        : (realTimePrice?.promotionName || '');

    const currentStock = selectedVariant?.stock ?? product.stock;
    const currentSKU = selectedVariant?.sku ?? `SPU-${product.id}`;

    return (
        <div className="flex flex-col min-h-screen bg-[#FBFBFB]">
            <SiteHeader />

            <main className="flex-1 w-full mx-auto max-w-[1440px] px-6 lg:px-12 py-6 lg:py-10">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[15px] text-zinc-500 font-medium mb-10 overflow-x-auto no-scrollbar">
                    <Link href="/products" className="hover:text-zinc-900 transition-colors shrink-0">所有產品</Link>
                    {categoryPath.map((node) => (
                        <React.Fragment key={node.id}>
                            <ChevronRight className="size-4 text-zinc-300 shrink-0" />
                            <Link
                                href={`/products?categoryId=${node.id}`}
                                className="hover:text-zinc-900 transition-colors shrink-0"
                            >
                                {node.name}
                            </Link>
                        </React.Fragment>
                    ))}
                    <ChevronRight className="size-4 text-zinc-300 shrink-0" />
                    <span className="text-zinc-900 font-bold shrink-0">{product.name}</span>
                </nav>
                {/* Section 1: Product Buy Box */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 pb-20 border-b border-[#E4E4E7]">

                    {/* Left: Gallery (6 Columns) */}
                    <div className="lg:col-span-6 flex flex-col gap-6 lg:pr-12">
                        <div className="w-full bg-white rounded-sm border border-[#E4E4E7] flex items-center justify-center p-6 lg:p-8 relative group aspect-[4/3] lg:aspect-[1.15/1] overflow-hidden">
                            <div className="absolute top-4 left-4 z-10">
                                <Badge variant="outline" className="bg-white/80 backdrop-blur-sm px-3 py-1 text-[10px] tracking-[0.2em] font-mono border-zinc-200">
                                    {currentStock > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                                </Badge>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeImage}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="relative w-full h-full"
                                >
                                    <Image
                                        src={product.images[activeImage]}
                                        alt={product.name}
                                        fill
                                        priority
                                        className="object-contain mix-blend-multiply drop-shadow-sm group-hover:scale-105 transition-transform duration-700 ease-out"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            <button className="absolute bottom-4 right-4 size-10 rounded-full border border-[#E4E4E7] bg-white flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm">
                                <Heart className="size-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 lg:gap-6 w-full">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={cn(
                                        "aspect-square w-full border rounded-sm bg-white p-4 lg:p-6 transition-all relative overflow-hidden",
                                        activeImage === idx ? "border-zinc-900 opacity-100" : "border-[#E4E4E7] opacity-80 hover:opacity-100"
                                    )}
                                >
                                    <Image
                                        src={img}
                                        alt={`Thumb ${idx} `}
                                        fill
                                        className="object-contain mix-blend-multiply"
                                        sizes="100px"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info (5 Columns) */}
                    <div className="lg:col-span-5 lg:col-start-8 flex flex-col justify-between py-2">
                        <div className="flex flex-col gap-10 lg:gap-14 pt-1">
                            {/* Title & Brand */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-[14px] text-zinc-500 uppercase tracking-[0.1em] h-6 font-medium">
                                    <span className="font-mono">SKU: {currentSKU}</span>
                                    <span className="w-[1px] h-3 bg-zinc-200"></span>
                                    <span className="text-zinc-600">{product.categoryName}</span>
                                </div>
                                <div className="space-y-3">
                                    <h1 className="text-3xl lg:text-4xl font-bold text-[#18181B] tracking-tight leading-none">
                                        {product.name}
                                    </h1>
                                    <p className="text-sm font-medium text-zinc-500 tracking-tight">
                                        {product.title}
                                    </p>
                                    {/* Refactored Price Display Logic */}
                                    {(() => {
                                        const finalCurrentPrice = currentPrice || 0;
                                        // The original price for comparison should be the legacy DB price (MSRP)
                                        // Unless it's a flash sale which might carry its own original price logic, but usually we compare against MSRP.
                                        const finalOriginalPrice = currentVariantOrProductOriginalPrice || 0;

                                        // Only show comparison if original > current
                                        const showStrikethrough = finalOriginalPrice > finalCurrentPrice;

                                        const discountPercentage = (showStrikethrough && finalOriginalPrice > 0)
                                            ? Math.round(((finalOriginalPrice - finalCurrentPrice) / finalOriginalPrice) * 100)
                                            : 0;

                                        return (
                                            <div className="flex items-center gap-3 pt-2">
                                                {activePromotionName && (
                                                    <Badge variant="destructive" className={cn(
                                                        "px-2 py-0.5 text-[10px] tracking-wide h-6 rounded-sm border-none",
                                                        isFlashSaleActive ? "bg-red-600 hover:bg-red-700" : "bg-red-600 hover:bg-red-700"
                                                    )}>
                                                        {activePromotionName}
                                                    </Badge>
                                                )}
                                                <div className="flex items-baseline gap-3">
                                                    <span className={cn(
                                                        "font-mono text-2xl tracking-tight",
                                                        (isFlashSaleActive || discountPercentage > 0) ? "text-red-700 font-bold" : "text-[#18181B] font-medium"
                                                    )}>
                                                        ${finalCurrentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                    {showStrikethrough && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-muted-foreground line-through font-mono decoration-zinc-300">
                                                                ${finalOriginalPrice.toLocaleString()}
                                                            </span>
                                                            {discountPercentage > 0 && (
                                                                <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-100 rounded-sm text-[10px] font-bold px-1.5 h-5">
                                                                    -{discountPercentage}%
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Brief Description */}
                            <div className="prose prose-zinc text-sm text-justify leading-7 text-[#52525B] max-w-md">
                                <p>{product.description}</p>
                            </div>

                            {/* Dynamic Variant Selectors */}
                            <div className="space-y-8 max-w-md">
                                {Object.entries(allUniqueOptions).map(([optionName, values]) => (
                                    <div key={optionName}>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm font-bold text-[#18181B] tracking-wider uppercase">{optionName}</span>
                                            <span className="text-sm text-[#52525B] font-mono">{selectedOptions[optionName] || '請選擇'}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {values.map((value) => {
                                                const disabled = isOptionDisabled(optionName, value);
                                                const selected = selectedOptions[optionName] === value;

                                                return (
                                                    <button
                                                        key={value}
                                                        onClick={() => !disabled && toggleOption(optionName, value)}
                                                        disabled={disabled}
                                                        className={cn(
                                                            "px-5 py-2.5 text-sm font-medium border transition-all rounded-sm",
                                                            selected
                                                                ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                                                                : "bg-white text-zinc-700 border-[#E4E4E7] hover:border-zinc-400",
                                                            disabled && "opacity-20 cursor-not-allowed grayscale"
                                                        )}
                                                    >
                                                        {value}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {/* Quantity & Add to Cart */}
                                <div className="space-y-4 pt-4">
                                    <div className="flex gap-4 h-12">
                                        <div className="w-32 border border-[#E4E4E7] rounded flex items-center justify-between px-3 bg-white hover:border-zinc-400 transition-colors group">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="text-zinc-400 hover:text-zinc-900 transition-colors p-2 text-lg font-light"
                                            >-</button>
                                            <span className="font-mono text-sm font-medium">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="text-zinc-400 hover:text-zinc-900 transition-colors p-2 text-lg font-light"
                                            >+</button>
                                        </div>
                                        <Button
                                            disabled={!isFullySelected || currentStock === 0}
                                            onClick={() => addItem({
                                                productId: product.id,
                                                variantId: selectedVariant?.id!,
                                                quantity
                                            })}
                                            className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 h-full rounded text-sm font-medium transition-all gap-4 shadow-lg shadow-zinc-200/50 group"
                                        >
                                            <span className="tracking-widest uppercase">
                                                {!isFullySelected ? '請選擇規格' : currentStock === 0 ? '暫無庫存' : '加入購物車'}
                                            </span>
                                            {isFullySelected && currentStock > 0 && (
                                                <>
                                                    <span className="w-[1px] h-3 bg-white/20"></span>
                                                    <span className="font-mono text-xs opacity-80">
                                                        ${(currentPrice * quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Badges Footer */}
                        <div className="mt-12 flex items-center gap-6 lg:gap-8 text-[10px] lg:text-[11px] font-medium text-[#52525B] uppercase tracking-wider border-t border-[#E4E4E7]/60 pt-6">
                            <div className="flex items-center gap-2">
                                <Truck className="size-4" />
                                <span>免運優惠</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Verified className="size-4" />
                                <span>30日退換貨</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="size-4" />
                                <span>5年結構保固</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Detailed Introduction (Conditional) */}
                {staticSpec && (
                    <section className="py-24 border-b border-[#E4E4E7]">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0">
                            <div className="lg:col-span-4">
                                <div className="sticky top-24">
                                    <div className="flex items-center gap-3 mb-4 text-zinc-400">
                                        <FileText className="size-6" />
                                        <h3 className="text-sm font-bold text-[#18181B] tracking-tight uppercase">產品詳細介紹</h3>
                                    </div>
                                    <p className="text-xs text-[#A1A1AA] leading-relaxed">
                                        探索 {product.name} 的設計哲學與製作工藝。經典重塑，歷久彌新。
                                    </p>
                                </div>
                            </div>
                            <div className="lg:col-span-7 lg:col-start-6 space-y-16">
                                <div className="prose prose-lg prose-zinc max-w-none text-[#18181B]">
                                    <p className="text-xl lg:text-2xl font-light leading-relaxed text-justify">
                                        {staticSpec.fullDescription}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 pt-8 border-t border-[#E4E4E7]">
                                    {staticSpec.features.map((feature, idx) => (
                                        <div key={feature.title}>
                                            <h4 className="text-sm font-bold text-[#18181B] mb-4">{feature.title}</h4>
                                            <p className="text-sm leading-7 text-[#52525B] text-justify">
                                                {feature.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Section 3: Technical Specs */}
                <section className="py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0">
                        <div className="lg:col-span-4">
                            <div className="sticky top-24">
                                <div className="flex items-center gap-3 mb-4 text-zinc-400">
                                    <Ruler className="size-6" />
                                    <h3 className="text-sm font-bold text-[#18181B] tracking-tight uppercase">規格參數</h3>
                                </div>
                                <p className="text-xs text-[#A1A1AA] leading-relaxed font-mono uppercase tracking-widest">
                                    Specifications & Data
                                </p>
                            </div>
                        </div>
                        <div className="lg:col-span-7 lg:col-start-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
                                {/* From Dynamic API Attrs */}
                                {product.attrs?.map((attr) => (
                                    <div key={`${attr.attrId}-${attr.attrValue}`} className="group border-b border-[#E4E4E7] py-5 flex justify-between items-baseline hover:bg-zinc-50 transition-colors px-2 -mx-2 rounded-sm">
                                        <span className="text-xs text-[#52525B] font-medium">{attr.attrName}</span>
                                        <span className="font-mono text-sm font-bold text-[#18181B]">{attr.attrValue}</span>
                                    </div>
                                ))}

                                {/* From Static UI Spec */}
                                {staticSpec?.technicalSpecs.map((spec) => (
                                    <div key={spec.label} className="group border-b border-[#E4E4E7] py-5 flex justify-between items-baseline hover:bg-zinc-50 transition-colors px-2 -mx-2 rounded-sm">
                                        <span className="text-xs text-[#52525B] font-medium">{spec.label}</span>
                                        <span className="font-mono text-sm font-bold text-[#18181B]">{spec.value}</span>
                                    </div>
                                ))}

                                <div className="md:col-span-2 py-7 flex justify-between items-center px-2 -mx-2">
                                    <span className="text-xs text-[#52525B] font-medium uppercase tracking-tighter">產地 (Origin)</span>
                                    <span className="font-bold text-sm text-[#18181B]">{staticSpec?.origin || '歐洲製造'}</span>
                                </div>
                            </div>
                            <div className="bg-zinc-100/50 p-5 rounded mt-8 flex gap-3 border border-zinc-100">
                                <Info className="size-5 text-zinc-400 shrink-0" />
                                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                                    每一件精品家具都具備天然的材料特徵，屬正常工藝範疇。所有規格數據僅供參考，尺寸測量可能存在微小公差，具體以實物為準。
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
