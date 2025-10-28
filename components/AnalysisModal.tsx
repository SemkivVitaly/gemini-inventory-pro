import React, { useState } from 'react';
import { SingleProductAnalysis, ComparisonAnalysis, Technology } from '../types.ts';
import { CloseIcon, SparklesIcon } from './icons.tsx';
import MarkdownRenderer from './MarkdownRenderer.tsx';

interface AnalysisModalProps {
  analysisData: SingleProductAnalysis | ComparisonAnalysis;
  onClose: () => void;
}

const isComparison = (data: any): data is ComparisonAnalysis => 'productNames' in data;

type PopoverState = {
    content: Technology;
    top: number;
    left: number;
} | null;

interface TechnologyPillProps {
    technology: Technology;
    onSelect: (technology: Technology, event: React.MouseEvent<HTMLButtonElement>) => void;
}

const TechnologyPill: React.FC<TechnologyPillProps> = ({ technology, onSelect }) => {
    return (
        <button
            onClick={(e) => onSelect(technology, e)}
            className="bg-cyan-600/50 text-cyan-200 border border-cyan-500/50 px-2 py-0.5 rounded-md text-sm hover:bg-cyan-600/80 transition-colors underline decoration-dotted decoration-cyan-400/50 underline-offset-2"
        >
            {technology.name}
        </button>
    );
};

const AnalysisModal: React.FC<AnalysisModalProps> = ({ analysisData, onClose }) => {
  const isComparisonData = isComparison(analysisData);
  const [popover, setPopover] = useState<PopoverState>(null);

  const handleTechClick = (tech: Technology, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const left = rect.left + rect.width / 2 > window.innerWidth / 2 
        ? rect.right - 320 
        : rect.left;

    setPopover({
        content: tech,
        top: rect.bottom + 8,
        left: Math.max(8, left),
    });
  }
  
  const renderTechnologyCell = (value: string) => {
    const techNames = value.split(',').map(name => name.trim()).filter(Boolean);
    return (
        <div className="flex flex-wrap gap-1.5">
            {techNames.map((name, index) => {
                const techDetail = analysisData.technologies.find(tech => tech.name.toLowerCase() === name.toLowerCase());
                return techDetail ? (
                    <TechnologyPill key={index} technology={techDetail} onSelect={handleTechClick} />
                ) : (
                    <span key={index} className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md text-sm">{name}</span>
                );
            })}
        </div>
    );
  };


  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" onClick={onClose}>
        {popover && (
         <div className="fixed inset-0 z-50" onClick={(e) => { e.stopPropagation(); setPopover(null);}}>
            <div
                className="absolute bg-slate-900 border border-cyan-500/50 rounded-lg shadow-xl p-4 max-w-xs w-80"
                style={{ top: `${popover.top}px`, left: `${popover.left}px` }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="font-bold text-base mb-2 text-cyan-300 flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5"/> 
                    {popover.content.name}
                </h3>
                <p className="text-slate-300 text-sm">{popover.content.description}</p>
            </div>
         </div>
      )}

      <div className="bg-slate-800 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-teal-300">
            {isComparisonData ? 'Результаты сравнения' : 'Результаты анализа'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <CloseIcon className="h-6 w-6" />
          </button>
        </header>
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="p-3 text-sm font-semibold text-slate-300 border-b-2 border-slate-700">Параметр</th>
                  {isComparisonData ? (
                    analysisData.productNames.map(name => (
                      <th key={name} className="p-3 text-sm font-semibold text-slate-300 border-b-2 border-slate-700">{name}</th>
                    ))
                  ) : (
                    <>
                      <th className="p-3 text-sm font-semibold text-slate-300 border-b-2 border-slate-700">Значение</th>
                      <th className="p-3 text-sm font-semibold text-slate-300 border-b-2 border-slate-700">Описание</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {isComparisonData ? (
                  analysisData.parameters.map((param, index) => (
                    <tr key={index} className="border-b border-slate-700/50">
                      <td className="p-3 font-medium text-slate-400 align-top">{param.name}</td>
                       {param.values.map((val, vIndex) => (
                        <td key={vIndex} className={`p-3 align-top ${param.name !== 'Технологии' && val.isBest ? 'bg-green-500/10 text-green-300' : 'text-slate-200'}`}>
                            {param.name === 'Технологии' ? renderTechnologyCell(val.value) : val.value}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  analysisData.parameters.map((param, index) => (
                    <tr key={index} className="border-b border-slate-700/50">
                      <td className="p-3 font-medium text-slate-400 align-top">{param.name}</td>
                      {param.name === 'Технологии' ? (
                          <td className="p-3 text-slate-200 align-top" colSpan={2}>
                              {renderTechnologyCell(param.value)}
                          </td>
                      ) : (
                          <>
                            <td className="p-3 text-slate-200 align-top">{param.value}</td>
                            <td className="p-3 text-slate-400 text-sm align-top">{param.description}</td>
                          </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-slate-900/50 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-teal-400 flex items-center gap-2"><SparklesIcon className="h-5 w-5"/> Резюме</h3>
            <MarkdownRenderer content={analysisData.summary} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalysisModal;