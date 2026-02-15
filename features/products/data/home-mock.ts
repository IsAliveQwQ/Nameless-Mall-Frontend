import { Product } from '@/shared/types/product';

/**
 * 專業級搜尋回應規格 (對齊後端 Elasticsearch 實作)
 */
export interface SearchFilter {
    attrId: number; // 確保穩定性，不依賴字串名稱
    attrName: string;
    attrValues: {
        value: string;
        count: number;
    }[];
}

export interface SearchResponse {
    products: {
        content: Product[];
        totalPages: number;
        totalElements: number;
        size: number;
        number: number; // 對應前端當前頁碼 (0-indexed)
    };
    filters: {
        // 展示目前分類下的「子分類」以供下鑽 (Drill-down)
        categories: { id: number; name: string; count: number; image?: string }[];
        brands: { id: number; name: string; image: string }[];
        attributes: SearchFilter[];
        priceRange: {
            min: number;
            max: number;
        };
    };
}

/**
 * 1. 頂部 Hero 區塊模擬
 */
export const HOME_HERO = {
    title: "建築般的舒適感。",
    subtitle: "專為現代生活空間設計，精準工藝與有機溫度的完美結合。",
    tag: "2024 全新系列",
    image: "/images/hero/hero-main.jpg",
};

/**
 * 2. 五大核心分類 (導覽與首頁入口)
 */
export const MAIN_CATEGORIES = [
    { id: 1, name: "座椅系列", code: "STNG-ICON", itemCount: 142, image: "/images/products/rey_chair_full.png" },
    { id: 2, name: "桌幾系列", code: "TBL-ARCH", itemCount: 86, image: "/images/products/architectural_table_full.png" },
    { id: 3, name: "燈飾系列", code: "LGT-GLOW", itemCount: 43, image: "/images/products/designer_lamp_full.png" },
    { id: 4, name: "織品系列", code: "TEX-SOFT", itemCount: 12, image: "/images/products/textile_detail.png" },
    { id: 5, name: "生活家飾", code: "DCR-OBJ", itemCount: 21, image: "/images/products/string-shelf.jpg" },
];

/**
 * 3. 模擬「座椅系列」的分類搜尋回應 (具備多維度規格)
 */
export const SEATING_CATEGORY_MOCK: SearchResponse = {
    products: {
        content: [
            {
                id: 1,
                categoryId: 1,
                categoryName: "座椅系列",
                name: "Rey 經典實木單椅",
                title: "溫潤實心橡木 / 經久耐用的工藝標誌",
                thumbnail: "/images/products/rey_chair_full.png",
                mainImage: "/images/products/rey_chair_full.png",
                price: 850,
                originalPrice: 1100,
                stock: 12,
                status: 1,
                sales: 124,
                publishedAt: "2026-01-20T10:00:00Z",
                tags: ["SOLID_WOOD", "NEW_ARRIVAL"],
                isNew: true,
                attrs: [{ attrId: 1, attrName: "材質", attrValue: "橡木" }]
            },
            {
                id: 2,
                categoryId: 1,
                categoryName: "座椅系列",
                name: "Pacha 雲頂休閒椅",
                title: "頂級圈圈紗織物 / 彷彿置身雲端的舒適感",
                thumbnail: "/images/products/pacha_lounge_full.png",
                mainImage: "/images/products/pacha_lounge_full.png",
                price: 2100,
                originalPrice: 2100,
                stock: 5,
                status: 1,
                sales: 58,
                publishedAt: "2026-01-20T10:00:00Z",
                tags: ["PREMIUM_FABRIC", "ICONIC"],
                isNew: true,
                attrs: [{ attrId: 1, attrName: "材質", attrValue: "圈圈紗布料" }]
            },
            {
                id: 3,
                categoryId: 1,
                categoryName: "座椅系列",
                name: "Mags Soft 模組沙發",
                title: "Kvadrat 頂級織物 / 建築感與柔延感的平衡",
                thumbnail: "/images/products/modular_sofa_heavy.png",
                mainImage: "/images/products/modular_sofa_heavy.png",
                price: 3400,
                originalPrice: 4200,
                stock: 2,
                status: 1,
                sales: 15,
                publishedAt: "2026-01-20T10:00:00Z",
                tags: ["MODULAR", "LIVING_ROOM"],
                isNew: true,
                attrs: [{ attrId: 1, attrName: "材質", attrValue: "織物" }]
            },
            {
                id: 4,
                categoryId: 1,
                categoryName: "座椅系列",
                name: "Outline 經典三人沙發",
                title: "俐落輪廓 / 經典建築美學再現",
                thumbnail: "/images/products/classic_sofa_full.png",
                mainImage: "/images/products/classic_sofa_full.png",
                price: 2850,
                originalPrice: 3200,
                stock: 4,
                status: 1,
                sales: 42,
                publishedAt: "2026-01-20T10:00:00Z",
                tags: ["CLASSIC", "ARCHITECTURAL"],
                isNew: false,
                attrs: [{ attrId: 1, attrName: "材質", attrValue: "羊毛織物" }]
            }
        ],
        totalPages: 16, // 修正：142 / 9 = 15.7 -> 16
        totalElements: 142,
        size: 9,
        number: 0
    },
    filters: {
        categories: [
            { id: 11, name: "模組沙發", count: 21 },
            { id: 12, name: "經典沙發", count: 18 },
            { id: 13, name: "休閒長發", count: 15 },
            { id: 14, name: "日用床沙發", count: 10 }
        ],
        brands: [
            { id: 1, name: "HAY", image: "/images/brands/hay-iconic.jpg" },
            { id: 2, name: "&Tradition", image: "/images/brands/and-tradition-iconic.jpg" },
            { id: 3, name: "GUBI", image: "/images/brands/gubi-iconic.jpg" }
        ],
        attributes: [
            {
                attrId: 1,
                attrName: "材質",
                attrValues: [
                    { value: "橡木", count: 64 },
                    { value: "胡桃木", count: 32 },
                    { value: "拉絲鋼", count: 18 },
                    { value: "圈圈紗布料", count: 12 }
                ]
            },
            {
                attrId: 2,
                attrName: "配色",
                attrValues: [
                    { value: "原木色", count: 45 },
                    { value: "曜石黑", count: 22 },
                    { value: "珍珠白", count: 15 },
                    { value: "霧灰色", count: 30 }
                ]
            }
        ],
        priceRange: {
            min: 150,
            max: 8500
        }
    }
};

/**
 * 4. 首頁「最新上架」簡單清單
 */
export const HOME_NEW_ARRIVALS: Product[] = SEATING_CATEGORY_MOCK.products.content;
