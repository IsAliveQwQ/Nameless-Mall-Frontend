import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Noto_Sans_TC } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { CartDrawer } from '@/features/cart/components/cart-drawer';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const notoSansTC = Noto_Sans_TC({
    subsets: ['latin'],
    variable: '--font-display',
    weight: ['300', '400', '500', '700']
});

export const metadata: Metadata = {
    title: 'Nameless Mall',
    description: 'Premium E-commerce Platform',
    icons: {
        icon: '/favicon.ico',
    },
};

import { QuickAddModal } from '@/features/products/components/quick-add-modal';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh-TW" suppressHydrationWarning>
            <body className={cn(
                "min-h-screen bg-background font-sans antialiased",
                inter.variable,
                jetbrainsMono.variable,
                notoSansTC.variable
            )}>
                <Providers>
                    {children}
                    <CartDrawer />
                    <QuickAddModal />
                </Providers>
                <Toaster />
            </body>
        </html>
    );
}
