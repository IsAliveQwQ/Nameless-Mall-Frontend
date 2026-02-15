'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCategories, useSearchProducts } from '@/features/products/hooks/use-products';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Category } from '@/shared/types/product';

function FeaturedCategoryCard({ category, className }: { category: Category; className?: string }) {
    // Fetch 1 product from this category to get a representative image (Best Selling)
    const { data: searchResult, isLoading } = useSearchProducts({
        categoryId: category.id,
        size: 1,
        sort: 'sales_desc'
    });

    // Use product image or fallback/placeholder
    const product = searchResult?.products?.[0];
    const image = product?.mainImage || category.icon || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1000'; // Fallback
    const itemCount = searchResult?.total || 0;

    if (isLoading) {
        return <Skeleton className={cn("aspect-[4/5] w-full", className)} />;
    }

    return (
        <Link
            href={`/products?categoryId=${category.id}`}
            className={cn(
                "group flex flex-col cursor-pointer",
                className
            )}
        >
            {/* Image Container */}
            <div className="relative aspect-square w-full bg-transparent overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-0">
                    <div className="relative w-full h-full transition-transform duration-500 ease-out group-hover:scale-105">
                        <Image
                            src={image}
                            alt={category.name}
                            fill
                            className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            sizes="(max-width: 768px) 100vw, 33vw"
                        />
                    </div>
                </div>
            </div>

            {/* Title & Action Below Card */}
            <div className="flex items-center justify-between w-full py-3">
                <h3 className="text-[20px] font-bold uppercase tracking-[0.1em] text-zinc-900 group-hover:text-black transition-colors">
                    {category.name}
                </h3>
                <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-900 border-b border-zinc-900 pb-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
                    VIEW ITEMS
                </span>
            </div>
        </Link>
    );
}

export function FeaturedCategories() {
    const { data: categories, isLoading } = useCategories();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-border/40">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="aspect-[4/5] w-full" />
                ))}
            </div>
        );
    }

    // Take top 4 categories
    const featuredCats = categories?.slice(0, 4) || [];

    // Graceful degradation if fewer than 4 (though unlikely in prod)
    if (featuredCats.length === 0) {
        return (
            <div className="p-10 text-center text-zinc-500">
                No categories found.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 px-4 md:px-0 bg-transparent">
            {featuredCats.map((cat) => (
                <FeaturedCategoryCard key={cat.id} category={cat} />
            ))}
        </div>
    );
}
