import React, { useState } from 'react';
import { X, Share2, Copy, Check, Send } from 'lucide-react';
import { HttpMethod } from '../types/index.js';

interface ShareModalProps {
  isOpen: boolean;
  method: HttpMethod;
  url: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  method,
  url,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Encode request into compact base64 query
  const payload = JSON.stringify({ m: method, u: url });
  const encoded = btoa(payload);
  const shareUrl = `${window.location.origin}?req=${encodeURIComponent(encoded)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(`⚡ Check this API endpoint on RestPocket:\n${method} ${url}`);
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`;
    window.open(tgUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-[#0f172a] rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-sky-400" />
            <h3 className="font-semibold text-sm text-white">Share Request Card</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 text-xs text-slate-300">
          <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-mono space-y-1">
            <span className="text-sky-400 font-bold">{method}</span>
            <p className="text-slate-200 truncate">{url}</p>
          </div>

          <p className="text-slate-400 text-xs">
            Anyone with this link can open RestPocket and run this request with 1 tap.
          </p>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-[11px] font-mono text-slate-300 select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
              title="Copy Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleShareTelegram}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded transition-colors"
            >
              <Send className="w-3.5 h-3.5 fill-white" />
              <span>Share to Telegram</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
