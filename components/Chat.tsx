import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chat } from '../services/geminiService';
import { SendIcon, SearchIcon, UserIcon, BotIcon } from './icons';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatProps {
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const Chat: React.FC<ChatProps> = ({ chatHistory, setChatHistory }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatHistory]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };
    setChatHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const { text, sources } = await chat(input, useSearch);

    const modelMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: text,
      sources: sources,
    };
    setChatHistory(prev => [...prev, modelMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-800/50 rounded-lg border border-slate-700/50">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-300">Чат с ИИ</h2>
        <div className="flex items-center gap-2">
            <label htmlFor="use-search-toggle" className="text-sm text-slate-400">
                Поиск в интернете
            </label>
            <button onClick={() => setUseSearch(!useSearch)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${useSearch ? 'bg-teal-500' : 'bg-slate-600'}`}>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${useSearch ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {chatHistory.map(message => (
          <div key={message.id} className={`flex items-start gap-3 my-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
            {message.role === 'model' && <div className="p-2 bg-slate-700 rounded-full"><BotIcon className="h-6 w-6 text-teal-400" /></div>}
            <div className={`max-w-xl p-3 rounded-lg ${message.role === 'user' ? 'bg-teal-600 text-white' : 'bg-slate-700'}`}>
                <MarkdownRenderer content={message.text} />
                {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-600">
                        <h4 className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1"><SearchIcon className="h-4 w-4"/> Источники:</h4>
                        <div className="flex flex-col gap-1">
                            {message.sources.map((source, index) => (
                                <a href={source.uri} key={index} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline truncate">
                                    {source.title || source.uri}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
             {message.role === 'user' && <div className="p-2 bg-slate-700 rounded-full"><UserIcon className="h-6 w-6 text-slate-300" /></div>}
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3 my-4">
                <div className="p-2 bg-slate-700 rounded-full"><BotIcon className="h-6 w-6 text-teal-400" /></div>
                <div className="max-w-xl p-3 rounded-lg bg-slate-700 flex items-center">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-slate-600 focus-within:ring-2 focus-within:ring-teal-500">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Спросите что-нибудь..."
            className="w-full bg-transparent px-3 py-2 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-teal-600 hover:bg-teal-500 text-white p-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;