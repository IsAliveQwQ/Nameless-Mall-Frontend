'use client';

import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import * as React from 'react';
import { orderApi } from '@/features/order/api/order-api';
import { OrderDetailVO } from '@/features/order/types';
import { paymentApi } from '@/features/payment/api/payment-api';
import { PaymentMethod } from '@/features/payment/types';
import { toast } from 'sonner';
import { Loader2, Package, Clock, CreditCard, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

// Mock Data based on Prototype
const ORDER_MOCK = {
    id: "#NM-2023-8842",
    date: "2023-11-14",
    status: "已發貨",
    items: [
        {
            name: "Soft Cloud Sofa - 3 Seater",
            spec: "顏色: Sand / 材質: Velvet",
            price: "NT$ 45,000",
            quantity: 1,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXlMdPQPKswL4aHT1qAWkgwU4UW_KsZsRAgvWZ765l2qPtq2njkZ6W_8Fl-10Kzyg5p4RQiZzt2DRzHiydAk6sjxvI6ZR_i98ORY93SzyqJaQxsGA-7wTXBG7N3iVqd5yheR6Zhfprbwj508Abaif2Qvunjd2bpM_tuhvvQmNBKc8ecsUvPVnfHP0K1MPp-hZzt8khD49exkLVWIYgCpDhoapiyNS0pX9aqvXaWvfIMflL6rmtZMxErBbDuCkWGYTRBx7R-Bfy97s"
        },
        {
            name: "Geo Pendant Light",
            spec: "顏色: Matte Black",
            price: "NT$ 6,500",
            quantity: 2,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5Ra_00DPNuojb9nY1xunheSYKxBpJSIwmzMpKVGJkTKxfns05IXutACvQ2GgO4KJuJa2yMzQ_F2TUqylv3uvxjDX8Y4pHRtxDQiVWNGkNgh_VCpbKVhtUdO-nOIqz5OZg61qCnzAaUKybuNB7S4KOZ8mJcDx2w9M3GEzQfRcvs-I-4x3BAmOcvp7T-kr8HUlrhk83FnyisiKVJoePWeZa8nLU6IERtLG2jCQyE7UByTT4wVqp6uSkFLzyS6n_i6O-38Y_6YjmNlM"
        }
    ],
    billing: {
        subtotal: "NT$ 51,500",
        shipping: "NT$ 1,200",
        discount: "- NT$ 500",
        total: "NT$ 52,200"
    },
    shipping: {
        name: "陳大明",
        phone: "0912-345-678",
        address: ["110 台北市信義區松高路 18 號", "(Nameless Tower 25F)"]
    },
    payment: {
        method: "信用卡付款",
        provider: "VISA",
        last4: "4242",
        invoice: "個人雲端發票 (手機條碼)"
    }
};

export default function OrderDetailPage({ params }: { params: { orderSn: string } }) {
    const [order, setOrder] = React.useState<OrderDetailVO | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await orderApi.getDetail(params.orderSn);
                setOrder((res as any).data || res);
            } catch (error: any) {
                console.error('Failed to fetch order detail', error);
                toast.error(error.message || '無法獲取訂單詳情');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [params.orderSn]);

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-[#FBFBFB]">
                <SiteHeader />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-zinc-400 size-8" />
                </main>
                <SiteFooter />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col min-h-screen bg-[#FBFBFB]">
                <SiteHeader />
                <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <h1 className="text-2xl font-bold tracking-tight mb-4">找不到此訂單</h1>
                    <Button variant="outline" asChild>
                        <Link href="/profile">回到會員中心</Link>
                    </Button>
                </main>
                <SiteFooter />
            </div>
        );
    }

    const getStepStatus = (step: number) => {
        const status = order.status;
        if (status >= step) return 'active';
        return 'inactive';
    };
    return (
        <div className="flex flex-col min-h-screen bg-[#FBFBFB]">
            <SiteHeader />

            <main className="flex-1 w-full max-w-[1100px] mx-auto border-l border-r border-[#E4E4E7] bg-[#FBFBFB]">
                <div className="px-8 py-12 lg:py-16 pb-20">
                    <nav className="flex items-center text-sm text-[#71717A] mb-8 font-medium">
                        <Link href="/" className="hover:text-[#18181B] transition-colors">首頁</Link>
                        <span className="mx-2 text-[#E4E4E7]">/</span>
                        <Link href="/profile" className="hover:text-[#18181B] transition-colors">會員中心</Link>
                        <span className="mx-2 text-[#E4E4E7]">/</span>
                        <span className="text-[#18181B]">訂單詳情</span>
                    </nav>

                    {/* Order Header */}
                    <div className="pb-8 border-b border-[#E4E4E7] mb-12">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold tracking-tighter text-[#18181B] font-mono leading-none">{order.orderSn}</h1>
                                <div className="flex items-center gap-3 text-sm font-medium">
                                    <span className="text-[#71717A]">訂購日期</span>
                                    <span className="font-mono text-[#18181B]">{format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                                    <span className="text-[#E4E4E7] mx-1">|</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#18181B] text-white text-xs font-bold tracking-wider uppercase">
                                        {order.statusName}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {order.status === 0 && (
                                    <>
                                        <Button
                                            size="sm"
                                            className="h-9 text-xs font-bold bg-[#18181B] text-white hover:bg-zinc-800 transition-all px-6 rounded-full"
                                            onClick={async () => {
                                                try {
                                                    // Map PayType to PaymentMethod
                                                    let method: PaymentMethod = 'LINE_PAY';
                                                    if (order.payType === 2) method = 'ECPAY_CREDIT';

                                                    // Call Payment API
                                                    const payment = await paymentApi.create({
                                                        orderSn: order.orderSn,
                                                        method: method,
                                                        payType: order.payType
                                                    });

                                                    // Handle Redirect
                                                    if (payment.redirectType === 'FORM_POST' && payment.formData) {
                                                        // ECPay: Create and submit form
                                                        const div = document.createElement('div');
                                                        div.innerHTML = payment.formData;
                                                        document.body.appendChild(div);
                                                        const form = div.querySelector('form');
                                                        if (form) form.submit();
                                                    } else if (payment.redirectUrl) {
                                                        // LINE Pay / Others
                                                        window.location.href = payment.redirectUrl;
                                                    } else {
                                                        toast.error('無法取得支付連結');
                                                    }
                                                } catch (error: any) {
                                                    console.error('Payment init error:', error);
                                                    toast.error(error.message || '發起支付失敗');
                                                }
                                            }}
                                        >
                                            立即付款
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-all px-6 rounded-full"
                                            onClick={async () => {
                                                if (confirm('確定要取消此訂單嗎？')) {
                                                    try {
                                                        await orderApi.cancel(order.orderSn);
                                                        toast.success('訂單已取消');
                                                        window.location.reload();
                                                    } catch (error: any) {
                                                        toast.error(error.message || '取消失敗');
                                                    }
                                                }
                                            }}
                                        >
                                            取消訂單
                                        </Button>
                                    </>
                                )}
                                <button className="text-xs font-bold text-[#71717A] hover:text-[#18181B] transition-colors underline decoration-[#71717A]/30 underline-offset-8 uppercase tracking-widest leading-none">
                                    需要協助？
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stepper / Timeline */}
                    <div className="mb-14 px-2 sm:px-8">
                        <div className="relative">
                            <div className="absolute top-[6px] left-[6px] right-[6px] h-px bg-zinc-200 -translate-y-1/2"></div>
                            {/*動態進度條*/}
                            <div
                                className="absolute top-[6px] left-[6px] h-px bg-[#18181B] -translate-y-1/2 transition-all duration-700 ease-in-out"
                                style={{ width: order.status === 0 ? '0%' : order.status === 1 ? '33.33%' : order.status === 2 ? '66.66%' : '100%' }}
                            ></div>
                            <div className="relative flex justify-between w-full">
                                <div className="flex flex-col items-center">
                                    <div className={cn("size-3.5 rounded-full ring-4 ring-[#FBFBFB] transition-all duration-300", order.status >= 0 ? "bg-[#18181B]" : "bg-zinc-200")}></div>
                                    <span className={cn("mt-4 text-xs font-bold tracking-tight uppercase", order.status >= 0 ? "text-[#18181B]" : "text-[#A1A1AA]")}>訂單成立</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className={cn("size-3.5 rounded-full ring-4 ring-[#FBFBFB] transition-all duration-300", order.status >= 1 ? "bg-[#18181B]" : "bg-zinc-200")}></div>
                                    <span className={cn("mt-4 text-xs font-bold tracking-tight uppercase", order.status >= 1 ? "text-[#18181B]" : "text-[#A1A1AA]")}>付款完成 / 處理中</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className={cn("size-3.5 rounded-full ring-4 ring-[#FBFBFB] transition-all duration-300", order.status >= 2 ? "bg-[#18181B]" : "bg-zinc-200")}></div>
                                    <span className={cn("mt-4 text-xs font-bold tracking-tight uppercase", order.status >= 2 ? "text-[#18181B]" : "text-[#A1A1AA]")}>已發貨</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className={cn("size-3.5 rounded-full ring-4 ring-[#FBFBFB] transition-all duration-300", order.status >= 3 ? "bg-[#18181B]" : "bg-zinc-200")}></div>
                                    <span className={cn("mt-4 text-xs font-bold tracking-tight uppercase", order.status >= 3 ? "text-[#18181B]" : "text-[#A1A1AA]")}>已送達</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-10">
                        {/* Left Column: Items */}
                        <div className="lg:col-span-8">
                            <h3 className="text-sm font-bold text-[#71717A] uppercase tracking-widest mb-6">訂單內容 (Items)</h3>
                            <div className="flex flex-col border-t border-[#E4E4E7]">
                                {order.items.map((item, index) => {
                                    const discountVal = item.promotionAmount || 0;
                                    const showDiscount = discountVal > 0;
                                    const hasPromotion = !!item.promotionName;

                                    return (
                                        <div key={index} className="group py-8 flex flex-col sm:flex-row items-start gap-6 border-b border-[#E4E4E7]">
                                            <div className="w-24 h-24 shrink-0 bg-zinc-100 overflow-hidden rounded-sm border border-[#E4E4E7] relative">
                                                <div
                                                    className="w-full h-full bg-cover bg-center mix-blend-multiply"
                                                    style={{ backgroundImage: `url('${item.productImage}')` }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-between h-auto min-h-[6rem] py-0.5">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="space-y-1">
                                                        <h4 className="text-base font-medium text-[#18181B]">{item.productName}</h4>
                                                        <p className="text-xs text-[#A1A1AA] font-medium tracking-tight uppercase">{item.productVariantName || '標準規格'}</p>

                                                        {/* [UI Component] 活動優惠標籤 (Active Promotion Badge) */}
                                                        {hasPromotion && (
                                                            <div className="mt-2">
                                                                <span className="text-[11px] text-[#C92A2A] bg-[#FFF5F5] px-2 py-0.5 rounded border border-[#FFEC99]/0 font-bold whitespace-nowrap tracking-wide inline-flex items-center ring-1 ring-[#FFC9C9]/30">
                                                                    {item.promotionName}
                                                                    {showDiscount ? ` (-NT$${discountVal.toLocaleString()})` : ''}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* [UI Component] 價格顯示 (原價/現價) */}
                                                    <div className="text-right">
                                                        {item.originalPrice && item.originalPrice > item.productPrice && (
                                                            <div className="text-xs text-zinc-400 line-through decoration-zinc-300 font-mono mb-0.5">
                                                                NT$ {item.originalPrice.toLocaleString()}
                                                            </div>
                                                        )}
                                                        <div className="text-base font-mono font-medium text-[#18181B]">
                                                            NT$ {item.productPrice.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between mt-4 sm:mt-0">
                                                    <p className="text-sm text-[#71717A] font-mono mt-auto">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Column: Summary */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24">
                                <h3 className="text-sm font-bold text-[#71717A] uppercase tracking-widest mb-6">金額明細 (Summary)</h3>
                                <div className="bg-zinc-50 border border-[#E4E4E7] p-8 rounded-sm">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-base">
                                            <span className="text-[#71717A]">小計</span>
                                            <span className="font-mono text-[#18181B]">NT$ {order.items.reduce((acc, item) => acc + ((item.originalPrice || item.productPrice) * item.quantity), 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-base">
                                            <span className="text-[#71717A]">運費</span>
                                            <span className="font-mono text-[#18181B]">NT$ {order.shippingFee.toLocaleString()}</span>
                                        </div>

                                        {(() => {
                                            const totalPromotionDiscount = order.items.reduce((acc, item) => acc + (item.promotionAmount || 0), 0);
                                            const totalCouponDiscount = Math.max(0, (order.discountAmount || 0) - totalPromotionDiscount);
                                            const promoNames = Array.from(new Set(order.items.map(i => i.promotionName).filter(Boolean)));
                                            const promoLabel = promoNames.length > 0
                                                ? `活動折扣 ${promoNames.length === 1 ? `(${promoNames[0]})` : ''}`
                                                : '活動折扣';

                                            return (
                                                <>
                                                    {totalPromotionDiscount > 0 && (
                                                        <div className="flex justify-between items-center text-base">
                                                            <span className="text-[#71717A] truncate pr-4" title={promoLabel}>{promoLabel}</span>
                                                            <span className="font-mono text-[#18181B] whitespace-nowrap">- NT$ {totalPromotionDiscount.toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                    {totalCouponDiscount > 0 && (
                                                        <div className="flex justify-between items-center text-base">
                                                            <span className="text-[#71717A]">優惠券折扣</span>
                                                            <span className="font-mono text-[#18181B] whitespace-nowrap">- NT$ {totalCouponDiscount.toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                        <div className="pt-6 mt-6 border-t border-dashed border-[#E4E4E7]/60">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-base font-bold text-[#18181B]">總金額</span>
                                                <span className="text-2xl font-bold font-mono text-[#18181B] tracking-tight">NT$ {order.payAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Info Grid */}
                    <div className="mt-16 pt-12 border-t border-[#E4E4E7]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            {/* Shipping Info */}
                            <div className="space-y-5">
                                <h3 className="text-sm font-bold text-[#71717A] uppercase tracking-widest">收件資訊 (Shipping)</h3>
                                <div className="pl-5 border-l-2 border-[#E4E4E7]/60 py-1">
                                    <p className="text-lg font-medium text-[#18181B]">{order.shipment.receiverName}</p>
                                    <p className="text-base font-mono text-[#71717A] mt-1.5">{order.shipment.receiverPhone}</p>
                                    <p className="text-base text-[#71717A] leading-relaxed mt-2.5 max-w-sm">
                                        {order.shipment.receiverAddress}
                                    </p>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="space-y-5">
                                <h3 className="text-sm font-bold text-[#71717A] uppercase tracking-widest">付款資訊 (Payment)</h3>
                                <div className="pl-5 border-l-2 border-[#E4E4E7]/60 py-1">
                                    <div className="flex items-center gap-3 mb-2.5">
                                        <span className="text-lg font-medium text-[#18181B]">{order.payTypeName}</span>
                                    </div>
                                    {order.paymentAccountInfo && (
                                        <p className="text-base font-mono text-[#71717A]">支付資訊: {order.paymentAccountInfo}</p>
                                    )}
                                    {order.note && (
                                        <p className="text-base text-[#71717A] mt-2.5">
                                            備註: {order.note}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
