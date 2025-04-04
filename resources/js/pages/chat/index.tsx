import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { Conversation } from '../../types';
import ChatArea from './chat-area';
import ConversationSidebar from './conversation-sidebar';
import ConversationTopbar from './conversation-topbar';

export default function ChatPage({
    conversation,
    models,
    tools,
    defaultModel = '',
}: {
    conversation: Conversation;
    models: string[];
    tools: string[];
    defaultModel: string;
}) {
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
                    router.reload({ only: ['conversation'] });
                },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.message]);

    return (
        <AppLayout>
            <Head title="My Conversations" />

            <div className="flex h-[calc(100vh-4rem)] bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white">
                <ConversationSidebar />

                <div className="flex flex-1 flex-col">
                    <ConversationTopbar models={models} tools={tools} defaultModel={data.model} handleDataChange={setData} />

                    <ChatArea conversation={conversation} userMessage={data.message} handleUserMessage={handleUserMessageChange} />
                </div>
            </div>
        </AppLayout>
    );
}
