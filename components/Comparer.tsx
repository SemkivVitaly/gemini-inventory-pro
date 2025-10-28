import React, { useState } from 'react';
import { Product, Analysis, SingleProductAnalysis, ComparisonAnalysis } from '../types.ts';
import { analyzeSingleProduct, compareProducts } from '../services/geminiService.ts';
import { DeleteIcon, QrCodeIcon, SparklesIcon } from './icons.tsx';
import QrScanner from './QrScanner.tsx';
import AnalysisModal from './AnalysisModal.tsx';

interface ComparerProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setAnalysisHistory: React.Dispatch<React.SetStateAction<Analysis[]>>;
}

const Comparer: React.FC<ComparerProps> = ({ products, setProducts, setAnalysisHistory }) => {
  const [inputValue, setInputValue] = useState('');
  const [analysisResult, setAnalysisResult] = useState<SingleProductAnalysis | ComparisonAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addProduct = (name: string) => {
    if (name.trim() && !products.some(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
      const newProduct: Product = { id: Date.now().toString(), name: name.trim() };
      setProducts(prev => [...prev, newProduct]);
    }
  };

  const handleAddProduct = () => {
    addProduct(inputValue);
    setInputValue('');
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleAnalyze = async () => {
    if (products.length === 0) return;
    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);

    try {
        let result;
        let prompt;
        let type: 'single' | 'comparison';

        if (products.length === 1) {
            prompt = `Анализ для: ${products[0].name}`;
            type = 'single';
            result = await analyzeSingleProduct(products[0].name);
        } else {
            prompt = `Сравнение для: ${products.map(p => p.name).join(', ')}`;
            type = 'comparison';
            result = await compareProducts(products.map(p => p.name));
        }
        
        setAnalysisResult(result);
        const newAnalysis: Analysis = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            prompt: prompt,
            response: result,
            type: type,
        };
        setAnalysisHistory(prev => [newAnalysis, ...prev]);
        setIsModalOpen(true);
    } catch (e: any) {
        setError(e.message || "Произошла неизвестная ошибка.");
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleScanSuccess = (decodedText: string) => {
    addProduct(decodedText);
    setIsScanning(false);
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-8">
        {isScanning && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setIsScanning(false)}>
                <div className="bg-slate-800 rounded-lg p-4 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-xl font-bold mb-4 text-center">Сканировать QR-код</h2>
                    <QrScanner onSuccess={handleScanSuccess} onError={(error) => console.error(error)} />
                    <button onClick={() => setIsScanning(false)} className="mt-4 w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded transition-colors">
                        Отмена
                    </button>
                </div>
            </div>
        )}

        {isModalOpen && analysisResult && (
            <AnalysisModal 
                analysisData={analysisResult}
                onClose={() => setIsModalOpen(false)}
            />
        )}

      {/* Left Panel: Input and Product List */}
      <div className="md:w-1/3 flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-slate-300">Список продуктов</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddProduct()}
            placeholder="Введите название продукта..."
            className="flex-grow bg-slate-800 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleAddProduct}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            disabled={!inputValue.trim()}
          >
            Добавить
          </button>
          <button
            onClick={() => setIsScanning(true)}
            className="bg-slate-700 hover:bg-slate-600 text-white p-2.5 rounded-md transition-colors"
            title="Сканировать QR-код"
          >
            <QrCodeIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4 flex-grow overflow-y-auto border border-slate-700/50 min-h-[150px]">
            {products.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Добавьте продукты для сравнения.</p>
            ) : (
                <ul>
                    {products.map(product => (
                        <li key={product.id} className="flex justify-between items-center bg-slate-700/50 p-2.5 rounded-md mb-2">
                            <span className="text-slate-300">{product.name}</span>
                            <button onClick={() => handleDeleteProduct(product.id)} className="text-slate-500 hover:text-red-400">
                                <DeleteIcon className="h-5 w-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        <button
          onClick={handleAnalyze}
          disabled={products.length === 0 || isLoading}
          className="w-full mt-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <SparklesIcon className="h-5 w-5" />
            {isLoading ? 'Анализ...' : (products.length === 1 ? 'Анализировать' : 'Сравнить')}
        </button>
      </div>

      {/* Right Panel: Analysis Result */}
      <div className="md:w-2/3 flex flex-col bg-slate-800/50 rounded-lg border border-slate-700/50">
        <h2 className="text-2xl font-bold p-4 border-b border-slate-700 text-slate-300">Анализ ИИ</h2>
        <div className="p-4 flex-grow overflow-y-auto flex justify-center items-center">
            {error && <div className="text-red-400 bg-red-500/10 p-4 rounded-md">{error}</div>}
            {!isLoading && !error && (
                <div className="text-slate-500 text-center py-16">
                    <SparklesIcon className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                    <p>Результаты анализа появятся в новом окне.</p>
                </div>
            )}
             {isLoading && (
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Comparer;