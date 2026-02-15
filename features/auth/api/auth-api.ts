import api from '@/lib/api/client';
import { LoginInput, RegisterInput, UserAuth } from '@/shared/types/auth';

export const authApi = {
    login: (data: LoginInput) => {
        return api.post<UserAuth>('/auth/login', data);
    },

    register: (data: RegisterInput) => {
        return api.post<any>('/users', data);
    },

    // Optional: Verify token / Refresh token if implemented backend side
};
