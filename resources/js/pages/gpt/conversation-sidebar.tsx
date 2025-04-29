import { Link } from '@inertiajs/react';
import { Conversation } from '../../types';

export default function ConversationSidebar({ conversations = [] }: { conversations: Conversation[] }) {
  return (
    <div className="w-64 border-r bg-gray-100 p-4">
      <div className="mb-4 flex justify-between font-bold">
        <div>
          <Link href={route('conversation.index')} className="text-blue-500 hover:text-blue-700">
            My Chat
          </Link>
        </div>
        <div>
          <Link href={route('dashboard')} className="text-blue-500 hover:text-blue-700">
            Home
          </Link>
        </div>
      </div>
      <div className="space-y-2">
        {conversations.length > 0 &&
          conversations.map((conversation) => (
            <div key={conversation.id}>
              <Link href={route('chat.conversation', { conversation: conversation.id })}>
                <div className="cursor-pointer rounded bg-white p-2 text-sm shadow">{conversation.name}</div>
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
}
