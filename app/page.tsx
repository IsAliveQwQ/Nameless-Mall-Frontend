'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { ProductGrid } from '@/features/products/components/product-grid';
import { FeaturedCategories } from '@/features/products/components/featured-categories';
import { FeaturedBanner } from '@/features/promotions/components/FeaturedBanner';

export default function Home() {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-background">

            <SiteHeader />

            <main className="flex-1">
                <div className="container py-10 space-y-24">

                    {/* 1. Hero Section */}
                    <section className="relative overflow-hidden rounded-[2rem] bg-secondary/10">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-gradient-to-br from-blue-100/30 to-purple-100/30 blur-[100px] rounded-full" />
                            <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] bg-gradient-to-tl from-orange-100/30 to-rose-100/30 blur-[100px] rounded-full" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] lg:min-h-[650px]">
                            <div className="flex flex-col justify-center px-10 py-16 lg:px-20 lg:py-0 space-y-8 order-2 lg:order-1">
                                <motion.div
                                    initial={mounted ? { opacity: 0, y: 20 } : false}
                                    animate={mounted ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="space-y-6"
                                >
                                    <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Spring Collection 2026
                                    </div>
                                    <h1 className="font-serif text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-foreground">
                                        現代生活的<br />
                                        <span className="text-muted-foreground font-light italic">精選指南</span>
                                    </h1>
                                    <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                                        發掘一系列為您的居家與生活方式量身打造的設計選物。<br className="hidden lg:block" />
                                        重質不重量，始終如一的品味堅持。
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={mounted ? { opacity: 0 } : false}
                                    animate={mounted ? { opacity: 1 } : { opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                    className="flex items-center gap-4 pt-2"
                                >
                                    <Button size="lg" className="h-14 rounded-full px-10 text-base" asChild>
                                        <Link href="/products">立即選購</Link>
                                    </Button>
                                    <Button variant="outline" size="lg" className="h-14 rounded-full px-10 text-base border-2 hover:bg-secondary/50" asChild>
                                        <Link href="/about">了解更多</Link>
                                    </Button>
                                </motion.div>
                            </div>

                            <div className="relative h-[400px] lg:h-auto bg-gray-100 order-1 lg:order-2 overflow-hidden">
                                <motion.div
                                    initial={mounted ? { scale: 1.1, opacity: 0 } : false}
                                    animate={mounted ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcIdY-OK2XUCcqFPVXg04ktQuWZUtdw0bvgRTwiPVVy4w3REOUoKOyeIT6mR_uGtLaVXX7OZAhxi0mR_5TMXaUhCRX8ARP1pIxoh4zQccJ9KUf319uWv_8ca6kDnvR-yX60guzMusSH3MuwJYfbYnKUtqfpvYJHtryS9cbcnN9PIytKmpRO8zHH8XoeNWckgDEpHObK67uZTjvsT0ZgU4kttRe98eOvPW3S4m0ULwN7_MkiblVnphQ1OzRFiui3f5pxztre04ieN0"
                                        alt="Modern Living Interior"
                                        fill
                                        priority
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent lg:bg-gradient-to-l" />
                                </motion.div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="container py-10 space-y-24">
                    <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 auto-rows-min overflow-hidden mt-24">

                        {/* 精選分類 Title Area */}
                        <div className="col-span-1 md:col-span-12 bg-background py-8 md:py-10 px-4 md:px-0 flex items-end justify-between border-t border-border/40">
                            <h2 className="text-[25px] font-bold tracking-tight">精選分類</h2>
                            <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors group">
                                查看全部 <span className="transition-transform group-hover:translate-x-1">→</span>
                            </Link>
                        </div>

                        {/* 精選分類 Grid Items - Dynamic */}
                        <div className="col-span-1 md:col-span-12 bg-background">
                            <FeaturedCategories />
                        </div>

                    </div>
                </div>

                {/* Middle Banner - Full Width */}
                <div className="w-full border-y border-border/40">
                    <FeaturedBanner />
                </div>

                <div className="container py-10 space-y-24">
                    <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 auto-rows-min overflow-hidden">

                        {/* 最新上架 Title Area */}
                        <div className="col-span-1 md:col-span-12 bg-background py-8 md:py-10 px-4 md:px-0 flex items-center justify-between border-t border-border/40">
                            <div className="flex items-center gap-4">
                                <h2 className="text-[25px] font-bold tracking-tight">最新上架</h2>
                                <span className="bg-secondary text-foreground text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-border/50 uppercase tracking-wider">4 New</span>
                            </div>
                        </div>

                        {/* 最新上架 Product Grid */}
                        <div className="col-span-1 md:col-span-12 bg-background border-t border-border/40">
                            <ProductGrid
                                limit={4}
                                className="grid grid-cols-1 md:grid-cols-4 gap-px bg-border/40"
                            />
                        </div>
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
