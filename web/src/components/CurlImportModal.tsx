import React, { useState } from 'react';
import { X, Terminal, FileJson, ArrowDownToLine } from 'lucide-react';
import { HttpMethod } from '../types/index.js';
import { parsePostmanCollection } from '../utils/postman.js';

interface CurlImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCurl: (curlString: string) => Promise<void>;
  onImportPostman: (collectionName: string, requests: any[]) => void;
}

export const CurlImportModal: React.FC<CurlImportModalProps> = ({
  isOpen,
  onClose,
  onImportCurl,
  onImportPostman,
}) => {
  const [activeTab, setActiveTab] = useState<'curl' | 'postman'>('curl');
  const [curlText, setCurlText] = useState('');
  const [postmanText, setPostmanText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImportCurl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curlText.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await onImportCurl(curlText.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to parse cURL command');
    } finally {
      setLoading(false);
    }
  };

  const handleImportPostman = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postmanText.trim()) return;

    setError(null);
    try {
      const result = parsePostmanCollection(postmanText.trim());
      onImportPostman(result.collectionName, result.requests);
      onClose();
    } catch (err: any) {
      setError(`Invalid Postman collection JSON: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-[#0f172a] rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownToLine className="w-4 h-4 text-sky-400" />
            <h3 className="font-semibold text-sm text-white">Import Requests</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-slate-800 bg-[#1e293b]/50 px-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('curl');
              setError(null);
            }}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'curl'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> cURL Command
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('postman');
              setError(null);
            }}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'postman'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" /> Postman Collection
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto">
          {error && (
            <div className="mb-3 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded text-xs text-rose-300">
              {error}
            </div>
          )}

          {activeTab === 'curl' ? (
            <form onSubmit={handleImportCurl} className="space-y-3">
              <label className="text-xs text-slate-400">
                Paste your cURL command below to extract method, URL, headers, and payload:
              </label>
              <textarea
                rows={7}
                placeholder={`curl -X POST https://api.example.com/login \\\n  -H 'Content-Type: application/json' \\\n  -d '{"username":"admin"}'`}
                value={curlText}
                onChange={(e) => setCurlText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !curlText.trim()}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded"
                >
                  {loading ? 'Parsing...' : 'Import to Runner'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleImportPostman} className="space-y-3">
              <label className="text-xs text-slate-400">
                Paste Postman Collection v2.1 JSON below:
              </label>
              <textarea
                rows={7}
                placeholder={`{\n  "info": {\n    "name": "My API"\n  },\n  "item": [...] \n}`}
                value={postmanText}
                onChange={(e) => setPostmanText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!postmanText.trim()}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded"
                >
                  Import Collection
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
