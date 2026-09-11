import React from 'react';
import {
  Zap,
  FolderClosed,
  History,
  Radio,
  Activity,
  FileCode2,
  Terminal,
  Share2,
  Settings2,
} from 'lucide-react';
import { EnvironmentItem } from '../types/index.js';

interface NavbarProps {
  activeEnv: EnvironmentItem | null;
  onOpenEnvironments: () => void;
  onOpenCollections: () => void;
  onOpenHistory: () => void;
  onOpenWebhookBin: () => void;
  onOpenMonitors: () => void;
  onOpenCurlImport: () => void;
  onOpenCodeExport: () => void;
  onOpenShare: () => void;
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeEnv,
  onOpenEnvironments,
  onOpenCollections,
  onOpenHistory,
  onOpenWebhookBin,
  onOpenMonitors,
  onOpenCurlImport,
  onOpenCodeExport,
  onOpenShare,
  userName,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0f172a]/95 backdrop-blur border-b border-slate-800 px-3 py-2.5 flex items-center justify-between">
      {/* Brand & Logo */}
      <div className="flex items-center gap-2">
        <img src="/logo.svg" alt="RestPocket" className="w-8 h-8 rounded-lg shadow-md shadow-sky-500/20" />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-white">RestPocket</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono border border-sky-500/20">
              v1.0
            </span>
          </div>
          {userName && (
            <p className="text-[11px] text-slate-400 leading-tight">
              @{userName}
            </p>
          )}
        </div>
      </div>

      {/* Center / Right controls */}
      <div className="flex items-center gap-1">
        {/* Environment button */}
        <button
          onClick={onOpenEnvironments}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
          title="Manage Environments"
        >
          <Settings2 className="w-3.5 h-3.5 text-sky-400" />
          <span className="max-w-[70px] sm:max-w-[100px] truncate font-mono text-[11px]">
            {activeEnv ? activeEnv.name : 'No Env'}
          </span>
        </button>

        {/* Collections */}
        <button
          onClick={onOpenCollections}
          className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Collections"
        >
          <FolderClosed className="w-4 h-4" />
        </button>

        {/* History */}
        <button
          onClick={onOpenHistory}
          className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Execution History"
        >
          <History className="w-4 h-4" />
        </button>

        {/* Webhook Catcher */}
        <button
          onClick={onOpenWebhookBin}
          className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative"
          title="Webhook Catcher / RequestBin"
        >
          <Radio className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Monitors */}
        <button
          onClick={onOpenMonitors}
          className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="API Health Monitors"
        >
          <Activity className="w-4 h-4 text-amber-400" />
        </button>

        {/* cURL & Postman Import */}
        <button
          onClick={onOpenCurlImport}
          className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors hidden xs:flex"
          title="Import cURL or Postman"
        >
          <Terminal className="w-4 h-4" />
        </button>

        {/* Code Snippet Export */}
        <button
          onClick={onOpenCodeExport}
          className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Export Code Snippet"
        >
          <FileCode2 className="w-4 h-4" />
        </button>

        {/* Share Deep Link */}
        <button
          onClick={onOpenShare}
          className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Share to Telegram"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
