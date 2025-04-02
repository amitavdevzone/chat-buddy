import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ChevronDown, ChevronLeft, ChevronRight, MessageSquare, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const tools = ['Web Search', 'Research'];
const models = ['GPT-4', 'GPT-3.5', 'Custom'];

export default function ChatPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedTool, setSelectedTool] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState('GPT-4');
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
                {/* Sidebar */}
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

                {/* Main Chat Area */}
                <div className="flex flex-1 flex-col">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="appearance-none rounded bg-gray-100 p-2 pr-6 text-sm dark:bg-gray-700"
                                >
                                    {models.map((model) => (
                                        <option key={model} value={model}>
                                            {model}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute top-2.5 right-2 text-gray-500" size={16} />
                            </div>
                            <div className="flex gap-2">
                                {tools.map((tool) => (
                                    <button
                                        key={tool}
                                        onClick={() => setSelectedTool(tool === selectedTool ? null : tool)}
                                        className={`rounded border px-3 py-1.5 text-sm ${
                                            selectedTool === tool
                                                ? 'border-blue-600 bg-blue-600 text-white'
                                                : 'border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                                        }`}
                                    >
                                        {tool}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

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
