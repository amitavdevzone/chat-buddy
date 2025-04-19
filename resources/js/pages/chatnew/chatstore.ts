import { create } from 'zustand';

type ChatStore = {
  isSettingDrawerOpen: boolean;
  toggleSettingDrawer: () => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  isSettingDrawerOpen: false,
  toggleSettingDrawer: () => set((state) => ({ isSettingDrawerOpen: !state.isSettingDrawerOpen })),
}));
