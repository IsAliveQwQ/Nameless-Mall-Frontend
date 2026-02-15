'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { promotionApi } from '@/lib/api/promotion-client';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function FeaturedBanner() {
    // 1. 取得當前秒殺活動
    const { data: flashSale, isLoading: isFlashLoading } = useQuery({
        queryKey: ['flash-sale-current'],
        queryFn: () => promotionApi.getCurrentFlashSaleSession(),
    });

    // 2. 取得最新行銷活動 (作為備案)
    const { data: campaigns, isLoading: isCampaignLoading } = useQuery({
        queryKey: ['campaigns-list'],
        queryFn: () => promotionApi.getCampaigns(),
        enabled: !flashSale, // 只有當沒有秒殺活動時才需要 fetch
    });

    // loading state
    if (isFlashLoading) {
        return <div className="w-full h-[240px] bg-zinc-100 animate-pulse" />;
    }

    // 決策邏輯：有秒殺 -> 秒殺；無秒殺 -> 最新活動；都無 -> 預設
    // 但此處為了 Demo "2026 數位生活節"，我們先硬編碼視覺，邏輯上連結到活動

    let targetLink = '/products'; // 預設
    let statusText = 'EXPLORE NOW';

    if (flashSale) {
        targetLink = '/promotions/flash-sale'; // 假設路由
        statusText = 'FLASH SALE LIVE';
    } else if (campaigns && campaigns.length > 0) {
        // 找一個最新的 active campaign
        const activeCampaign = campaigns.find(c => c.status === 'ONGOING') || campaigns[0];
        targetLink = `/promotions/${activeCampaign.id}`; // 假設路由
        statusText = 'LIMITED OFFER';
    }

    return (
        <section className="w-full">
            <Link
                href={targetLink}
                className="group relative block w-full h-[280px] overflow-hidden bg-[#F4F4F5] hover:bg-[#E4E4E7] transition-colors duration-500"
            >
                {/* 裝飾性網格背景 (模擬 Industrial 風格) */}
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: 'linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(90deg, #E5E7EB 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        opacity: 0.3
                    }}
                />

                <div className="relative h-full container flex flex-col justify-center px-8 md:px-12">
                    {/* 頂部標籤 */}
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase">
                            {statusText}
                        </span>
                    </div>

                    {/* 主標題 */}
                    <div className="max-w-4xl z-10">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900 group-hover:translate-x-2 transition-transform duration-500 ease-out">
                            2026 DIGITAL<br />
                            <span className="text-zinc-400 group-hover:text-zinc-500 transition-colors">LIFESTYLE FESTIVAL</span>
                        </h2>
                    </div>

                    {/* 右下角 View Project 風格按鈕 */}
                    <div className="absolute bottom-10 right-10 md:right-20 flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-zinc-900">
                        <span className="group-hover:mr-2 transition-all duration-300">Enter Festival</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </Link>
        </section>
    );
}
