import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth-api';
import { useAuthStore } from '../stores/auth-store';
import { LoginSchema, RegisterSchema } from '../schemas/auth-schema';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export const useAuth = () => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const loginMutation = useMutation({
        mutationFn: (data: LoginSchema) => authApi.login(data),
        onSuccess: (response: any) => {
            if (response && response.accessToken && response.user) {
                setAuth(response.accessToken, response.user);
                toast({
                    title: "登入成功",
                    description: "歡迎回來 Nameless Mall",
                });
                router.push('/');
            } else {
                console.error("Login response structure invalid:", response);
                toast({
                    variant: "destructive",
                    title: "系統錯誤",
                    description: "登入回應格式異常",
                });
            }
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "登入失敗",
                description: error.message || "發生未知錯誤，請稍後再試",
            });
        }
    });

    const registerMutation = useMutation({
        mutationFn: (data: RegisterSchema) => authApi.register(data),
        onSuccess: () => {
            toast({
                title: "註冊成功",
                description: "帳號已成功建立，請重新登入",
            });
            router.push('/login');
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "註冊失敗",
                description: error.message || "帳號重複或系統錯誤",
            });
        }
    });

    const logout = () => {
        clearAuth();
        localStorage.removeItem('accessToken');
        queryClient.clear();
        router.push('/login');
        toast({
            title: "已登出",
            description: "您已成功登出系統",
        });
    };

    return {
        login: loginMutation.mutate,
        isLoginPending: loginMutation.isPending,
        register: registerMutation.mutate,
        isRegisterPending: registerMutation.isPending,
        logout
    };
};
