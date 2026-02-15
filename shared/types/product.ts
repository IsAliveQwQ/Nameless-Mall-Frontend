/**
 * 商品相關型別定義 (DTO Mirroring)
 * 對應後端 product-api 模組與 SQL Schema: docs/backend/schema.sql
 */

/**
 * 商品分類 (Categories)
 */
export interface Category {
    id: number;
    name: string;
    parentId: number;    // 對應 parent_id, 預設 0
    level: number;       // 對應 level, 預設 1
    sortOrder: number;   // 對應 sort_order
    icon?: string;       // 圖標 URL
    status: number;      // 狀態: 1=正常, 0=停用
    children?: Category[]; // 遞迴結構 (前端擴展)
}

/**
 * 商品基礎資訊 (SPU - Products)
 */
export interface Product {
    id: number;
    categoryId: number;  // 對應 category_id
    categoryName?: string; // DTO 擴展欄位
    name: string;
    title?: string;      // 副標題/促銷語
    description?: string; // 商品描述 (Text)
    price: number;       // 售價 (SPU 展示價)
    originalPrice: number; // 原價 (用於顯示折扣)
    stock: number;       // 總庫存
    mainImage: string;   // 對應 main_image URL
    thumbnail: string;   // 縮圖 URL (用於列表展示)
    publishedAt: string; // 對應 published_at (ISO String)
    status: number;      // 狀態: 1=上架, 0=下架
    sales: number;       // 銷量
    tags?: string[];     // 對應 Tags 表關聯
    isNew?: boolean;     // UI 標籤
    brandName?: string;  // [Search Engine] 品牌名稱
    skus?: any[];        // [Search Engine] 簡化版 SKU 列表
    promotionName?: string; // [New] 促銷活動名稱
    promotionType?: string; // [New] 促銷類型 (FLASH_SALE, CAMPAIGN)

    // 列表快照屬性 (用於列表頁展示核心參數)
    attrs?: Array<{
        attrId: number;
        attrName: string;
        attrValue: string;
    }>;
}

/**
 * [Backend Mirror] 搜尋結果 DTO
 * 對應后端 com.nameless.mall.search.api.vo.ProductSearchVO
 */
export interface ProductSearchDTO {
    id: number;
    name: string;
    title?: string;      // subTitle
    categoryId: number;
    categoryName?: string;
    brandName?: string;
    price: number;
    originalPrice?: number;
    salesCount?: number; // Backend uses salesCount
    stock?: number;
    mainImage: string;
    skus?: string[];     // List<String>
    tags?: string[];
    publishedAt?: string;
}

/**
 * 商品詳情 (Detail View)
 */
export interface ProductDetail extends Product {
    images: string[];    // 對應 product_images 表的所有 URL
    variants: Variant[]; // 對應 variants 表的所有變體 (SKU)
    // [New] 展現用的規格聚合，用於渲染 Selector
    displayOptions?: Record<string, string[]>;
}

export interface ProductAttribute {
    name: string;
    value: string;
}

/**
 * 商品規格變體 (SKU - Variants)
 */
export interface Variant {
    id: number;
    productId: number;   // 對應 product_id
    sku: string;         // 對應 sku 編碼
    name?: string;       // 變體名稱 (e.g. "曜石黑 / 大")
    price: number;       // 該規格的具體售價
    originalPrice?: number; // 該規格的原價 (MSRP)
    stock: number;       // 該規格的庫存
    image?: string;      // 該規格的專屬圖片
    // 規格選項 (對應 variant_options 表)
    options: Array<{
        optionName: string;  // e.g. "顏色"
        optionValue: string; // e.g. "曜石黑"
    }>;
}

/**
 * 高級篩選器屬性 (Facets)
 */
export interface SearchFilter {
    attrId: number;
    attrName: string;
    attrValues: Array<{
        value: string;
        count: number;
    }>;
}

/**
 * 專業級搜尋回應 (Search Engine / List Page Output)
 * 分頁結果通用結構
 */
export interface PageResult<T> {
    content: T[];
    totalElements: number;
    size: number;
    number: number;      // 當前頁碼 (0-indexed)
}

/**
 * 商品搜尋回應 (專業版 - 支援 Facets 聚合)
 * 對接後端 SearchResponseVO (工業級版本)
 */
export interface SearchResponse {
    /** 商品列表 (ES 扁平結構) */
    products: Product[];

    /** 總命中筆數 (Elasticsearch total hits) */
    total: number;

    /** 總頁數 */
    totalPages: number;

    /** 當前頁碼 (1-indexed) */
    pageNum: number;

    /** Elasticsearch 聚合資訊 (側邊欄篩選數據) */
    facets: {
        /** 分類聚合 */
        categories?: Array<{ id: number; name: string; count: number }>;

        /** 標籤聚合 */
        tags?: Array<{ name: string; count: number }>;

        /** 價格統計聚合 */
        priceStatistics?: {
            min: number;
            max: number;
            count?: number;
        };

        /** 規格屬性聚合 (動態) */
        attributes?: Array<{
            attrId: number;
            attrName: string;
            attrValues: Array<{
                value: string;
                count: number;
            }>;
        }>;
    };
}
