'use client';

import * as React from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { motion } from 'framer-motion';
import { Truck, Store, MapPin } from 'lucide-react';

export default function ShippingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#FBFBFB]">
            <SiteHeader />
            <main className="flex-grow pt-32 pb-20">
                {/* Hero */}
                <section className="container mx-auto px-6 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto text-center space-y-4"
                    >
                        <h1 className="text-3xl md:text-5xl font-sans font-light tracking-tight text-zinc-950">
                            Shipping & Delivery
                        </h1>
                        <p className="text-zinc-500 font-light tracking-wide text-sm md:text-base">配送方式與運費說明</p>
                    </motion.div>
                </section>

                {/* Content Grid */}
                <section className="container mx-auto px-6 max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        {/* Home Delivery */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white p-8 rounded-xl border border-zinc-200/60 shadow-sm space-y-6 flex flex-col justify-between"
                        >
                            <div>
                                <div className="size-12 rounded-full bg-zinc-50 flex items-center justify-center mb-6">
                                    <Truck className="size-6 text-zinc-900" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 mb-2 tracking-tight">宅配到府 Home Delivery</h3>
                                <p className="text-zinc-600 text-sm leading-relaxed mb-4">
                                    由黑貓宅急便配送，安全送達您指定的地址。適合大型包裹或不便前往超商取貨的您。
                                </p>
                            </div>
                            <ul className="space-y-3 text-sm text-zinc-600 font-medium pt-4 border-t border-zinc-50">
                                <li className="flex justify-between items-center">
                                    <span className="text-zinc-400 font-normal">運費</span>
                                    <span className="font-mono text-zinc-900 text-lg">NT$ 100</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="text-zinc-400 font-normal">預計時效</span>
                                    <span className="font-mono text-zinc-900">2 - 3 工作日</span>
                                </li>
                            </ul>
                        </motion.div>

                        {/* CVS Pickup */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white p-8 rounded-xl border border-zinc-200/60 shadow-sm space-y-6 flex flex-col justify-between"
                        >
                            <div>
                                <div className="size-12 rounded-full bg-zinc-50 flex items-center justify-center mb-6">
                                    <Store className="size-6 text-zinc-900" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 mb-2 tracking-tight">超商取貨 CVS Pickup</h3>
                                <p className="text-zinc-600 text-sm leading-relaxed mb-4">
                                    支援 7-11 與全家便利商店取貨。24小時皆可取件，保有隱私且彈性。
                                </p>
                            </div>
                            <ul className="space-y-3 text-sm text-zinc-600 font-medium pt-4 border-t border-zinc-50">
                                <li className="flex justify-between items-center">
                                    <span className="text-zinc-400 font-normal">運費</span>
                                    <span className="font-mono text-zinc-900 text-lg">NT$ 60</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="text-zinc-400 font-normal">預計時效</span>
                                    <span className="font-mono text-zinc-900">3 - 5 工作日</span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>

                    {/* Notice */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-zinc-50 rounded-lg p-6 border border-zinc-100 flex gap-4 items-start"
                    >
                        <MapPin className="size-5 text-zinc-400 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                            <h4 className="font-bold text-sm text-zinc-900">配送範圍說明</h4>
                            <p className="text-sm text-zinc-700 leading-relaxed">
                                目前僅提供台灣本島配送服務。若您的收件地址位於離島（澎湖、金門、馬祖、綠島等），系統將可能無法完成下單。
                            </p>
                        </div>
                    </motion.div>
                </section>
            </main>
            <SiteFooter />
        </div>
    );
}
