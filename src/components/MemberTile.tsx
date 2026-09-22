import React, { useState, useRef } from 'react';
import { Participant, GiftItem, CurrentUserSession, ReactionType } from '../types';
import { Plus, Gift, Handshake, Heart, Sparkles, Lock, ExternalLink, MoreHorizontal, CheckCircle2 } from 'lucide-react';

interface MemberTileProps {
  participant: Participant;
  gifts: GiftItem[];
  currency: string;
  currentUser: CurrentUserSession | null;
  onOpenAddWish: (forParticipantId: string) => void;
  onSelectWish: (gift: GiftItem, memberName: string, isOwnWish: boolean) => void;
  onQuickTogglePrepared: (giftId: string, isPrepared: boolean) => void;
  onQuickReaction: (giftId: string, type: ReactionType) => void;
}

export const MemberTile: React.FC<MemberTileProps> = ({
  participant,
  gifts,
  currency,
  currentUser,
  onOpenAddWish,
  onSelectWish,
  onQuickTogglePrepared,
  onQuickReaction,
}) => {
  const isSelf = currentUser?.participantId === participant.id;

  // Track long press timer
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const startPress = (gift: GiftItem) => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      // Trigger long-press action
      onSelectWish(gift, participant.name, isSelf);
    }, 450); // 450ms for long press
  };

  const endPress = (gift: GiftItem, e: React.MouseEvent | React.TouchEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClickItem = (gift: GiftItem) => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    onSelectWish(gift, participant.name, isSelf);
  };

  // Stats
  const preparedCount = gifts.filter((g) => g.status === 'prepared').length;
  const sharingCount = gifts.filter((g) => g.contributions.length > 0).length;

  return (
    <div
      id={`member-tile-${participant.id}`}
      className="stationery-tile relative flex flex-col rounded-3xl overflow-hidden bg-white border border-[#E5D9C8] shadow-[0_4px_16px_rgba(72,17,29,0.06)]"
    >
      {/* Top ribbon accent: burgundy if current user, warm champagne/gold otherwise */}
      <div
        className={`h-1.5 w-full ${
          isSelf
            ? 'bg-linear-to-r from-[#5C1525] via-[#CBA469] to-[#5C1525]'
            : 'bg-linear-to-r from-[#8E253D] via-[#D8B478] to-[#8E253D]'
        }`}
      />

      {/* Member Header */}
      <div className="p-5 pb-4 border-b border-[#F0E8DC] bg-[#FAF7F2]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-base font-serif font-bold text-white shadow-xs ${
                participant.avatarColor || 'bg-[#5C1525]'
              }`}
            >
              {participant.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#300A12] truncate">
                  {participant.name}
                </h3>
                {isSelf && (
                  <span className="rounded-full bg-[#FAF0F2] border border-[#E8C5CD] px-2 py-0.2 text-[10px] font-bold text-[#8E253D] shrink-0">
                    You
                  </span>
                )}
                {participant.isOrganizer && (
                  <span className="rounded-full bg-[#FAF3E6] border border-[#ECD7AF] px-2 py-0.2 text-[10px] font-semibold text-[#741D30] shrink-0">
                    Host
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7A6B63] truncate font-sans">
                {participant.tagline || (isSelf ? 'Your personal wish list' : 'Teammate wish list')}
              </p>
            </div>
          </div>

          {/* "+ Add Wish" button ONLY on your own tile */}
          {isSelf && (
            <button
              type="button"
              onClick={() => onOpenAddWish(participant.id)}
              className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-white border border-[#D6C8B5] px-2.5 py-1.5 text-xs font-semibold text-[#5C1525] hover:bg-[#FAF0F2] hover:border-[#5C1525] shadow-2xs transition active:scale-95"
              title="Add to your wishlist"
            >
              <Plus className="w-3.5 h-3.5 text-[#5C1525]" />
              <span>Add Wish</span>
            </button>
          )}
        </div>

        {/* Member list quick tally */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-[#86756D] font-sans">
          <span>
            {gifts.length} {gifts.length === 1 ? 'wish' : 'wishes'} listed
          </span>
          {!isSelf && (
            <div className="flex items-center gap-2">
              {preparedCount > 0 && (
                <span className="text-[#3A5A40] font-semibold flex items-center gap-0.5">
                  <Gift className="w-3 h-3" /> {preparedCount} prepared
                </span>
              )}
              {sharingCount > 0 && (
                <span className="text-[#8E253D] font-semibold flex items-center gap-0.5">
                  <Handshake className="w-3 h-3" /> {sharingCount} sharing
                </span>
              )}
            </div>
          )}
          {isSelf && (
            <span className="text-[#7A6B63] italic">
              ✉️ Teammate preparations sealed
            </span>
          )}
        </div>
      </div>

      {/* The Wish List: Clean Bulleted / Numbered Basic List */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        {gifts.length > 0 ? (
          <ol className="space-y-2.5">
            {gifts.map((gift, idx) => {
              const isPreparedByMe = currentUser && gift.preparedBy?.participantId === currentUser.participantId;
              const hasSharedPledge = gift.contributions.length > 0;
              const totalShared = gift.contributions.reduce((acc, c) => acc + (c.amount || 0), 0);
              const reactionCount = gift.reactions.length;

              return (
                <li
                  key={gift.id}
                  id={`wish-item-${gift.id}`}
                  onMouseDown={() => startPress(gift)}
                  onMouseUp={(e) => endPress(gift, e)}
                  onMouseLeave={(e) => endPress(gift, e)}
                  onTouchStart={() => startPress(gift)}
                  onTouchEnd={(e) => endPress(gift, e)}
                  onClick={() => handleClickItem(gift)}
                  className={`group relative rounded-2xl border p-3 transition-all cursor-pointer select-none ${
                    gift.status === 'prepared' && !isSelf
                      ? 'border-[#C2D8C0] bg-[#F7FAF7] hover:border-[#3A5A40]'
                      : hasSharedPledge && !isSelf
                      ? 'border-[#EADCC7] bg-[#FAF8F3] hover:border-[#CBA469]'
                      : 'border-[#EBE2D5] bg-[#FFFFFF] hover:border-[#5C1525]/40 hover:bg-[#FAF7F2]'
                  }`}
                  title="Click or Long-press to mark prepared, volunteer to share, or react!"
                >
                  <div className="flex items-start gap-2.5">
                    {/* Number Badge (1., 2., 3.) */}
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FAF3E6] border border-[#ECD7AF] font-serif text-[11px] font-bold text-[#5C1525] mt-0.5">
                      {idx + 1}
                    </span>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-1">
                        <span className="text-xs sm:text-sm font-serif font-bold text-[#300A12] leading-snug group-hover:text-[#5C1525]">
                          {gift.title}
                        </span>
                        {gift.price !== undefined && (
                          <span className="text-xs font-serif font-semibold text-[#741D30] shrink-0">
                            {currency}{gift.price}
                          </span>
                        )}
                      </div>

                      {gift.description && (
                        <p className="mt-0.5 text-[11px] text-[#7A6B63] line-clamp-1 font-sans">
                          {gift.description}
                        </p>
                      )}

                      {/* Status row under item */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {/* If viewing own wishlist: show sealed mystery status if active */}
                        {isSelf ? (
                          (gift.status === 'prepared' || hasSharedPledge) ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF0F2] border border-[#E8C5CD] px-2 py-0.5 text-[10px] font-semibold text-[#8E253D]">
                              ✉️ Secret plan in motion
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#9E8E81] italic font-sans">
                              Tap to edit details
                            </span>
                          )
                        ) : (
                          /* Viewing teammate's wishlist */
                          <>
                            {/* Prepared status badge */}
                            {gift.status === 'prepared' && (
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-2xs ${
                                  isPreparedByMe
                                    ? 'bg-[#3A5A40] text-white'
                                    : 'bg-[#E3EEE2] text-[#244229] border border-[#C2D8C0]'
                                }`}
                              >
                                <Gift className="w-3 h-3" />
                                {isPreparedByMe
                                  ? 'Prepared by You'
                                  : `Prepared by ${gift.preparedBy?.participantName?.split(' ')[0] || 'Teammate'}`}
                              </span>
                            )}

                            {/* Sharing status badge */}
                            {hasSharedPledge && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF3E6] border border-[#ECD7AF] px-2 py-0.5 text-[10px] font-semibold text-[#741D30]">
                                <Handshake className="w-3 h-3 text-[#CBA469]" />
                                {gift.contributions.length} sharing ({currency}{totalShared})
                              </span>
                            )}

                            {/* Open indicator if nothing yet */}
                            {gift.status === 'open' && !hasSharedPledge && (
                              <span className="text-[10px] text-[#9E8E81] font-sans">
                                Available to gift
                              </span>
                            )}

                            {/* Reactions count */}
                            {reactionCount > 0 && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-[#FAF7F2] border border-[#E2D6C5] px-1.5 py-0.5 text-[10px] font-medium text-[#63544E]">
                                ❤️ {reactionCount}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Click / Long-press trigger hint indicator */}
                    <div className="shrink-0 text-[#CBA469] opacity-70 group-hover:opacity-100 group-hover:scale-110 transition mt-0.5">
                      <MoreHorizontal className="w-4 h-4" />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="py-8 text-center border border-dashed border-[#E2D6C5] rounded-2xl bg-[#FAF7F2]/60 p-4">
            <Gift className="w-6 h-6 text-[#CBA469] mx-auto mb-1.5 opacity-80" />
            <p className="text-xs font-serif font-bold text-[#300A12]">Wishlist is empty</p>
            <p className="text-[11px] text-[#7A6B63] mt-0.5 font-sans">
              {isSelf
                ? 'Add items you would love to receive!'
                : `Waiting for ${participant.name.split(' ')[0]} to add their holiday wishes.`}
            </p>
            {isSelf && (
              <button
                type="button"
                onClick={() => onOpenAddWish(participant.id)}
                className="mt-2.5 inline-flex items-center gap-1 rounded-lg bg-[#5C1525] px-3 py-1 text-[11px] font-semibold text-white shadow-2xs hover:bg-[#48111D] transition"
              >
                <Plus className="w-3 h-3" />
                <span>Add My First Wish</span>
              </button>
            )}
          </div>
        )}

        {/* Bottom subtle hint */}
        <div className="mt-3 pt-2 border-t border-[#F0E8DC]/80 flex items-center justify-between text-[10px] text-[#9E8E81] font-sans">
          <span>💡 Long-press or click any wish to react</span>
          {isSelf && (
            <button
              type="button"
              onClick={() => onOpenAddWish(participant.id)}
              className="text-[#741D30] font-semibold hover:underline"
            >
              + Add to list
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
