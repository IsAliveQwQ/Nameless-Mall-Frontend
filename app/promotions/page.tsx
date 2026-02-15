'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { promotionApi } from '@/lib/api/promotion-client';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PromotionCard, PromotionProps } from '@/features/promotions/components/PromotionCard';
import { format } from 'date-fns';
import { ChevronRight, ArrowLeft } from 'lucide-react';



export default function ActivityCenterPage() {
    // 1. Fetch Real Flash Sale
    const { data: flashSale } = useQuery({
        queryKey: ['flash-sale-current'],
        queryFn: () => promotionApi.getCurrentFlashSaleSession(),
    });

    // 2. Fetch Marketing Campaigns
    const { data: campaigns } = useQuery({
        queryKey: ['marketing-campaigns'],
        queryFn: () => promotionApi.getCampaigns(),
    });

    // 3. Combine Data
    const promotions = React.useMemo(() => {
        const list: PromotionProps[] = [];

        // Add Backend Campaigns
        if (campaigns) {
            campaigns.forEach(campaign => {
                list.push({
                    id: campaign.code, // Use code as ID for navigation
                    title: campaign.title,
                    description: campaign.description,
                    period: campaign.period,
                    code: campaign.code,
                    status: campaign.status,
                    imageUrl: campaign.imageUrl,
                    linkUrl: `/promotions/${campaign.code}`
                });
            });
        }

        // Add Real Flash Sale at the top
        if (flashSale) {
            const now = new Date();
            const startTime = new Date(flashSale.startTime);
            const endTime = new Date(flashSale.endTime);
            let status: 'ONGOING' | 'ENDING_SOON' | 'UPCOMING' | 'ENDED' = 'ONGOING';

            if (now < startTime) {
                status = 'UPCOMING';
            } else if (now > endTime) {
                status = 'ENDED';
            } else {
                // Check if ending within 24 hours
                const hoursRemaining = (endTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                if (hoursRemaining <= 24 && hoursRemaining > 0) {
                    status = 'ENDING_SOON';
                }
            }

            const flashSalePromo: PromotionProps = {
                id: 'flash-sale',
                title: flashSale.name || '限時特賣活動',
                description: 'Nameless Mall 限時特賣火熱進行中！精選商品限量釋出，立即搶購。錯過不再。',
                period: `${format(startTime, 'yyyy.MM.dd')} — ${format(endTime, 'yyyy.MM.dd')}`,
                code: 'FLASH_SALE',
                status: status,
                imageUrl: flashSale.bannerImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYt6r6haO2JQ65I0spJGVj3X6Rw70N4SeVfRaiORx-YAVVoTZuPwWq_52iL2tjXT8xm9nei7PDN8fBRq2d7slkGIUdUIsgXGD7UL6i6DqM0s77C902ryJoxUQ6TrHPUDJ_x-RqClGxSeOru0ENKnuoLkVTAxFxPBLrqHsHIV8g77KUXgcCi76gKgEfWVe-a45w0nRg49OsPcluQJtdBrYY1joyPrgitFRFh8CXpGO4OlBOrqUNaBmgkc9AogGA3XS8jAktCRE2EGs',
                linkUrl: '/promotions/flash-sale'
            };
            list.unshift(flashSalePromo);
        }

        return list;
    }, [flashSale, campaigns]);

    const [activeTab, setActiveTab] = React.useState<'ALL' | 'ONGOING' | 'ENDED'>('ALL');

    const filteredPromotions = React.useMemo(() => {
        if (activeTab === 'ALL') return promotions;
        if (activeTab === 'ONGOING') {
            return promotions.filter(p => ['ONGOING', 'ENDING_SOON', 'UPCOMING'].includes(p.status));
        }
        if (activeTab === 'ENDED') {
            return promotions.filter(p => p.status === 'ENDED');
        }
        return promotions;
    }, [promotions, activeTab]);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <SiteHeader />

            <main className="flex-1 bg-[#FBFBFB] relative">
                {/* Visual Texture Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3%3C/filter%3%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3%3C/svg%3")`,
                    }}
                />

                <div className="container max-w-[1200px] mx-auto px-6 md:px-8 py-20 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-20"
                    >
                        {/* 1. Back to Home Navigation */}
                        <nav className="flex items-center gap-2 mb-10 text-[13px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                            <Link href="/" className="hover:text-zinc-900 transition-colors flex items-center gap-2 group">
                                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                                Back to Home
                            </Link>
                        </nav>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-px bg-zinc-900" />
                            <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-[0.4em]">Activity Hub</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-zinc-900 mb-6">活動中心</h1>
                        <p className="text-lg text-zinc-500 max-w-2xl font-light leading-relaxed">
                            探索 Nameless Mall 最新的限定優惠、空間展覽與設計師聯名系列。
                            精選全球居家設計，為您的生活空間注入獨特品味。
                        </p>
                    </motion.div>

                    <nav className="flex items-center gap-8 border-b border-zinc-100 mb-0 overflow-x-auto scrollbar-hide">
                        {[
                            { id: 'ALL', label: '全部活動' },
                            { id: 'ONGOING', label: '進行中' },
                            { id: 'ENDED', label: '往期回顧' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`py-6 text-[16px] font-bold uppercase tracking-[0.1em] border-b-2 transition-all duration-300 relative ${activeTab === tab.id
                                    ? 'border-zinc-900 text-zinc-900'
                                    : 'border-transparent text-zinc-500 hover:text-zinc-700'
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabUnderline"
                                        className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-zinc-900"
                                    />
                                )}
                            </button>
                        ))}
                    </nav>

                    <section className="flex flex-col space-y-4">
                        {filteredPromotions.map((promo, index) => (
                            <motion.div
                                key={promo.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <PromotionCard {...promo} />
                            </motion.div>
                        ))}
                        {filteredPromotions.length === 0 && (
                            <div className="py-32 text-center">
                                <span className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-widest">No activities found in this section.</span>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
