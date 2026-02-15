import api from '@/lib/api/client';
import { Product, Category, ProductDetail, SearchResponse, PageResult, ProductSearchDTO } from '@/shared/types/product';
import { dataTransformer } from '../lib/data-transformer';

/**
 * 商品模組 API 服務 (Product Service)
 * 嚴格遵循標準 RESTful 風格與後端 DTO 結構
 */
export const productService = {
    /**
     * 獲取商品分類樹
     * 對應後端: GET /api/categories/tree
     */
    async getCategoryTree(): Promise<Category[]> {
        // [Engineering Discipline] 移除 Mock 回退，實現 Fail-Fast
        const res = await api.get<Category[]>('products/categories/tree');
        return res;
    },

    /**
     * [New] 純數據庫商品列表查詢 (Direct DB Access)
     * 用於分類瀏覽，避免 Elasticsearch 索引延遲或參數不一致問題
     * 對應後端: GET /api/products
     */
    async listProducts(params: {
        categoryId?: number;
        page?: number;
        size?: number;
        sort?: string;
    }): Promise<PageResult<Product>> {
        const { page, size, ...cleanParams } = params;

        // 注意：這裡打的是 'products' 而不是 'search/products'
        // Spring Data Pageable 預設參數是 page, size (0-indexed or 1-indexed depends on logic, usually 0)
        // 但 Nameless Mall 似乎習慣用 1-indexed. Let's try passing page/size directly.

        const res = await api.get<any>('products', {
            params: {
                ...cleanParams,
                page: page || 1,
                size: size || 10
            }
        });

        // 兼容 PageResult 結構
        const content = Array.isArray(res.content) ? res.content :
            Array.isArray(res.records) ? res.records : // MyBatis-Plus logic
                Array.isArray(res) ? res : []; // Plain list logic

        return {
            content: content.map((p: any) => dataTransformer.transformProduct(p)),
            totalElements: res.totalElements || res.total || 0,
            size: res.size || size || 10,
            number: res.number || res.current || 1
        };
    },

    /**
     * 搜尋商品 (含分頁、過濾、排序)
     * 對應後端: GET /api/search/products
     */
    async searchProducts(params: {
        categoryId?: number;
        keyword?: string;
        tag?: string;      // 新增標籤支持
        page?: number;     // 1-indexed (前端用)
        size?: number;     // 每頁數量
        sort?: string;
        minPrice?: number;
        maxPrice?: number;
        brand?: string;
        attrs?: string;
    }): Promise<SearchResponse> {
        // [Logic] 強制數值取整，防止 500 解析錯誤 (對齊 v3.1 合約)
        const pageNum = Math.floor(Number(params.page || 1));
        const pageSize = Math.floor(Number(params.size || 15));

        // 清理參數：移除前端用的 page/size，避免干擾後端 pageNum/pageSize
        const { page, size, ...cleanParams } = params;

        // [Engineering Discipline] 移除 Catch 回退到 Mock 的邏輯，實現 Fail-Fast 並透傳真實錯誤
        const data = await api.get<any>('search/products', {
            params: { ...cleanParams, pageNum, pageSize }
        });

        // 對齊後端 SearchResponseVO (v3.1) 結構
        // 後端 VO 直接包含 products (List), total (Long), facets (SearchFacetsVO)
        const facets = data.facets;

        const mappedFacets = {
            categories: facets?.categories || [],
            tags: facets?.tags || [],
            priceStatistics: facets?.priceStatistics || { min: 0, max: 0 },
            attributes: facets?.attributes?.map((a: any) => ({
                attrId: a.attrId,
                attrName: a.attrName,
                attrValues: a.attrValues?.map((v: any) => ({
                    value: v.value,
                    count: v.count
                })) || []
            })) || []
        };

        // [Adapter Pattern] Map Backend DTO (ProductSearchDTO) to Frontend Domain (Product)
        const products = (data.products || []).map((p: any) => {
            // Type assertion for safety during mapping
            const dto = p as ProductSearchDTO;
            return dataTransformer.transformSearchDTO(dto);
        });

        return {
            products: products,
            total: data.total || 0,
            totalPages: data.totalPages || 0,
            pageNum: data.pageNum || pageNum,
            facets: mappedFacets
        };
    },

    /**
     * 獲取商品詳情
     * 對應後端: GET /api/products/:id
     */
    async getProductDetail(id: number): Promise<ProductDetail> {
        try {
            // [Truth Seeking] 這裡直接調用 API，不進行 Catch 回退，讓開發者看清 401/500 原因
            return await api.get<ProductDetail>(`products/${id}`);
        } catch (error) {
            // 僅保留日誌，不回退到 Mock
            console.error(`[ProductService] Failure for ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * 獲取相關商品 (推薦)
     */
    async getRelatedProducts(productId: number, limit: number = 4): Promise<Product[]> {
        return api.get<Product[]>(`/products/${productId}/related`, { params: { limit } });
    }
};
