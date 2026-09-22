import React, { useState, useEffect } from 'react';
import { GiftItem, GiftlySpace, CurrentUserSession } from '../types';
import { X, Gift, Plus, Lock, ShieldAlert } from 'lucide-react';

interface AddWishModalProps {
  isOpen: boolean;
  space: GiftlySpace;
  initialForParticipantId?: string;
  initialGift?: GiftItem | null;
  currentUser: CurrentUserSession | null;
  onClose: () => void;
  onSubmit: (giftData: {
    title: string;
    description?: string;
    price?: number;
    url?: string;
    category?: string;
    forParticipantId?: string;
    isGroupGift?: boolean;
  }) => Promise<void>;
}

const CATEGORIES = [
  'Tech & Desk',
  'Kitchen & Home',
  'Books & Stationery',
  'Style & Accessories',
  'Experiences',
  'Garden & Outdoor',
  'Keepsake & Handmade',
  'Other',
];

export const AddWishModal: React.FC<AddWishModalProps> = ({
  isOpen,
  space,
  initialForParticipantId,
  initialGift,
  currentUser,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Tech & Desk');
  const [forParticipantId, setForParticipantId] = useState(
    initialForParticipantId || currentUser?.participantId || space.participants[0]?.id || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialGift) {
      setTitle(initialGift.title);
      setDescription(initialGift.description || '');
      setPrice(initialGift.price !== undefined ? initialGift.price.toString() : '');
      setUrl(initialGift.url || '');
      setCategory(initialGift.category || 'Tech & Desk');
      setForParticipantId(initialGift.forParticipantId || '');
    } else {
      setTitle('');
      setDescription('');
      setPrice('');
      setUrl('');
      setCategory('Tech & Desk');
      setForParticipantId(
        initialForParticipantId || currentUser?.participantId || space.participants[0]?.id || ''
      );
    }
  }, [initialGift, initialForParticipantId, currentUser, space]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const parsedPrice = price ? parseFloat(price) : undefined;
      const targetParticipantId = space.type === 'secret'
        ? (currentUser?.participantId || initialForParticipantId || space.participants[0]?.id)
        : undefined;

      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        price: parsedPrice && !isNaN(parsedPrice) ? parsedPrice : undefined,
        url: url.trim() || undefined,
        category,
        forParticipantId: targetParticipantId,
        isGroupGift: parsedPrice ? parsedPrice >= 100 : false,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetMember = space.participants.find((p) => p.id === forParticipantId);
  const isSelf = currentUser?.participantId === forParticipantId;

  return (
    <div id="add-wish-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#300A12]/50 backdrop-blur-xs">
      <div
        id="add-wish-card"
        className="stationery-card relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#FDFCF9] border border-[#E2D6C5] shadow-[0_20px_50px_rgba(92,21,37,0.22)] animate-in zoom-in-95 duration-150"
      >
        <div className="h-1.5 w-full bg-linear-to-r from-[#5C1525] via-[#CBA469] to-[#5C1525]" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F0E8DC] px-6 py-4 bg-[#FAF7F2]">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF0F2] border border-[#E8C5CD] px-2.5 py-0.5 text-[10px] font-bold text-[#8E253D] mb-1">
              <Gift className="w-3 h-3 text-[#8E253D]" />
              {initialGift ? 'Edit Wish' : 'Add to Wishlist Tile'}
            </span>
            <h3 className="text-xl font-serif font-bold text-[#300A12]">
              {initialGift
                ? 'Update Wish'
                : 'Add to My Wishlist'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[#9E8E81] hover:bg-[#EAE1D3] hover:text-[#300A12] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* In group gift exchange: locked to current user's wishlist tile */}
          {space.type === 'secret' && (
            <div>
              <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#554743] mb-1.5">
                Wishlist Destination:
              </label>
              <div className="flex items-center justify-between rounded-xl border border-[#D6C8B5] bg-[#FAF7F2] p-3 text-xs text-[#300A12]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#5C1525] font-serif font-bold text-white text-xs">
                    {(currentUser?.name || 'Y').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 truncate">
                    <span className="font-bold text-[#300A12] block truncate">
                      {currentUser?.name || 'Your'} Wishlist Tile
                    </span>
                    <span className="text-[10px] text-[#7A6B63]">
                      Only you can add and manage items on your list
                    </span>
                  </div>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#FAF0F2] border border-[#E8C5CD] px-2 py-0.5 text-[10px] font-bold text-[#8E253D]">
                  <Lock className="w-3 h-3" />
                  Your Tile Only
                </span>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#554743] mb-1.5">
              Item Name / Wish Title <span className="text-[#8E253D]">*</span>
            </label>
            <input
              id="wish-title-input"
              type="text"
              required
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[#D6C8B5] bg-white px-3.5 py-2.5 text-sm text-[#300A12] focus:border-[#5C1525] focus:outline-hidden"
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#554743] mb-1.5">
                Est. Price ({space.currency})
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-semibold text-[#9E8E81]">
                  {space.currency}
                </span>
                <input
                  id="wish-price-input"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 85"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#D6C8B5] bg-white text-sm text-[#300A12] focus:border-[#5C1525] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#554743] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-[#D6C8B5] bg-white px-3 py-2 text-xs text-[#300A12] focus:border-[#5C1525] focus:outline-hidden"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#554743] mb-1.5">
              Product Link (Optional)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-xl border border-[#D6C8B5] bg-white px-3.5 py-2 text-xs text-[#300A12] focus:border-[#5C1525] focus:outline-hidden"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#554743] mb-1.5">
              Specifics / Sizing / Color / Note (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Midnight black, size M, or preference details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-[#D6C8B5] bg-white px-3.5 py-2 text-xs text-[#300A12] focus:border-[#5C1525] focus:outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F0E8DC]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#E2D6C5] px-4 py-2 text-xs font-medium text-[#63544E] hover:bg-[#FAF7F2] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#5C1525] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#48111D] ring-1 ring-[#CBA469]/50 disabled:opacity-50 transition active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              {isSubmitting ? 'Saving...' : initialGift ? 'Update Wish' : 'Attach Wish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
