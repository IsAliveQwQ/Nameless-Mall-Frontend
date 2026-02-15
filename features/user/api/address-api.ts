import api from '@/lib/api/client';
import { Address, AddressInput } from '@/shared/types/address';

export const addressApi = {
    // 獲取地址列表
    getAddresses: async (): Promise<Address[]> => {
        return await api.get('/users/me/addresses');
    },

    // 新增地址
    createAddress: async (data: AddressInput): Promise<Address> => {
        return await api.post('/users/me/addresses', data);
    },

    // 修改地址
    updateAddress: async (id: number, data: AddressInput): Promise<Address> => {
        return await api.put(`/users/me/addresses/${id}`, data);
    },

    // 刪除地址
    deleteAddress: async (id: number): Promise<void> => {
        return await api.delete(`/users/me/addresses/${id}`);
    },

    // 設為預設地址
    setDefaultAddress: async (id: number): Promise<void> => {
        return await api.put(`/users/me/addresses/${id}/default`);
    }
};
