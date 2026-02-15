'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cart-api';
import { useCartStore } from '../stores/cart-store';
import { useToast } from '@/components/ui/use-toast';
import { AddToCartInput, UpdateCartItemInput } from '@/shared/types/cart';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { Button } from '@/components/ui/button';

export const useCart = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuthStore();
    const {
        cart: storeCart,
        setCart,
        setOpen,
        optimisticRemoveItem,
        optimisticUpdateItem
    } = useCartStore();

    // 1. Fetch Cart
    const cartQuery = useQuery({
        queryKey: ['cart'],
        queryFn: async () => {
            const response = await cartApi.getCart();
            if (response) setCart(response);
            return response;
        },
        enabled: isAuthenticated,
    });

    // 2. Add Item Mutation
    const addItemMutation = useMutation({
        mutationFn: (data: AddToCartInput) => cartApi.addItem(data),
        onSuccess: (updatedCart) => {
            // 合併：保留既有項目的促銷資訊，避免 getCartQuick() 空白資料覆蓋
            if (storeCart?.items?.length) {
                const promoLookup = new Map(
                    storeCart.items.map(i => [i.variantId, i])
                );
                const mergedItems = updatedCart.items.map(item => {
                    const prev = promoLookup.get(item.variantId);
                    const missingPromoFromQuickResponse =
                        !item.promotionName &&
                        !item.promotionType &&
                        (item.discountAmount === undefined || item.discountAmount === null);

                    if (missingPromoFromQuickResponse && prev?.promotionName) {
                        return { ...item, promotionName: prev.promotionName, promotionType: prev.promotionType, discountAmount: prev.discountAmount, originalPrice: prev.originalPrice };
                    }
                    return item;
                });
                setCart({ ...updatedCart, items: mergedItems });
            } else {
                setCart(updatedCart);
            }
            setOpen(true);
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast({
                title: "已加入購物車",
                description: "商品已成功加入您的購物車",
            });
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "加入失敗",
                description: error.message || "無法加入購物車",
            });
        }
    });

    // 3. Update Item Mutation
    const updateItemMutation = useMutation({
        mutationFn: ({ variantId, data }: { variantId: number; data: UpdateCartItemInput }) =>
            cartApi.updateItem(variantId, data),
        onMutate: ({ variantId, data }) => {
            optimisticUpdateItem(variantId, data.quantity);
        },
        onSuccess: () => {
            // 不覆蓋 Zustand — 樂觀更新已保留促銷資料，refetch 取得完整計價
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
        onError: (error: any) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast({
                variant: "destructive",
                title: "更新失敗",
                description: error.message,
            });
        }
    });

    // 4. Remove Item Mutation
    const removeItemMutation = useMutation({
        mutationFn: (variantId: number) => cartApi.removeItems([variantId]),
        onMutate: (variantId) => {
            optimisticRemoveItem(variantId);
        },
        onSuccess: () => {
            // 不覆蓋 Zustand — 樂觀更新已保留其餘項目促銷資料，refetch 取得完整計價
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast({
                title: "已移除商品",
                description: "商品已從購物車中移除",
            });
        },
        onError: (error: any) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast({
                variant: "destructive",
                title: "移除失敗",
                description: error.message,
            });
        }
    });

    // Wrapped Actions
    const addItem = (data: AddToCartInput) => {
        if (!isAuthenticated) {
            toast({
                title: "請先登入",
                description: "登入後即可享受完整的購物體驗",
                // @ts-ignore - action accepts ReactNode
                action: React.createElement(Button, {
                    variant: "outline",
                    size: "sm",
                    onClick: () => window.location.href = '/login'
                }, "前往登入")
            });
            return;
        }
        addItemMutation.mutate(data);
    };

    const updateItem = (variantId: number, data: UpdateCartItemInput) => {
        if (!isAuthenticated) return;
        updateItemMutation.mutate({ variantId, data });
    };

    const removeItem = (variantId: number) => {
        if (!isAuthenticated) return;
        removeItemMutation.mutate(variantId);
    };

    return {
        cart: storeCart,
        isLoading: cartQuery.isLoading,
        addItem,
        updateItem,
        removeItem,
        isPending: addItemMutation.isPending || updateItemMutation.isPending || removeItemMutation.isPending
    };
};
