import React, { useState } from 'react';
import { ChevronDown, Send, Loader2 } from 'lucide-react';
import { HttpMethod } from '../types/index.js';

interface RequestBarProps {
  method: HttpMethod;
  url: string;
  isLoading: boolean;
  onMethodChange: (method: HttpMethod) => void;
  onUrlChange: (url: string) => void;
  onSend: () => void;
}

const methodColors: Record<HttpMethod, { bg: string; text: string; border: string }> = {
  GET: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  POST: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  PUT: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  PATCH: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  DELETE: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  HEAD: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
  OPTIONS: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
};

const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

export const RequestBar: React.FC<RequestBarProps> = ({
  method,
  url,
  isLoading,
  onMethodChange,
  onUrlChange,
  onSend,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const color = methodColors[method] || methodColors.GET;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!isLoading && url.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="p-3 bg-[#0f172a] border-b border-slate-800">
      <div className="flex items-center gap-1.5 bg-[#1e293b] rounded-xl p-1 border border-slate-700/80 shadow-inner">
        {/* Method selector dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-1 px-2.5 py-2 rounded-lg font-bold text-xs tracking-wider border transition-all ${color.bg} ${color.text} ${color.border}`}
          >
            <span>{method}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 z-40 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 min-w-[110px]">
              {methods.map((m) => {
                const mColor = methodColors[m];
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      onMethodChange(m);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-bold transition-colors hover:bg-slate-800 ${mColor.text}`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* URL Input */}
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://api.example.com/v1/endpoint"
            className="w-full bg-transparent px-2.5 py-1.5 text-sm font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={onSend}
          disabled={isLoading || !url.trim()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-sky-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Send</span>
              <Send className="w-3.5 h-3.5 fill-white" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
