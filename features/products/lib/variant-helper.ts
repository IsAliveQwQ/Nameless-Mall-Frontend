import { Variant } from '@/shared/types/product';

/**
 * 規格組合型別定義
 * Record<規格名稱, 選擇的值> (e.g. { "顏色": "曜石黑", "尺寸": "L" })
 */
export type SelectedOptions = Record<string, string>;

/**
 * 商品規格變體處理小幫手 (Pure Logic)
 * 負責處理複雜的 SKU 匹配與可選狀態計算
 */
export const variantHelper = {
    /**
     * 尋找完全匹配的變體 (SKU)
     */
    findMatchingVariant(variants: Variant[], selectedOptions: SelectedOptions): Variant | undefined {
        return variants.find(variant => {
            // 檢查該變體的所有選項是否與目前選擇一致
            return variant.options.every(opt =>
                selectedOptions[opt.optionName] === opt.optionValue
            );
        });
    },

    /**
     * 檢查特定規格選項是否「可選」
     * 用於前端置灰 (Disable) 不存在的組合，防止用戶選到「死胡同」
     * 
     * @param variants 所有可用變體
     * @param currentSelection 目前已選的組合
     * @param targetOptionName 正在判斷的規格 (e.g. "尺寸")
     * @param targetValue 正在判斷的數值 (e.g. "XL")
     */
    isOptionAvailable(
        variants: Variant[],
        currentSelection: SelectedOptions,
        targetOptionName: string,
        targetValue: string
    ): boolean {
        // 邏輯：假設用戶選了這個值，是否至少存在一個 SKU 滿足此條件（且包含其他已選條件）
        const prospectiveSelection = { ...currentSelection, [targetOptionName]: targetValue };

        return variants.some(variant => {
            // 檢查該 SKU 是否同時滿足 (已選中的其他規格) + (當前判斷的這個規格)
            return Object.entries(prospectiveSelection).every(([name, value]) => {
                const variantOpt = variant.options.find(o => o.optionName === name);
                return variantOpt?.optionValue === value;
            });
        });
    },

    /**
     * 從變體清單中提取所有唯一的規格與其對應的值
     * 用於渲染選擇按鈕組 (e.g. 顏色組: [黑, 白], 尺寸組: [S, M, L])
     */
    extractUniqueOptions(variants: Variant[]): Record<string, string[]> {
        const optionMap: Record<string, Set<string>> = {};

        variants.forEach(variant => {
            variant.options.forEach(opt => {
                if (!optionMap[opt.optionName]) {
                    optionMap[opt.optionName] = new Set();
                }
                optionMap[opt.optionName].add(opt.optionValue);
            });
        });

        // 轉回陣列輸出
        const result: Record<string, string[]> = {};
        for (const key in optionMap) {
            result[key] = Array.from(optionMap[key]);
        }
        return result;
    }
};
