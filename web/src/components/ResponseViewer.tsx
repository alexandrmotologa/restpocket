import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  Search,
  ChevronRight,
  ChevronDown,
  Info,
  Clock,
  HardDrive,
  AlertTriangle,
  BookmarkPlus,
  Layers,
} from 'lucide-react';
import { ExecuteResult } from '../types/index.js';
import { getDiagnostic } from '../utils/diagnostics.js';

interface ResponseViewerProps {
  result: ExecuteResult | null;
  error: string | null;
  isLoading: boolean;
  onSaveToVariable?: (key: string, value: string) => void;
}

type ResponseTab = 'pretty' | 'raw' | 'headers' | 'diagnostics';

export const ResponseViewer: React.FC<ResponseViewerProps> = ({
  result,
  error,
  isLoading,
  onSaveToVariable,
}) => {
  const [activeTab, setActiveTab] = useState<ResponseTab>('pretty');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCollapse = (path: string) => {
    const next = new Set(collapsedPaths);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }
    setCollapsedPaths(next);
  };

  const diagnostic = useMemo(() => {
    if (result) {
      return getDiagnostic(result.status);
    }
    if (error) {
      return getDiagnostic(0, error);
    }
    return null;
  }, [result, error]);

  // Collapsible JSON Tree Node
  const renderJsonTree = (data: any, path = '', depth = 0): React.ReactNode => {
    if (data === null) return <span className="text-slate-500">null</span>;
    if (typeof data === 'boolean') return <span className="text-amber-400">{String(data)}</span>;
    if (typeof data === 'number') return <span className="text-emerald-400">{data}</span>;
    if (typeof data === 'string') {
      const isMatch = searchQuery && data.toLowerCase().includes(searchQuery.toLowerCase());
      return (
        <span className={`text-sky-300 break-all ${isMatch ? 'bg-yellow-500/30 font-bold' : ''}`}>
          "{data}"
        </span>
      );
    }

    if (Array.isArray(data)) {
      if (data.length === 0) return <span className="text-slate-400">[]</span>;
      const isCollapsed = collapsedPaths.has(path);

      return (
        <div className="inline">
          <button
            type="button"
            onClick={() => toggleCollapse(path)}
            className="inline-flex items-center text-slate-400 hover:text-white px-0.5"
          >
            {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <span className="text-slate-400">[</span>
          {isCollapsed ? (
            <span
              onClick={() => toggleCollapse(path)}
              className="text-xs text-slate-500 cursor-pointer px-1 hover:underline"
            >
              {data.length} items...
            </span>
          ) : (
            <div className="pl-4 border-l border-slate-800 ml-1.5 my-0.5 space-y-0.5">
              {data.map((item, idx) => (
                <div key={idx} className="leading-tight">
                  <span className="text-slate-500 mr-1 text-[11px]">{idx}:</span>
                  {renderJsonTree(item, `${path}.${idx}`, depth + 1)}
                </div>
              ))}
            </div>
          )}
          <span className="text-slate-400">]</span>
        </div>
      );
    }

    if (typeof data === 'object') {
      const keys = Object.keys(data);
      if (keys.length === 0) return <span className="text-slate-400">{'{}'}</span>;
      const isCollapsed = collapsedPaths.has(path);

      return (
        <div className="inline">
          {depth > 0 && (
            <button
              type="button"
              onClick={() => toggleCollapse(path)}
              className="inline-flex items-center text-slate-400 hover:text-white px-0.5"
            >
              {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
          <span className="text-slate-400">{'{'}</span>
          {isCollapsed ? (
            <span
              onClick={() => toggleCollapse(path)}
              className="text-xs text-slate-500 cursor-pointer px-1 hover:underline"
            >
              {keys.length} keys...
            </span>
          ) : (
            <div className="pl-4 border-l border-slate-800 ml-1.5 my-0.5 space-y-0.5">
              {keys.map((key) => {
                const val = data[key];
                const keyMatches = searchQuery && key.toLowerCase().includes(searchQuery.toLowerCase());
                const currentPath = path ? `${path}.${key}` : key;

                return (
                  <div key={key} className="flex items-start group leading-tight">
                    <span
                      className={`text-indigo-300 mr-1 text-xs font-mono font-medium ${
                        keyMatches ? 'bg-yellow-500/30' : ''
                      }`}
                    >
                      "{key}":
                    </span>
                    <div className="flex-1 overflow-x-auto">
                      {renderJsonTree(val, currentPath, depth + 1)}
                    </div>
                    {/* Response Chaining: Save to variable button */}
                    {onSaveToVariable && typeof val === 'string' && (
                      <button
                        type="button"
                        onClick={() => onSaveToVariable(key, val)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-0.5 text-slate-400 hover:text-sky-400"
                        title={`Save "${key}" to variable`}
                      >
                        <BookmarkPlus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <span className="text-slate-400">{'}'}</span>
        </div>
      );
    }

    return <span>{String(data)}</span>;
  };

  // Status badge colors
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (status >= 300 && status < 400) return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    if (status >= 400 && status < 500) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  };

  if (!result && !error && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-3 border border-slate-700/40">
          <Layers className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="font-semibold text-slate-300 text-sm mb-1">Ready to Test</h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          Configure method, URL, and headers above, then tap <strong>Send</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f17] overflow-hidden">
      {/* Response Metrics & Header Bar */}
      <div className="p-3 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {result && (
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono border ${getStatusColor(
                result.status
              )}`}
            >
              {result.status} {result.statusText}
            </span>
          )}
          {error && (
            <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> ERROR
            </span>
          )}

          {result && (
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                {result.latencyMs} ms
              </span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                {(result.sizeBytes / 1024).toFixed(1)} KB
              </span>
            </div>
          )}
        </div>

        {/* Copy button */}
        {result && (
          <button
            type="button"
            onClick={() =>
              handleCopy(
                typeof result.data === 'object'
                  ? JSON.stringify(result.data, null, 2)
                  : String(result.data)
              )
            }
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Response View Sub-tabs */}
      <div className="flex border-b border-slate-800 bg-[#0f172a] px-3 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('pretty')}
          className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'pretty'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Pretty
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('raw')}
          className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'raw'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Raw
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('headers')}
          className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'headers'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Headers {result && `(${Object.keys(result.headers).length})`}
        </button>
        {(error || (result && result.status >= 400)) && (
          <button
            type="button"
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1 ${
              activeTab === 'diagnostics'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-amber-500 hover:text-amber-300'
            }`}
          >
            <Info className="w-3 h-3" /> Diagnostics
          </button>
        )}
      </div>

      {/* Search Filter in Pretty View */}
      {activeTab === 'pretty' && (
        <div className="px-3 py-1.5 bg-[#121927] border-b border-slate-800 flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search response keys or values..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 p-3 overflow-auto font-mono text-xs text-slate-300">
        {error ? (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 space-y-1">
            <p className="font-semibold text-rose-400">Request Failed</p>
            <p className="text-xs">{error}</p>
          </div>
        ) : result ? (
          <>
            {activeTab === 'pretty' && (
              <div className="space-y-1">
                {result.isBinary ? (
                  result.contentType?.startsWith('image/') ? (
                    <div className="p-4 flex flex-col items-center justify-center bg-slate-900 rounded-lg">
                      <img src={result.data} alt="Response" className="max-w-full max-h-72 rounded shadow" />
                      <span className="text-[11px] text-slate-500 mt-2">{result.contentType}</span>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-400">
                      Binary payload ({result.contentType || 'application/octet-stream'})
                    </div>
                  )
                ) : typeof result.data === 'object' ? (
                  renderJsonTree(result.data)
                ) : (
                  <pre className="whitespace-pre-wrap">{String(result.data)}</pre>
                )}
              </div>
            )}

            {activeTab === 'raw' && (
              <pre className="whitespace-pre-wrap select-all">
                {typeof result.data === 'object'
                  ? JSON.stringify(result.data, null, 2)
                  : String(result.data)}
              </pre>
            )}

            {activeTab === 'headers' && (
              <div className="space-y-1.5">
                {Object.entries(result.headers).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-start justify-between py-1 border-b border-slate-800/60 text-xs"
                  >
                    <span className="text-sky-400 font-semibold">{key}:</span>
                    <span className="text-slate-300 break-all text-right max-w-xs">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'diagnostics' && diagnostic && (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-400" />
                  <span className="font-semibold text-sm text-slate-200">{diagnostic.title}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{diagnostic.tip}</p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};
