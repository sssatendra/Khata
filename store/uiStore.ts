import { create } from "zustand";

interface UIState {
  bottomSheetVisible: boolean;
  showBottomSheet: () => void;
  hideBottomSheet: () => void;
  deleteConfirmVisible: boolean;
  showDeleteConfirm: () => void;
  hideDeleteConfirm: () => void;
  confirmActionId?: string;
  setConfirmActionId: (id?: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterRiskLevel: "all" | "low" | "medium" | "high";
  setFilterRiskLevel: (level: "all" | "low" | "medium" | "high") => void;
}

export const useUIStore = create<UIState>((set) => ({
  bottomSheetVisible: false,
  showBottomSheet: () => set(() => ({ bottomSheetVisible: true })),
  hideBottomSheet: () => set(() => ({ bottomSheetVisible: false })),
  deleteConfirmVisible: false,
  showDeleteConfirm: () => set(() => ({ deleteConfirmVisible: true })),
  hideDeleteConfirm: () => set(() => ({ deleteConfirmVisible: false })),
  confirmActionId: undefined,
  setConfirmActionId: (id) => set(() => ({ confirmActionId: id })),
  searchQuery: "",
  setSearchQuery: (query) => set(() => ({ searchQuery: query })),
  filterRiskLevel: "all",
  setFilterRiskLevel: (level) => set(() => ({ filterRiskLevel: level })),
}));
