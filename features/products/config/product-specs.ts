/**
 * 商品靜態規格配置 (UI 增強數據)
 * 用於存放不需要由後端搜尋或頻繁變動的質感敘述文字
 */
export interface StaticProductSpec {
    fullDescription: string;
    features: Array<{ title: string; content: string }>;
    technicalSpecs: Array<{ label: string; value: string }>;
    certifications?: string[];
    origin?: string;
}

export const PRODUCT_STATIC_SPECS: Record<number, StaticProductSpec> = {
    1: {
        fullDescription: "Rey Chair 最初由 Bruno Rey 於 1971 年設計，是瑞士設計史上最成功的椅子之一。這款重新推出的版本保留了標誌性的統一輪廓和創新的無螺絲金屬木連接結構。",
        features: [
            {
                title: "獨特結構",
                content: "其獨特的結構特點在於壓鑄鋁製控制台與實木椅腿的結合，無需任何螺絲即可將其固定在座面下方，提供了卓越的強度和耐用性。"
            },
            {
                title: "舒適體驗",
                content: "有機的圓角設計不僅視覺上柔和，觸感也極為舒適。寬大的座面和弧形靠背為使用者提供了極佳的支撐。"
            }
        ],
        technicalSpecs: [
            { label: "材質", value: "實心櫸木 (FSC 認證)" },
            { label: "連接系統", value: "壓鑄鋁 / 專利無螺絲系統" },
            { label: "淨重", value: "6.3 kg" }
        ],
        certifications: ["EN 16139:2013 L2", "ANSI/BIFMA X5.1"],
        origin: "歐洲製造 (Made in Europe)"
    }
};
