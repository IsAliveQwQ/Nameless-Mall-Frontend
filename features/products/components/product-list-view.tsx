'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
    LayoutGrid,
    List,
    ChevronRight,
    Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Product, SearchResponse } from '@/shared/types/product';
import { ProductCard } from './product-card';
import { Button } from '@/components/ui/button';

interface ProductListViewProps {
    searchData?: SearchResponse;
    isLoading: boolean;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
    sort: string;
    onSortChange: (sort: string) => void;
    categoryName?: string;
}

export function ProductListView({
    searchData,
    isLoading,
    viewMode,
    onViewModeChange,
    sort,
    onSortChange,
    categoryName = '所有產品'
}: ProductListViewProps) {
    const products = searchData?.products || [];
    const totalElements = searchData?.total || 0;
    const { pageNum = 1 } = searchData || {};
    // Calculate display range
    const pageSize = 12; // Assuming default or passed prop, currently hardcoded logic in display
    const startItem = (pageNum - 1) * pageSize + 1;
    const endItem = Math.min(pageNum * pageSize, totalElements);

    return (
        <main className="flex-1 p-6 md:p-10 bg-white">
            <div className="flex flex-col">
                {/* 1. Header & Controls */}
                <div className="flex flex-wrap items-end justify-between gap-8 mb-12">
                    <div className="space-y-4">
                        <nav className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                            <span className="hover:text-zinc-900 cursor-pointer transition-colors">Nameless</span>
                            <ChevronRight className="size-3" />
                            <span className="text-zinc-900">{categoryName}</span>
                        </nav>
                        <h1 className="text-4xl font-black tracking-tighter text-zinc-950">{categoryName}</h1>
                        <p className="text-zinc-400 font-mono text-[10px] tracking-widest uppercase">
                            Displaying {startItem} - {endItem} of {totalElements} Masterpieces
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Sort Dropdown */}
                        <div className="flex items-center border border-zinc-200 rounded-sm bg-white h-10 overflow-hidden shadow-sm hover:border-zinc-300 transition-all">
                            <span className="px-4 text-[9px] font-black text-zinc-400 border-r border-zinc-100 h-full flex items-center bg-zinc-50 uppercase tracking-[0.15em]">Sort by</span>
                            <select
                                value={sort}
                                onChange={(e) => onSortChange(e.target.value)}
                                className="bg-transparent text-[11px] py-2 pl-4 pr-10 focus:ring-0 cursor-pointer text-zinc-900 font-bold outline-none border-none uppercase tracking-wider"
                            >
                                <option value="newest">最新到貨</option>
                                <option value="price_asc">價格: 低到高</option>
                                <option value="price_desc">價格: 高到低</option>
                                <option value="sales_desc">熱銷優先</option>
                            </select>
                        </div>

                        {/* View Switcher */}
                        <div className="flex bg-zinc-50 rounded-sm border border-zinc-200 p-1 h-10 items-center">
                            <button
                                onClick={() => onViewModeChange('grid')}
                                className={cn(
                                    "p-1.5 rounded-sm transition-all active:scale-95",
                                    viewMode === 'grid' ? "bg-white text-zinc-950 shadow-sm border border-zinc-200" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                <LayoutGrid className="size-4.5" />
                            </button>
                            <button
                                onClick={() => onViewModeChange('list')}
                                className={cn(
                                    "p-1.5 rounded-sm transition-all active:scale-95",
                                    viewMode === 'list' ? "bg-white text-zinc-950 shadow-sm border border-zinc-200" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                <List className="size-4.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Product Grid/List View */}
                {isLoading && !searchData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-100 border border-zinc-100 rounded-sm overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white p-8 aspect-[3/4] animate-pulse flex flex-col gap-6">
                                <div className="flex-1 bg-zinc-50 rounded" />
                                <div className="space-y-3">
                                    <div className="h-4 w-2/3 bg-zinc-50 rounded" />
                                    <div className="h-3 w-1/3 bg-zinc-50 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-32 flex flex-col items-center justify-center border border-dashed border-zinc-200 rounded-lg">
                        <p className="text-zinc-400 font-mono text-xs tracking-widest uppercase mb-4">No results matches your criteria</p>
                        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>重置篩選</Button>
                    </div>
                ) : (
                    <div className={cn(
                        "grid gap-px bg-zinc-100 border border-zinc-100 rounded-sm overflow-hidden transition-all duration-700",
                        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                    )}>
                        {products.map((product) => (
                            <div key={product.id} className="bg-white">
                                {viewMode === 'grid' ? (
                                    <ProductCard product={product} className="border-none rounded-none hover:shadow-none" />
                                ) : (
                                    <ListProductItem product={product} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* 3. Pagination / Load More */}
                {searchData && searchData.totalPages > 1 && (
                    <div className="mt-20 flex flex-col items-center gap-6">
                        <div className="flex items-center gap-1">
                            {[...Array(searchData.totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    className={cn(
                                        "size-10 border text-[11px] font-mono transition-all rounded-sm",
                                        pageNum === i + 1
                                            ? "bg-zinc-950 border-zinc-950 text-white shadow-lg shadow-zinc-200"
                                            : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-950 hover:text-zinc-950"
                                    )}
                                >
                                    {(i + 1).toString().padStart(2, '0')}
                                </button>
                            ))}
                        </div>
                        <span className="text-[9px] font-mono text-zinc-300 uppercase tracking-[0.3em]">Precision Engineering in Every Pixel</span>
                    </div>
                )}
            </div>
        </main>
    );
}

function ListProductItem({ product }: { product: Product }) {
    return (
        <div className="group flex flex-col md:flex-row h-auto md:h-64 p-6 gap-8 hover:bg-zinc-50/50 transition-colors">
            <div className="w-full md:w-64 h-64 md:h-full relative bg-zinc-50 rounded-sm overflow-hidden border border-zinc-100 p-6 flex items-center justify-center">
                <img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                />
            </div>
            <div className="flex-1 flex flex-col justify-between py-2">
                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-black text-zinc-950 tracking-tight mb-1">{product.name}</h3>
                            <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">{product.categoryName}</p>
                        </div>
                        <span className="text-xl font-mono text-zinc-950 font-medium">
                            ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <p className="text-[13px] text-zinc-500 leading-relaxed max-w-xl line-clamp-3">
                        {product.description}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button size="sm" className="h-10 text-[10px]">加入購物車</Button>
                    <Button variant="outline" size="sm" className="h-10 text-[10px]">查看詳情</Button>
                </div>
            </div>
        </div>
    );
}
