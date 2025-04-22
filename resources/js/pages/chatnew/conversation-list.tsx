import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useChatStore } from './chatstore';

export default function ConversationList() {
  const conversations = useChatStore((state) => state.conversations);
  const setConversations = useChatStore((state) => state.setConversations);
  const setCurrentConversation = useChatStore((state) => state.setCurrentConversation);

  const [dropdownOpenId, setDropdownOpenId] = useState<number | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);

  const deleteConversation = (id: number) => {
    setConversations(conversations.filter((conv) => conv.id !== id));
    if (selectedConversationId === id && conversations.length > 1) {
      setSelectedConversationId(conversations[0].id);
    }
  };

  const renameConversation = (id: number, newTitle: string) => {
    setConversations(conversations.map((conv) => (conv.id === id ? { ...conv, title: newTitle } : conv)));
  };

  const setSelectedConversation = (id: number) => {
    // handle if the same conversation is selected again to deselect it
    if (selectedConversationId === id) {
      setSelectedConversationId(null);
      setCurrentConversation(null);
      return;
    }

    // this is to set the selected conversation
    // if the conversation is not found, we can set it to null
    const selectedConv = conversations.find((conv) => conv.id === id);
    if (selectedConv) {
      setSelectedConversationId(selectedConv.id);
      setCurrentConversation(selectedConv);
    } else {
      console.log('Selected conversation not found');
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="p-4">
        <h2 className="mb-4 text-lg font-semibold">Conversations</h2>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="space-y-2 px-4 pb-4">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 ${
                selectedConversationId === conv.id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setSelectedConversation(conv.id)}
            >
              <span className="w-36 truncate">{conv.name}</span>
              <div className="relative">
                <MoreVertical
                  size={16}
                  className="cursor-pointer text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpenId(dropdownOpenId === conv.id ? null : conv.id);
                  }}
                />
                {dropdownOpenId === conv.id && (
                  <div className="absolute right-0 z-10 mt-2 w-32 rounded-md border border-gray-200 bg-white shadow-md dark:border-gray-600 dark:bg-gray-700">
                    <div
                      className="flex cursor-pointer items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newTitle = prompt('Rename conversation', conv.name);
                        if (newTitle) renameConversation(conv.id, newTitle);
                        setDropdownOpenId(null);
                      }}
                    >
                      <Pencil size={14} className="mr-2" /> Rename
                    </div>
                    <div
                      className="flex cursor-pointer items-center px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                        setDropdownOpenId(null);
                      }}
                    >
                      <Trash2 size={14} className="mr-2" /> Delete
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
