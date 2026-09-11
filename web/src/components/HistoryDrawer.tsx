import React from 'react';
import { X, History, Trash2, Clock, ExternalLink } from 'lucide-react';
import { HistoryItem, HttpMethod } from '../types/index.js';

interface HistoryDrawerProps {
  isOpen: boolean;
  history: HistoryItem[];
  onClose: () => void;
  onSelectHistoryItem: (method: HttpMethod, url: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  history,
  onClose,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (code >= 300 && code < 400) return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
    if (code >= 400 && code < 500) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-[#0f172a] h-full flex flex-col border-l border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-sky-400" />
            <h2 className="font-semibold text-sm text-white">Execution History</h2>
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Clear all request history?')) {
                    onClearHistory();
                  }
                }}
                className="px-2 py-1 text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1"
                title="Clear History"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <Clock className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">No executed requests yet.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistoryItem(item.method as HttpMethod, item.url);
                  onClose();
                }}
                className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition-all cursor-pointer group space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono text-xs font-bold text-slate-200">
                      {item.method}
                    </span>
                    <span className="text-xs font-mono text-slate-400 truncate max-w-[180px]">
                      {item.url}
                    </span>
                  </div>

                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getStatusColor(
                      item.status_code
                    )}`}
                  >
                    {item.status_code}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>{item.latency_ms} ms</span>
                  <span>{new Date(item.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
