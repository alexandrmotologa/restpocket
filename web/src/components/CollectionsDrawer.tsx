import React, { useState } from 'react';
import {
  X,
  FolderClosed,
  FolderOpen,
  Plus,
  Trash2,
  Play,
  Bookmark,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { CollectionItem, SavedRequestItem, HttpMethod } from '../types/index.js';

interface CollectionsDrawerProps {
  isOpen: boolean;
  collections: CollectionItem[];
  currentMethod: HttpMethod;
  currentUrl: string;
  onClose: () => void;
  onSelectRequest: (req: SavedRequestItem) => void;
  onCreateCollection: (name: string) => void;
  onDeleteCollection: (id: number) => void;
  onSaveCurrentRequest: (collectionId: number, name: string) => void;
  onDeleteRequest: (id: number) => void;
}

export const CollectionsDrawer: React.FC<CollectionsDrawerProps> = ({
  isOpen,
  collections,
  currentMethod,
  currentUrl,
  onClose,
  onSelectRequest,
  onCreateCollection,
  onDeleteCollection,
  onSaveCurrentRequest,
  onDeleteRequest,
}) => {
  const [openFolders, setOpenFolders] = useState<Set<number>>(new Set([1, 2, 3]));
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [requestSaveName, setRequestSaveName] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);

  if (!isOpen) return null;

  const toggleFolder = (id: number) => {
    const next = new Set(openFolders);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpenFolders(next);
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      onCreateCollection(newCollectionName.trim());
      setNewCollectionName('');
      setShowCreateModal(false);
    }
  };

  const handleSaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCollectionId && requestSaveName.trim()) {
      onSaveCurrentRequest(selectedCollectionId, requestSaveName.trim());
      setRequestSaveName('');
      setSaveModalOpen(false);
    }
  };

  const getMethodColor = (m: string) => {
    switch (m) {
      case 'GET':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'POST':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'PUT':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'DELETE':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-[#0f172a] h-full flex flex-col border-l border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderClosed className="w-4 h-4 text-sky-400" />
            <h2 className="font-semibold text-sm text-white">Collections</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (collections.length > 0) {
                  setSelectedCollectionId(collections[0].id);
                  setRequestSaveName(`${currentMethod} ${currentUrl.split('/').pop() || 'Request'}`);
                  setSaveModalOpen(true);
                }
              }}
              className="px-2 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded text-xs flex items-center gap-1 font-medium"
              title="Save current request"
            >
              <Bookmark className="w-3 h-3" /> Save Current
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              title="New Collection"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collections List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {collections.map((col) => {
            const isOpen = openFolders.has(col.id);

            return (
              <div key={col.id} className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
                {/* Collection Folder Header */}
                <div
                  className="p-2 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                  onClick={() => toggleFolder(col.id)}
                >
                  <div className="flex items-center gap-2">
                    {isOpen ? (
                      <FolderOpen className="w-4 h-4 text-sky-400" />
                    ) : (
                      <FolderClosed className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-xs font-semibold text-slate-200">{col.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({col.requests.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {col.user_id !== 'system' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete collection "${col.name}"?`)) {
                            onDeleteCollection(col.id);
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    {isOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                  </div>
                </div>

                {/* Saved Requests in Folder */}
                {isOpen && (
                  <div className="pl-4 pr-2 pb-2 space-y-1 border-t border-slate-800/40 pt-1.5">
                    {col.requests.length === 0 ? (
                      <p className="text-[11px] text-slate-500 py-1 pl-2 italic">No requests saved</p>
                    ) : (
                      col.requests.map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 group transition-colors cursor-pointer"
                          onClick={() => {
                            onSelectRequest(req);
                            onClose();
                          }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${getMethodColor(
                                req.method
                              )}`}
                            >
                              {req.method}
                            </span>
                            <span className="text-xs text-slate-300 truncate font-medium">
                              {req.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteRequest(req.id);
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal: Create Collection */}
        {showCreateModal && (
          <div className="p-3 border-t border-slate-800 bg-slate-900">
            <form onSubmit={handleCreateCollection} className="space-y-2">
              <label className="text-xs text-slate-300 font-medium">New Collection Name:</label>
              <input
                type="text"
                placeholder="e.g. Auth API Tests"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                autoFocus
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Save Request */}
        {saveModalOpen && (
          <div className="p-3 border-t border-slate-800 bg-slate-900">
            <form onSubmit={handleSaveRequest} className="space-y-2">
              <label className="text-xs text-slate-300 font-medium">Save Request To Collection:</label>
              <select
                value={selectedCollectionId || ''}
                onChange={(e) => setSelectedCollectionId(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none"
              >
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Request name"
                value={requestSaveName}
                onChange={(e) => setRequestSaveName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                autoFocus
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
