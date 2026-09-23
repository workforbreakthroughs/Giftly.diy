import React, { useState, useEffect } from 'react';
import { GiftlySpace, GiftItem, CurrentUserSession, Participant, ReactionType } from '../types';
import { MemberTile } from './MemberTile';
import { ItemActionModal } from './ItemActionModal';
import {
  Users,
  Plus,
  Sparkles,
  Gift,
  Handshake,
  Mail,
  UserPlus,
  Search,
  Filter,
  Link2,
  Check,
} from 'lucide-react';

interface GroupGiftTilesViewProps {
  space: GiftlySpace;
  currentUser: CurrentUserSession | null;
  onOpenAddWish: (forParticipantId?: string) => void;
  onOpenAddMember: () => void;
  onMarkPrepared: (giftId: string, isPrepared: boolean, note?: string) => Promise<void>;
  onAddSharingPledge: (giftId: string, amount?: number, note?: string) => Promise<void>;
  onRemoveSharingPledge: (giftId: string, contribId: string) => Promise<void>;
  onToggleReaction: (giftId: string, type: ReactionType) => Promise<void>;
  onEditWish: (gift: GiftItem) => void;
  onDeleteWish: (giftId: string) => void;
  onRequireAuth: () => void;
  onQuickSwitchUser: (p: Participant) => void;
}

export const GroupGiftTilesView: React.FC<GroupGiftTilesViewProps> = ({
  space,
  currentUser,
  onOpenAddWish,
  onOpenAddMember,
  onMarkPrepared,
  onAddSharingPledge,
  onRemoveSharingPledge,
  onToggleReaction,
  onEditWish,
  onDeleteWish,
  onRequireAuth,
  onQuickSwitchUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWishForAction, setSelectedWishForAction] = useState<{
    gift: GiftItem;
    memberName: string;
    isOwnWish: boolean;
  } | null>(null);

  // Ensure scroll is at the top when entering the group tiles view
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [space.id]);

  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://giftly.diy';
      const shareUrl = `${origin}/?giftly=${space.id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  // Filter members if search query exists
  const filteredParticipants = space.participants.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatches = p.name.toLowerCase().includes(q);
    const wishMatches = space.gifts
      .filter((g) => g.forParticipantId === p.id)
      .some((g) => g.title.toLowerCase().includes(q) || (g.description && g.description.toLowerCase().includes(q)));
    return nameMatches || wishMatches;
  });

  // Space-level stats
  const totalWishes = space.gifts.length;
  const totalPrepared = space.gifts.filter((g) => g.status === 'prepared').length;
  const totalSharing = space.gifts.filter((g) => g.contributions.length > 0).length;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner: Warm Stationery & Ribbon Header */}
      <section className="stationery-card relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#5C1525] via-[#CBA469] to-[#5C1525]" />
        
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-[#FAF3E6]/60 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5C1525] px-3 py-0.5 text-xs font-semibold text-[#FAF7F2] shadow-2xs">
                <Users className="w-3.5 h-3.5 text-[#E5CA9E]" />
                Group Gift Wishlist Tiles
              </span>
              <span className="rounded-full border border-[#E2D6C5] bg-[#FAF7F2] px-3 py-0.5 text-xs font-medium text-[#741D30]">
                {space.occasion}
              </span>
              {space.targetDate && (
                <span className="rounded-full border border-[#E2D6C5] bg-[#FAF7F2] px-3 py-0.5 text-xs font-medium text-[#7A6B63]">
                  Exchange Date: {space.targetDate}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold text-[#300A12] tracking-tight">
              {space.title}
            </h1>

            <p className="mt-2 text-sm text-[#63544E] font-sans leading-relaxed">
              {space.tagline ||
                'Tiles display all group members and their bulleted wish lists. Long-press or click any wish to prepare it or volunteer to share costs!'}
            </p>

            {/* Quick Stats Pill Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#63544E] font-sans">
              <div className="flex items-center gap-1.5 rounded-xl border border-[#E2D6C5] bg-white px-3 py-1.5 shadow-2xs">
                <Users className="w-3.5 h-3.5 text-[#5C1525]" />
                <span>
                  <strong>{space.participants.length}</strong> Group Members
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-[#E2D6C5] bg-white px-3 py-1.5 shadow-2xs">
                <Gift className="w-3.5 h-3.5 text-[#741D30]" />
                <span>
                  <strong>{totalWishes}</strong> Total Wishes
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-[#C2D8C0] bg-[#F2F7F2] px-3 py-1.5 text-[#1E3A20] shadow-2xs">
                <span className="font-bold">✓ {totalPrepared}</span> Prepared / Claimed
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-[#ECD7AF] bg-[#FAF6EC] px-3 py-1.5 text-[#741D30] shadow-2xs">
                <Handshake className="w-3.5 h-3.5 text-[#CBA469]" />
                <span>
                  <strong>{totalSharing}</strong> Shared Pledges
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 shrink-0">
            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                id="share-space-btn"
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#D6C8B5] bg-white px-3 py-2 text-xs font-semibold text-[#5C1525] hover:bg-[#FAF0F2] hover:border-[#5C1525] shadow-2xs transition active:scale-98"
                title="Copy private shareable link"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5 text-[#8E253D]" />
                    <span>Copy Invite Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="add-member-btn"
                onClick={onOpenAddMember}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#D6C8B5] bg-white px-3 py-2 text-xs font-semibold text-[#5C1525] hover:bg-[#FAF0F2] hover:border-[#5C1525] shadow-2xs transition active:scale-98"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#8E253D]" />
                <span>+ Member</span>
              </button>
            </div>

            <button
              type="button"
              id="add-my-wish-btn"
              onClick={() => onOpenAddWish(currentUser?.participantId)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#5C1525] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#48111D] ring-1 ring-[#CBA469]/50 transition active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Add Wish to My List</span>
            </button>
          </div>
        </div>

        {/* Quick User Switcher Bar (Essential for testing and multiple teammates on one device) */}
        {currentUser && (
          <div className="mt-5 pt-4 border-t border-[#F0E8DC] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-xs font-serif font-bold text-[#7A6B63] shrink-0">
                Active Member:
              </span>
              {space.participants.map((p) => {
                const isActive = currentUser.participantId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onQuickSwitchUser(p)}
                    className={`rounded-xl px-3 py-1 text-xs font-medium transition shrink-0 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#5C1525] text-white font-bold shadow-2xs'
                        : 'bg-white text-[#63544E] border border-[#E2D6C5] hover:border-[#5C1525]'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-[#E5CA9E]' : 'bg-[#D6C8B5]'}`} />
                    <span>{p.name} {isActive ? '(You)' : ''}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Box */}
            <div className="relative min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9E8E81]" />
              <input
                type="text"
                placeholder="Filter members or wishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#D6C8B5] bg-white text-xs text-[#300A12] focus:border-[#5C1525] focus:outline-hidden"
              />
            </div>
          </div>
        )}
      </section>

      {/* Guide Banner: Explaining Long-Press / Click actions */}
      <div className="envelope-lining rounded-2xl border border-[#E2D6C5] p-3.5 sm:p-4 text-xs text-[#554743] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="wax-seal flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E5CA9E]" />
          </div>
          <div>
            <strong className="text-[#300A12] font-serif">Quick Interactive Tip:</strong>{' '}
            Long-press or click any item in a member’s wish list to mark that you{' '}
            <span className="font-semibold text-[#1E3A20]">prepared for it</span> or volunteer to{' '}
            <span className="font-semibold text-[#741D30]">share cost</span>!
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#7A6B63] shrink-0 font-sans">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#3A5A40]" /> Prepared
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#CBA469]" /> Sharing
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#8E253D]" /> Sealed (Your List)
          </span>
        </div>
      </div>

      {/* All Member Tiles Side-by-Side in Grid! */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-bold text-[#300A12] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#5C1525]" />
            <span>Group Member Wishlist Tiles ({filteredParticipants.length})</span>
          </h2>
          <span className="text-xs text-[#7A6B63] font-sans">
            Tiles of all members and their lists
          </span>
        </div>

        {filteredParticipants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredParticipants.map((participant) => {
              const memberGifts = space.gifts.filter(
                (g) => g.forParticipantId === participant.id
              );

              return (
                <MemberTile
                  key={participant.id}
                  participant={participant}
                  gifts={memberGifts}
                  currency={space.currency}
                  currentUser={currentUser}
                  onOpenAddWish={onOpenAddWish}
                  onSelectWish={(gift, memberName, isOwnWish) => {
                    setSelectedWishForAction({ gift, memberName, isOwnWish });
                  }}
                  onQuickTogglePrepared={(giftId, isPrepared) => {
                    if (!currentUser) {
                      onRequireAuth();
                      return;
                    }
                    onMarkPrepared(giftId, isPrepared);
                  }}
                  onQuickReaction={(giftId, type) => {
                    if (!currentUser) {
                      onRequireAuth();
                      return;
                    }
                    onToggleReaction(giftId, type);
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div className="stationery-card rounded-3xl p-12 text-center border-dashed">
            <Users className="w-10 h-10 text-[#CBA469] mx-auto mb-2" />
            <h3 className="text-base font-serif font-bold text-[#300A12]">No members matched your search</h3>
            <p className="text-xs text-[#7A6B63] mt-1 font-sans">
              Try searching a different name or clear the search query.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs text-[#5C1525] font-bold hover:underline"
            >
              Clear Search Filter
            </button>
          </div>
        )}
      </section>

      {/* Long-Press / Click Action Modal Sheet */}
      {selectedWishForAction && (
        <ItemActionModal
          isOpen={Boolean(selectedWishForAction)}
          gift={selectedWishForAction.gift}
          currency={space.currency}
          memberOwnerName={selectedWishForAction.memberName}
          isOwnWish={selectedWishForAction.isOwnWish}
          currentUser={currentUser}
          onClose={() => setSelectedWishForAction(null)}
          onMarkPrepared={onMarkPrepared}
          onAddSharingPledge={onAddSharingPledge}
          onRemoveSharingPledge={onRemoveSharingPledge}
          onToggleReaction={onToggleReaction}
          onEditWish={onEditWish}
          onDeleteWish={onDeleteWish}
          onRequireAuth={onRequireAuth}
        />
      )}
    </div>
  );
};
