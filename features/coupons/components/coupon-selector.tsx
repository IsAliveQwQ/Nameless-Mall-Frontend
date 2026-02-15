import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { couponApi } from '@/lib/api/coupon-client';
import { CouponType, ApplicableCouponVO } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, TicketPercent, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface CouponSelectorProps {
    orderAmount: number;
    selectedCouponId?: number | null;
    onSelect: (coupon: ApplicableCouponVO | null) => void;
    trigger?: React.ReactNode;
}

export function CouponSelector({ orderAmount, selectedCouponId, onSelect, trigger }: CouponSelectorProps) {
    const [open, setOpen] = useState(false);

    const { data: coupons, isLoading, isError } = useQuery({
        queryKey: ['coupons-applicable', orderAmount],
        queryFn: () => couponApi.getApplicableCoupons(orderAmount),
        enabled: open, // Only fetch when dialog opens
    });

    const handleSelect = (coupon: ApplicableCouponVO) => {
        onSelect(coupon);
        setOpen(false);
    };

    const handleClear = () => {
        onSelect(null);
        setOpen(false);
    };

    const usableCoupons = coupons?.filter(c => c.usable) || [];
    const unusableCoupons = coupons?.filter(c => !c.usable) || [];

    // Helper to format discount text
    const getDiscountText = (c: ApplicableCouponVO) => {
        if (c.type === CouponType.CASH) return `$${c.value}`;
        if (c.type === CouponType.DISCOUNT) {
            const off = Math.round((1 - c.value) * 100);
            return `${off}% OFF`;
        }
        if (c.type === CouponType.FREE_SHIPPING) return '免運費';
        return '';
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="w-full justify-between border-dashed">
                        <span className="flex items-center gap-2">
                            <TicketPercent className="size-4" />
                            {selectedCouponId ? '已選擇優惠券' : '選擇優惠券 / 輸入折扣碼'}
                        </span>
                        {selectedCouponId ? <span className="text-zinc-900 font-bold">變更</span> : <span className="text-zinc-400">選擇</span>}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden bg-[#FBFBFB]">
                <DialogHeader className="p-6 pb-2 bg-white border-b border-zinc-100">
                    <DialogTitle className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                        <TicketPercent className="size-5" />
                        選擇優惠券
                    </DialogTitle>
                    <DialogDescription>
                        您有 {usableCoupons.length} 張可用優惠券
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                            <Loader2 className="size-8 animate-spin mb-2" />
                            <span className="text-sm">正在尋找最佳優惠...</span>
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                            <AlertCircle className="size-8 mb-2" />
                            <span className="text-sm">載入失敗，請稍後再試</span>
                        </div>
                    ) : (
                        <ScrollArea className="max-h-[60vh] p-6">
                            <div className="space-y-6">
                                {/* Usable Coupons */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">可用優惠券 ({usableCoupons.length})</h3>
                                    {usableCoupons.length === 0 && (
                                        <div className="text-sm text-zinc-400 p-4 text-center border border-dashed border-zinc-200 rounded-lg">
                                            暫無可用優惠券
                                        </div>
                                    )}
                                    {usableCoupons.map(coupon => (
                                        <div
                                            key={coupon.id}
                                            onClick={() => handleSelect(coupon)}
                                            className={cn(
                                                "relative group flex items-stretch bg-white border rounded-lg cursor-pointer transition-all hover:shadow-md active:scale-[0.99]",
                                                selectedCouponId === coupon.id
                                                    ? "border-zinc-900 ring-1 ring-zinc-900"
                                                    : "border-zinc-200 hover:border-zinc-400"
                                            )}
                                        >
                                            {/* Left: Value */}
                                            <div className="w-24 shrink-0 bg-zinc-50 border-r border-dashed border-zinc-200 flex flex-col items-center justify-center p-2 rounded-l-lg">
                                                <span className="text-lg font-bold font-mono text-zinc-900 tracking-tight">
                                                    {getDiscountText(coupon)}
                                                </span>
                                                <span className="text-[10px] text-zinc-500 font-mono mt-1">
                                                    滿 {coupon.threshold}
                                                </span>
                                            </div>
                                            {/* Right: Info */}
                                            <div className="flex-1 p-3 flex flex-col justify-center">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-zinc-900">{coupon.couponName}</h4>
                                                        <p className="text-[10px] text-zinc-500 mt-0.5">
                                                            有效期至 {format(new Date(coupon.endTime), 'yyyy/MM/dd')}
                                                        </p>
                                                    </div>
                                                    {coupon.estimatedDiscount && coupon.estimatedDiscount > 0 && (
                                                        <div className="text-right">
                                                            <div className="text-xs font-bold text-[#FF4D4F]">
                                                                - ${coupon.estimatedDiscount}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {selectedCouponId === coupon.id && (
                                                <div className="absolute top-2 right-2 text-zinc-900 bg-white rounded-full">
                                                    <CheckCircle2 className="size-4 fill-zinc-900 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Unusable Coupons */}
                                {unusableCoupons.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-zinc-100">
                                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">不可用 ({unusableCoupons.length})</h3>
                                        {unusableCoupons.map(coupon => (
                                            <div
                                                key={coupon.id}
                                                className="flex items-stretch bg-zinc-50 border border-zinc-100 rounded-lg opacity-60 grayscale"
                                            >
                                                <div className="w-24 shrink-0 border-r border-dashed border-zinc-200 flex flex-col items-center justify-center p-2">
                                                    <span className="text-lg font-bold font-mono text-zinc-400">
                                                        {getDiscountText(coupon)}
                                                    </span>
                                                </div>
                                                <div className="flex-1 p-3 flex flex-col justify-center">
                                                    <h4 className="text-sm font-bold text-zinc-500">{coupon.couponName}</h4>
                                                    <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                                                        <XCircle className="size-3" />
                                                        {coupon.reason}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <DialogFooter className="p-4 bg-white border-t border-zinc-100 sm:justify-between items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="text-zinc-500 hover:text-zinc-900 text-xs"
                    >
                        不使用優惠券
                    </Button>
                    <div className="text-xs text-zinc-400">
                        *運費不計入使用門檻
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
