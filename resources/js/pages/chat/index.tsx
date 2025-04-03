import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import ChatArea from './chat-area';
import ConversationSidebar from './conversation-sidebar';
import ConversationTopbar from './conversation-topbar';

export default function ChatPage({ models, tools, defaultModel = '' }: { models: string[]; tools: string[]; defaultModel: string }) {
    const { data, setData, post } = useForm({
        message: '',
        model: defaultModel,
        tool: '',
    });

    // Handle the update of message from user coming from chat box
    const handleUserMessageChange = (message: string) => setData('message', message);

    useEffect(() => {
        if (data.message) {
            post(route('message.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    setData('message', '');
                },
            });
        }
    }, [data.message]);

    return (
        <AppLayout>
            <Head title="My Conversations" />

            <div className="flex h-[calc(100vh-4rem)] bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white">
                <ConversationSidebar />

                <div className="flex flex-1 flex-col">
                    <ConversationTopbar models={models} tools={tools} defaultModel={data.model} handleDataChange={setData} />

                    <pre>{JSON.stringify(data)}</pre>

                    <ChatArea userMessage={data.message} handleUserMessage={handleUserMessageChange} />
                </div>
            </div>
        </AppLayout>
    );
}
