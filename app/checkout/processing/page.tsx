'use client';

import * as React from 'react';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, CreditCard, Shield } from 'lucide-react';
import { paymentApi } from '@/features/payment/api/payment-api';

type ProcessingStatus = 'loading' | 'success' | 'error';

function ProcessingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const paymentSn = searchParams.get('paymentSn');
    const orderSn = searchParams.get('orderSn');
    const hasStarted = useRef(false);

    const [status, setStatus] = useState<ProcessingStatus>('loading');
    const [message, setMessage] = useState('正在等待付款確認...');
    const [subMessage, setSubMessage] = useState('請在新分頁完成付款，此頁面將自動更新');
    const [pollCount, setPollCount] = useState(0);

    // 進度提示訊息
    const loadingMessages = [
        '正在等待付款確認...',
        '處理中，請稍候...',
        '正在與金流商通訊...',
        '驗證交易資訊中...',
        '即將完成，請保持網路連線...',
    ];

    useEffect(() => {
        if (hasStarted.current) return;
        hasStarted.current = true;

        if (!paymentSn || !orderSn) {
            setStatus('error');
            setMessage('無效的付款請求');
            setSubMessage('缺少必要的付款資訊');
            setTimeout(() => router.push('/cart'), 3000);
            return;
        }

        const pollInterval = 2000;
        const maxPolls = 150; // 5 分鐘
        let currentPoll = 0;

        const pollPaymentStatus = async () => {
            try {
                const paymentDetail = await paymentApi.getDetail(paymentSn);
                const paymentStatus = paymentDetail.paymentStatus;

                if (paymentStatus === 'SUCCESS') {
                    setStatus('success');
                    setMessage('付款成功！');
                    setSubMessage('感謝您的購買，正在跳轉...');
                    setTimeout(() => {
                        router.push(`/checkout/success?orderSn=${orderSn}`);
                    }, 1500);
                    return;
                }

                if (paymentStatus === 'CLOSED' || paymentStatus === 'REFUNDED') {
                    setStatus('error');
                    setMessage('付款未成功');
                    setSubMessage('交易已取消或被拒絕');
                    setTimeout(() => {
                        router.push(`/checkout/error?orderSn=${orderSn}`);
                    }, 2500);
                    return;
                }

                // 仍在等待中
                currentPoll++;
                setPollCount(currentPoll);

                // 動態更新提示訊息
                const msgIndex = Math.floor(currentPoll / 5) % loadingMessages.length;
                setMessage(loadingMessages[msgIndex]);

                if (currentPoll < maxPolls) {
                    setTimeout(pollPaymentStatus, pollInterval);
                } else {
                    // 超時
                    setStatus('error');
                    setMessage('等待超時');
                    setSubMessage('請至訂單頁面查看付款狀態');
                    setTimeout(() => {
                        router.push(`/orders/${orderSn}`);
                    }, 3000);
                }
            } catch (error) {
                console.error('Poll payment status error:', error);
                currentPoll++;
                if (currentPoll < maxPolls) {
                    setTimeout(pollPaymentStatus, pollInterval);
                }
            }
        };

        // 開始輪詢
        setTimeout(pollPaymentStatus, pollInterval);
    }, [paymentSn, orderSn, router]);

    return (
        <main className="flex-grow w-full flex flex-col items-center justify-center py-24 px-6 antialiased">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col items-center justify-center text-center p-12 bg-white/80 backdrop-blur-xl rounded-3xl border border-zinc-200/50 shadow-2xl shadow-zinc-200/50 max-w-md w-full"
            >
                {/* 背景裝飾 */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-zinc-100 to-transparent rounded-full opacity-50" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-zinc-100 to-transparent rounded-full opacity-50" />
                </div>

                {/* 狀態圖標 */}
                <div className="relative z-10 mb-8">
                    <div className="relative flex items-center justify-center h-24 w-24">
                        {/* 外圈動畫 (Loading 時) */}
                        <AnimatePresence>
                            {status === 'loading' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 rounded-full border-4 border-zinc-100"
                                />
                            )}
                        </AnimatePresence>

                        {/* Loading 旋轉圈 */}
                        {status === 'loading' && (
                            <motion.div
                                className="absolute inset-0"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            >
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-950 rounded-full" />
                            </motion.div>
                        )}

                        {/* 中心圖標 */}
                        <AnimatePresence mode="wait">
                            {status === 'loading' && (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center justify-center w-16 h-16 bg-zinc-50 rounded-full"
                                >
                                    <CreditCard className="w-8 h-8 text-zinc-400" />
                                </motion.div>
                            )}

                            {status === 'success' && (
                                <motion.div
                                    key="success"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                                    className="flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full"
                                >
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                </motion.div>
                            )}

                            {status === 'error' && (
                                <motion.div
                                    key="error"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                                    className="flex items-center justify-center w-20 h-20 bg-red-50 rounded-full"
                                >
                                    <XCircle className="w-12 h-12 text-red-500" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* 文字訊息 */}
                <div className="relative z-10 space-y-3">
                    <motion.h2
                        key={message}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xl font-bold tracking-tight text-zinc-950"
                    >
                        {message}
                    </motion.h2>
                    <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-xs">
                        {subMessage}
                    </p>
                </div>

                {/* 安全提示 (Loading 時顯示) */}
                {status === 'loading' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="relative z-10 mt-10 flex items-center gap-2 text-xs text-zinc-400"
                    >
                        <Shield className="w-3.5 h-3.5" />
                        <span>您的交易受到 SSL 加密保護</span>
                    </motion.div>
                )}

                {/* 訂單編號 */}
                {orderSn && (
                    <div className="relative z-10 mt-8 px-4 py-2 bg-zinc-50 rounded-lg border border-zinc-100">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.15em] mb-0.5">
                            Order
                        </p>
                        <p className="text-xs font-mono font-bold text-zinc-600">
                            {orderSn}
                        </p>
                    </div>
                )}
            </motion.div>
        </main>
    );
}

export default function CheckoutProcessingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#FAFAFA] to-[#F5F5F5]">
            <SiteHeader />
            <Suspense fallback={
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="animate-spin text-zinc-400 size-8" />
                </div>
            }>
                <ProcessingContent />
            </Suspense>
            <SiteFooter />
        </div>
    );
}
