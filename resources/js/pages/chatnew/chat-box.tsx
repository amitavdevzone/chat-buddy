import { router, useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, useEffect, useRef } from 'react';
import { Message } from '../../types';
import { useChatStore } from './chatstore';

type MessageForm = {
  conversation_id: number | null;
  message: string;
  sender_type: 'user' | 'assistant';
  model: string;
};

export default function ChatBox() {
  const currentConversation = useChatStore((state) => state.currentConversation);
  const setCurrentConversation = useChatStore((state) => state.setCurrentConversation);
  const conversations = useChatStore((state) => state.conversations);
  const setConversations = useChatStore((state) => state.setConversations);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const selectedModel = useChatStore((state) => state.selectedModel);

  useEffect(() => {
    console.log('Selected model changed:', selectedModel);
  }, [selectedModel]);

  const { data, setData, post } = useForm<MessageForm>({
    conversation_id: currentConversation?.id || null,
    message: '',
    sender_type: 'user',
    model: selectedModel,
  });

  const selectedConversationId = useChatStore((state) => state.currentConversation?.id);

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setData('message', e.target.value);
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
  }, [data.message]);

  // Update form data when selectedModel changes
  useEffect(() => {
    setData('model', selectedModel);
  }, [selectedModel, setData]);

  const sendMessage = () => {
    setData('model', selectedModel);

    if (!data.message.trim() || !currentConversation) return;

    // Create new message
    const newMessage: Message = {
      id: Date.now(),
      sender_type: 'user',
      message: data.message,
      conversation_id: currentConversation.id,
      user_id: 1,
    };

    const updatedConversations = conversations.map((conv) =>
      conv.id === currentConversation.id ? { ...conv, messages: [...conv.messages, newMessage] } : conv,
    );

    setConversations(updatedConversations);
    setCurrentConversation({
      ...currentConversation,
      messages: [...currentConversation.messages, newMessage],
    });

    post(route('message.store'), {
      preserveScroll: true,
      onSuccess: () => {
        setData('message', '');
        router.reload({ only: ['conversation'] });
      },
      onError: (error) => {
        console.error('Error sending message:', error);
      },
    });
  };

  return (
    <div className="sticky right-0 bottom-0 left-0 z-10 border-t border-gray-200 bg-white px-6 py-4 shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={data.message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type your message..."
          className="max-h-48 flex-1 resize-none overflow-auto rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <button
          onClick={sendMessage}
          className="h-fit rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:opacity-50"
          disabled={!data.message.trim() || !currentConversation}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
