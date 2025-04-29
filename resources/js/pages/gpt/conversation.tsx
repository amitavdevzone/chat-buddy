import { router, useForm } from '@inertiajs/react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // Highlight.js theme
import MarkdownIt from 'markdown-it';
import { useEffect, useRef, useState } from 'react';
import { Conversation, Message } from '../../types';
import ConversationSidebar from './conversation-sidebar';
import TopBar from './topbar';

// Create a more forgiving markdown parser for streaming content
const streamingMdParser: MarkdownIt = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`;
      } catch (__) {}
    }
    return `<pre class="hljs"><code>${streamingMdParser.utils.escapeHtml(str)}</code></pre>`;
  },
  // Make it more forgiving for incomplete markdown
  breaks: true,
  typographer: true,
});

// Regular parser for complete messages
const mdParser: MarkdownIt = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`;
      } catch (__) {}
    }
    return `<pre class="hljs"><code>${mdParser.utils.escapeHtml(str)}</code></pre>`;
  },
});

// Helper function to intelligently fix incomplete markdown
function preprocessMarkdown(text: string): string {
  // Attempt to fix common incomplete markdown patterns

  // Fix incomplete code blocks
  const codeBlockMatches = text.match(/```([a-zA-Z0-9]*)\n(?:(?!```).)*$/s);
  if (codeBlockMatches) {
    text += '\n```';
  }

  // Fix incomplete bold/italic formatting
  const boldCount = (text.match(/\*\*/g) || []).length;
  if (boldCount % 2 !== 0) {
    text += '**';
  }

  // Fix incomplete italic formatting
  const italicCount = (text.match(/(?<!\*)\*(?!\*)/g) || []).length;
  if (italicCount % 2 !== 0) {
    text += '*';
  }

  // Fix incomplete links
  if (text.match(/\[([^\]]+)\](?!\()/)) {
    text += '()';
  }

  return text;
}

// Component for displaying streaming content with improved markdown rendering
function StreamingMessage({ content }: { content: string }) {
  // Preprocess the markdown to handle incomplete elements
  const processedContent = preprocessMarkdown(content);

  return (
    <div className="mr-auto flex max-w-[80%] flex-col bg-white p-4">
      <div className="mb-1 text-sm font-bold">Agent</div>
      <div
        className="prose prose-message prose-sm max-w-none break-words"
        dangerouslySetInnerHTML={{ __html: streamingMdParser.render(processedContent) }}
      />
    </div>
  );
}

type MessageForm = {
  model: string;
  message: string;
  conversation_id: number | null;
};

export default function ChatConversation({ conversation, conversations }: { conversation: Conversation; conversations: Conversation[] }) {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedMessage, setStreamedMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const { data, setData, post } = useForm<MessageForm>({
    model: 'gpt-3.5-turbo',
    message: '',
    conversation_id: conversation.id,
  });

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const scrollOptions = {
        top: container.scrollHeight,
        behavior: 'smooth' as ScrollBehavior,
      };

      container.scrollTo(scrollOptions);
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isStreaming) return;

    // First save the user message
    post(route('message.store'), {
      onSuccess: () => {
        // Start streaming the response
        startStreaming(input);
        setInput('');
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      },
      onError: (errors) => {
        console.error(errors);
      },
    });
  };

  const startStreaming = (userMessage: string) => {
    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setIsStreaming(true);
    setStreamedMessage('');

    // Create URL with query parameters
    const url = new URL(route('message.response'));
    url.searchParams.append('message', userMessage);
    url.searchParams.append('conversation_id', conversation.id.toString());
    url.searchParams.append('model', data.model);

    // Create new EventSource connection
    const eventSource = new EventSource(url.toString());
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const newData = event.data;

      if (newData === '[DONE]') {
        eventSource.close();
        setIsStreaming(false);
        router.reload({ only: ['conversation'] });
        return;
      }

      try {
        // Try to parse as JSON first
        const parsedData = JSON.parse(newData);
        setStreamedMessage((prevMessage) => prevMessage + parsedData.content);
      } catch (error) {
        // If JSON parsing fails, treat it as plain text
        setStreamedMessage((prevMessage) => prevMessage + newData);
      }
      scrollToBottom();
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
      setIsStreaming(false);
      router.reload({ only: ['conversation'] });
    };
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
    setData('message', input);
  }, [input]);

  // Scroll to bottom when component mounts or messages change
  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex h-screen">
      <ConversationSidebar conversations={conversations} />

      {/* Main Chat Area */}
      <div className="relative flex flex-1 flex-col">
        <TopBar />

        <div ref={messagesContainerRef} className="mb-16 flex-1 space-y-6 overflow-y-auto p-4 lg:p-8" style={{ scrollBehavior: 'smooth' }}>
          {conversation &&
            conversation.messages.length > 0 &&
            [...conversation.messages]
              .sort((a, b) => a.id - b.id) // Sort messages by ID in ascending order
              .map((message: Message) =>
                message.sender_type === 'user' ? (
                  <UserMessage key={message.id} message={message} />
                ) : (
                  <SystemMessage key={message.id} message={message} />
                ),
              )}

          {/* Show streaming message if active - use our improved component */}
          {isStreaming && streamedMessage && <StreamingMessage content={streamedMessage} />}
        </div>

        {/* Message Input */}
        <div className="absolute right-0 bottom-0 left-0 border-t bg-white p-4 shadow-md">
          <div className="flex items-end space-x-2">
            <textarea
              ref={textareaRef}
              className="flex-1 resize-none rounded-2xl border p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={1}
              placeholder={isStreaming ? 'Waiting for response...' : 'Type a message...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
            />
            <button
              onClick={handleSubmit}
              className={`rounded-full px-6 py-2 text-white ${isStreaming ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
              disabled={isStreaming}
            >
              {isStreaming ? '...' : '➤'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserMessage({ message }: { message: Message }) {
  return (
    <div key={message.id} className="ml-auto flex max-w-[50%] flex-col rounded-md border bg-gray-200 p-6 shadow">
      <div className="mb-1 text-sm font-bold">You</div>
      <div className="prose prose-message prose-sm max-w-none break-words" dangerouslySetInnerHTML={{ __html: mdParser.render(message.message) }} />
    </div>
  );
}

export function SystemMessage({ message }: { message: Message }) {
  return (
    <div key={message.id} className="mr-auto flex max-w-[80%] flex-col bg-white p-4">
      <div className="mb-1 text-sm font-bold">Agent</div>
      <div className="prose prose-message prose-sm max-w-none break-words" dangerouslySetInnerHTML={{ __html: mdParser.render(message.message) }} />
    </div>
  );
}
