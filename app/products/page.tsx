'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { cn } from '@/lib/utils';
import {
    ChevronDown,
    ChevronRight,
    Grid,
    List,
    LayoutGrid,
    Plus,
    Search,
    Check,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCategories, useSearchProducts } from '@/features/products/hooks/use-products';
import { Product, Category } from '@/shared/types/product';
import { Button as UIButton } from '@/components/ui/button';
import { ProductCard } from '@/features/products/components/product-card';
import { ProductSidebar } from '@/features/products/components/product-sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function ProductListPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#FBFBFB]">
            <SiteHeader />
            <Suspense fallback={
                <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-zinc-900" />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Loading Collections...</span>
                    </div>
                </div>
            }>
                <ProductListContent />
            </Suspense>
            <SiteFooter />
        </div>
    );
}

function ProductListContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // [RFC-011] Simplified State: Only cache sidecar for category structure stability
    const sidecarCache = React.useRef<any>(undefined);

    // 1. URL State Management
    const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;
    const sort = searchParams.get('sort') || 'newest';
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const keyword = searchParams.get('keyword') || undefined;
    const tag = searchParams.get('tag') || undefined;

    // 2. Filter States (Derived from URL)
    const selectedAttributes = React.useMemo(() => {
        const attrs = searchParams.get('attrs');
        if (!attrs) return {} as Record<string, string[]>;

        const result: Record<string, string[]> = {};
        attrs.split(';').forEach(pair => {
            const [key, valStr] = pair.split(':');
            if (key && valStr) {
                result[key] = valStr.split(',');
            }
        });
        return result;
    }, [searchParams]);

    const priceRange = React.useMemo(() => ({
        min: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
        max: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    }), [searchParams]);

    // 3. Data Fetching (Main Request - carries ALL filters)
    const { data: categoriesData = [], isLoading: categoriesLoading } = useCategories();
    const attrsParam = searchParams.get('attrs') || undefined;

    const { data: searchData, isLoading: productsLoading } = useSearchProducts({
        categoryId,
        sort,
        page,
        size: 15,
        keyword,
        tag,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        attrs: attrsParam
    });

    // [Sidecar Request] Decoupled for Industrial Faceting (Rule #011 Refinement)
    // Purpose: Fetch global/keyword-based counts for the sidebar, IGNORING current categoryId
    // to prevent navigation counts from collapsing to zero.
    const { data: sidecarData } = useSearchProducts({
        categoryId: undefined, // CRITICAL: Exclude current category for disjunctive counts
        keyword,
        tag,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        attrs: attrsParam,
        sort,
        page: 1,
        size: 0,
    });
    // ============================================================
    // [RFC-011] Industrial Faceting: Trust Backend, Minimal Frontend Logic
    // ============================================================
    // Design Philosophy:
    // - Backend SearchServiceImpl already provides:
    //   1. post_filter: Ensures product list is precisely filtered
    //   2. disjunctive aggregations: Same-dimension OR counts
    //   3. conjunctive aggregations: Cross-dimension AND counts
    // - Frontend should ONLY focus on:
    //   1. Merging category STRUCTURE from sidecar (stability)
    //   2. Using COUNTS directly from searchData (truth)
    // ============================================================
    const sidebarSearchData = React.useMemo(() => {
        // Cache sidecar for structure stability
        if (sidecarData?.facets) {
            sidecarCache.current = sidecarData.facets;
        }
        const baselineFacets = sidecarData?.facets || sidecarCache.current;

        // Edge case: No data at all
        if (!searchData) {
            return baselineFacets ? { facets: baselineFacets, products: [], total: 0, totalPages: 0, pageNum: 1 } : undefined;
        }

        // If no baseline, just use searchData directly (common on first load)
        if (!baselineFacets) {
            return searchData;
        }

        // ========== Industrial Facet Merging ==========
        const mergedFacets = {
            categories: [] as any[],
            tags: [] as any[],
            attributes: [] as any[],
            priceStatistics: searchData.facets?.priceStatistics
        };

        // 1. Categories: Use Sidecar (Disjunctive) COUNTS
        // We trust baselineFacets counts because sidecarData excludes categoryId filter
        mergedFacets.categories = baselineFacets.categories || [];

        // 2. Tags: 100% Trust SearchData (Backend already filters correctly)
        // Sidecar provides structure, SearchData provides truth
        const tagMap = new Map<string, any>();
        baselineFacets.tags?.forEach((t: any) => tagMap.set(t.name, { ...t, count: 0 }));
        searchData.facets?.tags?.forEach((t: any) => {
            if (tagMap.has(t.name)) {
                tagMap.get(t.name).count = t.count;
            } else {
                tagMap.set(t.name, { ...t });
            }
        });
        mergedFacets.tags = Array.from(tagMap.values());

        // 3. Attributes: 100% Trust SearchData (Backend has disjunctive aggregations)
        // The backend already computes:
        // - all_attrs_agg: Conjunctive (cross-dimension AND)
        // - disjunctive_{attrName}_agg: Disjunctive (same-dimension OR)
        // Frontend just needs to use these numbers directly!
        const attrMap = new Map<string, any>();
        baselineFacets.attributes?.forEach((a: any) => {
            attrMap.set(a.attrName, {
                attrId: a.attrId,
                attrName: a.attrName,
                attrValues: a.attrValues.map((v: any) => ({ value: v.value, count: 0 }))
            });
        });
        searchData.facets?.attributes?.forEach((a: any) => {
            if (attrMap.has(a.attrName)) {
                const base = attrMap.get(a.attrName);
                const valueMap = new Map<string, number>();
                a.attrValues?.forEach((v: any) => valueMap.set(v.value, v.count));
                base.attrValues = base.attrValues.map((v: any) => ({
                    value: v.value,
                    count: valueMap.get(v.value) ?? 0
                }));
            } else {
                attrMap.set(a.attrName, { ...a });
            }
        });
        mergedFacets.attributes = Array.from(attrMap.values());

        return {
            ...searchData,
            total: sidecarData?.total ?? searchData.total,
            facets: mergedFacets
        };
    }, [searchData, sidecarData]);

    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

    const handleTagToggle = (tagName: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const currentTags = params.get('tag')?.split(',').filter(Boolean) || [];

        let newTags: string[];
        if (currentTags.includes(tagName)) {
            newTags = currentTags.filter(t => t !== tagName);
        } else {
            newTags = [...currentTags, tagName];
        }

        if (newTags.length > 0) {
            params.set('tag', newTags.join(','));
        } else {
            params.delete('tag');
        }
        params.set('page', '1');
        router.push(`/products?${params.toString()}`);
    };

    const handleCategoryChange = (id?: number) => {
        const params = new URLSearchParams();
        if (id) {
            params.set('categoryId', id.toString());
        }

        // 保留排序與價格，但清除屬性與標籤 (因為不同分類的屬性/標籤通常不通用)
        const currentSort = searchParams.get('sort');
        if (currentSort) params.set('sort', currentSort);

        const minPrice = searchParams.get('minPrice');
        if (minPrice) params.set('minPrice', minPrice);

        const maxPrice = searchParams.get('maxPrice');
        if (maxPrice) params.set('maxPrice', maxPrice);

        params.set('page', '1');
        router.push(`/products?${params.toString()}`);
    };

    const handleSortChange = (newSort: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', newSort);
        params.set('page', '1');
        router.push(`/products?${params.toString()}`);
    };

    const handleAttributeToggle = (attrName: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const currentAttrs = { ...selectedAttributes };

        const values = currentAttrs[attrName] || [];
        const nextValues = values.includes(value)
            ? values.filter(v => v !== value)
            : [...values, value];

        if (nextValues.length > 0) {
            currentAttrs[attrName] = nextValues;
        } else {
            delete currentAttrs[attrName];
        }

        const newAttrsStr = Object.entries(currentAttrs)
            .map(([key, vals]) => `${key}:${vals.join(',')}`)
            .join(';');

        if (newAttrsStr) {
            params.set('attrs', newAttrsStr);
        } else {
            params.delete('attrs');
        }

        params.set('page', '1');
        router.push(`/products?${params.toString()}`);
    };

    const [minPriceInput, setMinPriceInput] = React.useState(priceRange.min?.toString() || '');
    const [maxPriceInput, setMaxPriceInput] = React.useState(priceRange.max?.toString() || '');

    React.useEffect(() => {
        setMinPriceInput(priceRange.min?.toString() || '');
        setMaxPriceInput(priceRange.max?.toString() || '');
    }, [priceRange]);

    const applyPriceFilter = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (minPriceInput) params.set('minPrice', minPriceInput);
        else params.delete('minPrice');
        if (maxPriceInput) params.set('maxPrice', maxPriceInput);
        else params.delete('maxPrice');
        params.set('page', '1');
        router.push(`/products?${params.toString()}`);
    };

    const categoryPath = React.useMemo(() => {
        if (!categoryId) return [];
        const path: any[] = [];
        const findPath = (list: any[], targetId: number): boolean => {
            for (const cat of list) {
                if (cat.id === targetId) {
                    path.push({ id: cat.id, name: cat.name });
                    return true;
                }
                if (cat.children && findPath(cat.children, targetId)) {
                    path.unshift({ id: cat.id, name: cat.name });
                    return true;
                }
            }
            return false;
        };
        findPath(categoriesData, categoryId);
        return path;
    }, [categoriesData, categoryId]);

    const currentCategoryName = categoryPath.length > 0 ? categoryPath[categoryPath.length - 1].name : '所有產品';

    const products = Array.isArray(searchData?.products) ? searchData.products : [];
    const totalElements = searchData?.total ?? 0;
    const pageNum = searchData?.pageNum ?? 1;

    const handleClearAll = () => {
        const params = new URLSearchParams();
        if (categoryId) params.set('categoryId', categoryId.toString());
        params.set('page', '1');
        router.push(`/products?${params.toString()}`);
    };

    return (
        <div className="flex flex-1 max-w-[1440px] w-full mx-auto border-x border-[#E4E4E7]">
            {/* Desktop Sidebar */}
            <ProductSidebar
                categories={categoriesData}
                searchData={sidebarSearchData}
                selectedCategoryId={categoryId}
                onCategoryChange={handleCategoryChange}
                selectedAttributes={selectedAttributes}
                onAttributeToggle={handleAttributeToggle}
                priceRange={[Number(minPriceInput || 0), Number(maxPriceInput || 0)]}
                onPriceChange={(range) => {
                    setMinPriceInput(range[0] ? range[0].toString() : '');
                    setMaxPriceInput(range[1] ? range[1].toString() : '');
                }}
                onApplyPrice={applyPriceFilter}
                onClearAll={handleClearAll}
            />

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-8">
                <div className="flex flex-col">
                    {/* Mobile Filter Trigger */}
                    <div className="md:hidden w-full mb-6">
                        <Sheet>
                            <SheetTrigger asChild>
                                <UIButton variant="outline" className="w-full flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Filter className="size-4" />
                                        篩選與分類
                                    </span>
                                    <ChevronRight className="size-4 text-zinc-400" />
                                </UIButton>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-[85vw] border-r-0">
                                <ProductSidebar
                                    categories={categoriesData}
                                    searchData={sidebarSearchData}
                                    selectedCategoryId={categoryId}
                                    onCategoryChange={handleCategoryChange}
                                    selectedAttributes={selectedAttributes}
                                    onAttributeToggle={handleAttributeToggle}
                                    priceRange={[Number(minPriceInput || 0), Number(maxPriceInput || 0)]}
                                    onPriceChange={(range) => {
                                        setMinPriceInput(range[0] ? range[0].toString() : '');
                                        setMaxPriceInput(range[1] ? range[1].toString() : '');
                                    }}
                                    onApplyPrice={applyPriceFilter}
                                    onClearAll={handleClearAll}
                                    className="flex w-full h-full border-none shadow-none"
                                />
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Title & Sorting */}
                    <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
                        <div>
                            {categoryId && (
                                <div className="flex items-center gap-2 text-[13.5px] text-zinc-500 mb-2 font-medium">
                                    <button
                                        onClick={() => handleCategoryChange(undefined)}
                                        className="transition-colors hover:text-zinc-900"
                                    >
                                        所有產品
                                    </button>
                                    {categoryPath.map((node, index) => (
                                        <React.Fragment key={node.id}>
                                            <ChevronRight className="size-3.5 text-zinc-300" />
                                            <button
                                                onClick={() => handleCategoryChange(node.id)}
                                                className={cn(
                                                    "transition-colors",
                                                    index === categoryPath.length - 1 ? "text-zinc-900 font-bold" : "hover:text-zinc-900"
                                                )}
                                            >
                                                {node.name}
                                            </button>
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                            <h1 className="text-4xl font-bold tracking-tight text-zinc-950 mb-3">{currentCategoryName}</h1>
                            <p className="text-zinc-500 font-mono text-[12px] tracking-[0.12em] font-medium uppercase">
                                Displaying {totalElements > 0 ? (pageNum - 1) * 15 + 1 : 0} - {Math.min(pageNum * 15, totalElements)} of {totalElements} items
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center border border-zinc-200 rounded-md bg-white shadow-sm h-9 overflow-hidden">
                                <span className="px-3 text-[10px] font-bold text-zinc-400 border-r border-zinc-200 h-full flex items-center bg-zinc-50 uppercase tracking-wider">Sort by</span>
                                <select
                                    value={sort}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="bg-transparent text-xs py-1.5 pl-3 pr-8 focus:ring-0 cursor-pointer text-zinc-900 font-bold outline-none border-none"
                                >
                                    <option value="newest">最新到貨</option>
                                    <option value="price_asc">價格: 低到高</option>
                                    <option value="price_desc">價格: 高到低</option>
                                    <option value="sales_desc">熱銷優先</option>
                                </select>
                            </div>

                            <div className="flex bg-white rounded-md border border-zinc-200 shadow-sm p-0.5 h-9 items-center">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={cn("p-2 rounded-md transition-all active:scale-90", viewMode === 'grid' ? "bg-zinc-950 text-white shadow-md" : "text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100")}
                                >
                                    <LayoutGrid className="size-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={cn("p-2 rounded-md transition-all active:scale-90", viewMode === 'list' ? "bg-zinc-950 text-white shadow-md" : "text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100")}
                                >
                                    <List className="size-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Filters (顯示已選條件) */}
                    {(tag || Object.keys(selectedAttributes).length > 0 || priceRange.min || priceRange.max) && (
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                            <span className="text-xs text-zinc-400 font-medium mr-2">已選條件：</span>

                            {/* 標籤 Pills */}
                            {tag?.split(',').filter(Boolean).map(t => (
                                <button
                                    key={`tag-${t}`}
                                    onClick={() => handleTagToggle(t)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 text-zinc-700 text-xs font-medium rounded-full hover:bg-zinc-200 transition-colors"
                                >
                                    標籤: {t}
                                    <span className="text-zinc-400 hover:text-zinc-600">×</span>
                                </button>
                            ))}

                            {/* 屬性 Pills */}
                            {Object.entries(selectedAttributes).flatMap(([attrName, values]) =>
                                values.map(val => (
                                    <button
                                        key={`attr-${attrName}-${val}`}
                                        onClick={() => handleAttributeToggle(attrName, val)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 text-zinc-700 text-xs font-medium rounded-full hover:bg-zinc-200 transition-colors"
                                    >
                                        {attrName}: {val}
                                        <span className="text-zinc-400 hover:text-zinc-600">×</span>
                                    </button>
                                ))
                            )}

                            {/* 價格 Pill */}
                            {(priceRange.min || priceRange.max) && (
                                <button
                                    onClick={() => {
                                        const params = new URLSearchParams(searchParams.toString());
                                        params.delete('minPrice');
                                        params.delete('maxPrice');
                                        params.set('page', '1');
                                        router.push(`/products?${params.toString()}`);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 text-zinc-700 text-xs font-medium rounded-full hover:bg-zinc-200 transition-colors"
                                >
                                    價格: ${priceRange.min ?? 0} - ${priceRange.max ?? '∞'}
                                    <span className="text-zinc-400 hover:text-zinc-600">×</span>
                                </button>
                            )}

                            {/* 清除全部 */}
                            <button
                                onClick={() => {
                                    const params = new URLSearchParams();
                                    if (categoryId) params.set('categoryId', categoryId.toString());
                                    params.set('page', '1');
                                    router.push(`/products?${params.toString()}`);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium ml-2 transition-colors"
                            >
                                清除全部
                            </button>
                        </div>
                    )}

                    {/* Product Grid */}
                    <div className={cn(
                        "grid gap-6 md:gap-8",
                        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                    )}>
                        {productsLoading ? (
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white p-8 aspect-[4/3] animate-pulse border border-zinc-100 rounded-lg">
                                    <div className="w-full h-full bg-zinc-50 rounded" />
                                </div>
                            ))
                        ) : searchData === undefined ? (
                            <div className="col-span-full py-32 flex flex-col items-center justify-center border border-dashed border-red-200 bg-red-50/30 rounded-lg">
                                <p className="text-red-500 font-bold mb-2">服務連線異常</p>
                                <UIButton variant="outline" size="sm" onClick={() => window.location.reload()}>重新整理</UIButton>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="col-span-full py-32 flex flex-col items-center justify-center border border-dashed border-zinc-200 rounded-lg">
                                <p className="text-zinc-400 font-mono text-xs tracking-widest uppercase mb-4">No results found</p>
                                <UIButton variant="outline" size="sm" onClick={() => handleCategoryChange(undefined)}>重置所有篩選</UIButton>
                            </div>
                        ) : (
                            products.map((product) => (
                                viewMode === 'grid' ? (
                                    <ProductCard key={product.id} product={product} />
                                ) : (
                                    <ListProductItem key={product.id} product={product} />
                                )
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {searchData && searchData.totalPages > 1 && (
                        <div className="mt-20 flex flex-col items-center gap-6">
                            <div className="flex items-center gap-1">
                                {[...Array(searchData.totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            const params = new URLSearchParams(searchParams.toString());
                                            params.set('page', (i + 1).toString());
                                            router.push(`/products?${params.toString()}`);
                                        }}
                                        className={cn(
                                            "size-10 border text-[11px] font-mono transition-all rounded-sm",
                                            pageNum === i + 1
                                                ? "bg-zinc-950 border-zinc-950 text-white shadow-lg"
                                                : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-950 hover:text-zinc-950"
                                        )}
                                    >
                                        {(i + 1).toString().padStart(2, '0')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function ListProductItem({ product }: { product: Product }) {
    return (
        <div className="group flex flex-col md:flex-row h-auto md:h-56 bg-white border border-zinc-100 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-500">
            <div className="w-full md:w-64 relative bg-zinc-50 overflow-hidden border-r border-zinc-100">
                <img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
            </div>
            <div className="p-6 flex flex-col flex-1 justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-zinc-900 text-lg group-hover:text-primary transition-colors">{product.name}</h3>
                        <p className="font-mono text-base text-zinc-900 font-bold">$ {product.price.toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-zinc-400 font-medium">{product.categoryName}</p>
                    <p className="text-sm text-zinc-500 line-clamp-2 mt-2">{product.title}</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <span className="font-mono text-[9px] text-zinc-300 tracking-widest uppercase">ID: {product.id}</span>
                    <UIButton size="sm" variant="outline" className="h-8 text-xs">查看詳情</UIButton>
                </div>
            </div>
        </div>
    );
}
