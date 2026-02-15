'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Receipt, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

import { orderApi } from '@/features/order/api/order-api';
import { OrderDetailVO } from '@/features/order/types';

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const orderSn = searchParams.get('orderSn');
    const [order, setOrder] = React.useState<OrderDetailVO | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!orderSn) {
            setLoading(false);
            return;
        }
        orderApi.getDetail(orderSn)
            .then(data => {
                setOrder(data);
            })
            .catch(err => {
                console.error('Failed to fetch order:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [orderSn]);

    if (loading) {
        return (
            <div className="flex-grow flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-950"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <h1 className="text-2xl font-bold text-zinc-950">找不到訂單</h1>
                <Button asChild><Link href="/">回首頁</Link></Button>
            </div>
        );
    }

    const subtotal = order.totalAmount; // Assuming totalAmount is subtotal before shipping/discount for now, or match backend logic. 
    // Actually OrderVO: totalAmount, payAmount, shippingFee, discountAmount.
    // Let's use payAmount for total.

    return (
        <main className="flex-grow w-full max-w-[1440px] mx-auto flex flex-col items-center py-16 lg:py-24 px-6 antialiased">
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[800px] flex flex-col"
            >
                {/* Status Header */}
                <div className="flex flex-col items-center text-center pb-14 border-b border-zinc-200">
                    <div className="size-20 rounded-full bg-emerald-50 flex items-center justify-center mb-8 shadow-sm">
                        <CheckCircle2 className="size-10 text-emerald-600" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-950 mb-4">訂單支付成功</h1>
                    <p className="text-zinc-500 max-w-md leading-relaxed mb-8 font-medium">
                        感謝您的購買，我們會盡快為您安排出貨。<br />
                        您將會收到一封包含訂單詳情的確認電子郵件。
                    </p>

                    <div className="inline-flex items-center gap-4 px-5 py-2.5 bg-white border border-zinc-200 rounded-lg shadow-sm">
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">訂單編號</span>
                        <span className="text-sm font-mono font-bold text-zinc-950">{order.orderSn}</span>
                    </div>
                </div>

                {/* Order Summary Section */}
                <div className="py-14 flex flex-col gap-12">
                    <div className="flex flex-col gap-8">
                        <div className="flex items-end justify-between">
                            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">訂單摘要</h3>
                            <span className="text-xs font-mono text-zinc-300 font-bold">{order.items.length} ITEMS</span>
                        </div>

                        <div className="divide-y divide-zinc-100 border-y border-zinc-100">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="py-8 flex gap-8 group">
                                    <div className="size-24 bg-zinc-50 rounded-sm overflow-hidden shrink-0 border border-zinc-100 relative">
                                        <Image
                                            src={item.productImage}
                                            alt={item.productName}
                                            fill
                                            className="object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <h4 className="text-[17px] font-black text-zinc-950 mb-1">{item.productName}</h4>
                                            <p className="text-[13px] font-medium text-zinc-400">{item.productVariantName || '標準規格'}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-[12px] font-mono font-bold text-zinc-300 uppercase tracking-widest">Qty: {item.quantity}</span>
                                            <span className="font-mono font-bold text-zinc-950 text-[15px]">NT$ {item.productPrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="flex flex-col gap-4 pl-0 md:pl-[50%]">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-500 font-medium">小計</span>
                            <span className="font-mono font-bold text-zinc-950">NT$ {order.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-500 font-medium">運費</span>
                            <span className="text-zinc-950 font-black text-[13px] uppercase tracking-wider">
                                {order.shippingFee === 0 ? '免運費' : `NT$ ${order.shippingFee}`}
                            </span>
                        </div>
                        {order.discountAmount > 0 && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-emerald-600 font-medium">折扣</span>
                                <span className="font-mono font-bold text-emerald-600">- NT$ {order.discountAmount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="h-px bg-zinc-100 my-2" />
                        <div className="flex justify-between items-end">
                            <span className="text-[16px] font-black text-zinc-950">總計</span>
                            <div className="text-right">
                                <span className="font-mono text-2xl font-black text-emerald-600 tracking-tighter">NT$ {order.payAmount.toLocaleString()}</span>
                                <p className="text-[10px] text-zinc-400 font-medium tracking-tight mt-1">含關稅及相關稅費</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-8">
                        <Button className="h-14 bg-zinc-950 text-white rounded-md text-sm font-black uppercase tracking-[0.2em] shadow-xl hover:bg-zinc-800 transition-all flex gap-3" asChild>
                            <Link href={`/orders/${order.orderSn}`}>
                                <Receipt className="size-5" />
                                查看訂單詳情
                            </Link>
                        </Button>
                        <Button variant="outline" className="h-14 border-2 border-zinc-100 text-zinc-500 hover:border-zinc-950 hover:text-zinc-950 rounded-md text-sm font-black uppercase tracking-[0.2em] transition-all bg-white flex gap-3" asChild>
                            <Link href="/">
                                <Home className="size-5" />
                                回到首頁
                            </Link>
                        </Button>
                    </div>
                </div>
            </motion.section>
        </main>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#FBFBFB]">
            <SiteHeader />
            <Suspense fallback={
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-950"></div>
                </div>
            }>
                <CheckoutSuccessContent />
            </Suspense>
            <SiteFooter />
        </div>
    );
}
