import { useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Message } from '../../types';
import { useChatStore } from './chatstore';

type MessageForm = {
  conversation_id: number | null;
  message: string;
  sender_type: 'user' | 'agent';
  model: string;
};

export default function ChatBox() {
  const currentConversation = useChatStore((state) => state.currentConversation);
  const setCurrentConversation = useChatStore((state) => state.setCurrentConversation);
  const conversations = useChatStore((state) => state.conversations);
  const setConversations = useChatStore((state) => state.setConversations);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const selectedModel = useChatStore((state) => state.selectedModel);
  const [isReceiving, setIsReceiving] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const messageAccumulatorRef = useRef('');

  const { data, setData, post } = useForm<MessageForm>({
    conversation_id: null,
    message: '',
    sender_type: 'user',
    model: selectedModel,
  });

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
    setData('conversation_id', currentConversation?.id || null);
  }, [selectedModel, setData, currentConversation]);

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const startEventSource = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Reset accumulated message
    messageAccumulatorRef.current = '';

    // Set receiving flag to true
    setIsReceiving(true);

    if (!currentConversation) {
      return;
    }

    // Create a new agent message immediately
    const agentMessage: Message = {
      id: Date.now(),
      sender_type: 'agent',
      message: '',
      conversation_id: currentConversation.id,
      user_id: 1,
    };

    // Add the initial empty agent message to the conversation
    const updatedMessages = [...currentConversation.messages, agentMessage];

    const updatedConversation = {
      ...currentConversation,
      messages: updatedMessages,
    };

    // Update current conversation state
    setCurrentConversation(updatedConversation);

    // Update all conversations
    const updatedConversations = conversations.map((conv) => (conv.id === currentConversation.id ? updatedConversation : conv));

    setConversations(updatedConversations);

    // Set a timeout for safety in case stream never completes
    const safetyTimeoutId = setTimeout(() => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsReceiving(false);
      }
    }, 60000); // 60 second timeout

    // Create the EventSource with a small delay to ensure the state updates have propagated
    setTimeout(() => {
      const eventSource = new EventSource(
        route('message.response', {
          conversation_id: currentConversation.id,
          message: data.message,
        }),
      );
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        const newChunk = event.data;

        // Check if this is the done marker
        if (newChunk === '[DONE]') {
          clearTimeout(safetyTimeoutId);
          eventSource.close();
          eventSourceRef.current = null;
          setIsReceiving(false);
          return;
        }

        // Add the new chunk to our accumulator
        messageAccumulatorRef.current += newChunk;

        // Get the latest state
        const latestConversation = useChatStore.getState().currentConversation;

        if (!latestConversation) {
          return;
        }

        // Create a deep copy to avoid any mutation issues
        const currentMessages = JSON.parse(JSON.stringify(latestConversation.messages));

        // Find the last agent message
        const lastMessageIndex = currentMessages.length - 1;

        if (lastMessageIndex < 0) {
          return;
        }

        const lastMessage = currentMessages[lastMessageIndex];

        // Update only if it's an agent message
        if (lastMessage.sender_type === 'agent') {
          // Update with the complete accumulated message so far
          const updatedMessage = {
            ...lastMessage,
            message: messageAccumulatorRef.current,
          };

          // Update the message in our messages array
          currentMessages[lastMessageIndex] = updatedMessage;

          // Create a new conversation object with updated messages
          const updatedConversation = {
            ...latestConversation,
            messages: currentMessages,
          };

          // Update the states
          setCurrentConversation(updatedConversation);

          // Get latest conversations from store to ensure we're working with latest state
          const latestConversations = useChatStore.getState().conversations;

          const updatedConversations = latestConversations.map((conv) => (conv.id === updatedConversation.id ? updatedConversation : conv));

          setConversations(updatedConversations);
        }
      };

      eventSource.onerror = () => {
        clearTimeout(safetyTimeoutId);
        eventSource.close();
        eventSourceRef.current = null;
        setIsReceiving(false);
      };
    }, 100); // Small delay to ensure state updates have processed
  };

  const sendMessage = () => {
    if (!data.message.trim() || !currentConversation) {
      return;
    }

    // Save message before clearing form
    const messageToSend = data.message;

    // Create new message object
    const newMessage: Message = {
      id: Date.now(),
      sender_type: 'user',
      message: messageToSend,
      conversation_id: currentConversation.id,
      user_id: 1,
    };

    // Update conversations with the new user message
    const updatedMessages = [...currentConversation.messages, newMessage];

    const updatedConversation = {
      ...currentConversation,
      messages: updatedMessages,
    };

    setCurrentConversation(updatedConversation);

    const updatedConversations = conversations.map((conv) => (conv.id === currentConversation.id ? updatedConversation : conv));

    setConversations(updatedConversations);

    // Clear the input field immediately for better UX
    setData('message', '');

    // Send the message to the server
    post(route('message.store'), {
      preserveScroll: true,
      data: {
        conversation_id: currentConversation.id,
        message: messageToSend,
        sender_type: 'user',
        model: selectedModel,
      },
      onSuccess: () => {
        // Small delay to ensure UI has updated with the user message
        // before starting to show the assistant's response
        setTimeout(() => {
          // Start the EventSource to receive the streaming response
          startEventSource();
        }, 300); // 300ms delay
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
          disabled={isReceiving}
        />
        <button
          onClick={sendMessage}
          className="h-fit rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:opacity-50"
          disabled={!data.message.trim() || !currentConversation || isReceiving}
        >
          <Send size={18} />
        </button>
      </div>
      {isReceiving && <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Assistant is typing...</div>}
    </div>
  );
}
