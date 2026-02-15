import { create } from 'zustand';

interface QuickAddState {
    isOpen: boolean;
    activeProductId: number | null;
    openQuickAdd: (productId: number) => void;
    closeQuickAdd: () => void;
}

export const useQuickAddStore = create<QuickAddState>((set) => ({
    isOpen: false,
    activeProductId: null,
    openQuickAdd: (productId) => set({ isOpen: true, activeProductId: productId }),
    closeQuickAdd: () => set({ isOpen: false, activeProductId: null }),
}));
