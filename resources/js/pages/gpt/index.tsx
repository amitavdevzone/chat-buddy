import { useEffect, useRef, useState } from 'react';
import { Conversation } from '../../types';
import ConversationSidebar from './conversation-sidebar';
import TopBar from './topbar';

export default function ChatInterface({ conversations }: { conversations: Conversation[] }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!input.trim()) return;
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
        <div className="flex-1 space-y-6 overflow-y-auto p-6">This is where the basic design will come.</div>

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
