import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import ChatArea from './chat-area';
import ConversationSidebar from './conversation-sidebar';

export default function ChatPage({ models, tools, defaultModel }: { models: string[]; tools: string[]; defaultModel: string }) {
    return (
        <AppLayout>
            <Head title="My Conversations" />

            <div className="flex h-[calc(100vh-4rem)] bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white">
                <ConversationSidebar />

                <ChatArea />
            </div>
        </AppLayout>
    );
}
