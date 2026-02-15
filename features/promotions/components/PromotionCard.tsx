import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface PromotionProps {
    id: string;
    title: string;
    description: string;
    period: string;
    code?: string;
    status: 'ONGOING' | 'ENDING_SOON' | 'UPCOMING' | 'ENDED';
    imageUrl: string;
    linkUrl: string;
}

import { ArrowRight, Calendar, Tag } from 'lucide-react';

const statusConfig = {
    ONGOING: { label: 'Active', bg: 'bg-zinc-900', text: 'text-white' },
    ENDING_SOON: { label: 'Ending Soon', bg: 'bg-rose-500', text: 'text-white' },
    UPCOMING: { label: 'Coming Soon', bg: 'bg-zinc-100', text: 'text-zinc-500' },
    ENDED: { label: 'Closed', bg: 'bg-zinc-50', text: 'text-zinc-400' },
};

export const PromotionCard: React.FC<PromotionProps> = ({
    title,
    description,
    period,
    code,
    status,
    imageUrl,
    linkUrl
}) => {
    const statusStyle = statusConfig[status];

    return (
        <article className="group relative flex flex-col lg:flex-row items-center gap-10 lg:gap-16 py-20 border-b border-zinc-100 last:border-0">
            {/* Image Box - Framed Design */}
            <div className="w-full lg:w-[40%] shrink-0">
                <Link href={linkUrl} className="block relative aspect-[16/10] overflow-hidden rounded-xl bg-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                </Link>
            </div>

            {/* Content Box - Editorial Style */}
            <div className="flex flex-col flex-grow w-full lg:w-[60%]">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <span className={cn(
                            "text-[11px] font-mono font-black uppercase tracking-[0.2em] flex items-center gap-2",
                            code === 'FLASH_SALE' ? "text-zinc-900" : "text-zinc-500"
                        )}>
                            <Tag size={13} className={code === 'FLASH_SALE' ? "text-zinc-400" : "text-zinc-300"} />
                            {code === 'FLASH_SALE' ? 'Flash Sale' : 'Seasonal Event'}
                        </span>
                        <span className="flex items-center gap-2 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest pl-4 border-l border-zinc-200">
                            <Calendar size={12} /> {period}
                        </span>
                    </div>

                    <div className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ring-1 ring-inset",
                        statusStyle.bg,
                        statusStyle.text,
                        status === 'ONGOING' || status === 'ENDING_SOON' ? "ring-transparent" : "ring-zinc-200"
                    )}>
                        {statusStyle.label}
                    </div>
                </div>

                <Link href={linkUrl}>
                    <h3 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight leading-tight mb-6 group-hover:text-zinc-600 transition-colors">
                        {title}
                    </h3>
                </Link>

                <p className="text-zinc-500 text-base md:text-lg font-light leading-relaxed mb-10 line-clamp-2 md:line-clamp-3">
                    {description}
                </p>

                <div className="mt-auto">
                    <Link href={linkUrl} className="inline-flex items-center gap-2 text-sm font-bold text-zinc-900 uppercase tracking-widest group/link">
                        <span className="border-b-2 border-zinc-900 pb-0.5">Explore Details</span>
                        <ArrowRight size={16} className="transition-transform group-hover/link:translate-x-1.5" />
                    </Link>
                </div>
            </div>
        </article>
    );
};
