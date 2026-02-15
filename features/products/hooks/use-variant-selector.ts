import { useState, useMemo } from 'react';
import { Variant } from '@/shared/types/product';
import { variantHelper, SelectedOptions } from '../lib/variant-helper';

/**
 * Hook: 商品規格選擇器邏輯
 * 嚴格管理規格選中狀態、匹配 SKU 與庫存檢查
 */
export function useVariantSelector(variants: Variant[]) {
    // 1. 已選中的規格 (e.g. { "材質": "橡木", "尺寸": "W55" })
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});

    // 2. 提取所有可能的規格按鈕組
    const allUniqueOptions = useMemo(() =>
        variantHelper.extractUniqueOptions(variants),
        [variants]);

    // 3. 當前選擇對應的特定變體 (SKU)
    const selectedVariant = useMemo(() =>
        variantHelper.findMatchingVariant(variants, selectedOptions),
        [variants, selectedOptions]);

    /**
     * 切換選擇項
     */
    const toggleOption = (name: string, value: string) => {
        setSelectedOptions(prev => {
            if (prev[name] === value) {
                // 如果點選已選中的，則取消選中
                const next = { ...prev };
                delete next[name];
                return next;
            }
            return { ...prev, [name]: value };
        });
    };

    /**
     * 判斷特定按鈕是否應該被 Disable (避免無效組合)
     */
    const isOptionDisabled = (name: string, value: string) => {
        // 如果該選項選了之後，沒有任何一個變體能滿足，則 Disable
        return !variantHelper.isOptionAvailable(variants, selectedOptions, name, value);
    };

    /**
     * 重置所有選擇
     */
    const resetSelection = () => setSelectedOptions({});

    return {
        selectedOptions,
        setSelectedOptions,
        toggleOption,
        selectedVariant,
        allUniqueOptions,
        isOptionDisabled,
        resetSelection,
        // 是否已選齊所有必要規格
        isFullySelected: Object.keys(selectedOptions).length === Object.keys(allUniqueOptions).length,
    };
}
