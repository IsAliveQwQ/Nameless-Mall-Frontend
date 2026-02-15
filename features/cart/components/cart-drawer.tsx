'use client';

import { ShoppingCart, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetClose
} from '@/components/ui/sheet'; // 確保這些依賴已經存在
import { useCart } from '../hooks/use-cart';
import { useCartStore } from '../stores/cart-store';
import { CartItem } from './cart-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link as CustomLink } from 'lucide-react'; // Typo? It should be NEXT Link. Let me correct this.
import Link from 'next/link';
import { useCartPriceCalculation } from '../hooks/use-cart-price';

export const CartDrawer = () => {
    const { cart } = useCart();
    const { isOpen, setOpen } = useCartStore();

    // [Industrial Logic] 注入價格計算 Hook，確保顯示最新促銷價 (Priority: Flash Sale > Promotion > MSRP)
    const {
        calculatedItems: items,
        totalAmount: subtotal,
        totalDiscount
    } = useCartPriceCalculation(cart?.items);

    const itemCount = cart?.totalQuantity || 0;

    return (
        <Sheet open={isOpen} onOpenChange={setOpen}>
            <SheetContent
                side="right"
                showClose={false}
                className="flex w-full sm:!w-[500px] !max-w-[100vw] flex-col bg-white p-0 h-full overflow-hidden shadow-2xl border-l border-[#E4E4E7] antialiased"
            >
                {/* Header - 完全回歸 HTML 原型之份量感 */}
                <div className="flex items-center justify-between px-6 py-6 border-b border-[#E4E4E7] bg-white">
                    <div className="flex items-baseline gap-3">
                        <SheetTitle className="!text-[#18181B] !text-2xl !font-bold tracking-tight">
                            購物車
                        </SheetTitle>
                        <span className="text-zinc-400 font-mono text-sm font-bold">
                            [ {itemCount.toString().padStart(2, '0')} ]
                        </span>
                    </div>
                    {/* 自定義 Close 按鈕 - 與設計軸線對齊 */}
                    <SheetClose className="text-zinc-400 hover:text-zinc-950 transition-all p-2 -mr-2 rounded-full hover:bg-zinc-50">
                        <X className="h-6 w-6 stroke-[1.5px]" />
                    </SheetClose>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative">
                    {itemCount > 0 ? (
                        <ScrollArea className="h-full w-full">
                            <div className="flex flex-col gap-8 p-6">
                                {items.map((item) => (
                                    <CartItem key={item.variantId} item={item} />
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white space-y-4">
                            <ShoppingCart className="h-12 w-12 text-zinc-100 stroke-[1px]" />
                            <h3 className="text-base font-bold text-zinc-950 tracking-wider">您的購物車目前是空的</h3>
                            <SheetClose asChild>
                                <Button className="mt-4 bg-[#334155] text-white px-8 font-bold" asChild>
                                    <Link href="/products">去逛逛</Link>
                                </Button>
                            </SheetClose>
                        </div>
                    )}
                </div>

                {/* Footer - 極致份量感與高級感按鈕 */}
                {itemCount > 0 && (
                    <div className="border-t border-[#E4E4E7] p-8 bg-white space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1 text-sm text-zinc-500">
                                <span>商品總計</span>
                                {/* Original Price Sum = Subtotal (Discounted) + Total Discount */}
                                <span className="font-mono">$ {(subtotal + totalDiscount).toLocaleString()}</span>
                            </div>

                            {totalDiscount > 0 && (
                                <div className="flex justify-between items-center px-1 text-sm text-[#FF4D4F]">
                                    <span>活動折扣</span>
                                    <span className="font-mono">-${totalDiscount.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center px-1 pt-3 border-t border-dashed border-zinc-200">
                                <span className="text-[#18181B] font-bold text-base">小計</span>
                                <span className="text-[#18181B] font-mono text-2xl font-bold tracking-tighter">
                                    $ {subtotal.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <SheetClose asChild>
                                <Button
                                    size="lg"
                                    /* 校準更具質感的 Slate 色系，並確保文字夠粗 */
                                    className="w-full !bg-[#334155] !text-white h-14 rounded-md !font-bold text-[15px] tracking-widest transition-all shadow-md hover:!bg-[#1e293b] active:scale-[0.98] flex items-center justify-center gap-3"
                                    asChild
                                >
                                    <Link href="/checkout">
                                        前往結帳
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>
                                </Button>
                            </SheetClose>
                            <SheetClose asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full text-zinc-400 hover:text-zinc-950 h-10 text-sm font-bold tracking-[0.1em] transition-colors"
                                    asChild
                                >
                                    <Link href="/cart">查看完整清單</Link>
                                </Button>
                            </SheetClose>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};
