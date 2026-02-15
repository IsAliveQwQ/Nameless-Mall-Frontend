import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UiState {
    theme: 'light' | 'dark';
    isSidebarOpen: boolean;

    // Actions
    setTheme: (theme: 'light' | 'dark') => void;
    toggleSidebar: () => void;
    closeSidebar: () => void;
}

export const useUiStore = create<UiState>()(
    persist(
        (set) => ({
            theme: 'light',
            isSidebarOpen: false,

            setTheme: (theme) => set({ theme }),
            toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
            closeSidebar: () => set({ isSidebarOpen: false }),
        }),
        {
            name: 'ui-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ theme: state.theme }), // 只持久化主題，Sidebar 狀態不持久化
        }
    )
);
