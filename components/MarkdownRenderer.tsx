
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderContent = () => {
    const lines = content.split('\n');
    // FIX: Replaced JSX.Element with React.ReactElement to resolve JSX namespace errors.
    const elements: React.ReactElement[] = [];
    let isCodeBlock = false;
    let codeBlockContent: string[] = [];
    let isList = false;

    // FIX: Replaced JSX.Element with React.ReactElement to resolve JSX namespace errors.
    const flushList = (listItems: React.ReactElement[]) => {
      if (listItems.length > 0) {
        elements.push(<ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-3 pl-4">{listItems}</ul>);
      }
    };

    // FIX: Replaced JSX.Element with React.ReactElement to resolve JSX namespace errors.
    let listItems: React.ReactElement[] = [];

    lines.forEach((line, index) => {
      const key = `line-${index}`;
      
      if (line.trim().startsWith('```')) {
        if (isCodeBlock) {
          elements.push(
            <pre key={key} className="bg-slate-900 text-slate-300 p-3 my-3 rounded-md overflow-x-auto">
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
        }
        isCodeBlock = !isCodeBlock;
        return;
      }

      if (isCodeBlock) {
        codeBlockContent.push(line);
        return;
      }
      
      const isListItem = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      if (!isListItem && isList) {
          flushList(listItems);
          listItems = [];
          isList = false;
      }

      if (line.trim().startsWith('### ')) {
        flushList(listItems); listItems=[]; isList=false;
        elements.push(<h3 key={key} className="text-lg font-semibold mt-4 mb-2 text-teal-300">{line.substring(4)}</h3>);
      } else if (line.trim().startsWith('## ')) {
        flushList(listItems); listItems=[]; isList=false;
        elements.push(<h2 key={key} className="text-xl font-bold mt-5 mb-3 text-teal-300">{line.substring(3)}</h2>);
      } else if (line.trim().startsWith('# ')) {
        flushList(listItems); listItems=[]; isList=false;
        elements.push(<h1 key={key} className="text-2xl font-extrabold mt-6 mb-4 text-teal-200">{line.substring(2)}</h1>);
      } else if (isListItem) {
        isList = true;
        listItems.push(<li key={key}>{line.trim().substring(2)}</li>);
      } else if(line.trim() === '') {
        flushList(listItems); listItems=[]; isList=false;
        elements.push(<br key={key} />);
      }
      else {
        // Handle bold text within a line
        const parts = line.split(/(\*\*.*?\*\*)/g);
        elements.push(
          <p key={key} className="my-1">
            {parts.map((part, i) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={i}>{part.slice(2, -2)}</strong>
              ) : (
                part
              )
            )}
          </p>
        );
      }
    });
    
    flushList(listItems); // Flush any remaining list items

    if(codeBlockContent.length > 0) {
         elements.push(
            <pre key={`code-final`} className="bg-slate-900 text-slate-300 p-3 my-3 rounded-md overflow-x-auto">
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
    }

    return elements;
  };

  return <div className="prose prose-invert text-slate-300 max-w-none">{renderContent()}</div>;
};

export default MarkdownRenderer;