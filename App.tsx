
import React, { useState } from 'react';
import { View, Product, ChatMessage, Analysis, StoredFile } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Layout from './components/Layout';
import Comparer from './components/Comparer';
import Chat from './components/Chat';
import Files from './components/Files';
import History from './components/History';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.Comparer);
  const [products, setProducts] = useLocalStorage<Product[]>('products', []);
  const [chatHistory, setChatHistory] = useLocalStorage<ChatMessage[]>('chatHistory', []);
  const [analysisHistory, setAnalysisHistory] = useLocalStorage<Analysis[]>('analysisHistory', []);
  const [files, setFiles] = useLocalStorage<StoredFile[]>('files', []);

  const renderView = () => {
    switch (activeView) {
      case View.Comparer:
        return <Comparer products={products} setProducts={setProducts} setAnalysisHistory={setAnalysisHistory} />;
      case View.Chat:
        return <Chat chatHistory={chatHistory} setChatHistory={setChatHistory} />;
      case View.Files:
        return <Files files={files} setFiles={setFiles} />;
      case View.History:
        return <History analysisHistory={analysisHistory} />;
      default:
        return <Comparer products={products} setProducts={setProducts} setAnalysisHistory={setAnalysisHistory} />;
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      {renderView()}
    </Layout>
  );
};

export default App;
