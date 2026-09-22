import React, { useState } from 'react';
import { GiftItem, CurrentUserSession, ReactionType } from '../types';
import { Gift, Handshake, Heart, Sparkles, Lightbulb, ThumbsUp, X, Check, Trash2, Edit3, ExternalLink } from 'lucide-react';

interface ItemActionModalProps {
  isOpen: boolean;
  gift: GiftItem | null;
  currency: string;
  memberOwnerName: string;
  isOwnWish: boolean;
  currentUser: CurrentUserSession | null;
  onClose: () => void;
  onMarkPrepared: (giftId: string, isPrepared: boolean, note?: string) => Promise<void>;
  onAddSharingPledge: (giftId: string, amount?: number, note?: string) => Promise<void>;
  onRemoveSharingPledge: (giftId: string, contribId: string) => Promise<void>;
  onToggleReaction: (giftId: string, type: ReactionType) => Promise<void>;
  onEditWish: (gift: GiftItem) => void;
  onDeleteWish: (giftId: string) => void;
  onRequireAuth: () => void;
}

export const ItemActionModal: React.FC<ItemActionModalProps> = ({
  isOpen,
  gift,
  currency,
  memberOwnerName,
  isOwnWish,
  currentUser,
  onClose,
  onMarkPrepared,
  onAddSharingPledge,
  onRemoveSharingPledge,
  onToggleReaction,
  onEditWish,
  onDeleteWish,
  onRequireAuth,
}) => {
  if (!isOpen || !gift) return null;

  const [pledgeAmount, setPledgeAmount] = useState<string>('');
  const [pledgeNote, setPledgeNote] = useState<string>('');
  const [preparedNote, setPreparedNote] = useState<string>('');
  const [showShareInput, setShowShareInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPreparedByMe = currentUser && gift.preparedBy?.participantId === currentUser.participantId;
  const isPreparedByOther = gift.preparedBy && (!currentUser || gift.preparedBy.participantId !== currentUser.participantId);

  const myContribution = currentUser
    ? gift.contributions.find((c) => c.participantId === currentUser.participantId)
    : null;

  const totalSharedPledged = gift.contributions.reduce((sum, c) => sum + (c.amount || 0), 0);

  const handleTogglePrepared = async () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    setIsSubmitting(true);
    try {
      await onMarkPrepared(gift.id, !isPreparedByMe, preparedNote.trim() || undefined);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    setIsSubmitting(true);
    try {
      const parsed = pledgeAmount ? parseFloat(pledgeAmount) : undefined;
      await onAddSharingPledge(gift.id, parsed, pledgeNote.trim() || undefined);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReactionClick = async (type: ReactionType) => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    await onToggleReaction(gift.id, type);
  };

  return (
    <div
      id="item-action-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#300A12]/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="item-action-card"
        className="stationery-card relative w-full max-w-md overflow-hidden rounded-3xl bg-[#FDFCF9] border border-[#E2D6C5] shadow-[0_20px_50px_rgba(92,21,37,0.22)] transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top burgundy/gold ribbon accent */}
        <div className="h-1.5 w-full bg-linear-to-r from-[#5C1525] via-[#CBA469] to-[#5C1525]" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#F0E8DC] p-5 bg-[#FAF7F2]">
          <div className="min-w-0 pr-3">
            <span className="inline-block text-[11px] font-serif font-bold uppercase tracking-wider text-[#8E253D] mb-1">
              Wish for {memberOwnerName}
            </span>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-[#300A12] leading-snug">
              {gift.title}
            </h3>
            {gift.price !== undefined && (
              <span className="inline-block mt-1 font-serif text-sm font-semibold text-[#63544E]">
                Est. {currency}{gift.price}
              </span>
            )}
            {gift.url && (
              <a
                href={gift.url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 flex items-center gap-1 text-xs text-[#741D30] hover:underline"
              >
                <span>View item link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[#9E8E81] hover:bg-[#EAE1D3] hover:text-[#300A12] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {gift.description && (
            <p className="text-xs text-[#63544E] bg-[#FAF7F2] p-3 rounded-xl border border-[#EBE2D5] italic font-sans">
              "{gift.description}"
            </p>
          )}

          {/* Quick Reaction Emojis Row */}
          <div>
            <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#7A6B63] mb-2">
              Quick Reactions
            </label>
            <div className="flex items-center gap-2">
              {[
                { type: 'love' as ReactionType, icon: Heart, label: 'Love it', color: 'text-rose-600' },
                { type: 'excited' as ReactionType, icon: Sparkles, label: 'Excited', color: 'text-amber-600' },
                { type: 'idea' as ReactionType, icon: Lightbulb, label: 'Great idea', color: 'text-yellow-600' },
                { type: 'check' as ReactionType, icon: ThumbsUp, label: 'Approved', color: 'text-emerald-600' },
              ].map(({ type, icon: Icon, label, color }) => {
                const hasReacted = currentUser && gift.reactions.some(
                  (r) => r.participantId === currentUser.participantId && r.type === type
                );
                const count = gift.reactions.filter((r) => r.type === type).length;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleReactionClick(type)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition ${
                      hasReacted
                        ? 'border-[#5C1525] bg-[#FAF0F2] text-[#5C1525] shadow-2xs'
                        : 'border-[#E2D6C5] bg-[#FAF7F2] text-[#63544E] hover:border-[#CBA469] hover:bg-[#FFFFFF]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                    <span>{count > 0 ? count : ''}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Decision: Prepared Already vs. Sharing Only */}
          {!isOwnWish ? (
            <div className="space-y-3 pt-2 border-t border-[#F0E8DC]">
              <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#7A6B63]">
                Gift Coordination
              </label>

              {/* Action 1: "I prepared for this already / will gift the person" */}
              <div
                className={`rounded-2xl border p-4 transition ${
                  isPreparedByMe
                    ? 'border-[#3A5A40] bg-[#F2F7F2] text-[#1E3A20]'
                    : isPreparedByOther
                    ? 'border-[#E2D6C5] bg-[#FAF7F2] opacity-80'
                    : 'border-[#ECD7AF] bg-linear-to-b from-[#FFFDF9] to-[#FAF5EB] hover:border-[#5C1525]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs ${
                        isPreparedByMe ? 'bg-[#3A5A40]' : 'bg-[#5C1525]'
                      }`}
                    >
                      <Gift className="w-5 h-5 text-[#FAF7F2]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-bold text-[#300A12]">
                        {isPreparedByMe
                          ? 'You marked this as Prepared / Claimed!'
                          : isPreparedByOther
                          ? `Already prepared by ${gift.preparedBy?.participantName}`
                          : 'I prepared for this already / I will gift this'}
                      </h4>
                      <p className="text-xs text-[#63544E] mt-0.5 font-sans">
                        {isPreparedByMe
                          ? 'You are taking care of this gift. Other teammates will see it is covered!'
                          : isPreparedByOther
                          ? gift.preparedBy?.note
                            ? `"${gift.preparedBy.note}"`
                            : 'This wish is already handled.'
                          : 'Claim this item so nobody duplicates it.'}
                      </p>
                    </div>
                  </div>

                  {!isPreparedByOther && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleTogglePrepared}
                      className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-2xs ${
                        isPreparedByMe
                          ? 'border border-[#C2D8C0] bg-white text-[#8E253D] hover:bg-[#FAF0F2]'
                          : 'bg-[#5C1525] text-white hover:bg-[#48111D]'
                      }`}
                    >
                      {isPreparedByMe ? 'Cancel Claim' : 'I Got This! 🎁'}
                    </button>
                  )}
                </div>
              </div>

              {/* Action 2: "will gift the person but sharing only" */}
              <div
                className={`rounded-2xl border p-4 transition ${
                  myContribution
                    ? 'border-[#CBA469] bg-[#FAF6EC]'
                    : 'border-[#E2D6C5] bg-[#FAF7F2] hover:border-[#CBA469]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8E253D] text-white shadow-2xs">
                      <Handshake className="w-5 h-5 text-[#E5CA9E]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-bold text-[#300A12]">
                        {myContribution
                          ? `You volunteered to share! (${currency}${myContribution.amount || 'Custom'})`
                          : 'I will gift, but sharing only (Co-gift / Chip in)'}
                      </h4>
                      <p className="text-xs text-[#63544E] mt-0.5 font-sans">
                        {gift.contributions.length > 0
                          ? `${gift.contributions.length} teammate${
                              gift.contributions.length === 1 ? '' : 's'
                            } sharing (${currency}${totalSharedPledged} total pledged)`
                          : 'Volunteer to split the cost with other teammates.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowShareInput(!showShareInput)}
                    className="shrink-0 rounded-xl border border-[#D6C8B5] bg-white px-3 py-1.5 text-xs font-semibold text-[#5C1525] hover:bg-[#FAF0F2] transition shadow-2xs"
                  >
                    {showShareInput ? 'Close' : myContribution ? 'Edit Share' : '🤝 Share Only'}
                  </button>
                </div>

                {/* Inline Share Input */}
                {showShareInput && (
                  <form onSubmit={handleConfirmShare} className="mt-3 pt-3 border-t border-[#E8DECd] space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#300A12]">Pledge:</span>
                      {[20, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setPledgeAmount(amt.toString())}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition ${
                            pledgeAmount === amt.toString()
                              ? 'bg-[#5C1525] text-white border-[#5C1525]'
                              : 'bg-white text-[#63544E] border-[#D6C8B5] hover:border-[#5C1525]'
                          }`}
                        >
                          +{currency}{amt}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-[#7A6B63] font-bold">
                        {currency}
                      </span>
                      <input
                        type="number"
                        min="1"
                        placeholder="Custom amount (e.g. 35)"
                        value={pledgeAmount}
                        onChange={(e) => setPledgeAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-[#D6C8B5] bg-white text-xs text-[#300A12] focus:border-[#5C1525] focus:outline-hidden"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Note (e.g. Willing to order & wrap!)"
                      value={pledgeNote}
                      onChange={(e) => setPledgeNote(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#D6C8B5] bg-white text-xs text-[#300A12] focus:border-[#5C1525] focus:outline-hidden"
                    />

                    <div className="flex items-center justify-between">
                      {myContribution ? (
                        <button
                          type="button"
                          onClick={async () => {
                            await onRemoveSharingPledge(gift.id, myContribution.id);
                            setShowShareInput(false);
                          }}
                          className="text-xs text-[#8E253D] hover:underline"
                        >
                          Withdraw share
                        </button>
                      ) : (
                        <div />
                      )}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-xl bg-[#5C1525] px-4 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#48111D]"
                      >
                        {isSubmitting ? 'Saving...' : 'Confirm Share Pledge'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E2D6C5] bg-[#FAF5EB] p-4 text-center">
              <span className="block text-xs font-serif font-bold text-[#300A12] mb-1">
                ✉️ This is your wish!
              </span>
              <p className="text-xs text-[#7A6B63] font-sans">
                Coworkers and friends coordinate surprises here. You can edit or remove your wish anytime.
              </p>
            </div>
          )}

          {/* Edit / Delete actions for wish owner */}
          {(isOwnWish || currentUser?.isOrganizer) && (
            <div className="pt-2 border-t border-[#F0E8DC] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onEditWish(gift);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#63544E] hover:text-[#300A12] transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Wish Details</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove "${gift.title}" from wishlist?`)) {
                    onDeleteWish(gift.id);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#8E253D] hover:text-[#5C1525] transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
