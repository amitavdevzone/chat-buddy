// Full updated component with Shift+Enter support and textarea resizing
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { BotMessageSquare, MoreVertical, Pencil, Send, Settings2, Trash2, UserCircle2 } from 'lucide-react';
import MarkdownIt from 'markdown-it';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Conversation, Message } from '../../types';
import ChatSettings from './chat-settings';
import { useChatStore } from './chatstore';
import ModelSelector from './model-selector';

const mdParser: any = new MarkdownIt({
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`;
      } catch (_) {}
    }
    return `<pre class="hljs"><code>${mdParser.utils.escapeHtml(str)}</code></pre>`;
  },
});

export default function ChatUI({ models, defaultModel }: { models: string[]; defaultModel: string }) {
  const setModelList = useChatStore((state) => state.setModelList);
  const setSelectedModel = useChatStore((state) => state.setSelectedModel);
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      name: 'Weather Inquiry',
      messages: [
        { id: 1, sender_type: 'agent', message: 'Hi! How can I help you today?', user_id: 1, conversation_id: 1 },
        { id: 2, sender_type: 'user', message: 'What’s the weather like today?', user_id: 1, conversation_id: 1 },
        { id: 3, sender_type: 'agent', message: 'I do not have access to a weather tool to answer that.', user_id: 1, conversation_id: 1 },
      ],
      user_id: 0,
      created_at: '',
      updated_at: '',
    },
    {
      id: 2,
      name: 'Joke Request',
      messages: [{ id: 1, sender_type: 'agent', message: 'Sure, want to hear a joke?', user_id: 1, conversation_id: 2 }],
      user_id: 0,
      created_at: '',
      updated_at: '',
    },
  ]);

  const [selectedConversationId, setSelectedConversationId] = useState<number>(1);
  const [input, setInput] = useState<string>('');
  const [dropdownOpenId, setDropdownOpenId] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const toggleSettingDrawer = useChatStore((state) => state.toggleSettingDrawer);

  useEffect(() => {
    setSelectedModel(defaultModel);
    setModelList(models);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const currentConversation = conversations.find((c) => c.id === selectedConversationId);

  const sendMessage = () => {
    if (!input.trim() || !currentConversation) return;
    const newMessage: Message = {
      id: currentConversation.messages.length + 1,
      sender_type: 'user',
      message: input,
      conversation_id: currentConversation.id,
      user_id: 1,
    };
    const updatedConversations = conversations.map((conv) =>
      conv.id === selectedConversationId ? { ...conv, messages: [...conv.messages, newMessage] } : conv,
    );
    setConversations(updatedConversations);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const deleteConversation = (id: number) => {
    setConversations(conversations.filter((conv) => conv.id !== id));
    if (selectedConversationId === id && conversations.length > 1) {
      setSelectedConversationId(conversations[0].id);
    }
  };

  const renameConversation = (id: number, newTitle: string) => {
    setConversations(conversations.map((conv) => (conv.id === id ? { ...conv, title: newTitle } : conv)));
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="w-64 space-y-2 overflow-y-auto border-r border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold">Conversations</h2>
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 ${
              selectedConversationId === conv.id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setSelectedConversationId(conv.id)}
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

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="ml-auto flex items-center space-x-3">
            <ModelSelector />
            <Settings2
              className="cursor-pointer text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              onClick={() => toggleSettingDrawer()}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
            {currentConversation?.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender_type === 'agent' ? (
                  <div className="flex w-full items-start">
                    <BotMessageSquare className="mr-2 text-blue-500" size={28} />
                    <div
                      className="prose prose-sm dark:prose-invert w-full max-w-none rounded-lg border border-gray-200 bg-white p-3 px-6 text-sm text-gray-800 md:px-10 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      dangerouslySetInnerHTML={{ __html: mdParser.render(msg.message) }}
                    />
                  </div>
                ) : (
                  <div className="flex w-1/2 items-end justify-end">
                    <div className="w-full rounded-lg bg-blue-500 p-3 text-sm text-white">{msg.message}</div>
                    <UserCircle2 className="ml-2 text-gray-400" size={28} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Type your message..."
                className="max-h-48 flex-1 resize-none overflow-auto rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <button onClick={sendMessage} className="h-fit rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        <ChatSettings />
      </div>
    </div>
  );
}
