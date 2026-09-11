import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Layers,
  FileJson,
  KeyRound,
  FileText,
} from 'lucide-react';
import { RequestParam, RequestHeader, AuthConfig, BodyType } from '../types/index.js';

interface RequestTabsProps {
  params: RequestParam[];
  headers: RequestHeader[];
  auth: AuthConfig;
  bodyType: BodyType;
  bodyContent: string;
  onParamsChange: (params: RequestParam[]) => void;
  onHeadersChange: (headers: RequestHeader[]) => void;
  onAuthChange: (auth: AuthConfig) => void;
  onBodyTypeChange: (type: BodyType) => void;
  onBodyContentChange: (content: string) => void;
}

type TabType = 'params' | 'headers' | 'auth' | 'body';

export const RequestTabs: React.FC<RequestTabsProps> = ({
  params,
  headers,
  auth,
  bodyType,
  bodyContent,
  onParamsChange,
  onHeadersChange,
  onAuthChange,
  onBodyTypeChange,
  onBodyContentChange,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('params');
  const [isFormBuilderMode, setIsFormBuilderMode] = useState(false);
  const [formRows, setFormRows] = useState<Array<{ id: string; key: string; value: string }>>([
    { id: '1', key: '', value: '' },
  ]);

  // Sync Form Builder rows to JSON bodyContent
  const handleFormRowChange = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...formRows];
    updated[index][field] = value;
    setFormRows(updated);

    const obj: Record<string, any> = {};
    for (const row of updated) {
      if (row.key.trim()) {
        let parsedVal: any = row.value;
        if (row.value === 'true') parsedVal = true;
        else if (row.value === 'false') parsedVal = false;
        else if (!isNaN(Number(row.value)) && row.value.trim() !== '') parsedVal = Number(row.value);
        obj[row.key.trim()] = parsedVal;
      }
    }
    onBodyContentChange(JSON.stringify(obj, null, 2));
  };

  const addFormRow = () => {
    setFormRows([...formRows, { id: String(Date.now()), key: '', value: '' }]);
  };

  const removeFormRow = (index: number) => {
    const updated = formRows.filter((_, i) => i !== index);
    setFormRows(updated.length ? updated : [{ id: '1', key: '', value: '' }]);
  };

  // Beautify JSON button
  const handleBeautify = () => {
    try {
      const parsed = JSON.parse(bodyContent);
      onBodyContentChange(JSON.stringify(parsed, null, 2));
    } catch {
      // Invalid JSON, keep as is
    }
  };

  // Header quick preset click
  const applyHeaderPreset = (key: string, value: string) => {
    const existingIndex = headers.findIndex((h) => h.key.toLowerCase() === key.toLowerCase());
    if (existingIndex >= 0) {
      const updated = [...headers];
      updated[existingIndex].value = value;
      updated[existingIndex].enabled = true;
      onHeadersChange(updated);
    } else {
      onHeadersChange([...headers, { id: String(Date.now()), key, value, enabled: true }]);
    }
  };

  return (
    <div className="bg-[#0f172a] border-b border-slate-800">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 px-3 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('params')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'params'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Params</span>
          {params.filter((p) => p.enabled && p.key).length > 0 && (
            <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 text-[10px] flex items-center justify-center font-mono">
              {params.filter((p) => p.enabled && p.key).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('headers')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'headers'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Headers</span>
          {headers.filter((h) => h.enabled && h.key).length > 0 && (
            <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 text-[10px] flex items-center justify-center font-mono">
              {headers.filter((h) => h.enabled && h.key).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('auth')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'auth'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-3 h-3" />
          <span>Auth</span>
          {auth.type !== 'none' && (
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('body')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'body'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3 h-3" />
          <span>Body</span>
          {bodyType !== 'none' && (
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-3 max-h-56 overflow-y-auto">
        {/* PARAMS TAB */}
        {activeTab === 'params' && (
          <div className="space-y-2">
            <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
              <span>Query Parameters</span>
              <button
                type="button"
                onClick={() =>
                  onParamsChange([...params, { id: String(Date.now()), key: '', value: '', enabled: true }])
                }
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium"
              >
                <Plus className="w-3 h-3" /> Add Param
              </button>
            </div>

            {params.map((param, index) => (
              <div key={param.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={param.enabled}
                  onChange={(e) => {
                    const updated = [...params];
                    updated[index].enabled = e.target.checked;
                    onParamsChange(updated);
                  }}
                  className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="Key"
                  value={param.key}
                  onChange={(e) => {
                    const updated = [...params];
                    updated[index].key = e.target.value;
                    onParamsChange(updated);
                  }}
                  className="flex-1 bg-[#1e293b] border border-slate-700/80 rounded px-2 py-1 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={param.value}
                  onChange={(e) => {
                    const updated = [...params];
                    updated[index].value = e.target.value;
                    onParamsChange(updated);
                  }}
                  className="flex-1 bg-[#1e293b] border border-slate-700/80 rounded px-2 py-1 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => onParamsChange(params.filter((_, i) => i !== index))}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* HEADERS TAB */}
        {activeTab === 'headers' && (
          <div className="space-y-3">
            {/* Quick Preset Chips */}
            <div className="flex flex-wrap gap-1.5 pb-1 border-b border-slate-800">
              <button
                type="button"
                onClick={() => applyHeaderPreset('Content-Type', 'application/json')}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                + JSON Content-Type
              </button>
              <button
                type="button"
                onClick={() => applyHeaderPreset('Accept', 'application/json')}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                + Accept JSON
              </button>
              <button
                type="button"
                onClick={() => applyHeaderPreset('User-Agent', 'RestPocket/1.0')}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                + User-Agent
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
                <span>Headers List</span>
                <button
                  type="button"
                  onClick={() =>
                    onHeadersChange([...headers, { id: String(Date.now()), key: '', value: '', enabled: true }])
                  }
                  className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium"
                >
                  <Plus className="w-3 h-3" /> Add Header
                </button>
              </div>

              {headers.map((header, index) => (
                <div key={header.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={header.enabled}
                    onChange={(e) => {
                      const updated = [...headers];
                      updated[index].enabled = e.target.checked;
                      onHeadersChange(updated);
                    }}
                    className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="Header"
                    value={header.key}
                    onChange={(e) => {
                      const updated = [...headers];
                      updated[index].key = e.target.value;
                      onHeadersChange(updated);
                    }}
                    className="flex-1 bg-[#1e293b] border border-slate-700/80 rounded px-2 py-1 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={header.value}
                    onChange={(e) => {
                      const updated = [...headers];
                      updated[index].value = e.target.value;
                      onHeadersChange(updated);
                    }}
                    className="flex-1 bg-[#1e293b] border border-slate-700/80 rounded px-2 py-1 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => onHeadersChange(headers.filter((_, i) => i !== index))}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUTH TAB */}
        {activeTab === 'auth' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Auth Type:</label>
              <select
                value={auth.type}
                onChange={(e) => onAuthChange({ ...auth, type: e.target.value as AuthConfig['type'] })}
                className="bg-[#1e293b] border border-slate-700 text-xs rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
                <option value="apikey">API Key</option>
              </select>
            </div>

            {auth.type === 'bearer' && (
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Token (supports {'{{token}}'}):</label>
                <input
                  type="text"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={auth.token || ''}
                  onChange={(e) => onAuthChange({ ...auth, token: e.target.value })}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>
            )}

            {auth.type === 'basic' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400">Username:</label>
                  <input
                    type="text"
                    value={auth.username || ''}
                    onChange={(e) => onAuthChange({ ...auth, username: e.target.value })}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Password:</label>
                  <input
                    type="password"
                    value={auth.password || ''}
                    onChange={(e) => onAuthChange({ ...auth, password: e.target.value })}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                  />
                </div>
              </div>
            )}

            {auth.type === 'apikey' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400">Key Name:</label>
                  <input
                    type="text"
                    placeholder="X-API-Key"
                    value={auth.keyName || ''}
                    onChange={(e) => onAuthChange({ ...auth, keyName: e.target.value })}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Key Value:</label>
                  <input
                    type="text"
                    placeholder="secret_key_123"
                    value={auth.keyValue || ''}
                    onChange={(e) => onAuthChange({ ...auth, keyValue: e.target.value })}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* BODY TAB */}
        {activeTab === 'body' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <select
                  value={bodyType}
                  onChange={(e) => onBodyTypeChange(e.target.value as BodyType)}
                  className="bg-[#1e293b] border border-slate-700 text-xs rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="none">none</option>
                  <option value="json">JSON (application/json)</option>
                  <option value="urlencoded">x-www-form-urlencoded</option>
                  <option value="raw">raw text</option>
                </select>

                {bodyType === 'json' && (
                  <button
                    type="button"
                    onClick={() => setIsFormBuilderMode(!isFormBuilderMode)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                      isFormBuilderMode
                        ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {isFormBuilderMode ? 'Form Builder' : 'Code Mode'}
                  </button>
                )}
              </div>

              {bodyType === 'json' && !isFormBuilderMode && (
                <button
                  type="button"
                  onClick={handleBeautify}
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
                  title="Format / Beautify JSON"
                >
                  <Sparkles className="w-3 h-3" /> Beautify
                </button>
              )}
            </div>

            {bodyType !== 'none' && (
              <>
                {bodyType === 'json' && isFormBuilderMode ? (
                  /* Form-to-JSON Builder Table for Mobile Typing */
                  <div className="space-y-1.5 bg-[#162032] p-2 rounded-lg border border-slate-800">
                    <div className="text-[11px] text-slate-400 flex justify-between items-center mb-1">
                      <span>Visual Form Builder (Auto-generates JSON)</span>
                      <button
                        type="button"
                        onClick={addFormRow}
                        className="text-sky-400 hover:text-sky-300 flex items-center gap-0.5 text-xs font-semibold"
                      >
                        <Plus className="w-3 h-3" /> Field
                      </button>
                    </div>
                    {formRows.map((row, idx) => (
                      <div key={row.id} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Field name"
                          value={row.key}
                          onChange={(e) => handleFormRowChange(idx, 'key', e.target.value)}
                          className="flex-1 bg-[#1e293b] border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          value={row.value}
                          onChange={(e) => handleFormRowChange(idx, 'value', e.target.value)}
                          className="flex-1 bg-[#1e293b] border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                        />
                        <button
                          type="button"
                          onClick={() => removeFormRow(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <textarea
                    rows={6}
                    value={bodyContent}
                    onChange={(e) => onBodyContentChange(e.target.value)}
                    placeholder={
                      bodyType === 'json'
                        ? '{\n  "name": "example",\n  "uuid": "{{$uuid}}"\n}'
                        : 'Enter payload...'
                    }
                    className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
