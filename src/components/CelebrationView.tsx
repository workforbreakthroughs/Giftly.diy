import React, { useState, useEffect } from 'react';
import {
  GiftlySpace,
  GiftItem,
  CurrentUserSession,
  ReactionType,
  Participant,
  CelebrationNote,
  NoteCategory,
} from '../types';
import { ItemActionModal } from './ItemActionModal';
import { AddNoteModal } from './AddNoteModal';
import {
  Gift,
  Plus,
  Heart,
  Handshake,
  Calendar,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Ban,
  ShoppingBag,
  Lightbulb,
  Trash2,
  ShieldCheck,
  Pin,
  Crown,
} from 'lucide-react';

interface CelebrationViewProps {
  space: GiftlySpace;
  currentUser: CurrentUserSession | null;
  onOpenAddWish: () => void;
  onMarkPrepared: (giftId: string, isPrepared: boolean, note?: string) => Promise<void>;
  onAddSharingPledge: (giftId: string, amount?: number, note?: string) => Promise<void>;
  onRemoveSharingPledge: (giftId: string, contribId: string) => Promise<void>;
  onToggleReaction: (giftId: string, type: ReactionType) => Promise<void>;
  onEditWish: (gift: GiftItem) => void;
  onDeleteWish: (giftId: string) => void;
  onRequireAuth: () => void;
  onAddNote: (data: {
    category: NoteCategory;
    content: string;
    authorName: string;
    isImportant?: boolean;
  }) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onToggleNoteImportant: (noteId: string) => Promise<void>;
  onQuickSwitchUser?: (p: Participant) => void;
}

export const CelebrationView: React.FC<CelebrationViewProps> = ({
  space,
  currentUser,
  onOpenAddWish,
  onMarkPrepared,
  onAddSharingPledge,
  onRemoveSharingPledge,
  onToggleReaction,
  onEditWish,
  onDeleteWish,
  onRequireAuth,
  onAddNote,
  onDeleteNote,
  onToggleNoteImportant,
  onQuickSwitchUser,
}) => {
  const [selectedWishForAction, setSelectedWishForAction] = useState<GiftItem | null>(null);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [noteFilter, setNoteFilter] = useState<'all' | 'cautions' | 'preferences' | 'claimed'>('all');

  // Ensure scroll is at the top when entering the celebration view
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [space.id]);

  const totalGifts = space.gifts.length;
  const totalContributions = space.gifts.reduce(
    (sum, g) => sum + g.contributions.reduce((s, c) => s + (c.amount || 0), 0),
    0
  );

  // Check if active user is the organizer (with full curation privileges)
  const isOrganizer = Boolean(
    currentUser &&
      (currentUser.isOrganizer ||
        currentUser.name.toLowerCase().includes('organizer') ||
        space.participants.find((p) => p.id === currentUser.participantId)?.isOrganizer ||
        (space.organizerKeyword &&
          currentUser.keyword?.toLowerCase() === space.organizerKeyword.toLowerCase()) ||
        currentUser.name.toLowerCase() === space.organizerName.toLowerCase())
  );

  const notes = space.notes || [];

  const filteredNotes = notes.filter((note) => {
    if (noteFilter === 'cautions') return note.category === 'allergy' || note.category === 'dislike';
    if (noteFilter === 'preferences') return note.category === 'preference' || note.category === 'tip';
    if (noteFilter === 'claimed') return note.category === 'already_bought';
    return true;
  });

  const cautionsCount = notes.filter((n) => n.category === 'allergy' || n.category === 'dislike').length;
  const preferencesCount = notes.filter((n) => n.category === 'preference' || n.category === 'tip').length;
  const claimedCount = notes.filter((n) => n.category === 'already_bought').length;

  const celebrantName = space.recipientName || 'the celebrant';

  const handleDeleteNoteConfirm = (note: CelebrationNote) => {
    const isOwner = currentUser && note.addedBy.id === currentUser.participantId;
    let message = `Delete this note?`;
    if (isOrganizer && !isOwner) {
      message = `Organizer Action: Remove this note as not suitable or outdated?\n\n"${note.content}"`;
    }
    if (window.confirm(message)) {
      onDeleteNote(note.id);
    }
  };

  const getCategoryBadge = (cat: NoteCategory) => {
    switch (cat) {
      case 'dislike':
        return {
          label: 'Dislike',
          icon: Ban,
          className: 'bg-[#FAF0F2] text-[#8E253D] border-[#E8C5CD]',
        };
      case 'allergy':
        return {
          label: 'Allergy',
          icon: AlertTriangle,
          className: 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]',
        };
      case 'already_bought':
        return {
          label: 'Claimed',
          icon: ShoppingBag,
          className: 'bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]',
        };
      case 'preference':
        return {
          label: 'Preference',
          icon: Heart,
          className: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]',
        };
      case 'tip':
      default:
        return {
          label: 'Tip',
          icon: Lightbulb,
          className: 'bg-[#FAF7F2] text-[#63544E] border-[#E2D6C5]',
        };
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Celebration Header */}
      <section className="stationery-card relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#5C1525] via-[#CBA469] to-[#5C1525]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5C1525] px-3 py-0.5 text-xs font-semibold text-[#FAF7F2]">
                <Sparkles className="w-3.5 h-3.5 text-[#E5CA9E]" />
                Celebration Giftly
              </span>
              <span className="rounded-full border border-[#E2D6C5] bg-[#FAF7F2] px-3 py-0.5 text-xs font-medium text-[#741D30]">
                {space.occasion}
              </span>
              {space.targetDate && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#E2D6C5] bg-[#FAF7F2] px-3 py-0.5 text-xs font-medium text-[#7A6B63]">
                  <Calendar className="w-3 h-3 text-[#CBA469]" />
                  {space.targetDate}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold text-[#300A12]">
              {space.title}
            </h1>

            {space.recipientName && (
              <p className="mt-1 text-sm font-serif italic text-[#741D30]">
                Honoring {space.recipientName}
              </p>
            )}

            <p className="mt-2 text-sm text-[#63544E] font-sans leading-relaxed">
              {space.tagline || 'Collaborative gift ideas and group funding for this celebration.'}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#63544E]">
              <div className="flex items-center gap-1.5 rounded-xl border border-[#E2D6C5] bg-white px-3 py-1.5 shadow-2xs font-medium">
                <Gift className="w-3.5 h-3.5 text-[#5C1525]" />
                <span>
                  <strong className="text-[#300A12]">{totalGifts}</strong> Gift Ideas
                </span>
              </div>

              <div className="flex items-center gap-1.5 rounded-xl border border-[#ECD7AF] bg-[#FAF6EC] px-3 py-1.5 text-[#741D30] shadow-2xs font-medium">
                <Handshake className="w-3.5 h-3.5 text-[#CBA469]" />
                <span>
                  <strong>
                    {space.currency}
                    {totalContributions}
                  </strong>{' '}
                  Shared Funding
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('celebration-notes-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 rounded-xl border border-[#E2D6C5] bg-white px-3 py-1.5 text-[#63544E] hover:border-[#8E253D] shadow-2xs transition cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#8E253D]" />
                <span>
                  <strong className="text-[#300A12]">{notes.length}</strong> Notes & Caveats
                </span>
              </button>
            </div>
          </div>

          {/* Action Buttons: Prioritize Adding Gift Idea */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 self-start lg:self-center shrink-0">
            <button
              type="button"
              id="add-gift-idea-btn"
              onClick={onOpenAddWish}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5C1525] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#48111D] ring-1 ring-[#CBA469]/50 transition active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Add Gift Idea</span>
            </button>

            <button
              type="button"
              id="add-preference-note-btn"
              onClick={() => setIsAddNoteOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-[#D6C8B5] px-3.5 py-2 text-xs font-medium text-[#63544E] hover:bg-[#FAF7F2] hover:text-[#5C1525] shadow-2xs transition active:scale-98"
            >
              <Plus className="w-3 h-3 text-[#741D30]" />
              <span>Add Preference Note</span>
            </button>
          </div>
        </div>

        {/* Quick User Switcher Bar */}
        {currentUser && onQuickSwitchUser && space.participants.length > 0 && (
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
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive ? 'bg-[#E5CA9E]' : 'bg-[#D6C8B5]'
                      }`}
                    />
                    <span>
                      {p.name} {p.isOrganizer ? '👑' : ''} {isActive ? '(You)' : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            {isOrganizer && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF3E6] border border-[#ECD7AF] px-2.5 py-0.5 text-[11px] font-bold text-[#741D30]">
                <Crown className="w-3 h-3 text-[#CBA469]" />
                Organizer Mode Active (Can remove unsuitable notes)
              </span>
            )}
          </div>
        )}
      </section>

      {/* 1. PRIMARY SECTION: Curated Gift Ideas (Show first) */}
      <section id="curated-gift-ideas-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-[#300A12] flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#5C1525]" />
              <span>Curated Gift Ideas ({totalGifts})</span>
            </h2>
            <p className="text-xs text-[#7A6B63] mt-0.5 font-sans">
              Browse gifts suggested by family and friends, or volunteer to prepare or chip in.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAddWish}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#5C1525] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#48111D] ring-1 ring-[#CBA469]/50 transition shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Gift Idea</span>
          </button>
        </div>

        {space.gifts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {space.gifts.map((gift, idx) => {
              const totalShared = gift.contributions.reduce((s, c) => s + (c.amount || 0), 0);
              const isPrepared = gift.status === 'prepared';

              return (
                <div
                  key={gift.id}
                  onClick={() => setSelectedWishForAction(gift)}
                  className="stationery-tile rounded-3xl p-5 border border-[#E5D9C8] flex flex-col justify-between cursor-pointer hover:border-[#5C1525]/40 transition group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="rounded-full bg-[#FAF3E6] border border-[#ECD7AF] px-2.5 py-0.5 text-[10px] font-bold text-[#741D30]">
                        #{idx + 1} {gift.category || 'Gift'}
                      </span>
                      {gift.price !== undefined && (
                        <span className="font-serif font-bold text-base text-[#300A12]">
                          {space.currency}
                          {gift.price}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-base sm:text-lg text-[#300A12] group-hover:text-[#5C1525] transition leading-snug">
                      {gift.title}
                    </h3>

                    {gift.description && (
                      <p className="mt-1.5 text-xs text-[#7A6B63] line-clamp-2 font-sans leading-relaxed">
                        {gift.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-[#F0E8DC] flex items-center justify-between text-xs">
                    {isPrepared ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#E3EEE2] text-[#244229] border border-[#C2D8C0] px-2.5 py-0.5 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-[#3A5A40]" />
                        Prepared
                      </span>
                    ) : gift.contributions.length > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF3E6] border border-[#ECD7AF] px-2.5 py-0.5 text-[10px] font-semibold text-[#741D30]">
                        <Handshake className="w-3 h-3 text-[#CBA469]" />
                        {gift.contributions.length} sharing ({space.currency}
                        {totalShared})
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#9E8E81] font-medium">Available</span>
                    )}

                    <span className="text-[11px] text-[#8E253D] font-semibold group-hover:underline">
                      Long-press / React →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="stationery-card rounded-3xl p-12 text-center">
            <Gift className="w-10 h-10 text-[#CBA469] mx-auto mb-2" />
            <h3 className="text-base font-serif font-bold text-[#300A12]">No gift ideas added yet</h3>
            <p className="text-xs text-[#7A6B63] mt-1">
              Be the first to suggest a gift for this celebration!
            </p>
            <button
              type="button"
              onClick={onOpenAddWish}
              className="mt-3 rounded-xl bg-[#5C1525] px-4 py-2 text-xs font-semibold text-white hover:bg-[#48111D] transition"
            >
              Add First Gift Idea
            </button>
          </div>
        )}
      </section>

      {/* 2. SECONDARY SECTION: Celebrant Preferences, Dislikes & Notes (Visually smaller, shown below gifts) */}
      <section
        id="celebration-notes-section"
        className="rounded-3xl border border-[#E8DECd] bg-[#FAF8F4]/80 p-5 sm:p-6 space-y-3.5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#300A12] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#8E253D]" />
                <span>Preferences, Dislikes & Helpful Tips ({notes.length})</span>
              </h3>
              {isOrganizer && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#FAF3E6] border border-[#ECD7AF] px-2 py-0.5 text-[9px] font-bold text-[#741D30]">
                  <ShieldCheck className="w-2.5 h-2.5 text-[#CBA469]" />
                  Organizer Can Remove Unsuitable Notes
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#7A6B63] font-sans mt-0.5">
              Reference notes from family so everyone knows what {celebrantName} dislikes, allergies, or items already bought.
            </p>
          </div>

          <button
            type="button"
            id="add-note-inline-btn"
            onClick={() => setIsAddNoteOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-white border border-[#D6C8B5] px-2.5 py-1.5 text-[11px] font-semibold text-[#5C1525] hover:bg-[#FAF0F2] hover:border-[#5C1525] shadow-2xs transition shrink-0 self-start sm:self-center"
          >
            <Plus className="w-3 h-3 text-[#5C1525]" />
            <span>+ Add Note</span>
          </button>
        </div>

        {/* Compact Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => setNoteFilter('all')}
            className={`rounded-lg px-2.5 py-0.5 text-[11px] font-medium transition ${
              noteFilter === 'all'
                ? 'bg-[#5C1525] text-white font-semibold'
                : 'bg-white border border-[#E2D6C5] text-[#63544E] hover:border-[#5C1525]'
            }`}
          >
            All ({notes.length})
          </button>
          <button
            type="button"
            onClick={() => setNoteFilter('cautions')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[11px] font-medium transition ${
              noteFilter === 'cautions'
                ? 'bg-[#8E253D] text-white font-semibold'
                : 'bg-white border border-[#E2D6C5] text-[#63544E] hover:border-[#8E253D]'
            }`}
          >
            <Ban className="w-2.5 h-2.5" />
            <span>Allergies & Dislikes ({cautionsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setNoteFilter('claimed')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[11px] font-medium transition ${
              noteFilter === 'claimed'
                ? 'bg-[#4338CA] text-white font-semibold'
                : 'bg-white border border-[#E2D6C5] text-[#63544E] hover:border-[#4338CA]'
            }`}
          >
            <ShoppingBag className="w-2.5 h-2.5" />
            <span>Already Claimed ({claimedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setNoteFilter('preferences')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[11px] font-medium transition ${
              noteFilter === 'preferences'
                ? 'bg-[#15803D] text-white font-semibold'
                : 'bg-white border border-[#E2D6C5] text-[#63544E] hover:border-[#15803D]'
            }`}
          >
            <Heart className="w-2.5 h-2.5" />
            <span>Preferences & Sizes ({preferencesCount})</span>
          </button>
        </div>

        {/* Compact Notes Grid (Visually smaller than gift cards) */}
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {filteredNotes.map((note) => {
              const badge = getCategoryBadge(note.category);
              const BadgeIcon = badge.icon;
              const isOwner = currentUser && note.addedBy.id === currentUser.participantId;
              const canManage = isOrganizer || isOwner;

              return (
                <div
                  key={note.id}
                  id={`note-card-${note.id}`}
                  className={`rounded-2xl p-3 border flex flex-col justify-between transition-all duration-150 text-xs ${
                    note.isImportant
                      ? 'border-[#CBA469] bg-[#FAF8F3] shadow-2xs ring-1 ring-[#CBA469]/40 hover:border-[#5C1525] hover:ring-[#5C1525]/30 hover:shadow-xs'
                      : 'border-[#E2D6C5] bg-white hover:border-[#5C1525]/40 hover:shadow-2xs'
                  }`}
                >
                  <div>
                    {/* Badge & Important Tag */}
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${badge.className}`}
                      >
                        <BadgeIcon className="w-2.5 h-2.5" />
                        <span>{badge.label}</span>
                      </span>

                      {note.isImportant && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF3E6] border border-[#ECD7AF] px-2 py-0.5 text-[9px] font-bold text-[#741D30] shadow-2xs" title="Pinned by organizer as high priority">
                          <Pin className="w-2.5 h-2.5 text-[#CBA469]" />
                          <span>Must Read</span>
                        </span>
                      )}
                    </div>

                    {/* Content (Compact, readable, smaller text) */}
                    <p className="text-[11px] sm:text-xs text-[#300A12] leading-relaxed font-sans font-medium">
                      "{note.content}"
                    </p>
                  </div>

                  {/* Compact Footer & Actions */}
                  <div className="mt-2.5 pt-2 border-t border-[#F0E8DC] flex items-center justify-between text-[10px] text-[#7A6B63]">
                    <span className="truncate pr-1">
                      By <strong className="text-[#554743]">{note.addedBy.name}</strong>
                    </span>

                    {/* Manage Button (For Organizer or Note Author) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isOrganizer && (
                        <button
                          type="button"
                          onClick={() => onToggleNoteImportant(note.id)}
                          className="text-[9px] font-medium text-[#741D30] hover:underline"
                          title={note.isImportant ? 'Unpin' : 'Pin'}
                        >
                          {note.isImportant ? 'Unpin' : 'Pin'}
                        </button>
                      )}

                      {canManage && (
                        <button
                          type="button"
                          onClick={() => handleDeleteNoteConfirm(note)}
                          className={`inline-flex items-center gap-0.5 text-[10px] font-medium transition ${
                            isOrganizer && !isOwner
                              ? 'text-[#8E253D] hover:text-[#5C1525] bg-[#FAF0F2] px-1.5 py-0.5 rounded border border-[#E8C5CD]'
                              : 'text-[#9E8E81] hover:text-[#8E253D]'
                          }`}
                          title={
                            isOrganizer && !isOwner
                              ? 'Organizer Action: Remove this unsuitable note'
                              : 'Delete note'
                          }
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          <span>{isOrganizer && !isOwner ? 'Remove' : 'Del'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#E2D6C5] p-4 text-center bg-white/60">
            <p className="text-xs text-[#7A6B63]">
              No notes in this category yet.
            </p>
          </div>
        )}
      </section>

      {/* Action Sheet Modal */}
      {selectedWishForAction && (
        <ItemActionModal
          isOpen={Boolean(selectedWishForAction)}
          gift={selectedWishForAction}
          currency={space.currency}
          memberOwnerName={space.recipientName || 'Recipient'}
          isOwnWish={false}
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

      {/* Add Note Modal */}
      <AddNoteModal
        isOpen={isAddNoteOpen}
        celebrantName={space.recipientName || 'the celebrant'}
        currentUser={currentUser}
        onClose={() => setIsAddNoteOpen(false)}
        onSubmit={async (noteData) => {
          await onAddNote(noteData);
          setIsAddNoteOpen(false);
        }}
      />
    </div>
  );
};
