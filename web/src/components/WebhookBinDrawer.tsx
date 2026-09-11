import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface WebhookEvent {
  id: number;
  bin_id: string;
  method: string;
  path: string;
  headers_json: string;
  query_json: string;
  body_raw: string | null;
  created_at: string;
}

interface WebhookBinDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebhookBinDrawer: React.FC<WebhookBinDrawerProps> = ({ isOpen, onClose }) => {
  const [binId, setBinId] = useState<string>(() => localStorage.getItem('restpocket_bin_id') || '');
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);

  // Generate full bin URL
  const binUrl = binId
    ? `${window.location.origin}/api/bin/${binId}`
    : '';

  const createBin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bin/create', { method: 'POST' });
      const data = await res.json();
      setBinId(data.binId);
      localStorage.setItem('restpocket_bin_id', data.binId);
      setEvents([]);
    } catch (err) {
      console.error('Failed to create bin:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    if (!binId) return;
    try {
      const res = await fetch(`/api/bin/${binId}/events`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  const clearEvents = async () => {
    if (!binId) return;
    try {
      await fetch(`/api/bin/${binId}/events`, { method: 'DELETE' });
      setEvents([]);
    } catch (err) {
      console.error('Failed to clear events:', err);
    }
  };

  useEffect(() => {
    if (isOpen && binId) {
      fetchEvents();
      const interval = setInterval(fetchEvents, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, binId]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(binUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0f172a] h-full flex flex-col border-l border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h2 className="font-semibold text-sm text-white">Webhook Catcher (RequestBin)</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bin URL Bar */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 space-y-2">
          {!binId ? (
            <div className="text-center py-2 space-y-2">
              <p className="text-xs text-slate-400">
                Create a temporary endpoint to capture and inspect incoming webhooks in real time.
              </p>
              <button
                type="button"
                onClick={createBin}
                disabled={loading}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded"
              >
                {loading ? 'Creating...' : 'Create New Webhook Bin'}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Webhook Endpoint URL:</span>
                <button
                  type="button"
                  onClick={createBin}
                  className="text-sky-400 hover:text-sky-300 hover:underline"
                >
                  New Bin
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={binUrl}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-emerald-400 select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                  title="Copy Webhook URL"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 text-[11px]">
                  Listening live... ({events.length} captured)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchEvents}
                    className="text-slate-400 hover:text-white p-1"
                    title="Refresh"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                  {events.length > 0 && (
                    <button
                      type="button"
                      onClick={clearEvents}
                      className="text-slate-400 hover:text-rose-400 p-1"
                      title="Clear Events"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Captured Events List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <Radio className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs">No webhooks received yet.</p>
              <p className="text-[11px] text-slate-600 mt-1 max-w-xs">
                Send a POST request to your endpoint URL to see the payload appear here automatically.
              </p>
            </div>
          ) : (
            events.map((evt) => {
              const isExpanded = expandedEventId === evt.id;
              let headersObj = {};
              try {
                headersObj = JSON.parse(evt.headers_json);
              } catch {
                // Ignored
              }

              return (
                <div
                  key={evt.id}
                  className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden text-xs"
                >
                  <div
                    onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                    className="p-2 flex items-center justify-between cursor-pointer hover:bg-slate-800/60"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                      <span className="font-bold font-mono text-emerald-400">{evt.method}</span>
                      <span className="text-slate-300 font-mono truncate max-w-[180px]">{evt.path}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(evt.created_at).toLocaleTimeString()}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/60">
                      {/* Headers */}
                      <div>
                        <p className="text-[11px] font-semibold text-slate-400 mb-1">Headers:</p>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800 max-h-32 overflow-y-auto font-mono text-[11px] space-y-0.5">
                          {Object.entries(headersObj).map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                              <span className="text-sky-400">{k}:</span>
                              <span className="text-slate-300 truncate max-w-[200px]">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Body */}
                      {evt.body_raw && (
                        <div>
                          <p className="text-[11px] font-semibold text-slate-400 mb-1">Body Payload:</p>
                          <pre className="bg-slate-900 p-2 rounded border border-slate-800 font-mono text-[11px] text-emerald-300 max-h-48 overflow-auto whitespace-pre-wrap">
                            {evt.body_raw}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
