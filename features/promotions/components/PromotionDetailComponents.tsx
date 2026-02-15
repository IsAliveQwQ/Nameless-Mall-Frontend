import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PromotionHeroProps {
    imageUrl: string;
    title: string;
}

export const PromotionHero: React.FC<PromotionHeroProps> = ({ imageUrl, title }) => {
    return (
        <section className="w-full pt-20 pb-10 bg-background">
            <div className="container max-w-[1200px] mx-auto px-4 md:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl bg-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)] group"
                >
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-[3000ms] group-hover:scale-105"
                        priority
                    />
                    {/* Subtle Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
                </motion.div>
            </div>
        </section>
    );
};

import { ChevronRight, Clock, Share2, Tag } from 'lucide-react';
import Link from 'next/link';

interface PromotionHeaderProps {
    title: string;
    period: string;
    description: string;
    code?: string;
    endTime?: string;
}

const CountdownTimer: React.FC<{ endTime: string }> = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = React.useState({
        days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false
    });

    React.useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = new Date(endTime).getTime() - now;

            if (distance < 0) {
                setTimeLeft(prev => ({ ...prev, isExpired: true }));
                clearInterval(timer);
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
                isExpired: false
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    if (timeLeft.isExpired) return null;

    return (
        <div className="flex gap-2.5">
            {[
                { label: 'D', value: timeLeft.days },
                { label: 'H', value: timeLeft.hours },
                { label: 'M', value: timeLeft.minutes },
                { label: 'S', value: timeLeft.seconds }
            ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                    <div className="w-11 h-11 rounded-xl bg-white border border-zinc-100 flex items-center justify-center shadow-sm">
                        <span className="font-mono text-[15px] font-bold text-zinc-900">
                            {String(item.value).padStart(2, '0')}
                        </span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 mt-2 uppercase tracking-tight">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export const PromotionHeader: React.FC<PromotionHeaderProps> = ({
    title,
    period,
    description,
    code,
    endTime
}) => {
    return (
        <section className="w-full bg-background pt-8 pb-20">
            <div className="container max-w-[1200px] mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                    {/* Left Content */}
                    <div className="lg:col-span-8 flex flex-col">
                        {/* 1. Breadcrumbs - Increased size to 14px for better readability */}
                        <nav className="flex items-center gap-2 mb-12 text-[14px] font-medium text-muted-foreground uppercase tracking-wider">
                            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                            <ChevronRight size={13} className="text-zinc-300" />
                            <Link href="/promotions" className="hover:text-foreground transition-colors">Promotions</Link>
                            <ChevronRight size={13} className="text-zinc-300" />
                            <span className="text-foreground truncate max-w-[250px]">{title}</span>
                        </nav>

                        <div className="space-y-12 mt-4">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3">
                                    <Tag size={14} className="text-zinc-500 font-bold" />
                                    <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-[0.3em]">Limited Event</span>
                                </div>

                                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-zinc-900 leading-[1.05]">
                                    {title}
                                </h1>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="max-w-2xl"
                            >
                                <p className="text-lg md:text-xl font-light leading-relaxed text-zinc-600/90 whitespace-pre-line">
                                    {description}
                                </p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Info Sidebar (Sticky) */}
                    <div className="lg:col-span-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="sticky top-32"
                        >
                            <div className="p-8 rounded-3xl bg-zinc-50 border border-zinc-100 space-y-10 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
                                <div className="space-y-8">
                                    {/* Campaign Period */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Tag size={12} /> Event Duration
                                        </label>
                                        <p className="font-mono text-[15px] font-bold text-zinc-900 tracking-tight">{period}</p>
                                    </div>

                                    {/* Countdown Timer - Separated if endTime exists */}
                                    {endTime && (
                                        <div className="space-y-4 pt-8 border-t border-zinc-200/60">
                                            <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Clock size={12} /> Ends In
                                            </label>
                                            <CountdownTimer endTime={endTime} />
                                        </div>
                                    )}

                                    {/* Real-time Status Indicator */}
                                    <div className="pt-8 border-t border-zinc-200/60 flex items-center justify-between">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em]">Status</label>
                                            <div className="flex items-center gap-2">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                </span>
                                                <span className="text-xs font-bold text-zinc-900 uppercase">Active</span>
                                            </div>
                                        </div>
                                        {code && (
                                            <div className="text-right space-y-1.5">
                                                <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.2em]">Event ID</label>
                                                <p className="font-mono text-[10px] font-bold text-zinc-400 uppercase">#{code}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4">
                                    <button className="w-full h-14 bg-zinc-900 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-800 transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95">
                                        Explore Collection
                                    </button>
                                    <button className="group w-full h-14 border border-zinc-200 text-zinc-500 text-[11px] font-bold uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 hover:border-zinc-900 hover:text-zinc-900 transition-all">
                                        <Share2 size={14} className="group-hover:rotate-12 transition-transform" />
                                        Share Event
                                    </button>
                                </div>
                            </div>

                            <p className="mt-6 text-center text-[10px] font-medium text-zinc-400 uppercase tracking-tighter">
                                All items are limited until stock lasts.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
