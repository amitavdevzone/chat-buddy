import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { BotMessageSquare, UserCircle2 } from 'lucide-react';
import MarkdownIt from 'markdown-it';
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

export function ChatMessages() {
  const currentConversation = useChatStore((state) => state.currentConversation);
  return (
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
  );
}
