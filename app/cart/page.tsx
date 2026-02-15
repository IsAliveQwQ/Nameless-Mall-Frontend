'use client';

import * as React from 'react';
import { useCart } from '@/features/cart/hooks/use-cart';
import { useCartPriceCalculation } from '@/features/cart/hooks/use-cart-price';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Minus, Plus, X, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem } from '@/features/cart/components/cart-item';
import { CouponSelector } from '@/features/coupons/components/coupon-selector';
import { ApplicableCouponVO } from '@/features/coupons/types';

export default function CartPage() {
    const { cart, isLoading } = useCart();
    const [mounted, setMounted] = React.useState(false);
    const [selectedCoupon, setSelectedCoupon] = React.useState<ApplicableCouponVO | null>(null);

    // [Industrial Logic] 注入即時價格計算，確保顯示最新促銷
    const {
        calculatedItems: items,
        totalAmount: subtotal,
        totalDiscount: activityDiscount
    } = useCartPriceCalculation(cart?.items);

    const originalSubtotal = subtotal + activityDiscount;

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const discountAmount = selectedCoupon?.estimatedDiscount || 0;
    const finalTotal = Math.max(0, subtotal - discountAmount);
    const totalQuantity = cart?.totalQuantity || 0;

    if (items.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-[#FBFBFB]">
                <SiteHeader />
                <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md space-y-8"
                    >
                        <div className="size-24 rounded-full bg-zinc-100 flex items-center justify-center mx-auto border border-zinc-200">
                            <ShoppingBag className="h-10 w-10 text-zinc-400" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">您的購物車是空的</h1>
                        <Button size="lg" className="rounded-md px-10" asChild>
                            <Link href="/products">開始購物</Link>
                        </Button>
                    </motion.div>
                </main>
                <SiteFooter />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#FBFBFB]">
            <SiteHeader />

            <main className="flex-1 w-full relative">
                <div className="max-w-[1440px] mx-auto p-6 md:p-12 pb-24">
                    <div className="flex flex-col gap-12">
                        {/* Header Section */}
                        <div className="flex flex-col gap-4 border-b border-zinc-200 pb-8">
                            <h1 className="text-4xl font-bold tracking-tight text-zinc-900">您的購物車</h1>
                            <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs">
                                您共有 {totalQuantity} 件商品
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                            {/* Left: Cart Items List */}
                            <div className="lg:col-span-8 flex flex-col gap-8">
                                <AnimatePresence mode='popLayout'>
                                    {items.map((item) => (
                                        <motion.div
                                            key={item.variantId}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-b border-zinc-100 pb-8 last:border-0"
                                        >
                                            <CartItem item={item} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <div className="pt-4">
                                    <Link href="/products" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-900 transition-colors font-medium group">
                                        <ArrowRight className="size-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                        繼續購物
                                    </Link>
                                </div>
                            </div>

                            {/* Right: Summary Box */}
                            <aside className="lg:col-span-4 sticky top-24">
                                <div className="bg-white border border-zinc-200 rounded-lg p-8 shadow-sm">
                                    <h2 className="text-xl font-bold text-zinc-900 mb-8 border-b border-zinc-100 pb-4">訂單摘要</h2>

                                    <div className="space-y-6 mb-8">
                                        <div className="flex justify-between items-center">
                                            <span className="text-zinc-500 font-medium">商品總計</span>
                                            {/* Original Sum */}
                                            <span className="font-mono font-bold text-zinc-900">$ {(subtotal + activityDiscount).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-400 italic">運費將在結帳頁計算</span>
                                        </div>

                                        {/* 活動折扣顯示 */}
                                        {activityDiscount > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-zinc-500 font-medium">活動折扣</span>
                                                <span className="font-mono font-bold text-[#FF4D4F]">
                                                    -${activityDiscount.toLocaleString()}
                                                </span>
                                            </div>
                                        )}

                                        {/* 優惠券折扣顯示 */}
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-500 font-medium">優惠折扣</span>
                                            <span className={discountAmount > 0 ? "font-mono font-bold text-[#FF4D4F]" : "font-mono font-bold text-zinc-900"}>
                                                -${discountAmount.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 優惠券選擇器 */}
                                    <div className="mb-8 pt-4 border-t border-zinc-50">
                                        <CouponSelector
                                            orderAmount={subtotal}
                                            selectedCouponId={selectedCoupon?.id}
                                            onSelect={setSelectedCoupon}
                                        />
                                    </div>

                                    <div className="pt-8 border-t border-zinc-100 mb-10">
                                        <div className="flex justify-between items-end">
                                            <span className="text-lg font-bold text-zinc-900">總計預估</span>
                                            <span className="font-mono text-3xl font-bold text-zinc-900 tracking-tighter">$ {finalTotal.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <Button size="lg" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-16 rounded-md font-bold text-base transition-all shadow-xl shadow-zinc-200" asChild>
                                        <Link href={`/checkout?couponId=${selectedCoupon?.id || ''}`} className="flex items-center justify-center gap-3">
                                            確認結帳 (Checkout)
                                            <ArrowRight className="size-5" />
                                        </Link>
                                    </Button>

                                    <div className="mt-8 flex flex-col gap-4">
                                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                                            <div className="size-1.5 bg-green-500 rounded-full animate-pulse" />
                                            <span>包含所有適用稅額</span>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div >
            </main >

            <SiteFooter />
        </div >
    );
}
