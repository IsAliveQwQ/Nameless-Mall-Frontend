'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface StaticCategory {
    id: number;
    name: string;
    image: string;
    href: string;
    code: string;
}

const STATIC_CATEGORIES: StaticCategory[] = [
    {
        id: 1,
        name: '座椅系列',
        code: 'STNG-04',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALFCda_2tUfhzGCllk6ehKvydbaf5Urhiurj2Blx-TR1HoEpwaO1P2Edt4s6dGssxfuVgzxzo6WRKtB27NIlK39SbKxEsQOJByHldIaT8h15u9Urd5LfsRSh7KX7jLAX_rTfoRTrJwAKK1tEh6wKCXzhnS1MEU2-0LwTRsa0izVCt6LiTORgQQEo8PpFFuiHb4q7mwxP6YvsxzJ6KDZHbwMpfg64JGDTOUYPzwzLvYq3BA4msNNQ5YzsI31QnQjNJSTe30wgUU2hM',
        href: '/products?category=furniture'
    },
    {
        id: 2,
        name: '燈飾系列',
        code: 'LGT-02',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMHaxTjQHHZ5Rjk5BKVZBKiNd-18V7H5H92TRXbJRY_QLEWa72uEKGyt7ZC6IOtkXV_J5Uaf-iu2jWpXpZahlcoDrdvvwljaqgVi1YD8U3M6R8zDDrVV-Dz5EDI3DTfDkhTULcuDk3WM9bEkZlU5vRsShYkW3iCVCwqKOvigkQdRHVLsL3PMIRa8ff45u3HuatpJKclzO8Cvow3qbgcR-GwntYTFGmusITRcJw1d-genxsfv7R7kPOSpltNS8qXb0sNX4lZ0R5vRw',
        href: '/products?category=lighting'
    },
    {
        id: 3,
        name: '織品系列',
        code: 'TEX-09',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5ofl9ScmJUsK9LQbv0VOb6vc0k0mmXcZnzUq55meMcY75G6nLolFMArZC9ixk--Bk5RZgUALu_z2dBNIFRrnC23CBtLJm6sYbI5HrSOl0KrViBZV8S_w6okkwg-ziPS7NEfbo42aoGDjOXMdIVSMm_9Fc1dVtlGlkJnTKea1BXFjDsFGd3L3tIhKp_SFHFON0zsZT0rNOJmodxBU84y5rNlugFmF0PFsmMFqM6gYOwv3erNXehHT9mALl-po5gqV2HqnHgyjunjI',
        href: '/products?category=textile'
    },
    {
        id: 4,
        name: '居家收納',
        code: 'STRG-11',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnnJRtcTjYIjbG4Dm8g3jB55eMdrewzMCB50L4PSw0crzlXQ4ce_DhMlMiOYYJsPGxl8QwJmJQczM8tC5zuMWgRgslfAI4uKGRAaFhZXSAElBbpfXWTZnL8RvNSy5SXd_6jB2dL7xjOkEgwFwUdOJ43EoFzzlzs_dKs4WB9qzmlsMAxAhjqqelCzawvg25stBJgH3V1pKRIa69s-Whj4sCejHjcUw3-3VOUMvwO0Fv_9gCMDYYQWTyHzXFfhf829Iwdhgtytqr01s',
        href: '/products?category=storage'
    }
];

export function CategoryShowcase() {
    return (
        <div className="w-full space-y-10">
            {/* Header: 標題 */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 italic">精選分類</h2>
                <Link href="/products" className="text-sm font-medium text-slate-500 hover:text-black border-b border-transparent hover:border-black transition-all">
                    查看全部
                </Link>
            </div>

            {/* Main Content: 橫向排列 4 列 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-10">
                {STATIC_CATEGORIES.map((cat) => (
                    <Link
                        key={cat.id}
                        href={cat.href}
                        className="group flex flex-col gap-6 cursor-pointer"
                    >
                        {/* 上層: Tab 文字風格 */}
                        <div className="border-b border-slate-200 group-hover:border-slate-900 transition-colors duration-500 pb-4 relative">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-xl font-bold text-slate-400 group-hover:text-slate-900 transition-colors duration-500">
                                    {cat.name}
                                </h3>
                                <span className="font-mono text-[10px] text-slate-300 group-hover:text-slate-500 transition-colors">
                                    {cat.code}
                                </span>
                            </div>
                            {/* 模擬 Tab 激活特效線 */}
                            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-slate-900 transition-all duration-500 group-hover:w-full" />
                        </div>

                        {/* 下層: 對應分類圖 */}
                        <div className="relative w-full aspect-[4/5] bg-[#F9F9F9] overflow-hidden rounded-sm transition-shadow duration-500 group-hover:shadow-2xl group-hover:shadow-slate-200/50">
                            <Image
                                src={cat.image}
                                alt={cat.name}
                                fill
                                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                                sizes="(max-width: 1440px) 25vw, 400px"
                                priority={cat.id <= 2}
                            />
                            {/* 懸浮遮罩 */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors duration-500" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
