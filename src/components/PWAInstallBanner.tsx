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
        <div className="bg-[#12211A] text-[#F0F7F4] px-3 py-2 text-xs flex items-center justify-between gap-2 shadow-sm border-b border-[#2D4A3D]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#14241D] flex items-center justify-center font-black text-[9px] shrink-0 shadow-xs">
              AG
            </div>
            <p className="truncate font-medium text-xs">
              <span className="font-bold text-[#D4AF37]">NOTEPAD মোবাইল অ্যাপ:</span> কোনো ব্রাউজার বার ছাড়া সরাসরি অ্যাপ হিসেবে ইনস্টল করুন
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#14241D] font-black px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 transition-transform active:scale-95 shadow-xs cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>অ্যাপ ইনস্টল</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-[#8DA89B] hover:text-[#F0F7F4] p-1 rounded-md cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Guide Modal for iOS or manual install */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#162920] border border-[#2D4A3D] p-6 shadow-2xl space-y-4 text-[#F0F7F4]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-[#14241D] flex flex-col items-center justify-center shadow-md font-black text-sm">
                  AG
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F0F7F4]">
                    স্মার্ট নোটপ্যাড ইনস্টল গাইড
                  </h3>
                  <p className="text-xs text-[#8DA89B]">
                    হোমস্ক্রিনে যুক্ত করে আসল অ্যাপের মতো ব্যবহার করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="text-[#8DA89B] hover:text-[#F0F7F4] p-1.5 rounded-lg hover:bg-[#2D4A3D] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-[#8DA89B] bg-[#12211A] p-4 rounded-xl border border-[#2D4A3D]">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-2.5">
                    <Share2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                    <p className="text-[#F0F7F4]">
                      <strong>ধাপ ১:</strong> Safari ব্রাউজারের নিচে থাকা <strong className="text-[#D4AF37]">Share (শেয়ার)</strong> বাটনে ট্যাপ করুন।
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <PlusSquare className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                    <p className="text-[#F0F7F4]">
                      <strong>ধাপ ২:</strong> নিচে স্ক্রোল করে <strong className="text-[#10B981]">"Add to Home Screen"</strong> (হোমস্ক্রিনে যোগ করুন) সিলেক্ট করুন।
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-[#D4AF37]/40">
                      ১
                    </div>
                    <p className="text-[#F0F7F4]">
                      Chrome ব্রাউজারের উপরের ডানপাশে থাকা <strong className="text-[#D4AF37]">তিনটি ডট (⋮) মেনু</strong>-তে ট্যাপ করুন।
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Smartphone className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                    <p className="text-[#F0F7F4]">
                      <strong className="text-[#10B981]">"Install app"</strong> অথবা <strong className="text-[#10B981]">"Add to Home screen"</strong> নির্বাচন করুন।
                    </p>
                  </div>
                </>
              )}

              <div className="flex items-start gap-2.5 pt-2 border-t border-[#2D4A3D] text-[#8DA89B]">
                <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                <p>
                  ইনস্টল হলে আপনার ফোনের হোমস্ক্রিনে <strong className="text-[#D4AF37]">AG NOTEPAD</strong> অ্যাপ হিসেবে থাকবে এবং GitHub-এ নতুন পুশ করলেই স্বয়ংক্রিয়ভাবে আপডেট হয়ে যাবে!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpenModal(false)}
              className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#14241D] font-black rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-md"
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
        className="px-2.5 py-1.5 text-xs font-bold text-[#D4AF37] bg-[#12211A] hover:bg-[#1a3327] rounded-xl border border-[#D4AF37]/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
      >
        <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span className="hidden sm:inline">ইনস্টল অ্যাপ</span>
        <span className="sm:hidden">অ্যাপ</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#162920] border border-[#2D4A3D] p-5 shadow-2xl space-y-4 text-[#F0F7F4]">
            <h3 className="text-base font-bold text-[#F0F7F4] flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#D4AF37]" />
              মোবাইলে অ্যাপ হিসেবে ব্যবহার
            </h3>
            <p className="text-xs text-[#8DA89B] leading-relaxed">
              আপনার মোবাইলের ব্রাউজার মেনু (<strong className="text-[#D4AF37]">⋮</strong> অথবা <strong className="text-[#D4AF37]">Share</strong>) থেকে <strong className="text-[#10B981]">"Add to Home screen"</strong> বা <strong className="text-[#10B981]">"Install app"</strong> নির্বাচন করুন।
            </p>
            <p className="text-xs text-[#10B981] font-medium">
              ✓ হোমস্ক্রিনে অ্যাপ আইকন তৈরি হবে এবং কোনো অ্যাড্রেস বার ছাড়া সরাসরি অ্যাপ হিসেবে খুলবে ও GitHub-এর পুশের সাথে অটো-আপডেট হবে।
            </p>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full py-2 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#14241D] rounded-xl text-xs font-black cursor-pointer shadow-md"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}
    </>
  );
};
