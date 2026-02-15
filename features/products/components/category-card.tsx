'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/features/products/api/product-service';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/shared/types/product';

interface CategoryCardProps {
    category: Category;
    index: number;
}

export function CategoryCard({ category, index }: CategoryCardProps) {
    // Dynamically fetch top 5 best sellers to ensure quality and avoid "Latest" duplicates
    const { data: productData, isLoading } = useQuery({
        queryKey: ['products', 'list', { categoryId: category.id, size: 5, sort: 'sales_desc' }],
        queryFn: () => productService.searchProducts({ categoryId: category.id, size: 5, sort: 'sales_desc' }),
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    // Randomly pick one from the top 5 to keep homepage fresh
    const displayProduct = React.useMemo(() => {
        if (!productData?.products || productData.products.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * productData.products.length);
        return productData.products[randomIndex];
    }, [productData]);

    const fallbackImage = 'https://placehold.co/400x500/f4f4f5/a1a1aa?text=No+Image';

    // Get real image
    const imageUrl = displayProduct?.mainImage || fallbackImage;

    return (
        <Link
            href={`/products?categoryId=${category.id}`}
            className="col-span-1 md:col-span-3 bg-[#FBFBFB] group relative aspect-[4/5] flex flex-col justify-between p-8 overflow-hidden transition-colors border border-transparent hover:border-[#E4E4E7]"
        >
            {/* Top Text Area */}
            <div className="relative z-20 flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-[#18181B] mb-1">{category.name}</h3>
                    <div className="h-0.5 w-6 bg-[#18181B] group-hover:w-full transition-all duration-500 ease-out" />
                </div>
                <span className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-wider">
                    CAT-{String(category.id).padStart(2, '0')}
                </span>
            </div>

            {/* Bottom Image Area */}
            <div className="absolute inset-x-0 bottom-0 top-16 z-10 p-4">
                <div className="relative w-full h-full transition-transform duration-700 ease-out group-hover:scale-105">
                    {isLoading ? (
                        <div className="w-full h-full bg-zinc-100 animate-pulse" />
                    ) : (
                        <Image
                            src={imageUrl}
                            alt={category.name}
                            fill
                            className="object-contain object-bottom"
                            sizes="(max-width: 768px) 100vw, 33vw"
                        />
                    )}
                </div>
            </div>

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] pointer-events-none transition-colors duration-300 z-30" />
        </Link>
    );
}
