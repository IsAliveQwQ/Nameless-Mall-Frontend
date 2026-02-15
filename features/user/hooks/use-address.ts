import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressApi } from '../api/address-api';
import { AddressInput } from '@/shared/types/address';
import { useToast } from '@/components/ui/use-toast';

export function useAddress() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // 獲取所有地址
    const { data: addresses = [], isLoading, error } = useQuery({
        queryKey: ['addresses'],
        queryFn: () => addressApi.getAddresses(),
        staleTime: 1000 * 60 * 5, // 5分鐘
    });

    // 新增地址
    const createMutation = useMutation({
        mutationFn: (data: AddressInput) => addressApi.createAddress(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            toast({ title: "新增成功", description: "已成功新增收貨地址" });
        },
        onError: (err: any) => {
            toast({
                title: "新增失敗",
                description: err.message || "請檢查輸入格式是否正確",
                variant: "destructive"
            });
        }
    });

    // 修改地址
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: AddressInput }) =>
            addressApi.updateAddress(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            toast({ title: "修改成功", description: "已更新地址資訊" });
        },
        onError: (err: any) => {
            toast({
                title: "更新失敗",
                description: err.message || "更新地址時發生錯誤",
                variant: "destructive"
            });
        }
    });

    // 刪除地址
    const deleteMutation = useMutation({
        mutationFn: (id: number) => addressApi.deleteAddress(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            toast({ title: "刪除成功", description: "地址已移除" });
        },
        onError: (err: any) => {
            toast({
                title: "刪除失敗",
                description: err.message || "刪除地址時發生錯誤",
                variant: "destructive"
            });
        }
    });

    // 設為預設
    const setDefaultMutation = useMutation({
        mutationFn: (id: number) => addressApi.setDefaultAddress(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            toast({ title: "設定成功", description: "已將該地址設為預設" });
        },
        onError: (err: any) => {
            toast({
                title: "設定失敗",
                description: err.message || "無法變更預設地址",
                variant: "destructive"
            });
        }
    });

    return {
        addresses,
        isLoading,
        error,
        createAddress: createMutation.mutate,
        isCreating: createMutation.isPending,
        updateAddress: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        deleteAddress: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        setDefaultAddress: setDefaultMutation.mutate,
        isSettingDefault: setDefaultMutation.isPending,
    };
}
