'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronDown, Check, Archive, Tag, Palette, Layers, Maximize2, CircleDollarSign, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category, SearchResponse } from '@/shared/types/product';

interface ProductSidebarProps {
    categories: Category[];
    searchData?: SearchResponse;
    selectedCategoryId?: number;
    onCategoryChange: (id?: number) => void;
    selectedAttributes: Record<string, string[]>;
    onAttributeToggle: (attrName: string, value: string) => void;
    priceRange: [number, number];
    onPriceChange: (range: [number, number]) => void;
    onApplyPrice?: () => void;
    onClearAll?: () => void;
    className?: string;
}

export function ProductSidebar({
    categories,
    searchData,
    selectedCategoryId,
    onCategoryChange,
    selectedAttributes,
    onAttributeToggle,
    priceRange,
    onPriceChange,
    onApplyPrice,
    onClearAll,
    className
}: ProductSidebarProps) {
    const [expandedSections, setExpandedSections] = React.useState<string[]>([]);
    const [expandedCats, setExpandedCats] = React.useState<number[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentTag = searchParams.get('tag');

    // 當外部選中的分類改變時，自動展開父節點 (可選)
    React.useEffect(() => {
        if (selectedCategoryId) {
            // 遞迴尋找父節點並展開
            const parents: number[] = [];
            const findParents = (list: Category[], targetId: number): boolean => {
                for (const cat of list) {
                    if (cat.id === targetId) return true;
                    if (cat.children && findParents(cat.children, targetId)) {
                        parents.push(cat.id);
                        return true;
                    }
                }
                return false;
            };
            findParents(categories, selectedCategoryId);
            setExpandedCats((prev: number[]) => Array.from(new Set([...prev, ...parents])));
        }
    }, [selectedCategoryId, categories]);

    // Auto expand active sections (Tags & Attributes)
    React.useEffect(() => {
        const active: string[] = [];
        if (currentTag) active.push('tags');
        Object.keys(selectedAttributes).forEach(key => active.push(key));

        if (active.length > 0) {
            setExpandedSections((prev: string[]) => Array.from(new Set([...prev, ...active])));
        }
    }, [currentTag, selectedAttributes]);

    const toggleCatExpansion = (id: number) => {
        setExpandedCats((prev: number[]) =>
            prev.includes(id) ? prev.filter((c: number) => c !== id) : [...prev, id]
        );
    };

    const toggleSection = (id: string) => {
        setExpandedSections((prev: string[]) =>
            prev.includes(id) ? prev.filter((x: string) => x !== id) : [...prev, id]
        );
    };

    const handleTagToggle = (tagName: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const currentTags = params.get('tag')?.split(',').filter(Boolean) || [];

        let newTags: string[];
        if (currentTags.includes(tagName)) {
            // 取消選中：移除該標籤
            newTags = currentTags.filter(t => t !== tagName);
        } else {
            // 選中：新增該標籤
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

    // 遞迴計算分類計數：後端 categoryHierarchy 聚合已包含子分類計數，無需前端累加
    // v3 fix: Force Recompile - ensuring straight SET logic
    const { categoryCounts, preFilterTotal } = React.useMemo(() => {
        const counts = new Map<number, number>();

        // 直接使用 API 回傳的計數 (因為 categoryHierarchy 是多值欄位，已包含所有層級)
        searchData?.facets?.categories?.forEach(c => {
            counts.set(c.id, c.count || 0);
        });

        // 核心修正：直接使用搜尋結果總數，確保數字與列表一致
        const total = searchData?.total || 0;

        return { categoryCounts: counts, preFilterTotal: total };
    }, [categories, searchData]);

    const hasActiveFilters = !!currentTag || Object.keys(selectedAttributes).length > 0 || !!priceRange[0] || !!priceRange[1];

    return (
        <aside className={cn(
            "w-72 flex-col border-r border-[#E4E4E7] bg-white overflow-y-auto hidden md:flex sticky top-16 h-[calc(100vh-4rem)] z-10 custom-scrollbar",
            className
        )}>
            {/* Filter Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
                <span className="text-[11px] font-bold tracking-[0.2em] text-zinc-900 uppercase">Filters.</span>
                {hasActiveFilters && (
                    <button
                        onClick={onClearAll}
                        className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors tracking-widest uppercase border-b border-transparent hover:border-zinc-900 pb-px"
                    >
                        Clear All
                    </button>
                )}
            </div>

            <div className="p-6 pb-32 flex flex-col gap-0">
                {/* 1. Categorization (Always Visible) */}
                <div className="pb-6 mb-6 border-b border-zinc-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Archive size={16} className="text-zinc-600" />
                        <h3 className="text-[14px] font-bold text-zinc-800 tracking-[0.12em] uppercase antialiased">系列分類</h3>
                    </div>
                    <div className="flex flex-col gap-1">
                        <CategoryItem
                            name="所有產品"
                            level={0}
                            active={!selectedCategoryId}
                            onClick={() => onCategoryChange(undefined)}
                            count={preFilterTotal}
                        />
                        {categories.map((cat) => (
                            <CategoryNode
                                key={cat.id}
                                category={cat}
                                level={0}
                                selectedId={selectedCategoryId}
                                expandedIds={expandedCats}
                                counts={categoryCounts}
                                onSelect={onCategoryChange}
                                onToggle={toggleCatExpansion}
                            />
                        ))}
                    </div>
                </div>

                {/* 2. Tags (Collapsible) */}
                {searchData?.facets.tags && searchData.facets.tags.length > 0 && (
                    <div className="border-b border-zinc-100 py-4">
                        <button
                            onClick={() => toggleSection('tags')}
                            className="flex items-center justify-between w-full group py-1"
                        >
                            <div className="flex items-center gap-2">
                                <Tag size={15} className="text-zinc-600" />
                                <h3 className="text-[14px] font-bold text-zinc-800 tracking-[0.12em] uppercase antialiased">標籤篩選</h3>
                            </div>
                            <ChevronDown className={cn(
                                "size-4 text-zinc-400 transition-transform duration-300",
                                expandedSections.includes('tags') && "rotate-180"
                            )} />
                        </button>

                        <AnimatePresence>
                            {expandedSections.includes('tags') && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 flex flex-wrap gap-2">
                                        {searchData.facets.tags.map(tag => {
                                            const selectedTags = currentTag?.split(',').filter(Boolean) || [];
                                            const isSelected = selectedTags.includes(tag.name);
                                            const isDisabled = tag.count === 0 && !isSelected;
                                            return (
                                                <button
                                                    key={tag.name}
                                                    onClick={() => !isDisabled && handleTagToggle(tag.name)}
                                                    className={cn(
                                                        "px-3 py-1 rounded-full text-xs font-medium transition-all border",
                                                        isSelected
                                                            ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                                                            : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900",
                                                        isDisabled && "opacity-30 grayscale cursor-not-allowed pointer-events-none"
                                                    )}
                                                >
                                                    {tag.name} <span className="text-[10px] ml-1 opacity-60">({tag.count})</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* 3. Dynamic Attributes (Collapsible) */}
                {searchData?.facets.attributes?.map((filter) => (
                    <div key={filter.attrId} className="border-b border-zinc-100 py-4">
                        <button
                            onClick={() => toggleSection(filter.attrName)}
                            className="flex items-center justify-between w-full group py-1"
                        >
                            <div className="flex items-center gap-2">
                                {filter.attrName === '顏色' && <Palette size={15} className="text-zinc-600" />}
                                {filter.attrName === '材質' && <Layers size={15} className="text-zinc-600" />}
                                {filter.attrName === '尺寸' && <Maximize2 size={15} className="text-zinc-600" />}
                                {!['顏色', '材質', '尺寸'].includes(filter.attrName) && <LayoutGrid size={15} className="text-zinc-600" />}
                                <h3 className="text-[14px] font-bold text-zinc-800 tracking-[0.12em] uppercase antialiased">
                                    {filter.attrName}
                                </h3>
                            </div>
                            <ChevronDown className={cn(
                                "size-4 text-zinc-400 transition-transform duration-300",
                                expandedSections.includes(filter.attrName) && "rotate-180"
                            )} />
                        </button>

                        <AnimatePresence>
                            {expandedSections.includes(filter.attrName) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-3 flex flex-col gap-0.5">
                                        {filter.attrValues.map(val => {
                                            const isSelected = selectedAttributes[filter.attrName]?.includes(val.value);
                                            const isZero = val.count === 0;
                                            const isDisabled = isZero && !isSelected;

                                            return (
                                                <div
                                                    key={val.value}
                                                    onClick={() => !isDisabled && onAttributeToggle(filter.attrName, val.value)}
                                                    className={cn(
                                                        "flex items-center justify-between group cursor-pointer py-1",
                                                        isDisabled && "opacity-30 grayscale cursor-not-allowed pointer-events-none"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                                            isSelected
                                                                ? "bg-zinc-900 border-zinc-900 text-white"
                                                                : "border-zinc-300 group-hover:border-zinc-400 bg-white"
                                                        )}>
                                                            {isSelected && <Check className="w-3 h-3" />}
                                                        </div>
                                                        <span className={cn(
                                                            "text-sm transition-colors",
                                                            isSelected ? "text-zinc-900 font-medium" : "text-zinc-600 group-hover:text-zinc-900"
                                                        )}>
                                                            {val.value}
                                                        </span>
                                                    </div>
                                                    <span className={cn(
                                                        "text-xs transition-colors",
                                                        isSelected ? "text-zinc-500" : "text-zinc-400"
                                                    )}>
                                                        ({val.count})
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}

                {/* 4. Price Range */}
                <div className="py-6">
                    <div className="flex items-center gap-2 mb-4">
                        <CircleDollarSign size={16} className="text-zinc-600" />
                        <h3 className="text-[14px] font-bold text-zinc-800 tracking-[0.12em] uppercase antialiased">價格範圍</h3>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">$</span>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full h-9 bg-zinc-50 border-none text-sm rounded-sm pl-7 pr-2 focus:ring-1 focus:ring-zinc-200 outline-none placeholder:text-zinc-300 transition-all font-mono"
                                    value={priceRange[0] || ''}
                                    onChange={(e) => onPriceChange([Number(e.target.value), priceRange[1]])}
                                />
                            </div>
                            <span className="text-zinc-300">—</span>
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">$</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full h-9 bg-zinc-50 border-none text-sm rounded-sm pl-7 pr-2 focus:ring-1 focus:ring-zinc-200 outline-none placeholder:text-zinc-300 transition-all font-mono"
                                    value={priceRange[1] || ''}
                                    onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
                                />
                            </div>
                        </div>
                        <button
                            className="w-full py-2 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-zinc-800 transition-colors"
                            onClick={() => onApplyPrice?.()}
                        >
                            套用價格 (Apply)
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}

// Helpers
// Helpers
function CategoryNode({
    category,
    level,
    selectedId,
    expandedIds,
    counts,
    onSelect,
    onToggle
}: {
    category: Category;
    level: number;
    selectedId?: number;
    expandedIds: number[];
    counts: Map<number, number>;
    onSelect: (id: number) => void;
    onToggle: (id: number) => void;
}) {
    const isExpanded = expandedIds.includes(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const isActive = Number(selectedId) === Number(category.id);
    const count = counts.get(category.id);
    const isDisabled = count === 0 && !isActive;

    return (
        <div className="flex flex-col">
            <CategoryItem
                name={category.name}
                level={level}
                active={isActive}
                count={count}
                hasChildren={hasChildren}
                isExpanded={isExpanded}
                disabled={isDisabled}
                onClick={() => onSelect(category.id)}
                onToggle={() => onToggle(category.id)}
            />
            <AnimatePresence>
                {isExpanded && hasChildren && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden ml-[1.55rem] border-l border-zinc-100"
                    >
                        {category.children!.map((child) => (
                            <CategoryNode
                                key={child.id}
                                category={child}
                                level={level + 1}
                                selectedId={selectedId}
                                expandedIds={expandedIds}
                                counts={counts}
                                onSelect={onSelect}
                                onToggle={onToggle}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function CategoryItem({
    name,
    level,
    active,
    count,
    hasChildren,
    isExpanded,
    disabled,
    onClick,
    onToggle
}: {
    name: string;
    level: number;
    active: boolean;
    count?: number;
    hasChildren?: boolean;
    isExpanded?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    onToggle?: () => void;
}) {
    return (
        <div
            className={cn(
                "flex items-center justify-between group px-3 py-2.5 rounded-sm cursor-pointer transition-all relative overflow-hidden",
                active ? "bg-zinc-50/80" : "hover:bg-zinc-50/50",
                disabled && "opacity-40 grayscale cursor-not-allowed pointer-events-none bg-transparent hover:bg-transparent"
            )}
            onClick={disabled ? undefined : onClick}
        >
            {/* Active Indicator Line */}
            {active && (
                <motion.div
                    layoutId="sidebar-active-line"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-zinc-950 rounded-full"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                />
            )}
            <div className="flex items-center">
                <span className={cn(
                    "text-[17px] tracking-tight transition-colors",
                    active ? "font-black text-zinc-950" : "text-zinc-700 group-hover:text-zinc-950 font-medium",
                    disabled && "text-zinc-400 group-hover:text-zinc-400 font-normal"
                )}>
                    {name}
                </span>
            </div>

            <div className="flex items-center gap-3">
                {count !== undefined && (
                    <span className={cn(
                        "font-mono text-[12px] transition-colors",
                        disabled ? "text-zinc-300" : "text-zinc-400 group-hover:text-zinc-600"
                    )}>
                        {count}
                    </span>
                )}
                {hasChildren && (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            // 即使禁用，如果有子項目且被展開，可能還是希望有機會收合？
                            // 但如果禁用了通常代表整個子樹都沒東西 (因為 count 包含子樹)
                            // 所以這裡也一併禁用是合理的。
                            if (!disabled) onToggle?.();
                        }}
                        className={cn(
                            "p-1 rounded-full transition-colors",
                            !disabled && "hover:bg-zinc-200/50"
                        )}
                    >
                        <ChevronDown className={cn(
                            "size-3.5 transition-transform duration-300",
                            isExpanded && "rotate-180",
                            disabled ? "text-zinc-200" : "text-zinc-400"
                        )} />
                    </div>
                )}
            </div>
        </div>
    );
}
