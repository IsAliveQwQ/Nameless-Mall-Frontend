'use client';

import * as React from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { motion } from 'framer-motion';

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#FBFBFB]">
            <SiteHeader />

            <main className="flex-grow pt-24 pb-16">
                {/* Hero Section */}
                <section className="container mx-auto px-6 mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto text-center space-y-8"
                    >
                        <h1 className="text-4xl md:text-5xl font-sans font-light tracking-tight text-zinc-950 leading-tight">
                            We curate <span className="font-serif italic text-zinc-500">timeless</span> designs <br />
                            for modern living.
                        </h1>
                        <p className="text-lg text-zinc-600 leading-relaxed font-light max-w-2xl mx-auto">
                            Nameless Mall 是一個致力於極簡美學與實用主義的選物平台。我們相信好的設計不應被繁複的裝飾掩蓋，而是透過材質與形態的純粹對話，融入您的日常生活。
                        </p>
                    </motion.div>
                </section>

                {/* Values Grid */}
                <section className="container mx-auto px-6 mb-24">
                    <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="space-y-4 text-center"
                        >
                            <div className="size-16 mx-auto bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                                <span className="font-serif text-2xl italic text-zinc-400">01</span>
                            </div>
                            <h3 className="text-lg font-bold tracking-wide uppercase">Curation</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                嚴選全球獨立設計師品牌，確保每一件單品都能經得起時間的考驗。
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="space-y-4 text-center"
                        >
                            <div className="size-16 mx-auto bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                                <span className="font-serif text-2xl italic text-zinc-400">02</span>
                            </div>
                            <h3 className="text-lg font-bold tracking-wide uppercase">Quality</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                堅持工藝與材質的真實性，拒絕快速時尚的浪費與妥協。
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="space-y-4 text-center"
                        >
                            <div className="size-16 mx-auto bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                                <span className="font-serif text-2xl italic text-zinc-400">03</span>
                            </div>
                            <h3 className="text-lg font-bold tracking-wide uppercase">Service</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                提供專業的諮詢與完善的售後支持，讓您的購物體驗如設計般流暢。
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Team Section (Placeholder Image) */}
                <section className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative rounded-lg overflow-hidden h-[400px] w-full max-w-5xl mx-auto bg-zinc-100"
                    >
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-80" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <h2 className="text-white text-3xl font-light tracking-widest uppercase border-b border-whitepb-2">
                                Our Studio
                            </h2>
                        </div>
                    </motion.div>
                </section>

            </main>

            <SiteFooter />
        </div>
    );
}
