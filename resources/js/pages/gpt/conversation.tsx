import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // Highlight.js theme
import MarkdownIt from 'markdown-it';
import { useEffect, useRef, useState } from 'react';
import { Conversation, Message } from '../../types';
import ConversationSidebar from './conversation-sidebar';
import TopBar from './topbar';

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

export default function ChatConversation({ conversation, conversations }: { conversation: Conversation; conversations: Conversation[] }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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
    if (!input.trim()) return;
    setInput('');
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
  }, [input]);

  // Scroll to bottom when component mounts or messages change
  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

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
        </div>

        {/* Message Input */}
        <div className="absolute right-0 bottom-0 left-0 border-t bg-white p-4 shadow-md">
          <div className="flex items-end space-x-2">
            <textarea
              ref={textareaRef}
              className="flex-1 resize-none rounded-2xl border p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={1}
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSubmit} className="rounded-full bg-blue-500 px-6 py-2 text-white hover:bg-blue-600">
              ➤
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
      <div className="prose prose-sm max-w-none break-words" dangerouslySetInnerHTML={{ __html: mdParser.render(message.message) }} />
    </div>
  );
}

export function SystemMessage({ message }: { message: Message }) {
  return (
    <div key={message.id} className="mr-auto flex max-w-[80%] flex-col bg-white p-4">
      <div className="mb-1 text-sm font-bold">Agent</div>
      <div className="prose prose-sm max-w-none break-words" dangerouslySetInnerHTML={{ __html: mdParser.render(message.message) }} />
    </div>
  );
}
