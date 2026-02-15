'use client';

import * as React from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, Headset, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CheckoutErrorContent() {
    const searchParams = useSearchParams();
    const errorMessage = searchParams.get('message') || '您的卡片未能成功扣款，這可能是由於餘額不足或銀行拒絕交易。請檢查卡片資訊或嘗試其他支付方式。';
    const errorCode = searchParams.get('code') || 'NM_PAY_ERR_UNKNOWN';

    return (
        <main className="flex-grow w-full max-w-[1440px] mx-auto flex flex-col items-center py-24 lg:py-32 px-6 antialiased">
            <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[600px] flex flex-col"
            >
                {/* Status Header */}
                <div className="flex flex-col items-center text-center pb-12 border-b border-zinc-200">
                    <div className="size-24 rounded-full bg-red-50 flex items-center justify-center mb-10 shadow-sm">
                        <XCircle className="size-12 text-red-600" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-950 mb-4">支付未成功</h1>
                    <p className="text-zinc-500 max-w-sm leading-relaxed mb-10 font-medium">
                        {errorMessage}
                    </p>

                    <div className="bg-zinc-50 border border-zinc-100 rounded p-4 w-full">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mb-1">Error Information</p>
                        <code className="text-[13px] font-mono text-zinc-500">
                            {errorCode}
                        </code>
                    </div>
                </div>


                {/* Actions */}
                <div className="py-12 flex flex-col items-center gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                        <Button className="h-14 bg-zinc-950 text-white rounded-md text-sm font-black uppercase tracking-[0.2em] shadow-xl hover:bg-zinc-800 transition-all flex gap-3" asChild>
                            <Link href="/cart">
                                <RefreshCw className="size-5" />
                                重新嘗試支付
                            </Link>
                        </Button>
                        <Button variant="outline" className="h-14 border-2 border-zinc-100 text-zinc-500 hover:border-zinc-950 hover:text-zinc-950 rounded-md text-sm font-black uppercase tracking-[0.2em] transition-all bg-white flex gap-3">
                            <Headset className="size-5" />
                            聯絡客服
                        </Button>
                    </div>

                    <Link href="/products" className="group flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-950 transition-colors pt-4">
                        <ArrowLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
                        返回商品列表
                    </Link>
                </div>

                {/* Extra Help */}
                <div className="mt-8 p-6 bg-white border border-zinc-100 rounded-lg shadow-sm">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-950 mb-3">常見解決方案</h4>
                    <ul className="text-xs text-zinc-400 space-y-3 font-medium leading-relaxed">
                        <li className="flex gap-3">
                            <span className="text-zinc-950">01</span>
                            確保您的卡片具備足夠的可用餘額。
                        </li>
                        <li className="flex gap-3">
                            <span className="text-zinc-950">02</span>
                            檢查卡號、過期日以及 CVC 安全碼是否輸入正確。
                        </li>
                        <li className="flex gap-3">
                            <span className="text-zinc-950">03</span>
                            嘗試使用不同瀏覽器或清除快取後重新交易。
                        </li>
                    </ul>
                </div>
            </motion.section>
        </main>
    );
}

export default function CheckoutErrorPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#FBFBFB]">
            <SiteHeader />
            <Suspense fallback={
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-950"></div>
                </div>
            }>
                <CheckoutErrorContent />
            </Suspense>
            <SiteFooter />
        </div>
    );
}
