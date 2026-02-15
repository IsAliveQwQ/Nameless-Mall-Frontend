'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { paymentApi } from '@/features/payment/api/payment-api';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function CallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('訂單支付處理中，請稍候...');

    useEffect(() => {
        let isCancelled = false;
        let pollTimer: NodeJS.Timeout;

        const handleCallback = async () => {
            const params: Record<string, string> = {};
            searchParams.forEach((value, key) => {
                params[key] = value;
            });

            // 1. LINE Pay 處理 (帶有 transactionId)
            if (params.transactionId) {
                try {
                    await paymentApi.processCallback('linepay', params);
                    setStatus('success');
                    setMessage('LINE Pay 支付成功！');
                    const paymentSn = params.paymentSn || params.orderId;
                    if (paymentSn) {
                        const payment = await paymentApi.getDetail(paymentSn);
                        setTimeout(() => router.push(`/checkout/success?orderSn=${payment.orderSn}`), 1000);
                    } else {
                        setTimeout(() => router.push('/profile/orders'), 1000);
                    }
                } catch (error: any) {
                    console.error('LINE Pay callback error:', error);
                    router.push(`/checkout/error?code=LINE_PAY_ERROR&message=${encodeURIComponent(error.message || 'LINE Pay 確認失敗')}`);
                }
                return;
            }

            // 2. ECPay/通用 處理 (僅有 paymentSn，需輪詢狀態)
            // ECPay Redirect 不會帶回交易參數(因為是 POST)，我們依賴 URL 中的 paymentSn
            const paymentSn = params.paymentSn || params.MerchantTradeNo;

            if (paymentSn) {
                setMessage('等待付款確認中...');

                const checkStatus = async () => {
                    if (isCancelled) return;
                    try {
                        const payment = await paymentApi.getDetail(paymentSn);
                        console.log('Polling result:', payment);

                        if (!payment) {
                            console.warn('Payment detail is empty, retrying...');
                            // 繼續輪詢
                            pollTimer = setTimeout(checkStatus, 2000);
                            return;
                        }

                        // 狀態映射: SUCCESS 視為付款成功 (PaymentStatus Enum)
                        if (payment.paymentStatus === 'SUCCESS') {
                            setStatus('success');
                            setMessage('付款確認成功！');
                            setTimeout(() => router.push(`/checkout/success?orderSn=${payment.orderSn}`), 1000);
                        } else if (payment.paymentStatus === 'CLOSED' || payment.paymentStatus === 'REFUNDED') {
                            // Redirect to error page
                            router.push(`/checkout/error?code=${payment.paymentStatus}&message=${encodeURIComponent('付款失敗或已關閉，請重新嘗試。')}`);
                        } else {
                            // 繼續輪詢 (WAIT_PAY)
                            pollTimer = setTimeout(checkStatus, 2000);
                        }
                    } catch (error) {
                        console.error('Polling error:', error);
                        // 容錯: 繼續輪詢，直到超時或用戶離開
                        pollTimer = setTimeout(checkStatus, 3000);
                    }
                };

                checkStatus();
                return;
            }

            // 3. 錯誤處理
            if (searchParams.get('cancelled') === 'true') {
                setStatus('error');
                setMessage('您已取消支付。');
            } else {
                setStatus('error');
                setMessage('無效的支付回呼參數。');
            }
        };

        handleCallback();

        return () => {
            isCancelled = true;
            if (pollTimer) clearTimeout(pollTimer);
        };
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
            <div className="max-w-md w-full bg-white border border-zinc-200 rounded-xl p-8 shadow-sm text-center">
                {status === 'loading' && (
                    <div className="space-y-4">
                        <Loader2 className="w-12 h-12 text-zinc-900 animate-spin mx-auto" />
                        <h1 className="text-xl font-bold text-zinc-900">支付處理中</h1>
                        <p className="text-zinc-500 font-medium">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                        <h1 className="text-xl font-bold text-zinc-900">支付完成</h1>
                        <p className="text-zinc-600 font-medium">{message}</p>
                        <div className="pt-4">
                            <Button asChild className="bg-zinc-900 text-white hover:bg-zinc-800">
                                <Link href="/profile/orders">查看我的訂單</Link>
                            </Button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                        <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
                        <h1 className="text-xl font-bold text-zinc-900">支付失敗</h1>
                        <p className="text-rose-600 font-medium bg-rose-50 py-3 px-4 rounded-lg">
                            {message}
                        </p>
                        <div className="pt-4 flex flex-col gap-3">
                            <Button asChild className="bg-zinc-900 text-white hover:bg-zinc-800">
                                <Link href="/cart">回到購物車</Link>
                            </Button>
                            <Button asChild variant="ghost" className="text-zinc-500 hover:text-zinc-900">
                                <Link href="/">回首頁</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CheckoutCallbackPage() {
    return (
        <React.Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-mono text-zinc-400 text-sm animate-pulse">
                INITIALIZING CALLBACK HANDLER...
            </div>
        }>
            <CallbackContent />
        </React.Suspense>
    );
}
