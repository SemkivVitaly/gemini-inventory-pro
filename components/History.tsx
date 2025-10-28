import React, { useState } from 'react';
import { Analysis } from '../types';
import { EyeIcon, HistoryIcon } from './icons';
import AnalysisModal from './AnalysisModal';

interface HistoryProps {
  analysisHistory: Analysis[];
}

const History: React.FC<HistoryProps> = ({ analysisHistory }) => {
    const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);

    const handleViewDetails = (analysis: Analysis) => {
        setSelectedAnalysis(analysis);
    };

  return (
    <div className="h-full flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-slate-300">История анализов</h2>
        <div className="flex-grow bg-slate-800/50 rounded-lg p-4 overflow-y-auto border border-slate-700/50">
            {analysisHistory.length === 0 ? (
                <div className="text-slate-500 text-center py-16">
                    <HistoryIcon className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                    <p>Ваша история анализов пуста.</p>
                    <p className="text-sm">Результаты из раздела "Сравнение" появятся здесь.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {analysisHistory.map(item => (
                        <div key={item.id} className="bg-slate-800 rounded-lg border border-slate-700 p-4 flex justify-between items-center transition-shadow hover:shadow-lg hover:border-slate-600">
                             <div>
                                <p className="font-semibold text-slate-200">{item.prompt}</p>
                                <p className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleString()}</p>
                            </div>
                            <button 
                                onClick={() => handleViewDetails(item)}
                                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-3 rounded-md transition-colors"
                            >
                                <EyeIcon className="h-5 w-5" />
                                <span>Просмотр</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
        {selectedAnalysis && (
            <AnalysisModal
                analysisData={selectedAnalysis.response}
                onClose={() => setSelectedAnalysis(null)}
            />
        )}
    </div>
  );
};

export default History;