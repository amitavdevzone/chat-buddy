import { useEffect, useRef } from 'react';
import { useChatStore } from './chatstore';

export default function ChatSettings() {
  const isSettingsOpen = useChatStore((state) => state.isSettingDrawerOpen);
  const toggleSettingDrawer = useChatStore((state) => state.toggleSettingDrawer);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | globalThis.MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        toggleSettingDrawer();
      }
    };
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  return (
    <>
      {isSettingsOpen && (
        <div
          ref={settingsRef}
          className="fixed top-0 right-0 z-50 h-full w-1/2 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800"
        >
          <div className="flex items-center justify-between border-b border-gray-200 p-4 font-semibold dark:border-gray-700">
            Settings
            <button
              className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              onClick={() => toggleSettingDrawer()}
            >
              Close
            </button>
          </div>
          <div className="space-y-4 p-4">
            {/* You can add settings form elements here */}
            <p className="text-sm text-gray-700 dark:text-gray-300">Settings content goes here.</p>
          </div>
        </div>
      )}
    </>
  );
}
