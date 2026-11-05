import React, { useRef, useState } from 'react';
import { X, Download, Upload, ShieldCheck, Database, Check, AlertCircle } from 'lucide-react';
import { exportAllData, importAllData } from '../utils/storage';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReload: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  onDataReload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nutritrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ text: 'Backup downloaded successfully to your computer!', type: 'success' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importAllData(content);
      if (success) {
        setStatusMessage({ text: 'Data imported successfully! Your logs have been updated.', type: 'success' });
        onDataReload();
      } else {
        setStatusMessage({ text: 'Failed to import backup file. Ensure it is a valid NutriTrack JSON backup.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-4 sm:p-5 shadow-2xl max-h-[92vh] overflow-y-auto smooth-scroll">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Database className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Data Backup & Restore</h3>
              <p className="text-xs text-slate-400">100% private, saved directly in your browser</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Zero Subscription, Zero Paywall</p>
              <p className="text-slate-400 mt-0.5">
                All your meal logs, weight logs, and custom foods are stored locally. Download backups anytime to keep them safe forever.
              </p>
            </div>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleExport}
              className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500/50 flex flex-col items-center justify-center gap-2 transition-all text-center group"
            >
              <Download className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-bold text-white">Download Backup</p>
                <p className="text-[10px] text-slate-400">Save JSON file to your device</p>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-amber-500/50 flex flex-col items-center justify-center gap-2 transition-all text-center group"
            >
              <Upload className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-bold text-white">Restore Backup</p>
                <p className="text-[10px] text-slate-400">Upload existing JSON file</p>
              </div>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

