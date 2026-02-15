import { Product, ProductDetail, ProductSearchDTO } from '@/shared/types/product';

/**
 * 數據轉換小幫手
 * 負責將後端（或模擬 JSON）的原始數據轉換為前端嚴格型別定義的格式
 */
export const dataTransformer = {
    /**
     * 轉換單一商品實體
     */
    transformProduct(p: any): Product {
        return {
            id: p.id,
            categoryId: p.categoryId,
            categoryName: p.categoryName,
            name: p.name,
            // [Search Engine] SSoT 對齊 (v4-Final)
            title: p.title,
            description: p.description,
            price: p.price,
            originalPrice: p.originalPrice || p.price,
            stock: p.stock ?? 0,
            // [Search Engine] SSoT 對齊 (v4-Final)
            mainImage: p.mainImage,
            thumbnail: p.thumbnail || p.mainImage, // 若無縮圖則回退至主圖
            publishedAt: p.publishedAt || new Date().toISOString(),
            status: p.status ?? 1,
            sales: p.sales ?? 0,
            tags: p.tags || [],
            isNew: (p.tags && p.tags.includes('NEW')) || p.isNew || false,
            brandName: p.brandName,
            skus: p.skus || [],
            attrs: p.attrs || [],
        };
    },

    /**
     * 專門處理 Search API 的 DTO 轉換
     * Handle Field Mismatch: salesCount -> sales
     */
    transformSearchDTO(p: ProductSearchDTO): Product {
        return {
            id: p.id,
            categoryId: p.categoryId,
            categoryName: p.categoryName,
            name: p.name,
            title: p.title,
            description: '', // Search result usually doesn't need full description
            price: p.price,
            originalPrice: p.originalPrice || p.price,
            stock: p.stock ?? 0,
            mainImage: p.mainImage,
            thumbnail: p.mainImage, // Fallback
            publishedAt: p.publishedAt || new Date().toISOString(),
            status: 1,
            sales: p.salesCount ?? 0, // Map salesCount (Backend) to sales (Frontend)
            tags: p.tags || [],
            isNew: (p.tags && p.tags.includes('NEW')) || false, // Derived from tags
            brandName: p.brandName,
            skus: p.skus || [],
            attrs: [], // VO doesn't have list-level attrs in the same format
        };
    },

    /**
     * 轉換商品詳體
     */
    transformProductDetail(d: any): ProductDetail {
        return {
            ...this.transformProduct(d),
            images: d.images || [d.mainImage],
            variants: (d.variants || []).map((v: any) => ({
                id: v.id,
                productId: d.id, // [Critical Fix] Inject Parent Product ID
                sku: v.sku,
                name: v.name,
                price: v.price,
                stock: v.stock,
                image: v.image,
                options: v.options || []
            })),
            displayOptions: d.displayOptions || {}
        };
    }
};
