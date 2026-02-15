'use client';

import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SiteFooter() {
    const [isCaught, setIsCaught] = useState(false);
    const [isFleeing, setIsFleeing] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLFormElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current || isCaught) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left;
        const mouseY = e.clientY - containerRect.top;

        // 計算相對於容器的按鈕參考點
        // 按鈕原本位於 form 的右端
        const buttonX = containerRect.width - 60 + offset.x; // 60 是按鈕大概的一半寬度
        const buttonY = containerRect.height / 2 + offset.y;

        const dx = buttonX - mouseX;
        const dy = buttonY - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const threshold = 140;

        if (distance < threshold) {
            setIsFleeing(true);
            const power = (threshold - distance) / threshold;
            const moveStep = power * 75;

            setOffset(prev => {
                let nextX = prev.x + (dx / distance) * moveStep;
                let nextY = prev.y + (dy / distance) * moveStep;

                const bounds = { x: 400, y: 150 };
                if (Math.abs(nextX) > bounds.x) nextX = (nextX / Math.abs(nextX)) * bounds.x;
                if (Math.abs(nextY) > bounds.y) nextY = (nextY / Math.abs(nextY)) * bounds.y;

                return { x: nextX, y: nextY };
            });
        }
    };

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (isCaught) return;

        setIsCaught(true);
        setIsFleeing(false);
        setTimeout(() => {
            setIsCaught(false);
            setOffset({ x: 0, y: 0 });
        }, 3000);
    };

    return (
        <footer className="w-full border-t border-border-color bg-[#FBFBFB]">
            <div className="max-w-[1440px] mx-auto px-8 md:px-12 lg:px-16 py-16 lg:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
                    <div className="flex flex-col gap-10">
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="h-7 w-7 text-primary" strokeWidth={1.5} />
                            <span className="font-bold text-2xl tracking-tight text-primary">Nameless Mall</span>
                        </div>
                        <div className="flex flex-col gap-5">
                            <h4 className="font-bold text-sm tracking-widest uppercase text-primary/80">快速連結</h4>
                            <div className="flex flex-col gap-3 text-base text-muted-foreground font-light">
                                <Link className="hover:text-primary transition-colors duration-200" href="/promotions">活動中心</Link>
                                <Link className="hover:text-primary transition-colors duration-200" href="/products">所有產品</Link>
                                <Link className="hover:text-primary transition-colors duration-200" href="/categories">系列分類</Link>
                                <Link className="hover:text-primary transition-colors duration-200" href="/about">關於我們</Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-5 lg:pt-[72px]">
                        <h4 className="font-bold text-sm tracking-widest uppercase text-primary/80">客戶服務</h4>
                        <div className="flex flex-col gap-3 text-base text-muted-foreground font-light">
                            <Link className="hover:text-primary transition-colors duration-200" href="/faq">常見問題</Link>
                            <Link className="hover:text-primary transition-colors duration-200" href="/shipping">配送資訊</Link>
                            <Link className="hover:text-primary transition-colors duration-200" href="/about">關於我們</Link>
                            <Link className="hover:text-primary transition-colors duration-200" href="/404-demo">404範例頁</Link>
                        </div>
                    </div>

                    <div className="md:col-span-2 lg:col-span-2 lg:pl-16 flex flex-col justify-center h-full">
                        <div className="w-full">
                            <h3 className="text-2xl font-bold tracking-tight text-primary mb-5">訂閱電子報</h3>
                            <p className="text-muted-foreground text-base leading-relaxed mb-8 font-light max-w-lg">
                                訂閱我們的電子報，獲取最新極簡家居設計趨勢與獨家優惠資訊。
                            </p>
                            <form
                                ref={containerRef}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={() => setIsFleeing(false)}
                                className="flex flex-col sm:flex-row items-center gap-6 w-full"
                                onSubmit={handleSubscribe}
                            >
                                <input
                                    className="flex-grow w-full bg-transparent border-b border-primary/20 px-0 py-3 text-lg focus:ring-0 focus:border-primary transition-colors placeholder:text-muted-foreground/40 text-primary outline-none"
                                    placeholder="您的電子信箱"
                                    type="email"
                                />
                                <div className="relative w-full sm:w-auto">
                                    <motion.button
                                        type="submit"
                                        animate={{
                                            x: offset.x,
                                            y: offset.y,
                                            scale: isCaught ? [1, 1.2, 1] : 1
                                        }}
                                        transition={{
                                            x: { type: "spring", stiffness: 450, damping: 25 },
                                            y: { type: "spring", stiffness: 450, damping: 25 },
                                            scale: { duration: 0.3 }
                                        }}
                                        className="bg-primary text-white text-base font-medium px-10 py-3.5 rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap tracking-wide w-full sm:w-auto shadow-md relative z-10"
                                    >
                                        訂閱
                                    </motion.button>

                                    <AnimatePresence>
                                        {isCaught && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, y: -55, x: 50, scale: 1 }}
                                                exit={{ opacity: 0, y: -70, scale: 0.9 }}
                                                className="absolute pointer-events-none select-none z-20 whitespace-nowrap"
                                                style={{
                                                    left: `calc(50% + ${offset.x}px)`,
                                                    top: `calc(50% + ${offset.y}px)`
                                                }}
                                            >
                                                <div className="bg-white border border-zinc-200 px-4 py-2 rounded shadow-[0_10px_25px_rgba(0,0,0,0.08)] relative">
                                                    <span className="text-zinc-600 text-[13px] font-medium tracking-tight">
                                                        下..下次再給你電子報
                                                    </span>
                                                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-white border-r border-b border-zinc-200 rotate-45" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-border-color flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="font-mono text-xs text-muted-foreground">© 2026 Nameless Mall.</p>
                    <Link
                        href="https://github.com/IsAliveQwQ/nameless-mall"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-3 py-1.5 bg-white rounded border border-zinc-950 hover:bg-zinc-50 hover:-translate-y-1 hover:shadow-lg active:scale-95 transition-all duration-300 shadow-sm group"
                        title="View Backend Source Code"
                    >
                        <svg
                            viewBox="0 0 16 16"
                            className="size-4 fill-zinc-950 group-hover:rotate-12 transition-transform duration-300"
                            aria-hidden="true"
                        >
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                        </svg>
                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-zinc-950">Open Source</span>
                    </Link>
                </div>
            </div>
        </footer>
    );
}
