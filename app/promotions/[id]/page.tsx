'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { promotionApi } from '@/lib/api/promotion-client';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { PromotionHero, PromotionHeader } from '@/features/promotions/components/PromotionDetailComponents';
import { FlashSaleProductGrid } from '@/features/promotions/components/FlashSaleProductGrid';
import { ProductGrid } from '@/features/products/components/product-grid';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

export default function PromotionDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;

    // 1. Fetch Real Flash Sale (if id is flash-sale)
    const { data: flashSale, isLoading: isFlashSaleLoading } = useQuery({
        queryKey: ['flash-sale-current'],
        queryFn: () => promotionApi.getCurrentFlashSaleSession(),
        enabled: id === 'flash-sale',
    });

    // 2. Fetch Campaign Detail (if not flash-sale)
    const { data: campaign, isLoading: isCampaignLoading } = useQuery({
        queryKey: ['marketing-campaign', id],
        queryFn: () => promotionApi.getCampaignByCode(id),
        enabled: id !== 'flash-sale',
    });

    const isFlashSale = id === 'flash-sale';

    if (isFlashSale && !flashSale && !isFlashSaleLoading) {
        notFound();
    }

    if (!isFlashSale && !campaign && !isCampaignLoading) {
        notFound();
    }

    if ((isFlashSale && isFlashSaleLoading) || (!isFlashSale && isCampaignLoading)) {
        return (
            <div className="min-h-screen bg-[#FBFBFB] flex flex-col">
                <SiteHeader />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse text-zinc-400 font-mono tracking-widest uppercase">Loading Activity...</div>
                </div>
                <SiteFooter />
            </div>
        );
    }

    // Prepare Data
    let hero = { imageUrl: '', title: '' };
    let header: { title: string; period: string; description: string; code: string; endTime?: string } = { title: '', period: '', description: '', code: '' };
    let products = null;

    if (isFlashSale && flashSale) {
        hero = {
            imageUrl: flashSale.bannerImage || 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=2000',
            title: flashSale.name
        };
        header = {
            title: flashSale.name,
            period: `${format(new Date(flashSale.startTime), 'yyyy.MM.dd')} — ${format(new Date(flashSale.endTime), 'yyyy.MM.dd')}`,
            description: `Nameless Mall 限時特賣火熱進行中！精選商品限量釋出，立即搶購。錯過不再。此場次包含 ${flashSale.products.length} 件精選商品。`,
            code: 'FLASH_SALE',
            endTime: flashSale.endTime
        };
        products = <FlashSaleProductGrid products={flashSale.products} />;
    } else if (campaign) {
        hero = { imageUrl: campaign.imageUrl, title: campaign.title };
        header = {
            title: campaign.title,
            period: campaign.period,
            description: campaign.description,
            code: campaign.code
        };

        // Remove hardcoded category map. Use backend data only.
        const targetCategoryId = campaign.categoryId;
        const discountRate = campaign.discountRate || 1.0;

        products = (
            <div className="space-y-16">
                <ProductGrid
                    categoryId={targetCategoryId && targetCategoryId > 0 ? targetCategoryId : undefined}
                    limit={15}
                    className="grid-cols-2 lg:grid-cols-4 gap-px bg-border/40"
                    customDiscountRate={discountRate < 1 ? discountRate : undefined}
                />
                <div className="flex justify-center border-t border-zinc-100 pt-12">
                    <Link
                        href={`/products?category=${targetCategoryId}`}
                        className="group flex items-center gap-3 text-sm font-bold text-zinc-900 uppercase tracking-[0.2em] px-8 py-4 border border-zinc-200 rounded-full hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all duration-300"
                    >
                        Explore More ({campaign.title})
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <SiteHeader />

            <main className="flex-1 bg-[#FBFBFB] w-full relative">
                {/* Visual Texture Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3%3C/filter%3%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3%3C/svg%3")`,
                    }}
                />

                <PromotionHero imageUrl={hero.imageUrl} title={hero.title} />
                <PromotionHeader {...header} />

                <section className="w-[90%] md:w-[75%] max-w-[1200px] mx-auto mb-32">
                    <div className="flex flex-col mb-16 px-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="size-1.5 rounded-full bg-zinc-900" />
                            <span className="text-[11px] font-mono font-bold tracking-[0.3em] text-zinc-400 uppercase">Curated Collection</span>
                        </div>
                        <div className="h-px w-full bg-zinc-100 relative">
                            <div className="absolute left-0 top-0 h-px w-20 bg-zinc-900" />
                        </div>
                    </div>
                    {products}
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
