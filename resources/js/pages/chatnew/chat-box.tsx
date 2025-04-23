import { useForm } from '@inertiajs/react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { BotMessageSquare, Send, UserCircle2 } from 'lucide-react';
import MarkdownIt from 'markdown-it';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Message } from '../../types';
import ChatGreeting from './chat-greeting';
import { useChatStore } from './chatstore';

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
  const forceUpdateRef = useRef(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const sortedMessages = currentConversation?.messages ? [...currentConversation.messages].sort((a, b) => a.id - b.id) : [];

  // Force component updates for streaming
  const [streamTick, setStreamTick] = useState(0);
  const [streamedResponse, setStreamedResponse] = useState('');
  const currentAgentMessageIdRef = useRef<number | null>(null);

  // Add a state to directly track the streaming content
  const [streamingContent, setStreamingContent] = useState('');
  const agentMessageIdRef = useRef<number | null>(null);

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

    // Reset accumulated message and streaming content
    messageAccumulatorRef.current = '';
    setStreamingContent('');

    // Set receiving flag to true
    setIsReceiving(true);

    if (!currentConversation) {
      return;
    }

    // Get the CURRENT state directly from the store to ensure we have latest messages
    const currentState = useChatStore.getState();
    const latestConversation = currentState.currentConversation;
    
    if (!latestConversation) return;
    
    console.log('Starting stream with conversation containing', latestConversation.messages.length, 'messages');

    // Create a new agent message immediately
    const agentMessageId = Date.now();
    agentMessageIdRef.current = agentMessageId;

    const agentMessage: Message = {
      id: agentMessageId,
      sender_type: 'agent',
      message: '',
      conversation_id: latestConversation.id,
      user_id: 1,
    };

    // Create a new array with all existing messages plus the new agent message
    // This preserves the user message that was just added
    const updatedMessages = [...latestConversation.messages, agentMessage];

    const updatedConversation = {
      ...latestConversation,
      messages: updatedMessages,
    };

    // Update store directly first
    useChatStore.setState({
      currentConversation: updatedConversation,
      conversations: currentState.conversations.map(conv => 
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    });
    
    // Then update component state
    setCurrentConversation(updatedConversation);
    setConversations(currentState.conversations.map(conv => 
      conv.id === updatedConversation.id ? updatedConversation : conv
    ));
    
    // Force immediate UI update
    setStreamTick(prev => prev + 1);

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
          conversation_id: latestConversation.id,
          message: data.message,
        }),
      );
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        const newChunk = event.data;

        // Check if this is the done marker
        if (newChunk === '[DONE]') {
          console.log('Stream completed with [DONE] marker');
          clearTimeout(safetyTimeoutId);
          eventSource.close();
          eventSourceRef.current = null;
          setIsReceiving(false);
          return;
        }

        // Add the new chunk to our accumulator
        messageAccumulatorRef.current += newChunk;

        // Update the streaming content state - this will force a re-render
        setStreamingContent(messageAccumulatorRef.current);

        // Increment stream tick to force a re-render
        setStreamTick((prev) => prev + 1);

        // Update the message in component and store
        updateMessageInStore(messageAccumulatorRef.current);
      };

      eventSource.onerror = () => {
        clearTimeout(safetyTimeoutId);
        eventSource.close();
        eventSourceRef.current = null;
        setIsReceiving(false);
      };
    }, 100); // Small delay to ensure state updates have processed
  };

  // Modified function to update the message in store and component state
  const updateMessageInStore = (content: string) => {
    // Exit if no conversation or agentMessageId not set
    if (!currentConversation || !agentMessageIdRef.current) return;

    // Create a new copy of the current conversation
    const updatedConversation = { ...currentConversation };
    const updatedMessages = [...updatedConversation.messages];

    // Find the message we're currently updating by its ID
    const agentMessageIndex = updatedMessages.findIndex((msg) => msg.id === agentMessageIdRef.current);

    if (agentMessageIndex === -1) return;

    // Update the message content
    updatedMessages[agentMessageIndex] = {
      ...updatedMessages[agentMessageIndex],
      message: content,
    };

    // Create the updated conversation object
    updatedConversation.messages = updatedMessages;

    // Update local state (this will trigger a re-render)
    setCurrentConversation(updatedConversation);

    // Update conversations list
    const updatedConversations = conversations.map((conv) => (conv.id === updatedConversation.id ? updatedConversation : conv));
    setConversations(updatedConversations);

    // Also update the store directly to ensure changes propagate
    const store = useChatStore.getState();
    store.setCurrentConversation(updatedConversation);
    store.setConversations(updatedConversations);
  };

  const sendMessage = () => {
    if (!data.message.trim() || !currentConversation) {
      return;
    }

    // Save message before clearing form
    const messageToSend = data.message;

    console.log('Sending message:', messageToSend);

    // Create new message object with a unique timestamp-based ID
    const newUserMessageId = Date.now();
    const newMessage: Message = {
      id: newUserMessageId,
      sender_type: 'user',
      message: messageToSend,
      conversation_id: currentConversation.id,
      user_id: 1,
    };

    // Clear the input field immediately for better UX
    setData('message', '');

    // Create a new copy of the conversation with the user message
    const updatedMessages = [...currentConversation.messages, newMessage];
    const updatedConversation = {
      ...currentConversation,
      messages: updatedMessages,
    };

    console.log('Updated conversation with user message:', updatedConversation);

    // Direct store update first for immediate global state change
    useChatStore.setState({
      currentConversation: updatedConversation,
      conversations: conversations.map((conv) =>
        conv.id === updatedConversation.id ? updatedConversation : conv
      ),
    });

    // Then update component state
    setCurrentConversation(updatedConversation);
    setConversations(
      conversations.map((conv) =>
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    );

    // Force a re-render with the stream tick to make sure message is shown
    setStreamTick((prev) => prev + 1);

    // Send the message to the server
    post(route('message.store'), {
      preserveScroll: true,
      data: {
        conversation_id: currentConversation.id,
        message: messageToSend,
        sender_type: 'user',
        model: selectedModel,
      },
      onSuccess: (response) => {
        console.log('Message sent successfully, server response:', response);

        // Get the actual user message ID from the response if available
        const savedMessageId = response?.message?.id;

        if (savedMessageId) {
          // Get the CURRENT state directly from the store
          const currentState = useChatStore.getState();
          const currentConv = currentState.currentConversation;

          if (!currentConv) return;

          // Update the message ID in our state with the server ID
          const updatedWithServerIds = currentConv.messages.map((msg) => {
            if (msg.id === newUserMessageId) {
              return { ...msg, id: savedMessageId };
            }
            return msg;
          });

          const conversationWithServerIds = {
            ...currentConv,
            messages: updatedWithServerIds,
          };

          // Update store directly with the latest state
          useChatStore.setState({
            currentConversation: conversationWithServerIds,
            conversations: currentState.conversations.map((conv) =>
              conv.id === conversationWithServerIds.id
                ? conversationWithServerIds
                : conv
            ),
          });

          // Update local component state too
          setCurrentConversation(conversationWithServerIds);
        }

        // Double-check the state before starting the stream
        const finalState = useChatStore.getState();
        console.log(
          'State before starting stream:',
          finalState.currentConversation
        );

        // Add a forced re-render before starting the stream
        setStreamTick((prev) => prev + 1);

        // Small delay with callback to ensure state is settled
        setTimeout(() => {
          // Final verification of state before starting stream
          const verifiedState = useChatStore.getState();
          console.log(
            'Final verified state before stream:',
            verifiedState.currentConversation?.messages?.length || 0,
            'messages'
          );

          // Start the EventSource to receive the streaming response
          startEventSource();
        }, 750); // Increased delay for state to settle
      },
      onError: (error) => {
        console.error('Error sending message:', error);
      },
    });
  };

  return (
    <>
      <div className="flex-1 space-y-4 overflow-y-auto bg-gray-100 px-6 py-4">
        {currentConversation != null ? (
          <>
            {/* Debug info to show message count - remove in production */}
            <div className="text-xs text-gray-400">
              {sortedMessages.length} messages in conversation
            </div>

            {sortedMessages.map((msg) => (
              <div
                key={`${msg.id}-${streamTick}`}
                className={`flex ${
                  msg.sender_type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender_type === 'agent' ? (
                  <div className="flex w-full items-start">
                    <BotMessageSquare
                      className="mr-2 text-blue-500"
                      size={28}
                    />
                    <div
                      className="prose prose-sm dark:prose-invert w-full max-w-none rounded-lg border border-gray-200 bg-white p-3 px-6 text-sm text-gray-800 md:px-10 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      dangerouslySetInnerHTML={{
                        __html: mdParser.render(
                          // Use streamingContent for currently streaming message
                          msg.id === agentMessageIdRef.current
                            ? streamingContent
                            : msg.message
                        ),
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex w-1/2 items-end justify-end">
                    <div className="w-full rounded-lg bg-blue-500 p-3 text-sm text-white">
                      {msg.message}
                    </div>
                    <UserCircle2
                      className="ml-2 text-gray-400"
                      size={28}
                    />
                  </div>
                )}
              </div>
            ))}
          </>
        ) : (
          <div className="mt-48 w-full justify-center px-20 text-center">
            <ChatGreeting />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
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
        {isReceiving && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Assistant is typing...
            {/* This value updates with each tick of the stream, forcing re-renders */}
            <span className="hidden">{streamTick}</span>
          </div>
        )}
      </div>
    </>
  );
}
