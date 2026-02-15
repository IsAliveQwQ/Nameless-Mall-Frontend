'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useCart } from '@/features/cart/hooks/use-cart';
import { useCartPriceCalculation } from '@/features/cart/hooks/use-cart-price';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Minus, Plus, X, ArrowRight, ShieldCheck, Truck, ChevronRight, Edit3, Lock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { orderApi } from '@/features/order/api/order-api';
import { paymentApi } from '@/features/payment/api/payment-api';
import { OrderSubmitInput } from '@/features/order/types';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { couponApi } from '@/lib/api/coupon-client';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { addressApi } from '@/features/user/api/address-api';
import { Address } from '@/shared/types/user';
import { CouponSelector } from '@/features/coupons/components/coupon-selector';
import { ApplicableCouponVO } from '@/features/coupons/types';


export default function CheckoutPage() {
    return (
        <React.Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#FBFBFB]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
            </div>
        }>
            <CheckoutContent />
        </React.Suspense>
    );
}

function CheckoutContent() {
    const { cart, updateItem, removeItem, isLoading } = useCart();
    const [mounted, setMounted] = React.useState(false);
    const [orderToken, setOrderToken] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuthStore();

    // Form State
    const [formData, setFormData] = React.useState({
        receiverName: '',
        receiverPhone: '',
        email: '',
        city: '',
        district: '',
        address: '',
        note: '',
        payType: 1, // Default LINE Pay
    });

    // Coupon State
    const [selectedCoupon, setSelectedCoupon] = React.useState<ApplicableCouponVO | null>(null);


    React.useEffect(() => {
        setMounted(true);
        // Fetch Order Token for Idempotency
        const fetchToken = async () => {
            try {
                const res = await orderApi.generateToken();
                setOrderToken((res as any).data || res);
            } catch (error) {
                console.error('Failed to fetch order token', error);
            }
        };
        fetchToken();
    }, []);



    // [Fix] 與購物車抽屜一致：使用 useCartPriceCalculation 取得正確促銷價格
    // Priority: Flash Sale > Backend Calculation > Cart Snapshot
    const {
        calculatedItems: items,
        totalAmount: subtotal,
        totalDiscount: activityDiscount,
    } = useCartPriceCalculation(cart?.items);
    const originalSubtotal = subtotal + activityDiscount;
    // [Engineering Discipline] 運費對齊後端真相源：滿 1500 免運，否則 $100
    // Subtotal >= 1500 ? 0 : 100
    const shipping = items.length > 0 ? (subtotal >= 1500 ? 0 : 100) : 0;

    // Auto-fetch and select coupon if query param exists
    const { data: coupons } = useQuery({
        queryKey: ['coupons-checkout-auto', subtotal],
        queryFn: () => couponApi.getApplicableCoupons(subtotal),
        enabled: subtotal > 0 && !!searchParams.get('couponId')
    });

    React.useEffect(() => {
        const couponId = searchParams.get('couponId');
        if (couponId && coupons && !selectedCoupon) {
            const target = coupons.find(c => c.id === Number(couponId));
            if (target && target.usable) {
                setSelectedCoupon(target);
                toast.success(`已自動套用優惠券: ${target.couponName}`);
            }
        }
    }, [coupons, searchParams, selectedCoupon]);

    // Discount Calculation Strategy:
    // Trust backend's estimatedDiscount from ApplicableCouponVO.
    // Backend validation occurs again at Order Submit time.
    const discountAmount = selectedCoupon?.estimatedDiscount || 0;

    // Final Total: Ensure non-negative
    const total = Math.max(0, subtotal + shipping - discountAmount);

    if (!mounted) return null;



    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFillMemberData = async () => {
        if (!user) {
            toast.error('請先登入');
            return;
        }

        // Fill basic info
        setFormData(prev => ({
            ...prev,
            receiverName: user.nickname || user.username,
            receiverPhone: user.phone || '',
            email: user.email || '',
        }));

        // Fill address if available
        try {
            const addresses = await addressApi.getAddresses();
            const defaultAddr = addresses.find(a => a.isDefault === 1) || addresses[0];
            if (defaultAddr) {
                setFormData(prev => ({
                    ...prev,
                    city: defaultAddr.city,
                    district: (defaultAddr as any).region || '', // Mapping region to district
                    address: defaultAddr.detailAddress,
                }));
            }
        } catch (error) {
            console.error('Failed to fetch addresses', error);
        }

        toast.info('已帶入會員聯絡資訊');
    };

    const handleOrderSubmit = async () => {
        if (!orderToken) {
            toast.error('系統忙碌中，請重新整理頁面');
            return;
        }

        if (!formData.receiverName || !formData.receiverPhone || !formData.address) {
            toast.error('請填寫完整的配送資訊');
            return;
        }

        setIsSubmitting(true);
        try {
            const submitData: OrderSubmitInput = {
                cartItemIds: items.map(i => i.variantId),
                receiverName: formData.receiverName,
                receiverPhone: formData.receiverPhone,
                receiverAddress: `${formData.city}${formData.district}${formData.address}`,
                payType: formData.payType,
                shippingMethod: 1, // 宅配
                orderToken: orderToken,
                note: formData.note,
                userCouponId: selectedCoupon?.id

            };

            const order = await orderApi.create(submitData);

            // === 異步下單輪詢 ===
            // 後端回傳 status=5(CREATING) 表示非同步處理中，需輪詢等待完成
            const CREATING = 5;
            const CREATE_FAILED = 6;
            const PENDING_PAYMENT = 0;

            if (order.status === CREATING) {
                toast.info('訂單建立中，請稍候...');

                const MAX_POLL = 30;         // 最多輪詢 30 次
                const POLL_INTERVAL = 1000;  // 每秒一次

                let finalOrder = order;
                for (let i = 0; i < MAX_POLL; i++) {
                    await new Promise(r => setTimeout(r, POLL_INTERVAL));
                    try {
                        const statusResult = await orderApi.getStatus(order.orderSn);
                        if (statusResult.status === PENDING_PAYMENT) {
                            finalOrder = statusResult;
                            break;
                        }
                        if (statusResult.status === CREATE_FAILED) {
                            throw new Error(statusResult.failReason || '訂單建立失敗，請重試');
                        }
                    } catch (pollError: any) {
                        // 如果是 CREATE_FAILED 的 throw，直接向外拋
                        if (pollError.message?.includes('訂單建立失敗') || pollError.message?.includes('重試')) {
                            throw pollError;
                        }
                        // 網路暫時中斷，繼續輪詢
                        console.warn(`Polling attempt ${i + 1} failed:`, pollError.message);
                    }
                    if (i === MAX_POLL - 1) {
                        throw new Error('訂單處理逾時，請至「我的訂單」查看最新狀態');
                    }
                }
                order.status = finalOrder.status;
                order.payAmount = finalOrder.payAmount || order.payAmount;
            }

            // === 訂單已就緒，開始支付流程 ===
            toast.success('訂單建立成功！正在開啟支付頁面...');

            // Create Payment
            const payment = await paymentApi.create({
                orderSn: order.orderSn,
                method: formData.payType === 1 ? 'LINE_PAY' : 'ECPAY_CREDIT'
            });

            // [RFC-012 v3] 新分頁導向金流商，原頁面跳轉到處理中頁面
            let paymentWindow: Window | null = null;

            if (payment.redirectType === 'URL_REDIRECT' && payment.redirectUrl) {
                // LINE Pay：新分頁開啟
                paymentWindow = window.open(payment.redirectUrl, '_blank');
            } else if (payment.redirectType === 'FORM_POST' && payment.formData) {
                // ECPay：在新分頁中提交表單
                paymentWindow = window.open('', '_blank');
                if (paymentWindow) {
                    paymentWindow.document.write(payment.formData);
                    paymentWindow.document.close();
                }
            }

            if (!paymentWindow) {
                // 如果瀏覽器阻擋彈出視窗，退回原邏輯
                toast.warning('請允許彈出視窗以開啟付款頁面');
                if (payment.redirectType === 'URL_REDIRECT' && payment.redirectUrl) {
                    window.location.href = payment.redirectUrl;
                    return;
                }
            }

            // [UX Enhancement] 立即跳轉到處理中頁面，輪詢邏輯在該頁面執行
            router.push(`/checkout/processing?paymentSn=${payment.paymentSn}&orderSn=${order.orderSn}`);

        } catch (error: any) {
            console.error('Order submission failed', error);

            // 只有在明確失敗時，才解除 Loading 鎖定，讓用戶能重試
            setIsSubmitting(false);

            toast.error(error.message || '訂單建立失敗');

            // Refresh token on failure if it's an idempotency issue
            if (error.code === 'TOKEN_INVALID' || error.status === 409) {
                const res = await orderApi.generateToken();
                setOrderToken((res as any).data || res);
            }
        }
        // [UX Fix] 移除 finally 區塊的 setIsSubmitting(false)，防止在跳轉前按鈕變回可點擊狀態
    };

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
                            <Link href="/">開始購物</Link>
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
                <div className="max-w-[1440px] mx-auto p-4 md:p-8 pb-16">

                    {/* Header with Breadcrumbs - Prototype Match */}
                    <div className="flex items-end justify-between pb-2 border-b border-zinc-200 mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">結帳流程</h1>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <span className="text-zinc-900 font-medium">填寫資料</span>
                            <ChevronRight className="size-3" />
                            <span>確認付款</span>
                            <ChevronRight className="size-3" />
                            <span>完成訂單</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">

                        {/* LEFT: Forms & Sections */}
                        <div className="lg:col-span-8 flex flex-col gap-6">

                            {/* 1. 商品摘要 (Cart Item Summary) */}
                            <div className="bg-white border border-zinc-200 rounded-md p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-zinc-900">商品摘要</h2>
                                    <Link href="/cart" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1 group">
                                        編輯購物車
                                        <Edit3 className="size-3 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <AnimatePresence mode='popLayout'>
                                        {items.map((item, idx) => (
                                            <React.Fragment key={item.variantId}>
                                                {idx > 0 && <div className="h-px bg-zinc-100 w-full" />}
                                                <div className="flex gap-5 items-start py-2">
                                                    <div className="w-20 h-20 bg-zinc-50 rounded-md border border-zinc-200 flex-shrink-0 relative overflow-hidden group-hover:border-zinc-300 transition-colors">
                                                        <img
                                                            src={item.productPic || item.productImage || 'https://placehold.co/200x200?text=Item'}
                                                            alt={item.productName}
                                                            className="object-cover w-full h-full mix-blend-multiply"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
                                                        <div>
                                                            <h3 className="text-base font-bold text-zinc-900 line-clamp-2 leading-tight">
                                                                {item.productName}
                                                            </h3>
                                                            <p className="text-xs text-zinc-500 mt-1.5 font-medium uppercase tracking-wide">
                                                                {item.specInfo || item.skuCode || 'Standard Spec'}
                                                            </p>
                                                        </div>
                                                        {item.promotionName && (
                                                            <div className="mt-auto">
                                                                <span className="text-[11px] text-red-700 bg-red-50/80 px-2 py-0.5 rounded border border-red-100 font-bold inline-block tracking-wide">
                                                                    {item.promotionName}
                                                                    {item.discountAmount && item.discountAmount > 0 ? ` (-$${item.discountAmount.toLocaleString()})` : ''}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                                                        {item.originalPrice && item.originalPrice > item.price && (
                                                            <span className="text-xs text-zinc-400 line-through decoration-zinc-300 font-mono">
                                                                $ {item.originalPrice.toLocaleString()}
                                                            </span>
                                                        )}
                                                        <div className="font-mono text-base font-bold text-zinc-900 tracking-tight">$ {item.price.toLocaleString()}</div>
                                                        <div className="text-xs text-zinc-500 font-mono font-medium">Qty: {item.quantity}</div>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div>
                                <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-900 transition-colors font-medium group">
                                    <ArrowRight className="size-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                    回到購物車
                                </Link>
                            </div>

                            {/* 2. 付款方式 (Payment Methods) */}
                            <div className="bg-white border border-zinc-200 rounded-md p-6">
                                <h2 className="text-lg font-bold text-zinc-900 mb-4">付款方式</h2>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <label className="w-full md:w-1/2 relative flex cursor-pointer rounded-lg border border-zinc-200 bg-white p-4 shadow-sm hover:border-zinc-900 transition-all group">
                                        <input
                                            type="radio"
                                            name="payType"
                                            value="1"
                                            className="sr-only"
                                            checked={formData.payType === 1}
                                            onChange={() => setFormData(prev => ({ ...prev, payType: 1 }))}
                                        />
                                        <div className="flex w-full items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-[#06C755] rounded-md flex items-center justify-center text-white font-bold text-[14px]">L</div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-zinc-900">LINE Pay</span>
                                                    <span className="text-[10px] text-zinc-400">使用 LINE 點數折抵</span>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "size-4 border rounded-full flex items-center justify-center transition-colors",
                                                formData.payType === 1 ? "border-zinc-900" : "border-zinc-200"
                                            )}>
                                                {formData.payType === 1 && <div className="size-2 bg-zinc-900 rounded-full" />}
                                            </div>
                                        </div>
                                    </label>
                                    <label className="w-full md:w-1/2 relative flex cursor-pointer rounded-lg border border-zinc-200 bg-white p-4 shadow-sm hover:border-zinc-900 transition-all group">
                                        <input
                                            type="radio"
                                            name="payType"
                                            value="2"
                                            className="sr-only"
                                            checked={formData.payType === 2}
                                            onChange={() => setFormData(prev => ({ ...prev, payType: 2 }))}
                                        />
                                        <div className="flex w-full items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-zinc-900 rounded-md flex items-center justify-center text-white font-bold text-[14px]">E</div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-zinc-900">綠界金流</span>
                                                    <span className="text-[10px] text-zinc-400">信用卡 / ATM 轉帳</span>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "size-4 border rounded-full flex items-center justify-center transition-colors",
                                                formData.payType === 2 ? "border-zinc-900" : "border-zinc-200"
                                            )}>
                                                {formData.payType === 2 && <div className="size-2 bg-zinc-900 rounded-full" />}
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* 3. 寄送方式 (Shipping) */}
                            <div className="bg-white border border-zinc-200 rounded-md p-6">
                                <h2 className="text-lg font-bold text-zinc-900 mb-4">寄送方式</h2>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <label className="w-full md:w-1/3 relative flex cursor-pointer rounded-lg border-2 border-zinc-900 bg-zinc-50 p-4 shadow-sm transition-all">
                                        <span className="flex flex-col w-full">
                                            <span className="flex items-center justify-between">
                                                <span className="block text-sm font-bold text-zinc-900">宅配</span>
                                                <div className="size-4 bg-zinc-900 rounded-full flex items-center justify-center">
                                                    <div className="size-1.5 bg-white rounded-full" />
                                                </div>
                                            </span>
                                            <span className="mt-1 text-xs text-zinc-400">
                                                {shipping === 0 ? '符合滿額免運資格' : '預計 3-5 個工作天'}
                                            </span>
                                            <span className={cn(
                                                "mt-3 font-mono text-sm font-bold",
                                                shipping === 0 ? "text-green-600" : "text-zinc-900"
                                            )}>
                                                {shipping === 0 ? '免運費' : '$ 100.00'}
                                            </span>
                                        </span>
                                    </label>
                                    <div className="w-full md:w-2/3 border border-dashed border-zinc-200 rounded-lg flex items-center justify-center text-zinc-300 text-xs bg-zinc-50/50 min-h-[100px] select-none">
                                        更多取貨方式即將上線
                                    </div>
                                </div>
                            </div>

                            {/* 4. 配送資訊 (Delivery Info) */}
                            <div className="bg-white border border-zinc-200 rounded-md p-6 flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-zinc-900">配送資訊</h2>
                                    <button
                                        type="button"
                                        onClick={handleFillMemberData}
                                        className="text-xs text-zinc-900 underline decoration-dotted underline-offset-4 font-medium"
                                    >
                                        帶入會員資料
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest">收件人姓名</label>
                                        <input
                                            name="receiverName"
                                            value={formData.receiverName}
                                            onChange={handleInputChange}
                                            className="w-full rounded-md border border-zinc-200 bg-[#FBFBFB] px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900 focus:ring-0 outline-none transition-all"
                                            placeholder="請輸入姓名"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest">聯絡電話</label>
                                        <input
                                            name="receiverPhone"
                                            value={formData.receiverPhone}
                                            onChange={handleInputChange}
                                            className="w-full rounded-md border border-zinc-200 bg-[#FBFBFB] px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900 focus:ring-0 outline-none transition-all font-mono"
                                            placeholder="09xx-xxx-xxx"
                                        />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest">電子郵件</label>
                                        <input
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full rounded-md border border-zinc-200 bg-[#FBFBFB] px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900 focus:ring-0 outline-none transition-all font-mono"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest">配送地址</label>
                                        <div className="grid grid-cols-6 gap-3 mb-3">
                                            <input
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className="col-span-3 rounded-md border border-zinc-200 bg-[#FBFBFB] px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900 focus:ring-0 outline-none transition-all"
                                                placeholder="縣市"
                                            />
                                            <input
                                                name="district"
                                                value={formData.district}
                                                onChange={handleInputChange}
                                                className="col-span-3 rounded-md border border-zinc-200 bg-[#FBFBFB] px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900 focus:ring-0 outline-none transition-all"
                                                placeholder="區域"
                                            />
                                        </div>
                                        <input
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="w-full rounded-md border border-zinc-200 bg-[#FBFBFB] px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900 focus:ring-0 outline-none transition-all"
                                            placeholder="街道名稱、樓層、門牌號碼..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 5. 訂單備註 (Notes) */}
                            <div className="bg-white border border-zinc-200 rounded-md p-6 flex flex-col">
                                <h2 className="text-lg font-bold text-zinc-900 mb-4">訂單備註</h2>
                                <textarea
                                    name="note"
                                    value={formData.note}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-zinc-200 bg-[#FBFBFB] px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900 focus:ring-0 outline-none transition-all min-h-[140px] resize-none"
                                    placeholder="有什麼特別需求或是配送指示嗎？例如：請管理員代收、到達前請電話聯繫..."
                                    maxLength={200}
                                />
                                <p className="text-[10px] text-zinc-400 mt-2 text-right">{formData.note.length} / 200 字</p>
                            </div>
                        </div>

                        {/* RIGHT: Order Summary Sticky */}
                        <aside className="lg:col-span-4 lg:sticky lg:top-24">
                            <div className="bg-white border border-zinc-200 rounded-md p-6 sticky">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-zinc-900">訂單摘要</h2>
                                    <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">{items.length} ITEMS</span>
                                </div>
                                <div className="flex flex-col gap-4 mb-6">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-400">商品小計</span>
                                        <span className="font-mono font-bold text-zinc-900">$ {originalSubtotal.toLocaleString()}</span>
                                    </div>

                                    {activityDiscount > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-zinc-400">活動折扣</span>
                                            <span className="font-mono font-bold text-[#FF4D4F]">-${activityDiscount.toLocaleString()}</span>
                                        </div>
                                    )}

                                    {activityDiscount > 0 && (
                                        <div className="flex items-center justify-between text-sm pt-2 border-t border-dashed border-zinc-100">
                                            <span className="text-zinc-900 font-bold">小計</span>
                                            <span className="font-mono font-bold text-zinc-900">$ {subtotal.toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-400">運費 (宅配)</span>
                                        <span className={cn(
                                            "font-mono font-bold",
                                            shipping === 0 ? "text-green-600" : "text-zinc-900"
                                        )}>
                                            {shipping === 0 ? '免運費' : `$ ${shipping.toLocaleString()}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-400">優惠券折扣</span>
                                        <span className={cn(
                                            "font-mono font-bold",
                                            discountAmount > 0 ? "text-[#FF4D4F]" : "text-zinc-400"
                                        )}>
                                            {discountAmount > 0 ? `-$${discountAmount.toLocaleString()}` : '$0'}
                                        </span>
                                    </div>
                                    <div className="pt-2">
                                        <CouponSelector
                                            orderAmount={subtotal}
                                            // Pass subtotal (not total with shipping) because backend threshold logic usually applies to product total
                                            // Note: Depending on business rule, some coupons might cover shipping (free shipping type).
                                            selectedCouponId={selectedCoupon?.id}
                                            onSelect={setSelectedCoupon}
                                        />
                                    </div>
                                </div>
                                <div className="border-t border-zinc-100 pt-6 mb-8">
                                    <div className="flex items-end justify-between">
                                        <span className="font-bold text-zinc-900">總金額</span>
                                        <div className="flex flex-col items-end">
                                            <span className="font-mono text-3xl font-bold text-zinc-900 tracking-tighter">$ {total.toLocaleString()}</span>
                                            <span className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest">含稅金額</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleOrderSubmit}
                                    disabled={isSubmitting || items.length === 0}
                                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 px-6 rounded-md transition-all flex items-center justify-center gap-2 group shadow-lg shadow-zinc-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? '處理中...' : '確認訂單並付款'}
                                    {!isSubmitting && <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />}
                                </button>

                                {/* Trust Badges - Pure Restoration of User's Confirmed Design */}
                                <div className="grid grid-cols-2 gap-4 mt-12 pt-10 border-t border-zinc-100 select-none">
                                    <div className="flex flex-col items-center gap-3 text-center">
                                        <ShieldCheck className="size-5 text-zinc-300" />
                                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-[0.2em]">安全支付</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-3 text-center">
                                        <Truck className="size-5 text-zinc-300" />
                                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-[0.2em]">快速配送</span>
                                    </div>
                                </div>
                            </div>
                        </aside>

                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}

function ShoppingBag(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    )
}
