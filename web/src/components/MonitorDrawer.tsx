import React, { useState, useEffect } from 'react';
import { X, Activity, Plus, Trash2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { HttpMethod } from '../types/index.js';

interface Monitor {
  id: number;
  name: string;
  method: string;
  url: string;
  interval_minutes: number;
  expected_status: number;
  last_status: number | null;
  last_latency_ms: number | null;
  last_checked_at: string | null;
  is_active: number;
}

interface MonitorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUrl?: string;
  defaultMethod?: HttpMethod;
}

export const MonitorDrawer: React.FC<MonitorDrawerProps> = ({
  isOpen,
  onClose,
  defaultUrl = '',
  defaultMethod = 'GET',
}) => {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState(defaultUrl || 'https://httpbin.org/status/200');
  const [method, setMethod] = useState(defaultMethod || 'GET');
  const [intervalMinutes, setIntervalMinutes] = useState(15);
  const [expectedStatus, setExpectedStatus] = useState(200);
  const [loading, setLoading] = useState(false);

  const fetchMonitors = async () => {
    try {
      const res = await fetch('/api/monitors');
      if (res.ok) {
        const data = await res.json();
        setMonitors(data);
      }
    } catch (err) {
      console.error('Failed to load monitors:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMonitors();
    }
  }, [isOpen]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/monitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          method,
          url: url.trim(),
          intervalMinutes,
          expectedStatus,
        }),
      });

      if (res.ok) {
        setName('');
        setShowAddForm(false);
        fetchMonitors();
      }
    } catch (err) {
      console.error('Failed to create monitor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/monitors/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMonitors();
      }
    } catch (err) {
      console.error('Failed to delete monitor:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0f172a] h-full flex flex-col border-l border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <h2 className="font-semibold text-sm text-white">Health-Check Monitors</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAddForm(true)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              title="Add Monitor"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Telegram Alert Note */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 leading-relaxed">
          <p className="text-slate-300 font-semibold mb-0.5">Automated Telegram Alerts</p>
          Monitors ping your endpoints periodically in the background. If an endpoint fails or latency spikes, the bot sends an instant alert to your Telegram chat.
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {showAddForm ? (
            <form onSubmit={handleCreate} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2.5">
              <p className="font-semibold text-xs text-slate-200">New API Monitor</p>

              <div>
                <label className="text-[11px] text-slate-400">Monitor Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Production Login API"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[11px] text-slate-400">Method:</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as HttpMethod)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="HEAD">HEAD</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Interval:</label>
                  <select
                    value={intervalMinutes}
                    onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value={5}>Every 5m</option>
                    <option value={15}>Every 15m</option>
                    <option value={30}>Every 30m</option>
                    <option value={60}>Every 1h</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Expected Status:</label>
                  <input
                    type="number"
                    value={expectedStatus}
                    onChange={(e) => setExpectedStatus(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Target URL:</label>
                <input
                  type="url"
                  placeholder="https://api.example.com/health"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3.5 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded"
                >
                  {loading ? 'Creating...' : 'Start Monitoring'}
                </button>
              </div>
            </form>
          ) : null}

          {monitors.length === 0 && !showAddForm ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <Activity className="w-8 h-8 mb-2 opacity-30 text-amber-400" />
              <p className="text-xs">No active monitors.</p>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                + Add First Monitor
              </button>
            </div>
          ) : (
            monitors.map((m) => {
              const isHealthy = m.last_status === m.expected_status;

              return (
                <div key={m.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {m.last_status === null ? (
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                      ) : isHealthy ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      <span className="font-semibold text-slate-200 truncate">{m.name}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(m.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="font-mono text-[11px] text-slate-400 truncate">
                    {m.method} {m.url}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-0.5 border-t border-slate-800/60">
                    <span>Interval: {m.interval_minutes}m</span>
                    <span>
                      {m.last_status !== null
                        ? `HTTP ${m.last_status} (${m.last_latency_ms}ms)`
                        : 'Pending check'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
