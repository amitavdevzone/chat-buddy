import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // Highlight.js theme
import MarkdownIt from 'markdown-it';
import { useEffect, useRef, useState } from 'react';
import { Conversation } from '../../types';
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

export default function ChatConversation({ conversations }: { conversations: Conversation[] }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'user', text: 'Hello! **How are you?**' },
    { id: 2, sender: 'assistant', text: "I'm good! Here's a code sample:\n\n```javascript\nconsole.log('Hello world');\n```" },
  ]);
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: prev.length + 1, sender: 'user', text: input.trim() }]);
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

  return (
    <div className="flex h-screen">
      <ConversationSidebar conversations={conversations} />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        <TopBar />

        {/* Messages */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <div className="mb-1 text-sm font-bold">{msg.sender === 'user' ? 'You' : 'GPT-4o'}</div>
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: mdParser.render(msg.text) }} />
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="border-t bg-white p-4">
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
