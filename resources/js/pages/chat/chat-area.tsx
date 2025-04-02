import { useEffect, useRef, useState } from 'react';

export default function ChatArea({ handleUserMessage }: { handleUserMessage: (message: string) => void }) {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const ta = textAreaRef.current;
        if (ta) {
            ta.style.height = 'auto';
            ta.style.height = `${ta.scrollHeight}px`;
        }
    }, [message]);

    return (
        <>
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
                    <button onClick={() => handleUserMessage(message)} className="ml-3 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        Send
                    </button>
                </div>
            </div>
        </>
    );
}
