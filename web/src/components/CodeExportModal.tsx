import React, { useState } from 'react';
import { X, FileCode2, Copy, Check } from 'lucide-react';
import { HttpMethod } from '../types/index.js';
import {
  generateCurl,
  generateFetch,
  generatePython,
  generateGo,
} from '../utils/codeGenerators.js';

interface CodeExportModalProps {
  isOpen: boolean;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
  onClose: () => void;
}

type LangType = 'curl' | 'javascript' | 'python' | 'go';

export const CodeExportModal: React.FC<CodeExportModalProps> = ({
  isOpen,
  method,
  url,
  headers,
  body,
  onClose,
}) => {
  const [lang, setLang] = useState<LangType>('curl');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  let code = '';
  switch (lang) {
    case 'curl':
      code = generateCurl(method, url, headers, body);
      break;
    case 'javascript':
      code = generateFetch(method, url, headers, body);
      break;
    case 'python':
      code = generatePython(method, url, headers, body);
      break;
    case 'go':
      code = generateGo(method, url, headers, body);
      break;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-[#0f172a] rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-sky-400" />
            <h3 className="font-semibold text-sm text-white">Generate Code Snippet</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language Tabs */}
        <div className="flex border-b border-slate-800 bg-[#1e293b]/50 px-3 gap-1 overflow-x-auto">
          {(['curl', 'javascript', 'python', 'go'] as LangType[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`px-3 py-2 text-xs font-semibold border-b-2 capitalize transition-colors ${
                lang === l
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {l === 'javascript' ? 'JavaScript (Fetch)' : l === 'curl' ? 'cURL' : l}
            </button>
          ))}
        </div>

        {/* Snippet Display */}
        <div className="p-4 flex-1 overflow-auto flex flex-col space-y-3">
          <div className="relative flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 overflow-auto">
            <pre className="whitespace-pre">{code}</pre>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Snippet</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
