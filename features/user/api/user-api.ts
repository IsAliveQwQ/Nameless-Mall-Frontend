import api from '@/lib/api/client';
import { User, RegisterInput, UserUpdateInput, PasswordChangeInput, Address, AddressCreateInput } from '@/shared/types/user';

export const userApi = {
    // User Profile
    // POST /users - Register is usually public, but put here for cohesion
    register: (data: RegisterInput) => {
        return api.post<User>('/users', data);
    },

    getProfile: () => {
        return api.get<User>('/users/me');
    },

    updateProfile: (data: UserUpdateInput) => {
        return api.put<User>('/users/me', data);
    },

    changePassword: (data: PasswordChangeInput) => {
        return api.put<void>('/users/me/password', data);
    },

    // Address Management
    getAddresses: () => {
        return api.get<Address[]>('/users/me/addresses');
    },

    addAddress: (data: AddressCreateInput) => {
        return api.post<Address>('/users/me/addresses', data);
    },

    updateAddress: (id: string, data: AddressCreateInput) => {
        return api.put<Address>(`/users/me/addresses/${id}`, data);
    },

    deleteAddress: (id: string) => {
        return api.delete<void>(`/users/me/addresses/${id}`);
    },

    setDefaultAddress: (id: string) => {
        return api.put<void>(`/users/me/addresses/${id}/default`);
    }
};
