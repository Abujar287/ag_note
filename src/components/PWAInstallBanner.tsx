import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isMobile, install } = usePWAInstall();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem('pwa_banner_dismissed') === 'true';
  });

  useEffect(() => {
    const handleOpen = () => setIsOpenModal(true);
    window.addEventListener('open-pwa-guide', handleOpen);
    return () => window.removeEventListener('open-pwa-guide', handleOpen);
  }, []);

  // If already installed and running as standalone app, don't show the banner
  if (isInstalled) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setIsOpenModal(true);
    }
  };

  return (
    <>
      {/* Top Mobile Notice Bar when not dismissed */}
      {!isDismissed && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-3 py-2 text-xs flex items-center justify-between gap-2 shadow-sm border-b border-blue-500/30">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center font-black text-[9px] shrink-0 shadow-2xs">
              AG
            </div>
            <p className="truncate font-medium">
              <span className="font-bold">NOTEPAD মোবাইল অ্যাপ:</span> কোনো ব্রাউজার বার ছাড়া আসল অ্যাপের মতো ব্যবহার করুন
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-2.5 py-1 rounded-md text-[11px] flex items-center gap-1 transition-transform active:scale-95 shadow-2xs cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>অ্যাপ ইনস্টল</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-white/80 hover:text-white p-1 rounded-md cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Guide Modal for iOS or manual install */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex flex-col items-center justify-center shadow-md">
                  <span className="text-xs font-black">AG</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    স্মার্ট নোটপ্যাড ইনস্টল গাইড
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    হোমস্ক্রিনে যুক্ত করে আসল অ্যাপের মতো ব্যবহার করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-2.5">
                    <Share2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p>
                      <strong>ধাপ ১:</strong> Safari ব্রাউজারের নিচে থাকা <strong>Share (শেয়ার)</strong> বাটনে ট্যাপ করুন।
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <PlusSquare className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p>
                      <strong>ধাপ ২:</strong> নিচে স্ক্রোল করে <strong>"Add to Home Screen"</strong> (হোমস্ক্রিনে যোগ করুন) সিলেক্ট করুন।
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ১
                    </div>
                    <p>
                      Chrome ব্রাউজারের উপরের ডানপাশে থাকা <strong>তিনটি ডট (⋮) মেনু</strong>-তে ট্যাপ করুন।
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Smartphone className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p>
                      <strong>"Install app"</strong> অথবা <strong>"Add to Home screen"</strong> (হোমস্ক্রিনে যোগ করুন)-এ ট্যাপ করুন।
                    </p>
                  </div>
                </>
              )}

              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p>
                  ইনস্টল সম্পন্ন হলে আপনার মোবাইলের হোমস্ক্রিনে <strong>NOTEPAD</strong> আইকন চলে আসবে এবং সরাসরি ক্লিক করলেই ব্রাউজারের কোনো অ্যাড্রেস বার বা লিঙ্ক ছাড়া ফুলস্ক্রিন মোবাইল অ্যাপ হিসেবে চালু হবে!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpenModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
            >
              বুঝেছি, বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const PWAInstallHeaderButton: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) return null;

  return (
    <>
      <button
        type="button"
        onClick={async () => {
          if (isInstallable) {
            await install();
          } else {
            setShowGuide(true);
          }
        }}
        title="Install NOTEPAD as Mobile App"
        className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
      >
        <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span className="hidden sm:inline">ইনস্টল অ্যাপ</span>
        <span className="sm:hidden">অ্যাপ</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              মোবাইলে অ্যাপ হিসেবে ব্যবহার
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              আপনার মোবাইলের ব্রাউজার মেনু (<strong>⋮</strong> অথবা <strong>Share</strong>) থেকে <strong>"Add to Home screen"</strong> বা <strong>"Install app"</strong> নির্বাচন করুন।
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ হোমস্ক্রিনে অ্যাপ আইকন তৈরি হবে এবং কোনো অ্যাড্রেস বার বা ওয়েবসাইট লিঙ্ক ছাড়া সরাসরি অ্যাপ হিসেবে খুলবে।
            </p>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}
    </>
  );
};
