import { Send } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Message } from '../../types';
import { useChatStore } from './chatstore';

export default function ChatBox() {
  const currentConversation = useChatStore((state) => state.currentConversation);
  const setCurrentConversation = useChatStore((state) => state.setCurrentConversation);
  const conversations = useChatStore((state) => state.conversations);
  const setConversations = useChatStore((state) => state.setConversations);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [input, setInput] = useState<string>('');

  const selectedConversationId = useChatStore((state) => state.currentConversation?.id);

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

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

    const updatedCurrentConversation = updatedConversations.find((conv) => conv.id === selectedConversationId);
    if (updatedCurrentConversation) {
      setCurrentConversation(updatedCurrentConversation);
    }

    setInput('');
  };

  return (
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
  );
}
