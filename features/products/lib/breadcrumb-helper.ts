import { Category } from '@/shared/types/product';

export interface BreadcrumbItem {
    id: number;
    name: string;
    href: string;
}

/**
 * 麵包屑尋路小幫手
 * 負責在樹狀結構中遞迴尋找指定分類路徑
 */
export const breadcrumbHelper = {
    /**
     * 尋找路徑 (從根節點到目標節點)
     * @param categories 目錄樹
     * @param targetId 目標分類 ID
     * @param currentPath 當前路徑緩存 (用於遞迴)
     */
    findPath(
        categories: Category[],
        targetId: number,
        currentPath: BreadcrumbItem[] = []
    ): BreadcrumbItem[] | null {
        for (const cat of categories) {
            const newPath = [
                ...currentPath,
                { id: cat.id, name: cat.name, href: `/products?categoryId=${cat.id}` }
            ];

            if (cat.id === targetId) {
                return newPath;
            }

            if (cat.children && cat.children.length > 0) {
                const found = this.findPath(cat.children, targetId, newPath);
                if (found) return found;
            }
        }
        return null;
    }
};
