import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import MarkdownIt from 'markdown-it';
import { useEffect, useRef, useState } from 'react';
import { Conversation } from '../../types';

const md = new MarkdownIt({
    linkify: true,
    breaks: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, { language: lang }).value;
            } catch (e) {
                console.log(e);
            }
        }

        return ''; // use external default escaping
    },
});

export default function ChatArea({
    conversation,
    userMessage,
    handleUserMessage,
}: {
    conversation: Conversation;
    userMessage: string;
    handleUserMessage: (message: string) => void;
}) {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [message, setMessage] = useState('');
    const [streamingMessage, setStreamingMessage] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [localMessages, setLocalMessages] = useState<any[]>([]);

    useEffect(() => {
        scrollToBottom();
    }, []); // At the start, scroll to the bottom of the messages.

    useEffect(() => {
        const ta = textAreaRef.current;
        if (ta) {
            ta.style.height = 'auto';
            ta.style.height = `${ta.scrollHeight}px`;
        }
    }, [message]); // Update height when message changes

    useEffect(() => {
        scrollToBottom();
    }, [conversation]); // Scroll to bottom when conversation updates

    useEffect(() => {
        setMessage(userMessage);
    }, [userMessage]);

    const renderMessages = () => {
        if (!conversation.messages.length && !isStreaming) return null;
        const messagesInOrder = [...localMessages, ...conversation.messages].reverse();

        return (
            <>
                {messagesInOrder.map((message) => (
                    <div key={message.id} className={`flex w-full ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-xl rounded p-4 ${
                                message.sender_type === 'user' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-600'
                            }`}
                        >
                            <p>
                                <strong>{message.sender_type === 'user' ? 'User:' : 'Assistant:'}</strong>{' '}
                                {message.sender_type === 'user' ? (
                                    message.message
                                ) : (
                                    <span dangerouslySetInnerHTML={{ __html: md.render(message.message) }} className="markdown-content" />
                                )}
                            </p>
                        </div>
                    </div>
                ))}

                {isStreaming && (
                    <div className="flex w-full justify-start">
                        <div className="max-w-xl rounded bg-gray-100 p-4 dark:bg-gray-600">
                            <p>
                                <strong>Assistant:</strong>{' '}
                                <span className="markdown-content" dangerouslySetInnerHTML={{ __html: md.render(streamingMessage) }} />
                            </p>
                        </div>
                    </div>
                )}
            </>
        );
    };

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
            }, 100); // Small delay to ensure DOM is updated
        }
    };

    const sendUserMessage = (message: string) => {
        const tempUserMessage = {
            id: `temp-${Date.now()}`,
            message: message,
            sender_type: 'user',
            conversation_id: conversation.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        setLocalMessages([tempUserMessage]);
        scrollToBottom();

        handleUserMessage(message);
        setMessage('');
        startServerSentEvent();
    };

    useEffect(() => {
        setLocalMessages([]);
    }, [conversation]);

    let eventSource: EventSource | null = null;
    const startServerSentEvent = () => {
        if (eventSource) eventSource.close();
        setStreamingMessage('');
        setIsStreaming(true);

        eventSource = new EventSource(route('message.response', { message }));
        eventSource.onmessage = (event) => {
            // const messagesInOrder = [...conversation.messages].reverse();
            setStreamingMessage((prev) => prev + event.data);
            scrollToBottom();
        };
        eventSource.onerror = () => {
            if (eventSource) eventSource.close();
            eventSource = null;
            setIsStreaming(false);
        };
    };

    return (
        <>
            <div ref={messagesContainerRef} className="flex-1 space-y-4 overflow-y-auto p-6">
                {renderMessages()}
            </div>

            <div className="border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex">
                    <textarea
                        ref={textAreaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.ctrlKey && e.key === 'Enter' && message.trim()) {
                                e.preventDefault();
                                sendUserMessage(message);
                            }
                        }}
                        placeholder="Send a message..."
                        rows={1}
                        className="flex-1 resize-none rounded bg-gray-100 p-3 text-sm outline-none dark:bg-gray-700"
                    />
                    <button onClick={() => sendUserMessage(message)} className="ml-3 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        Send
                    </button>
                </div>
            </div>
        </>
    );
}
