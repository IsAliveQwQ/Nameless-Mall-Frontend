import { Product, Variant } from './product';

/**
 * 購物車項目介面
 * 對應 CartItemDTO
 */
export interface CartItem {
    id: number;              // 購物車項目 ID
    productId: number;       // 商品 ID
    variantId: number;       // 規格 ID (SKU ID)
    productName: string;     // 商品名稱 (快照)
    skuCode: string;         // SKU 編號 (e.g. "P1001-RED-L")
    specInfo?: string;       // 規格資訊 (e.g. "顏色: 紅色, 尺寸: L")
    price: number;           // 當下單價
    quantity: number;        // 購買數量
    productImage: string;    // 商品圖片 (相容欄位)
    productPic?: string;     // 商品圖片 (後端 DTO 原生欄位)
    promotionName?: string;  // [New] 促銷名稱
    promotionType?: string;  // [New] 促銷類型 (FLASH_SALE, CAMPAIGN)
    originalPrice?: number;  // [New] 原價
    discountAmount?: number; // [New] 折扣金額


    // 關聯物件 (Optional, 用於前端顯示詳情)
    product?: Product;
    variant?: Variant;
}

/**
 * 購物車介面
 * 對應 CartDTO
 */
export interface Cart {
    id?: string;             // 購物車 ID (Redis Key 或 DB ID)
    items: CartItem[];       // 項目列表
    totalAmount: number;     // 總金額 (後端計算)
    totalQuantity: number;    // 總項數
}

/**
 * 加入購物車請求物件
 */
export interface AddToCartInput {
    productId: number;
    variantId: number;
    quantity: number;
}

/**
 * 更新購物車請求物件
 */
export interface UpdateCartItemInput {
    quantity: number;
}
