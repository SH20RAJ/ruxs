"use client";

import React, { useEffect, useState } from "react";

export function PwaManager() {
  const [isOnline, setIsOnline] = useState(true);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Online/Offline event listeners
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 2. Service Worker Registration
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] ServiceWorker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] ServiceWorker registration failed:", err);
        });
    }

    // 3. BeforeInstallPrompt handler
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallPrompt(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 text-xs font-semibold py-1.5 px-4 text-center sticky top-0 z-50 flex items-center justify-center gap-2">
          <span>⚠️ Offline Mode: Live Khata transactions paused until reconnection</span>
        </div>
      )}

      {/* PWA Install Banner */}
      {showInstallPrompt && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm bg-slate-900/95 border border-emerald-500/50 rounded-2xl p-4 shadow-2xl z-50 backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              R
            </div>
            <div>
              <p className="text-xs font-bold text-white">Install RUXS App</p>
              <p className="text-[10px] text-slate-400">1-Tap access to daily household services</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              Install
            </button>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
