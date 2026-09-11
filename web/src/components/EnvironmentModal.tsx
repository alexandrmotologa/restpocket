import React, { useState } from 'react';
import { X, Settings2, Plus, Trash2, Check } from 'lucide-react';
import { EnvironmentItem } from '../types/index.js';

interface EnvironmentModalProps {
  isOpen: boolean;
  environments: EnvironmentItem[];
  activeEnv: EnvironmentItem | null;
  onClose: () => void;
  onSelectEnv: (env: EnvironmentItem | null) => void;
  onSaveEnv: (name: string, variables: Record<string, string>, isActive: boolean) => void;
}

export const EnvironmentModal: React.FC<EnvironmentModalProps> = ({
  isOpen,
  environments,
  activeEnv,
  onClose,
  onSelectEnv,
  onSaveEnv,
}) => {
  const [selectedEnvId, setSelectedEnvId] = useState<number | null>(activeEnv ? activeEnv.id : null);
  const [isEditing, setIsEditing] = useState(false);
  const [envName, setEnvName] = useState('');
  const [variableRows, setVariableRows] = useState<Array<{ id: string; key: string; value: string }>>([
    { id: '1', key: 'baseUrl', value: 'https://httpbin.org' },
  ]);

  if (!isOpen) return null;

  const handleStartNew = () => {
    setEnvName('');
    setVariableRows([{ id: '1', key: '', value: '' }]);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!envName.trim()) return;

    const vars: Record<string, string> = {};
    for (const row of variableRows) {
      if (row.key.trim()) {
        vars[row.key.trim()] = row.value.trim();
      }
    }

    onSaveEnv(envName.trim(), vars, true);
    setIsEditing(false);
  };

  const addVariableRow = () => {
    setVariableRows([...variableRows, { id: String(Date.now()), key: '', value: '' }]);
  };

  const removeVariableRow = (idx: number) => {
    const updated = variableRows.filter((_, i) => i !== idx);
    setVariableRows(updated.length ? updated : [{ id: '1', key: '', value: '' }]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[#0f172a] rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-sky-400" />
            <h3 className="font-semibold text-sm text-white">Environment Variables</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {!isEditing ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Select Active Environment:</span>
                <button
                  type="button"
                  onClick={handleStartNew}
                  className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> New Environment
                </button>
              </div>

              {/* List */}
              <div className="space-y-2">
                <div
                  onClick={() => onSelectEnv(null)}
                  className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                    !activeEnv
                      ? 'border-sky-500/50 bg-sky-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold">No Environment</p>
                    <p className="text-[11px] text-slate-500">Raw URLs without variable substitution</p>
                  </div>
                  {!activeEnv && <Check className="w-4 h-4 text-sky-400" />}
                </div>

                {environments.map((env) => {
                  const isActive = activeEnv?.id === env.id;
                  let parsedVars: Record<string, string> = {};
                  try {
                    parsedVars = JSON.parse(env.variables_json);
                  } catch {
                    // Ignored
                  }

                  return (
                    <div
                      key={env.id}
                      onClick={() => onSelectEnv(env)}
                      className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                        isActive
                          ? 'border-sky-500/50 bg-sky-500/10 text-white'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-semibold">{env.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {Object.keys(parsedVars).length} variables (
                          {Object.keys(parsedVars).slice(0, 3).join(', ')}
                          {Object.keys(parsedVars).length > 3 ? '...' : ''})
                        </p>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-sky-400" />}
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Tokens Guide */}
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1.5 text-xs text-slate-400">
                <p className="font-semibold text-slate-200">Built-in Dynamic Tokens:</p>
                <div className="grid grid-cols-2 gap-1 font-mono text-[11px]">
                  <span><code>{`{{$uuid}}`}</code>: Random UUID</span>
                  <span><code>{`{{$timestamp}}`}</code>: Unix ms</span>
                  <span><code>{`{{$randomInt}}`}</code>: 1-1000</span>
                  <span><code>{`{{$isoDate}}`}</code>: ISO string</span>
                </div>
              </div>
            </>
          ) : (
            /* Editing / Creating Form */
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium">Environment Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Production API"
                  value={envName}
                  onChange={(e) => setEnvName(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">Variables:</span>
                  <button
                    type="button"
                    onClick={addVariableRow}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-0.5 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Variable
                  </button>
                </div>

                {variableRows.map((row, idx) => (
                  <div key={row.id} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Variable name (e.g. baseUrl)"
                      value={row.key}
                      onChange={(e) => {
                        const updated = [...variableRows];
                        updated[idx].key = e.target.value;
                        setVariableRows(updated);
                      }}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white placeholder:text-slate-500"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={row.value}
                      onChange={(e) => {
                        const updated = [...variableRows];
                        updated[idx].value = e.target.value;
                        setVariableRows(updated);
                      }}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariableRow(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!envName.trim()}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded"
                >
                  Save Environment
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
