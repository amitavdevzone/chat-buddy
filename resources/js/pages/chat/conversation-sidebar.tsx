import { ChevronLeft, ChevronRight, MessageSquare, Plus } from 'lucide-react';
import { useState } from 'react';

export default function ConversationSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      className={`border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 ${
        sidebarOpen ? 'w-64' : 'w-16'
      } flex flex-col`}
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <span className={`text-lg font-semibold ${sidebarOpen ? 'block' : 'hidden'}`}>Conversations</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {[1, 2, 3].map((c) => (
          <div key={c} className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700">
            <MessageSquare size={18} />
            {sidebarOpen && <span>Conversation {c}</span>}
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <button className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">
          <Plus size={18} />
          {sidebarOpen && 'New Chat'}
        </button>
      </div>
    </div>
  );
}
