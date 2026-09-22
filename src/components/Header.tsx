import React, { useState } from 'react';
import { GiftlySpace, CurrentUserSession, Participant } from '../types';
import {
  Gift,
  ChevronDown,
  Plus,
  Link2,
  Check,
  UserCheck,
  Home,
  LogOut,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  currentSpace: GiftlySpace | null;
  currentUser: CurrentUserSession | null;
  onGoHome: () => void;
  onOpenCreateModal: () => void;
  onOpenAccessModal: () => void;
  onLogout: () => void;
  onQuickSwitchUser: (p: Participant) => void;
  showToast: (msg: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSpace,
  currentUser,
  onGoHome,
  onOpenCreateModal,
  onOpenAccessModal,
  onLogout,
  onQuickSwitchUser,
  showToast,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyShareLink = () => {
    if (!currentSpace) return;
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://giftly.diy';
      const shareUrl = `${origin}/?giftly=${currentSpace.id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      showToast('Copied private shareable link to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToast(`Share code: ${currentSpace.id}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E8DECd] bg-[#FAF7F2]/95 backdrop-blur-md shadow-2xs">
      {/* Top Ribbon Strip */}
      <div className="h-1 w-full bg-linear-to-r from-[#5C1525] via-[#CBA469] to-[#5C1525]" />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand & Home Navigation */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-2.5 text-left group"
            title="Return to Giftly Welcome Screen"
          >
            <div className="wax-seal flex h-9 w-9 items-center justify-center rounded-2xl text-white shadow-xs group-hover:scale-105 transition">
              <Gift className="w-5 h-5 text-[#FAF7F2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-extrabold text-[#300A12] text-lg tracking-tight group-hover:text-[#5C1525] transition">
                  Giftly<span className="text-[#8E253D]">.diy</span>
                </span>
              </div>
              <span className="hidden sm:block text-[10px] uppercase tracking-wider text-[#86756D] font-sans font-medium">
                Better Gifts. Less Guessing.
              </span>
            </div>
          </button>

          {/* If inside a space, show divider and space badge */}
          {currentSpace && (
            <>
              <div className="h-6 w-px bg-[#E2D6C5] hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2">
                <span className="font-serif font-bold text-sm text-[#300A12] truncate max-w-[220px]">
                  {currentSpace.title}
                </span>
                <span className="rounded-full bg-[#FAF3E6] border border-[#ECD7AF] px-2 py-0.2 text-[10px] font-semibold text-[#741D30]">
                  Private
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-2.5">
          {currentSpace ? (
            <>
              {/* Copy Shareable Link Button */}
              <button
                type="button"
                id="header-copy-link-btn"
                onClick={handleCopyShareLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#D6C8B5] bg-white px-3 py-1.5 text-xs font-semibold text-[#5C1525] hover:bg-[#FAF0F2] hover:border-[#5C1525] shadow-2xs transition active:scale-95"
                title="Copy private invite link to send to teammates"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5 text-[#8E253D]" />
                    <span className="hidden sm:inline">Share Link</span>
                  </>
                )}
              </button>

              {/* Active User Dropdown */}
              {currentUser ? (
                <div className="relative">
                  <button
                    type="button"
                    id="header-user-btn"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 rounded-2xl border border-[#D6C8B5] bg-white px-3 py-1.5 text-xs font-semibold text-[#300A12] hover:border-[#5C1525] shadow-2xs transition"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5C1525] text-[10px] font-bold text-white font-serif">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-xs text-[#300A12]">
                      {currentUser.name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#9E8E81]" />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 z-50 w-64 origin-top-right rounded-2xl border border-[#E2D6C5] bg-[#FDFCF9] p-2 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3 py-2 border-b border-[#F0E8DC]">
                          <p className="text-xs font-serif font-bold text-[#300A12]">
                            {currentUser.name}
                          </p>
                          <p className="text-[10px] text-[#7A6B63] font-sans">
                            Keyword pass: ••••••••
                          </p>
                        </div>

                        <div className="py-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onOpenAccessModal();
                            }}
                            className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#63544E] hover:bg-[#FAF7F2] hover:text-[#300A12]"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-[#5C1525]" />
                            <span>Switch Member / Sign In</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onLogout();
                            }}
                            className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#8E253D] hover:bg-[#FAF0F2]"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out of Tile</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAccessModal}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#D6C8B5] bg-white px-3 py-1.5 text-xs font-semibold text-[#5C1525] hover:bg-[#FAF0F2] transition"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Identify Me</span>
                </button>
              )}

              {/* Exit Space to Welcome */}
              <button
                type="button"
                onClick={onGoHome}
                className="hidden md:inline-flex items-center gap-1 rounded-xl border border-[#E2D6C5] px-2.5 py-1.5 text-xs font-medium text-[#7A6B63] hover:bg-white hover:text-[#300A12] transition"
                title="Exit to Giftly Home"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
            </>
          ) : (
            /* Welcome Screen Controls */
            <>
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#5C1525] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#48111D] ring-1 ring-[#CBA469]/50 transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-[#E5CA9E]" />
                <span>Start a Giftly</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
