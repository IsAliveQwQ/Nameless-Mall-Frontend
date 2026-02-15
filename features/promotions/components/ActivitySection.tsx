import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { promotionApi } from '@/lib/api/promotion-client';
import { Skeleton } from '@/components/ui/skeleton';

export const ActivitySection: React.FC = () => {
    // [Engineering Discipline] 資料源後端化 v1.2
    const { data: campaigns, isLoading } = useQuery({
        queryKey: ['campaigns'],
        queryFn: () => promotionApi.getCampaigns(),
    });

    if (isLoading) {
        return (
            <section className="w-full bg-[#FBFBFB] py-16 border-b border-[#E4E4E7]">
                <div className="w-full md:w-[85%] max-w-[1440px] mx-auto px-6 md:px-0">
                    <div className="mb-10 space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Skeleton className="aspect-[16/9] w-full rounded-card" />
                        <Skeleton className="aspect-[16/9] w-full rounded-card" />
                    </div>
                </div>
            </section>
        );
    }

    // 當沒有活動時，隱藏區塊 (Graceful Degradation)
    if (!campaigns || campaigns.length === 0) return null;

    return (
        <section className="w-full bg-[#FBFBFB] py-16 border-b border-[#E4E4E7]">
            <div className="w-full md:w-[85%] max-w-[1440px] mx-auto px-6 md:px-0">
                <div className="mb-10">
                    <h2 className="text-2xl font-bold tracking-tight text-[#18181B] font-display mb-2">
                        精選活動
                    </h2>
                    <p className="text-sm text-[#71717A] max-w-2xl">
                        探索 Nameless Mall 的限定企劃、設計師聯名與季節性主題。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {campaigns.slice(0, 2).map((campaign) => (
                        <Link key={campaign.id} href={`/promotions/${campaign.code}`} className="group block">
                            <div className="relative aspect-[16/9] overflow-hidden rounded-card border border-[#E4E4E7] mb-4">
                                <Image
                                    src={campaign.imageUrl || 'https://placehold.co/800x450?text=Campaign'}
                                    alt={campaign.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-[2px] border border-white/20">
                                    <span className="text-[10px] font-mono text-[#18181B] tracking-widest uppercase">
                                        {campaign.type || 'EVENT'}
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-[#18181B] mb-2 group-hover:text-[#71717A] transition-colors">
                                {campaign.title}
                            </h3>
                            <p className="text-sm text-[#71717A] line-clamp-2">
                                {campaign.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};
