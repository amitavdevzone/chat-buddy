import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ConversationSidebar from './conversation-sidebar';
import ConversationTopbar from './conversation-topbar';

export default function ChatPage({ models, tools }: { models: string[]; tools: string[] }) {
    const [message, setMessage] = useState('');
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const ta = textAreaRef.current;
        if (ta) {
            ta.style.height = 'auto';
            ta.style.height = `${ta.scrollHeight}px`;
        }
    }, [message]);

    return (
        <AppLayout>
            <Head title="Chat" />

            <div className="flex h-[calc(100vh-4rem)] bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white">
                <ConversationSidebar />

                {/* Main Chat Area */}
                <div className="flex flex-1 flex-col">
                    <ConversationTopbar models={models} tools={tools} />

                    {/* Messages */}
                    <div className="flex-1 space-y-4 overflow-y-auto p-6">
                        <div className="max-w-xl rounded bg-gray-200 p-4 dark:bg-gray-700">
                            <p>
                                <strong>User:</strong> Hello, what's up?
                            </p>
                        </div>
                        <div className="max-w-xl self-start rounded bg-gray-100 p-4 dark:bg-gray-600">
                            <p>
                                <strong>Assistant:</strong> Hey! How can I help you today?
                            </p>
                        </div>
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex">
                            <textarea
                                ref={textAreaRef}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Send a message..."
                                rows={1}
                                className="flex-1 resize-none rounded bg-gray-100 p-3 text-sm outline-none dark:bg-gray-700"
                            />
                            <button className="ml-3 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Send</button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
