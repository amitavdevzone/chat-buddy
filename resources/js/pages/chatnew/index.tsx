import 'highlight.js/styles/github-dark.css';
import { Settings2 } from 'lucide-react';
import { useEffect } from 'react';
import { Conversation } from '../../types';
import ChatBox from './chat-box';
import { ChatMessages } from './chat-messages';
import ChatSettings from './chat-settings';
import { useChatStore } from './chatstore';
import ConversationList from './conversation-list';
import ModelSelector from './model-selector';

export default function ChatUI({ models, defaultModel, conversations }: { models: string[]; defaultModel: string; conversations: Conversation[] }) {
  const setModelList = useChatStore((state) => state.setModelList);
  const setSelectedModel = useChatStore((state) => state.setSelectedModel);
  const setCurrentConversation = useChatStore((state) => state.setCurrentConversation);
  const setConversations = useChatStore((state) => state.setConversations);

  const toggleSettingDrawer = useChatStore((state) => state.toggleSettingDrawer);

  useEffect(() => {
    setSelectedModel(defaultModel);
    setModelList(models);
    setConversations(conversations);
    setCurrentConversation(null);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="flex-shrink-0">
        <ConversationList />
      </div>

      <div className="flex flex-1 flex-col overflow-auto">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="ml-auto flex items-center space-x-3">
            <ModelSelector />
            <Settings2
              className="cursor-pointer text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              onClick={() => toggleSettingDrawer()}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-auto">
          <ChatMessages />
          <ChatBox />
        </div>

        <ChatSettings />
      </div>
    </div>
  );
}
