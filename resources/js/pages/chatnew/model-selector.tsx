import { useChatStore } from './chatstore';

export default function ModelSelector() {
  const selectedModel = useChatStore((state) => state.selectedModel);
  const setSelectedModel = useChatStore((state) => state.setSelectedModel);
  const models = useChatStore((state) => state.models);

  return (
    <select
      value={selectedModel}
      onChange={(e) => {
        setSelectedModel(e.target.value);
        alert(`Model changed to: ${selectedModel}`);
      }}
      className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
    >
      {models.map((model) => (
        <option key={model} value={model}>
          {model}
        </option>
      ))}
    </select>
  );
}
