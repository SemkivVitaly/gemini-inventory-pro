import React from 'react';
import { View } from '../types';
import { ComparerIcon, ChatIcon, FilesIcon, HistoryIcon } from './icons';
import InstallPWA from './InstallPWA';

interface LayoutProps {
  activeView: View;
  setActiveView: (view: View) => void;
  children: React.ReactNode;
}

const navItems = [
  { view: View.Comparer, icon: ComparerIcon, label: 'Сравнение' },
  { view: View.Chat, icon: ChatIcon, label: 'Чат' },
  { view: View.Files, icon: FilesIcon, label: 'Файлы' },
  { view: View.History, icon: HistoryIcon, label: 'История' },
];

const Layout: React.FC<LayoutProps> = ({ activeView, setActiveView, children }) => {
  return (
    <div className="flex flex-col md:flex-row h-screen font-sans">
      <nav className="fixed bottom-0 md:relative w-full md:w-64 bg-slate-800/50 backdrop-blur-sm border-t md:border-t-0 md:border-r border-slate-700 z-10">
        <div className="p-4 hidden md:block">
          <h1 className="text-2xl font-bold text-teal-400">Gemini Pro</h1>
          <p className="text-slate-400 text-sm">Ассистент Инвентаря</p>
        </div>
        <ul className="flex justify-around md:flex-col md:p-2">
          {navItems.map((item) => (
            <li key={item.view}>
              <button
                onClick={() => setActiveView(item.view)}
                className={`flex flex-col items-center md:flex-row md:items-stretch w-full p-3 my-1 text-sm md:text-base rounded-lg transition-colors duration-200 ${
                  activeView === item.view
                    ? 'bg-teal-500/20 text-teal-300'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                }`}
              >
                <item.icon className="h-6 w-6 md:mr-4" />
                <span className="mt-1 md:mt-0">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <div className="p-4 md:p-8 h-full">
            {children}
        </div>
      </main>
      <InstallPWA />
    </div>
  );
};

export default Layout;