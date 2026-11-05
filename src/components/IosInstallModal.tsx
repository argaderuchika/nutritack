import React, { useState, useEffect } from 'react';
import { X, Share, PlusSquare, Smartphone, CheckCircle, Download, ArrowUpRight } from 'lucide-react';

interface IosInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IosInstallModal: React.FC<IosInstallModalProps> = ({ isOpen, onClose }) => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);

  useEffect(() => {
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isRunningStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIosDevice(isIos);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Install on iPhone</h3>
              <p className="text-xs text-slate-400">NutriTrack Progressive Web App (PWA)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4">
          {isStandalone ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-300">App Already Installed!</p>
                <p className="text-xs text-slate-300 mt-1">
                  You are already running NutriTrack in standalone full-screen mode on your device.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/50">
                Install NutriTrack directly to your iPhone Home Screen to enjoy instant loading, offline food logging, and full-screen iPhone 17 Dynamic Island support without any App Store download.
              </div>

              {/* Step by step instructions for iOS */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/30">
                    1
                  </div>
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-white">Open in Apple Safari</p>
                    <p className="text-slate-400 mt-0.5">Ensure you are viewing this page inside Safari on your iPhone.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/30">
                    2
                  </div>
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-white flex items-center gap-1.5">
                      <span>Tap the Share Button</span>
                      <Share className="w-3.5 h-3.5 text-indigo-400 inline" />
                    </p>
                    <p className="text-slate-400 mt-0.5">
                      Look at the Safari bottom toolbar and tap the square icon with an upward arrow.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/30">
                    3
                  </div>
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-white flex items-center gap-1.5">
                      <span>Tap "Add to Home Screen"</span>
                      <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />
                    </p>
                    <p className="text-slate-400 mt-0.5">
                      Scroll down through the share sheet options and select <strong>Add to Home Screen</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/30">
                    4
                  </div>
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-white">Tap "Add" at top right</p>
                    <p className="text-slate-400 mt-0.5">
                      NutriTrack will appear as an app icon on your iPhone home screen!
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-bold text-sm text-white shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98]"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

