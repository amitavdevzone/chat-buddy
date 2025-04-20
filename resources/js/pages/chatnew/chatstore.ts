import { create } from 'zustand';

type ChatStore = {
  isSettingDrawerOpen: boolean;
  toggleSettingDrawer: () => void;

  models: string[];
  setModelList: (models: string[]) => void;

  selectedModel: string;
  setSelectedModel: (model: string) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  isSettingDrawerOpen: false,
  toggleSettingDrawer: () => set((state) => ({ isSettingDrawerOpen: !state.isSettingDrawerOpen })),

  models: [],

  selectedModel: '',
  setSelectedModel: (model: string) => set({ selectedModel: model }),

  setModelList: (models: string[]) => set({ models: models }),
}));
