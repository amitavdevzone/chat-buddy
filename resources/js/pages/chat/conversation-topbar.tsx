import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function ConversationTopbar({ tools, models }: { tools: string[]; models: string[] }) {
    const [selectedModel, setSelectedModel] = useState('GPT-4');
    const [selectedTool, setSelectedTool] = useState<string | null>(null);

    return (
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
    );
}
