import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/user-api';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@/shared/types/user';

export const useUser = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { updateUser: updateStoreUser } = useAuthStore();

    // 獲取個人資料
    const { data: user, isLoading, error, refetch } = useQuery({
        queryKey: ['user', 'me'],
        queryFn: async () => {
            return await userApi.getProfile();
        },
        retry: false,
        staleTime: 1000 * 60 * 5, // 5分鐘內不重新獲取
    });

    // 更新資料 Mutation
    const updateProfileMutation = useMutation({
        mutationFn: (data: Partial<User>) => userApi.updateProfile(data),
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(['user', 'me'], updatedUser);
            // 這裡保留 Store 更新是合理的，因為這是用戶主動觸發的寫入操作，且只執行一次
            updateStoreUser(updatedUser);
            toast({
                title: "更新成功",
                description: "個人資料已更新",
            });
        },
        onError: (error: any) => {
            toast({
                variant: 'destructive',
                title: "更新失敗",
                description: error.message,
            });
        }
    });

    return {
        user,
        isLoading,
        error,
        refetch,
        updateProfile: updateProfileMutation.mutate,
        isUpdating: updateProfileMutation.isPending
    };
};
