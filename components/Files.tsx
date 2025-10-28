import React, { useState } from 'react';
import { StoredFile } from '../types';
import { analyzeFileContent } from '../services/geminiService';
import { FileIcon, DeleteIcon, SparklesIcon, EyeIcon, UploadIcon } from './icons';
import MarkdownRenderer from './MarkdownRenderer';

interface FilesProps {
  files: StoredFile[];
  setFiles: React.Dispatch<React.SetStateAction<StoredFile[]>>;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });

const base64ToText = (base64: string) => {
    try {
        return atob(base64);
    } catch(e) {
        return "Невозможно отобразить бинарный контент.";
    }
};

const Files: React.FC<FilesProps> = ({ files, setFiles }) => {
  const [selectedFile, setSelectedFile] = useState<StoredFile | null>(null);
  const [analysisResult, setAnalysisResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    for (const file of uploadedFiles) {
      const base64Content = await fileToBase64(file);
      const newFile: StoredFile = {
        id: `${file.name}-${Date.now()}`,
        name: file.name,
        type: file.type,
        content: base64Content,
      };
      setFiles(prev => [newFile, ...prev]);
    }
  };

  const deleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFile?.id === id) {
        setSelectedFile(null);
        setAnalysisResult('');
    }
  };

  const handleAnalyzeFile = async (file: StoredFile) => {
      setIsLoading(true);
      setAnalysisResult('');
      const textContent = base64ToText(file.content);
      const result = await analyzeFileContent(textContent, file.name);
      setAnalysisResult(result);
      setIsLoading(false);
  }

  return (
    <div className="h-full flex flex-col md:flex-row gap-8">
      {/* Left Panel: File List */}
      <div className="md:w-1/3 flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-slate-300">Файлы</h2>
        <div className="mb-4">
            <label htmlFor="file-upload" className="w-full cursor-pointer bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2">
                <UploadIcon className="h-5 w-5" />
                Загрузить файлы
            </label>
            <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileUpload} />
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 flex-grow overflow-y-auto border border-slate-700/50 min-h-[150px]">
            {files.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Файлы не загружены.</p>
            ) : (
                <ul>
                    {files.map(file => (
                        <li key={file.id} className="flex justify-between items-center bg-slate-700/50 p-2.5 rounded-md mb-2">
                            <div className="flex items-center gap-2 truncate">
                                <FileIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                                <span className="text-slate-300 truncate" title={file.name}>{file.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => { setSelectedFile(file); setAnalysisResult(''); }} className="text-slate-400 hover:text-teal-400"><EyeIcon className="h-5 w-5" /></button>
                                <button onClick={() => deleteFile(file.id)} className="text-slate-500 hover:text-red-400"><DeleteIcon className="h-5 w-5" /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>

      {/* Right Panel: File Viewer/Analyzer */}
      <div className="md:w-2/3 flex flex-col bg-slate-800/50 rounded-lg border border-slate-700/50">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-300">Просмотр и анализ</h2>
            {selectedFile && (
                <button 
                    onClick={() => handleAnalyzeFile(selectedFile)}
                    disabled={isLoading}
                    className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <SparklesIcon className="h-5 w-5" />
                    {isLoading ? 'Анализ...' : 'Анализировать'}
                </button>
            )}
        </div>
        <div className="p-4 flex-grow overflow-y-auto">
            {!selectedFile ? (
                <div className="text-slate-500 text-center py-16">
                    <EyeIcon className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                    <p>Выберите файл для просмотра и анализа.</p>
                </div>
            ) : (
                <div>
                    <div className="bg-slate-900 p-3 rounded-md mb-4">
                        <h3 className="font-bold text-lg text-slate-200">{selectedFile.name}</h3>
                        <p className="text-sm text-slate-400">{selectedFile.type}</p>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
                        </div>
                    ) : analysisResult ? (
                         <MarkdownRenderer content={analysisResult} />
                    ) : (
                        <pre className="whitespace-pre-wrap break-words bg-slate-900 p-4 rounded-md text-slate-300 text-sm max-h-96 overflow-y-auto">
                            {base64ToText(selectedFile.content)}
                        </pre>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Files;
