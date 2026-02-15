'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { useCategories } from '@/features/products/hooks/use-products';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export function MainNav() {
    const { data: categories, isLoading } = useCategories();

    return (
        <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="gap-2">
                <NavigationMenuItem>
                    <Link href="/promotions" legacyBehavior passHref>
                        <NavigationMenuLink className={cn(
                            navigationMenuTriggerStyle(),
                            "bg-transparent hover:bg-zinc-50 text-zinc-600 hover:text-zinc-950 text-base font-medium active:scale-95 transition-all duration-200"
                        )}>
                            活動中心
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <Link href="/products" legacyBehavior passHref>
                        <NavigationMenuLink className={cn(
                            navigationMenuTriggerStyle(),
                            "bg-transparent hover:bg-zinc-50 text-zinc-600 hover:text-zinc-950 text-base font-medium active:scale-95 transition-all duration-200"
                        )}>
                            所有產品
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-zinc-50 text-zinc-600 hover:text-zinc-950 text-base font-medium active:scale-95 transition-all duration-200">
                        系列分類
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <div className="w-[640px] p-7 bg-transparent">
                            {isLoading ? (
                                <div className="grid grid-cols-4 gap-6">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="space-y-4 animate-pulse">
                                            <div className="h-4 w-20 bg-zinc-200/50 rounded-full" />
                                            <div className="space-y-2">
                                                <div className="h-3 w-28 bg-zinc-100/50 rounded-full" />
                                                <div className="h-3 w-16 bg-zinc-100/50 rounded-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 gap-x-8 gap-y-8">
                                    {categories?.map((category) => (
                                        <div key={category.id} className="group/cat flex flex-col gap-4">
                                            <Link
                                                href={`/products?categoryId=${category.id}`}
                                                className="flex items-center gap-2"
                                            >
                                                <div className="size-1.5 rounded-full bg-primary/40 group-hover/cat:scale-150 group-hover/cat:bg-primary transition-all duration-300" />
                                                <span className="text-sm font-black tracking-tight text-zinc-950 group-hover/cat:translate-x-1 transition-transform">
                                                    {category.name}
                                                </span>
                                            </Link>

                                            <ul className="flex flex-col gap-2.5 pl-3 border-l border-zinc-100">
                                                {category.children?.map((child) => (
                                                    <li key={child.id}>
                                                        <NavigationMenuLink asChild>
                                                            <Link
                                                                href={`/products?categoryId=${child.id}`}
                                                                className="text-[13px] text-zinc-500 hover:text-primary transition-colors duration-200"
                                                            >
                                                                {child.name}
                                                            </Link>
                                                        </NavigationMenuLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <Link href="/about" legacyBehavior passHref>
                        <NavigationMenuLink className={cn(
                            navigationMenuTriggerStyle(),
                            "bg-transparent hover:bg-zinc-50 text-zinc-600 hover:text-zinc-950 text-base font-medium active:scale-95 transition-all duration-200"
                        )}>
                            關於我們
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}
