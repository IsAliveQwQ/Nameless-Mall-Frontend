'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { couponApi } from '@/lib/api/coupon-client';
import { CouponCard } from '@/features/coupons/components/CouponCard';
import { CouponCardVO, CouponType } from '@/features/coupons/types';
import { Ticket } from 'lucide-react';
import { toast } from 'sonner';

export default function MyCouponsPage() {
    const [activeTab, setActiveTab] = useState<'available' | 'used' | 'expired'>('available');
    const [redeemCode, setRedeemCode] = useState('');

    const { data: couponsPage, isLoading } = useQuery({
        queryKey: ['coupons-my'],
        queryFn: () => couponApi.getMyCoupons(1, 100), // Get enough for client filtering
    });

    const handleRedeem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!redeemCode.trim()) return;
        toast.info('優惠券代碼功能開發中');
        setRedeemCode('');
    };

    // Transform and Filter Logic
    const filteredCoupons = React.useMemo(() => {
        if (!couponsPage?.records) return [];

        const now = new Date();

        return couponsPage.records
            .map(userCoupon => {
                // Convert UserCouponDTO to CouponCardVO
                // [Fix] 優先使用後端回傳的 expireTime (對應 DTO 定義)，若無則 fallback 到 endTime 或 validEndTime
                const endTimeStr = userCoupon.expireTime || userCoupon.validEndTime || '';
                const endTime = endTimeStr ? new Date(endTimeStr) : new Date(now.getFullYear() + 1, 0, 1); // Default to next year if missing
                const isExpired = endTime < now;

                // Determine display status
                let statusText = '立即使用';
                let isClaimable = false; // "My Coupons" are already claimed

                if (userCoupon.status === 1) statusText = '已使用';
                else if (isExpired) statusText = '已過期';

                // Format Validity Period
                // [Fix] 使用 createdAt 作為開始時間
                const startDateStr = userCoupon.createdAt || userCoupon.validStartTime || '';
                const startDate = startDateStr ? new Date(startDateStr) : now;
                const period = `${startDate.toLocaleDateString()} - ${endTime.toLocaleDateString()}`;

                return {
                    id: userCoupon.id,
                    templateId: userCoupon.templateId,
                    name: userCoupon.couponName,
                    description: `滿 $${userCoupon.threshold} 可折抵`, // Generic description
                    amountDisplay: userCoupon.type === CouponType.DISCOUNT && userCoupon.discount < 1
                        ? `${userCoupon.discount * 10}折`
                        : `$${userCoupon.discount}`,
                    thresholdDisplay: `滿 $${userCoupon.threshold}`,
                    statusText,
                    isClaimable,
                    progress: 100, // Not relevant for My Coupons
                    validityPeriod: period,
                    endTime: endTime.toISOString(),
                    // Internal flags for filtering
                    _status: userCoupon.status,
                    _isExpired: isExpired,
                } as CouponCardVO & { _status: number, _isExpired: boolean };
            })
            .filter(c => {
                if (activeTab === 'available') return c._status === 0 && !c._isExpired;
                if (activeTab === 'used') return c._status === 1;
                if (activeTab === 'expired') return c._status === 0 && c._isExpired;
                return true;
            });
    }, [couponsPage, activeTab]);

    return (
        <div className="flex flex-col w-full">
            <div className="flex items-end justify-between border-b border-zinc-200 mb-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                        <Ticket className="size-5 text-zinc-400" />
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">我的優惠券</h1>
                    </div>
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] px-1">Claimable Rewards & Benefits</p>
                </div>
            </div>

            {/* Redeem Section */}
            <div className="bg-white p-6 rounded-lg border border-[#E4E4E7] shadow-sm mb-8">
                <h3 className="text-sm font-bold text-[#18181B] mb-4">新增優惠券</h3>
                <form onSubmit={handleRedeem} className="flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
                        <input
                            type="text"
                            value={redeemCode}
                            onChange={(e) => setRedeemCode(e.target.value)}
                            placeholder="輸入優惠代碼 (Redeem Code)"
                            className="w-full bg-[#F4F4F5] border-transparent focus:border-[#18181B] focus:ring-0 rounded-md py-2 pl-10 pr-4 text-sm font-mono placeholder:text-[#A1A1AA]"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-[#18181B] text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-[#27272a] transition-colors"
                    >
                        兌換
                    </button>
                </form>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 border-b border-[#E4E4E7] mb-6">
                {[
                    { id: 'available', label: '可使用' },
                    { id: 'used', label: '已使用' },
                    { id: 'expired', label: '已失效' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            pb-4 text-sm font-medium transition-colors relative
                            ${activeTab === tab.id
                                ? 'text-[#18181B]'
                                : 'text-[#71717A] hover:text-[#18181B]'}
                        `}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#18181B]" />
                        )}
                    </button>
                ))}
            </div>

            {/* List */}
            {isLoading ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                        <div key={i} className="h-40 bg-zinc-100 animate-pulse rounded-lg" />
                    ))}
                </div>
            ) : filteredCoupons.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredCoupons.map((coupon) => (
                        <CouponCard
                            key={coupon.id}
                            coupon={coupon}
                            isMyCoupon={true}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed border-[#E4E4E7]">
                    <div className="size-12 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                        <Ticket className="size-6 text-zinc-300" />
                    </div>
                    <p className="text-zinc-500 text-sm">
                        此分類下尚無優惠券
                    </p>
                </div>
            )}
        </div>
    );
}
