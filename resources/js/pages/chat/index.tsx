import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import ChatArea from './chat-area';
import ConversationSidebar from './conversation-sidebar';
import ConversationTopbar from './conversation-topbar';

export default function ChatPage({ models, tools, defaultModel = '' }: { models: string[]; tools: string[]; defaultModel: string }) {
    const [selectedModel, setSelectedModel] = useState(defaultModel);
    const [selectedTool, setSelectedTool] = useState<string | null>(null);
    const [userMessage, setUserMessage] = useState('');

    const handleUserMessageChange = (message: string) => {
        setUserMessage(message);
    };
    const handleModelChange = (model: string) => {
        setSelectedModel(model);
    };
    const handleToolChange = (tool: string | null) => {
        setSelectedTool(tool);
    };

    return (
        <AppLayout>
            <Head title="My Conversations" />

            <div className="flex h-[calc(100vh-4rem)] bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white">
                <ConversationSidebar />

                <div className="flex flex-1 flex-col">
                    <ConversationTopbar
                        models={models}
                        tools={tools}
                        defaultModel={defaultModel}
                        handleModelChange={handleModelChange}
                        handleToolChange={handleToolChange}
                    />

                    <ChatArea handleUserMessage={handleUserMessageChange} />
                </div>
            </div>
        </AppLayout>
    );
}
