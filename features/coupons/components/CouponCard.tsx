import React, { useState } from 'react';
import { CouponCardVO } from '../types';
import { couponApi } from '@/lib/api/coupon-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CouponCardProps {
    coupon: CouponCardVO;
    isMyCoupon?: boolean; // True if displaying in "My Coupons" list
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, isMyCoupon }) => {
    const queryClient = useQueryClient();

    // 領取優惠券 Mutation
    const claimMutation = useMutation({
        mutationFn: () => couponApi.claimCoupon(coupon.templateId),
        onSuccess: () => {
            toast.success('優惠券領取成功！');
            // 刷新列表
            queryClient.invalidateQueries({ queryKey: ['coupons-available'] });
            queryClient.invalidateQueries({ queryKey: ['coupons-my'] });
        },
        onError: (error: any) => {
            toast.error(error.message || '領取失敗');
        }
    });

    const isClaimed = coupon.statusText === '已領取' || coupon.statusText === '已搶光';
    const isExpired = !coupon.isClaimable && isMyCoupon; // 簡化邏輯，實際應看 status

    return (
        <div className={`
            group relative flex flex-col md:flex-row items-stretch 
            bg-white border border-[#E4E4E7] rounded-card overflow-hidden 
            transition-all duration-300 hover:border-[#18181B] hover:shadow-sm
            ${isClaimed || isExpired ? 'opacity-60 grayscale' : ''}
        `}>
            {/* Left: Amount/Discount */}
            <div className={`
                w-full md:w-[140px] shrink-0 flex flex-col items-center justify-center p-6 
                bg-[#FBFBFB] border-b md:border-b-0 md:border-r border-[#E4E4E7]
                ${isClaimed ? 'bg-[#F4F4F5]' : ''}
            `}>
                <div className="text-2xl font-bold text-[#18181B] font-mono tracking-tight text-center">
                    {coupon.amountDisplay}
                </div>
                <div className="text-[10px] text-[#71717A] mt-2 font-noto text-center leading-tight">
                    {coupon.thresholdDisplay}
                </div>
            </div>

            {/* Middle: Info */}
            <div className="flex-grow p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`
                        text-[10px] font-mono font-medium tracking-wider px-2 py-0.5 rounded-[2px] uppercase
                        ${isClaimed
                            ? 'bg-[#F4F4F5] text-[#A1A1AA]'
                            : 'bg-[#18181B] text-white'}
                    `}>
                        COUPON
                    </span>
                    {coupon.validityPeriod && (
                        <span className="text-[10px] font-mono text-[#71717A]">
                            {coupon.validityPeriod}
                        </span>
                    )}
                </div>

                <h3 className="text-base font-bold text-[#18181B] font-noto mb-1 group-hover:text-[#71717A] transition-colors">
                    {coupon.name}
                </h3>
                <p className="text-sm text-[#71717A] font-noto line-clamp-2">
                    {coupon.description}
                </p>

                {/* Progress Bar for Limited Coupons */}
                {!isMyCoupon && coupon.progress !== undefined && coupon.progress < 100 && (
                    <div className="mt-4 w-full max-w-[200px]">
                        <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-[#A1A1AA] font-mono">REMAINING</span>
                            <span className="text-[#18181B] font-mono">{100 - coupon.progress}%</span>
                        </div>
                        <div className="h-1 bg-[#F4F4F5] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#18181B]"
                                style={{ width: `${100 - coupon.progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Action */}
            <div className="w-full md:w-[160px] shrink-0 p-6 flex items-center justify-center md:border-l border-[#E4E4E7]">
                {!isMyCoupon ? (
                    <button
                        onClick={() => claimMutation.mutate()}
                        disabled={!coupon.isClaimable || claimMutation.isPending}
                        className={`
                            w-full py-3 px-4 rounded-[4px] text-sm font-bold font-noto tracking-wide transition-all
                            ${!coupon.isClaimable
                                ? 'bg-[#F4F4F5] text-[#A1A1AA] cursor-not-allowed'
                                : 'bg-[#18181B] text-white hover:bg-[#27272a] shadow-sm'}
                        `}
                    >
                        {claimMutation.isPending ? '處理中...' : coupon.statusText}
                    </button>
                ) : (
                    <div className="text-center">
                        <span className={`
                            text-sm font-bold block mb-1
                            ${isExpired ? 'text-[#A1A1AA]' : 'text-[#4DA17B]'}
                        `}>
                            {coupon.statusText}
                        </span>
                        <Link
                            href="/products"
                            className="text-[10px] text-[#71717A] hover:text-[#18181B] underline underline-offset-2 font-mono"
                        >
                            USE NOW →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

// Next.js Link import fix
import Link from 'next/link';
