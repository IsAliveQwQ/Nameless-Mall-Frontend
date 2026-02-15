'use client';

import { useSearchProducts } from '@/features/products/hooks/use-products';
import { ProductCard, ProductCardSkeleton } from './product-card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Product } from '@/shared/types/product';
import { cn } from '@/lib/utils';

interface ProductGridProps {
    categoryId?: number;
    limit?: number;
    className?: string;
    customDiscountRate?: number;
    customLabel?: string;
}

export function ProductGrid({ categoryId, limit = 8, className, customDiscountRate, customLabel }: ProductGridProps) {
    const { data, isLoading, isError, error, refetch } = useSearchProducts({
        categoryId,
        size: limit,
        page: 1
    });

    const productsToShow = data?.products || [];

    if (isError) {
        return (
            <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 bg-white border border-border/40">
                <AlertCircle className="size-10 text-muted-foreground opacity-20" />
                <div className="text-center">
                    <p className="text-sm font-medium text-foreground">無法載入商品數據</p>
                    <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : '請檢查網路連線'}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                    <RefreshCcw className="size-3" /> 重試
                </Button>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "grid grid-cols-2 lg:grid-cols-4 gap-px bg-border/40 transition-opacity duration-700",
                isLoading && !data ? "opacity-60" : "opacity-100",
                className
            )}
        >
            {productsToShow.slice(0, limit).map((product: Product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    customDiscountRate={customDiscountRate}
                    customLabel={customLabel}
                />
            ))}
        </div>
    );
}

