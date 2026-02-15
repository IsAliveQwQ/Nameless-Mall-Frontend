'use client';

import * as React from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// FAQ Data based on Real System Implementation
const faqItems = [
    {
        category: "Order & Payment",
        items: [
            { q: "有哪些付款方式？", a: "我們支援 **LINE Pay** 行動支付（可使用 LINE Points 折抵），以及由 **綠界科技 (ECPay)** 提供的安全金流服務。透過綠界，您可以使用各家銀行信用卡 (VISA, MasterCard, JCB) 進行線上刷卡，或選擇 ATM 虛擬帳號轉帳。" },
            { q: "如何查詢訂單狀態？", a: "您可以登入會員中心，在「我的訂單」頁面查看即時處理進度。訂單成立後，您可以在此查閱訂單編號與明細。" },
            { q: "下單後可以修改內容嗎？", a: "訂單成立後系統即開始作業，無法直接修改內容。若需變更商品或數量，請先取消原訂單後重新下單（請注意優惠券可能無法返還）。" }
        ]
    },
    {
        category: "Shipping & Delivery",
        items: [
            { q: "運費如何計算？", a: "宅配運費為 NT$100，超商取貨（支援 7-11 與全家）運費為 NT$60。我們會不定時推出免運優惠活動，請留意首頁公告。" },
            { q: "配送需要多久時間？", a: "現貨商品通常於下單後 1-2 個工作天內出貨。宅配約 2-3 天送達，超商取貨約 3-5 天送達門市。" },
            { q: "有提供離島配送嗎？", a: "目前配送範圍僅限台灣本島。離島配送服務正在規劃中。" }
        ]
    },
    {
        category: "Returns & Exchanges",
        items: [
            { q: "如何辦理退換貨？", a: "目前尚未開放系統自助退貨。若您收到瑕疵商品或有退換貨需求，請透過網站底部的「聯絡我們」或客服信箱與我們聯繫，將有專人為您服務。" },
            { q: "退款需要多久？", a: "我們收到退回商品並確認無誤後，將於 7-10 個工作天內透過 LINE Pay 進行退刷或退款。" }
        ]
    }
];

// Simple Accordion Component
const AccordionItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="border-b border-zinc-200 bg-white first:rounded-t-lg last:rounded-b-lg last:border-0 hover:bg-zinc-50/50 transition-colors">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 px-6 flex items-center justify-between text-left group"
            >
                <span className={cn("text-base font-medium transition-colors tracking-tight", isOpen ? "text-zinc-900" : "text-zinc-600 group-hover:text-zinc-900")}>
                    {question}
                </span>
                <span className={cn("p-1.5 rounded-full border transition-all duration-300", isOpen ? "rotate-45 border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-400 group-hover:border-zinc-300")}>
                    <Plus className="size-3.5" />
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "circOut" }}
                        className="overflow-hidden bg-zinc-50/30"
                    >
                        <p className="pb-6 px-6 text-sm text-zinc-500 leading-7 font-light tracking-wide max-w-2xl">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function FAQPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#FBFBFB]">
            <SiteHeader />
            <main className="flex-grow pt-32 pb-20">
                <section className="container mx-auto px-6 mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto text-center space-y-6"
                    >
                        <h1 className="text-3xl md:text-5xl font-sans font-light tracking-tight text-zinc-950">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-zinc-500 font-light tracking-wide text-sm md:text-base">常見問題與解答</p>
                    </motion.div>
                </section>

                <div className="max-w-3xl mx-auto px-4 md:px-0 space-y-16">
                    {faqItems.map((section, idx) => (
                        <motion.div
                            key={section.category}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                        >
                            <h3 className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase mb-6 pl-2">
                                {section.category}
                            </h3>
                            <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm overflow-hidden">
                                {section.items.map((item, i) => (
                                    <AccordionItem key={i} question={item.q} answer={item.a} />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
