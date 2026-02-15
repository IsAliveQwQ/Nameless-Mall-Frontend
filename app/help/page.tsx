'use client';

import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Construction } from 'lucide-react';

export default function HelpPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#FBFBFB]">
            <SiteHeader />

            <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
                <div className="size-24 bg-zinc-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
                    <Construction className="size-10 text-zinc-400" />
                </div>

                <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-4 font-mono">
                    EASTER EGG FOUND
                </h1>

                <div className="max-w-md space-y-2">
                    <p className="text-lg text-zinc-600 font-medium">
                        本專案僅用於學習與測試，暫..暫無客服服務
                    </p>
                    <p className="text-sm text-zinc-400 font-mono">
                        This project is for educational and testing purposes only.
                    </p>
                </div>

                <div className="mt-12 p-6 bg-white border border-dashed border-zinc-200 rounded-lg max-w-2xl w-full">
                    <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest mb-4">Device Info (Mock)</h3>
                    <div className="grid grid-cols-2 gap-4 text-left text-sm font-mono text-zinc-500">
                        <div>Status: <span className="text-green-500">Operational</span></div>
                        <div>Environment: <span className="text-blue-500">Development</span></div>
                        <div>Version: v1.0.0-beta</div>
                        <div>Region: Asia-East</div>
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
