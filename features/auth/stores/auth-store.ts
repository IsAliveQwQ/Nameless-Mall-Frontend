import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/shared/types/user';

interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    user: User | null;
    _hasHydrated: boolean;

    // Actions
    setAuth: (token: string, user: User) => void;
    setToken: (token: string) => void; // 用於 OAuth callback 流程，先設定 Token 後獲取 User
    clearAuth: () => void;
    updateUser: (user: Partial<User>) => void;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            token: null,
            user: null,
            _hasHydrated: false,

            setAuth: (token, user) =>
                set({ isAuthenticated: true, token, user }),

            setToken: (token) =>
                set({ token, isAuthenticated: !!token }),

            clearAuth: () =>
                set({ isAuthenticated: false, token: null, user: null }),

            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null
                })),

            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: 'auth-storage', // localStorage key
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setHasHydrated(true);
                }
            },
        }
    )
);
