import { create } from 'zustand';
import { Conversation } from '../../types';

type ChatStore = {
  isSettingDrawerOpen: boolean;
  toggleSettingDrawer: () => void;

  models: string[];
  setModelList: (models: string[]) => void;

  selectedModel: string;
  setSelectedModel: (model: string) => void;

  currentConversation: Conversation | null;
  setCurrentConversation: (conversation: Conversation | null) => void;

  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  isSettingDrawerOpen: false,
  toggleSettingDrawer: () => set((state) => ({ isSettingDrawerOpen: !state.isSettingDrawerOpen })),

  models: [],

  selectedModel: '',
  setSelectedModel: (model: string) => set({ selectedModel: model }),

  setModelList: (models: string[]) => set({ models: models }),

  currentConversation: null,
  setCurrentConversation: (conversation: Conversation | null) => set({ currentConversation: conversation }),

  conversations: [],
  setConversations: (conversations: Conversation[]) => set({ conversations: conversations }),
}));
