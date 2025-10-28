import React, { useState, useEffect } from 'react';
import { DownloadIcon } from './icons.tsx';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
}

const InstallPWA: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('Пользователь принял приглашение на установку');
    } else {
      console.log('Пользователь отклонил приглашение на установку');
    }
    setInstallPrompt(null);
  };

  if (!installPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-24 right-4 md:bottom-4 md:right-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:opacity-90 transition-all flex items-center gap-2 z-20 animate-bounce"
      title="Установить приложение"
    >
      <DownloadIcon className="h-6 w-6" />
      <span className="hidden md:block">Установить</span>
    </button>
  );
};

export default InstallPWA;