import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { promotionApi } from '@/lib/api/promotion-client';
import { FlashSaleSessionVO } from '../types';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceStrict } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export const FlashSaleSection: React.FC = () => {
    const { data: session, isLoading } = useQuery({
        queryKey: ['flash-sale-current'],
        queryFn: () => promotionApi.getCurrentFlashSaleSession(),
        staleTime: 30 * 1000, // 30 秒內不重複請求，倒數由前端本地 useEffect 計算
    });

    // 倒數計時邏輯
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        if (!session) return;

        const calculateTimeLeft = () => {
            const now = new Date();
            const end = new Date(session.endTime);
            const start = new Date(session.startTime);

            if (now < start) {
                return `距離開始還有 ${formatDistanceStrict(start, now, { locale: zhTW })}`;
            } else if (now < end) {
                const diff = end.getTime() - now.getTime();
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else {
                return '活動已結束';
            }
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, [session]);

    if (isLoading || !session) return null;

    return (
        <section className="w-full bg-white border-y border-[#E4E4E7] py-16">
            <div className="w-full md:w-[85%] max-w-[1440px] mx-auto px-6 md:px-0">
                <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="shrink-0 size-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[11px] font-mono text-red-500 font-bold tracking-widest uppercase">
                                FLASH SALE
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-[#18181B] font-display">
                            {session.name}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4 bg-[#18181B] text-white px-6 py-3 rounded-card">
                        <span className="text-sm font-medium tracking-wide font-noto">
                            {session.statusText}
                        </span>
                        <div className="h-4 w-px bg-white/20" />
                        <span className="font-mono text-lg font-bold tracking-widest tabular-nums">
                            {timeLeft}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {session.products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/product/${product.productId}`}
                            className="group block"
                        >
                            <div className="relative aspect-[3/4] overflow-hidden rounded-card border border-[#E4E4E7] bg-white mb-4">
                                <Image
                                    src={product.imageUrl || product.image || '/placeholder.png'}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {product.stockStatus === '售罄' && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="text-white font-bold tracking-widest border-2 border-white px-4 py-2">
                                            SOLD OUT
                                        </span>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-[2px]">
                                    {product.discountLabel || product.discountRateDisplay || 'SALE'}
                                </div>
                            </div>

                            <h3 className="text-sm text-[#18181B] font-medium mb-1 truncate group-hover:text-[#71717A] transition-colors">
                                {product.name}
                            </h3>

                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-base font-bold text-red-600 font-mono">
                                    ${(product.flashPrice || product.flashSalePrice || 0).toLocaleString()}
                                </span>
                                <span className="text-xs text-[#A1A1AA] line-through font-mono">
                                    ${product.originalPrice.toLocaleString()}
                                </span>
                            </div>

                            <div className="w-full h-1.5 bg-[#F4F4F5] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-500 transition-all duration-1000"
                                    style={{ width: `${Math.min(product.soldPercentage || 0, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-[10px] text-[#71717A] font-mono">
                                    {product.soldPercentage ? `已搶 ${product.soldPercentage}%` : '熱銷中'}
                                </span>
                                <span className="text-[10px] text-red-500 font-bold font-mono">
                                    {product.stockStatus || product.stockStatusText}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};
