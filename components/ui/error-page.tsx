'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import {
    MoveLeft,
    Armchair,
    LayoutGrid,
    HelpCircle,
    ArrowRight,
    Frown,
    RotateCcw
} from 'lucide-react';

interface ErrorPageProps {
    code: string;
    title: string;
    message: string;
    errorCodeLabel?: string;
    showReset?: boolean;
    onReset?: () => void;
}

export function ErrorPage({
    code,
    title,
    message,
    errorCodeLabel = "Page_Not_Found",
    showReset = false,
    onReset
}: ErrorPageProps) {
    return (
        <div className="flex flex-col min-h-screen bg-[#FBFBFB] relative overflow-hidden selection:bg-zinc-950/10 selection:text-zinc-950">
            {/* Background Decorative Elements */}
            <div className="fixed top-[-10%] left-[5%] w-[900px] h-[900px] bg-zinc-200/30 rounded-full blur-[140px] -z-10 pointer-events-none mix-blend-multiply" />
            <div className="fixed bottom-[-10%] right-[5%] w-[700px] h-[700px] bg-zinc-100/50 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-multiply" />

            <SiteHeader />

            <main className="flex-grow flex flex-col items-center justify-center relative w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-24 gap-20">

                {/* 404 Hero Section - Fixed Width/Visibility Issue */}
                <section className="w-full relative z-10 flex flex-col items-center">
                    {/* WIDE CONTAINER: Changed from 65% to a fixed wide max-width to match original luxury feel */}
                    <div className="w-full max-w-[1100px] mx-auto">
                        <div className="bg-white/70 backdrop-blur-2xl rounded-[32px] p-16 md:p-24 relative overflow-hidden border border-white/60 shadow-glass flex flex-col items-center text-center">

                            {/* Watermark 404 - Restored exactly */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                                <span className="font-mono font-bold text-[280px] lg:text-[450px] leading-none text-zinc-950 opacity-[0.03] tracking-tighter blur-[2px] transform translate-y-8">
                                    {code}
                                </span>
                            </div>

                            {/* Content Block */}
                            <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto space-y-10">
                                <div className="relative mb-4">
                                    <div className="size-[88px] rounded-[24px] bg-gradient-to-br from-white to-gray-50 shadow-soft border border-white/80 flex items-center justify-center">
                                        <Frown className="size-10 text-zinc-950 opacity-80" strokeWidth={1.5} />
                                    </div>
                                    <div className="absolute inset-0 bg-gray-200/40 blur-3xl -z-10 rounded-full scale-150" />
                                </div>

                                <div className="space-y-6">
                                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-950">
                                        {title}
                                    </h1>
                                    <p className="text-zinc-400 font-medium text-lg md:text-xl leading-relaxed max-w-xl mx-auto whitespace-pre-line">
                                        {message}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-5 w-full justify-center pt-6">
                                    {showReset ? (
                                        <button
                                            onClick={onReset}
                                            className="inline-flex items-center justify-center px-10 py-4 bg-zinc-950 hover:bg-zinc-800 text-white text-[15px] font-black tracking-widest uppercase rounded-md transition-all duration-300 shadow-xl shadow-zinc-950/10 active:scale-95"
                                        >
                                            <RotateCcw className="size-4 mr-3" />
                                            重新嘗試
                                        </button>
                                    ) : (
                                        <Link
                                            href="/"
                                            className="inline-flex items-center justify-center px-10 py-4 bg-zinc-950 hover:bg-zinc-800 text-white text-[15px] font-black tracking-widest uppercase rounded-md transition-all duration-300 shadow-xl shadow-zinc-950/10 active:scale-95"
                                        >
                                            <MoveLeft className="size-4 mr-3" />
                                            回到首頁
                                        </Link>
                                    )}
                                    <Link
                                        href="/journal"
                                        className="inline-flex items-center justify-center px-10 py-4 bg-white/60 border border-white/60 hover:bg-white text-zinc-950 text-[15px] font-black tracking-widest uppercase rounded-md transition-all duration-300 shadow-sm active:scale-95"
                                    >
                                        聯絡客服
                                    </Link>
                                </div>
                            </div>

                            {/* Error Code Descriptor */}
                            <div className="absolute bottom-8 left-0 right-0 text-center opacity-30">
                                <div className="flex items-center justify-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-950 font-black">
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-pulse"></span>
                                    <span>Error_Code: {errorCodeLabel}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Suggested Navigation - Wider to match */}
                <section className="w-full max-w-[1100px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SuggestedLink
                            href="/products"
                            icon={Armchair}
                            title="探索新品"
                            description="瀏覽本季最新設計。"
                        />
                        <SuggestedLink
                            href="/products"
                            icon={LayoutGrid}
                            title="系列分類"
                            description="依照空間需求尋找靈感。"
                        />
                        <SuggestedLink
                            href="/journal"
                            icon={HelpCircle}
                            title="協助中心"
                            description="需要協助？隨時為您服務。"
                        />
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}

function SuggestedLink({ href, icon: Icon, title, description }: any) {
    return (
        <Link
            href={href}
            className="group relative flex flex-col rounded-xl bg-white p-8 transition-all duration-300 hover:shadow-xl min-h-[220px] overflow-hidden border border-zinc-100/50"
        >
            <div className="flex items-start justify-between mb-8 z-10">
                <div className="size-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-950 group-hover:bg-zinc-950 group-hover:text-white transition-colors duration-300">
                    <Icon strokeWidth={1.5} className="size-6" />
                </div>
                <ArrowRight className="size-5 text-zinc-200 group-hover:text-zinc-950 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <div className="z-10 mt-auto">
                <h3 className="font-black text-lg text-zinc-950 mb-1 tracking-tight">{title}</h3>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed">{description}</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-50/0 to-zinc-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
    );
}
