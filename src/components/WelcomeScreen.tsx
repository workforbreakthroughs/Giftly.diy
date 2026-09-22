import React, { useState } from 'react';
import { GiftlySpace } from '../types';
import { Gift, ArrowRight, ShieldCheck, Plus, Link2, Sparkles, Clock, Check } from 'lucide-react';

interface WelcomeScreenProps {
  spaces: GiftlySpace[];
  recentSpaceIds: string[];
  onSelectSpace: (id: string) => void;
  onOpenCreateModal: () => void;
  showToast: (msg: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  spaces,
  recentSpaceIds,
  onSelectSpace,
  onOpenCreateModal,
  showToast,
}) => {
  const [inputUrlOrCode, setInputUrlOrCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleJoinByInput = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputUrlOrCode.trim();
    if (!raw) return;

    setErrorMsg(null);

    let extractedId = raw;
    // Check if it's a full URL
    try {
      if (raw.includes('giftly=')) {
        const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
        const paramId = url.searchParams.get('giftly');
        if (paramId) {
          extractedId = paramId;
        }
      } else if (raw.includes('/')) {
        const parts = raw.split('/');
        const lastPart = parts[parts.length - 1];
        if (lastPart) extractedId = lastPart;
      }
    } catch {
      // ignore URL parsing error, use raw string
    }

    // Check legacy aliases
    if (extractedId.toLowerCase() === 'christmas-wishlist-ig-2026-ungd') {
      extractedId = 'christmas-wishlist-class-06-2026';
    }

    // Look for matching space in available spaces
    const found = spaces.find(
      (s) => s.id.toLowerCase() === extractedId.toLowerCase()
    );

    if (found) {
      onSelectSpace(found.id);
    } else {
      setErrorMsg(
        'Space code not recognized. Please verify the link provided by your group organizer.'
      );
    }
  };

  // Resolve recently visited spaces on this device
  const recentSpaces = recentSpaceIds
    .map((id) => spaces.find((s) => s.id === id))
    .filter((s): s is GiftlySpace => Boolean(s));

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-12 space-y-10">
      {/* Hero Welcome Card */}
      <section className="stationery-card relative overflow-hidden rounded-3xl p-7 sm:p-12 text-center border border-[#E2D6C5]">
        <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-[#5C1525] via-[#CBA469] to-[#5C1525]" />
        
        {/* Decorative soft glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FAF0F2]/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          {/* Brand Seal Motif */}
          <div className="wax-seal mx-auto flex h-16 w-16 items-center justify-center rounded-3xl text-white shadow-md mb-2">
            <Gift className="w-8 h-8 text-[#FAF7F2]" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF0F2] border border-[#E8C5CD] px-3.5 py-1 text-xs font-serif font-bold text-[#8E253D]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8E253D]" />
            Private by Design • Shared Link Only
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-[#300A12] tracking-tight leading-tight">
            Better gifts.<br />Less guessing.
          </h1>

          <p className="text-sm sm:text-base text-[#63544E] font-sans leading-relaxed">
            Welcome to <strong>Giftly.diy</strong>. We protect the privacy of your wishes.
            There are no public directories or searchable profiles—each gift space is private
            and accessible strictly to members who hold the unique shared link.
          </p>
        </div>
      </section>

      {/* Two Primary Action Pillars: Start a Giftly vs. Join via Link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Start a New Giftly */}
        <div className="stationery-tile rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-[#E5D9C8] hover:border-[#5C1525]/40 transition group">
          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5C1525] text-white shadow-xs">
              <Plus className="w-6 h-6 text-[#E5CA9E]" />
            </div>

            <h2 className="text-xl font-serif font-bold text-[#300A12]">
              Start a New Giftly
            </h2>

            <p className="text-xs sm:text-sm text-[#63544E] font-sans leading-relaxed">
              Create a private group gift exchange (Secret Santa, family wishlist tiles) or a milestone celebration. You get a private link to share with your group.
            </p>
          </div>

          <div className="pt-6">
            <button
              type="button"
              id="welcome-start-btn"
              onClick={onOpenCreateModal}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5C1525] py-3.5 px-5 text-sm font-bold text-white shadow-sm hover:bg-[#48111D] ring-1 ring-[#CBA469]/50 transition active:scale-98"
            >
              <span>+ Start a Private Giftly</span>
              <ArrowRight className="w-4 h-4 text-[#E5CA9E]" />
            </button>
          </div>
        </div>

        {/* Pillar 2: Join with Shared URL or Code */}
        <div className="stationery-tile rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-[#E5D9C8] hover:border-[#CBA469] transition">
          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8E253D] text-white shadow-xs">
              <Link2 className="w-6 h-6 text-[#FAF7F2]" />
            </div>

            <h2 className="text-xl font-serif font-bold text-[#300A12]">
              Enter with Shared Link
            </h2>

            <p className="text-xs sm:text-sm text-[#63544E] font-sans leading-relaxed">
              Received an invitation from a coworker, family member, or friend? Paste your link or space code below to access their wishlist:
            </p>
          </div>

          <form onSubmit={handleJoinByInput} className="pt-6 space-y-3">
            <div className="relative">
              <input
                type="text"
                id="join-code-input"
                required
                placeholder="Paste link or code (e.g. christmas-wishlist-class-06-2026)"
                value={inputUrlOrCode}
                onChange={(e) => setInputUrlOrCode(e.target.value)}
                className="w-full rounded-xl border border-[#D6C8B5] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#300A12] focus:border-[#5C1525] focus:bg-white focus:outline-hidden transition"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-xl">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              id="welcome-enter-btn"
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-[#5C1525] bg-white py-3 px-5 text-sm font-bold text-[#5C1525] hover:bg-[#FAF0F2] shadow-2xs transition active:scale-98"
            >
              <span>Enter Private Space</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Local Device History: Only Spaces Visited on THIS Device */}
      {recentSpaces.length > 0 && (
        <section className="stationery-card rounded-3xl p-6 sm:p-8 border border-[#E2D6C5]">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[#8E253D]" />
            <h3 className="text-base font-serif font-bold text-[#300A12]">
              Your Recent Spaces on this Device
            </h3>
            <span className="text-[10px] text-[#9E8E81] italic ml-auto hidden sm:inline">
              Private to your browser session
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentSpaces.map((space) => (
              <button
                key={space.id}
                type="button"
                onClick={() => onSelectSpace(space.id)}
                className="flex items-center justify-between p-4 rounded-2xl border border-[#EBE2D5] bg-white hover:border-[#5C1525] hover:bg-[#FAF7F2] text-left transition group shadow-2xs"
              >
                <div className="min-w-0 pr-3">
                  <h4 className="text-sm font-serif font-bold text-[#300A12] group-hover:text-[#5C1525] truncate">
                    {space.title}
                  </h4>
                  <p className="text-xs text-[#7A6B63] font-sans truncate">
                    {space.type === 'secret' ? 'Group Wishlist Tiles' : 'Celebration'} • {space.participants.length} members
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#CBA469] group-hover:text-[#5C1525] group-hover:translate-x-1 transition shrink-0" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Explore Sample Demos */}
      <div className="envelope-lining rounded-2xl border border-[#E2D6C5] p-5 text-center space-y-3">
        <span className="inline-flex items-center gap-1 text-xs font-serif font-bold text-[#741D30]">
          <Sparkles className="w-3.5 h-3.5 text-[#CBA469]" />
          Preview Interactive Demos
        </span>
        <p className="text-xs text-[#63544E] max-w-lg mx-auto font-sans">
          Curious how the member tiles and secret coordination look? Try a sample space:
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          {spaces.slice(0, 2).map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSpace(sample.id)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#D6C8B5] bg-white px-4 py-2 text-xs font-semibold text-[#5C1525] hover:bg-[#FAF0F2] hover:border-[#5C1525] shadow-2xs transition"
            >
              <span>{sample.title}</span>
              <span className="text-[10px] text-[#CBA469]">({sample.type === 'secret' ? 'Group Tiles' : 'Celebration'})</span>
              <ArrowRight className="w-3 h-3 text-[#5C1525]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
