import React, { useState } from 'react';
import { GiftlyType } from '../types';
import { X, Sparkles, Users, Gift } from 'lucide-react';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: {
    title: string;
    tagline?: string;
    type: GiftlyType;
    occasion: string;
    recipientName?: string;
    organizerName: string;
    organizerKeyword?: string;
    targetDate?: string;
  }) => Promise<void>;
}

export const CreateSpaceModal: React.FC<CreateSpaceModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<GiftlyType>('secret');
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [occasion, setOccasion] = useState('Christmas / Secret Santa');
  const [recipientName, setRecipientName] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerKeyword, setOrganizerKeyword] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !organizerName.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        tagline: tagline.trim() || undefined,
        type,
        occasion,
        recipientName: type === 'celebration' ? recipientName.trim() : undefined,
        organizerName: organizerName.trim(),
        organizerKeyword: organizerKeyword.trim() || undefined,
        targetDate: targetDate || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="create-space-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#300A12]/50 backdrop-blur-xs">
      <div
        id="create-space-card"
        className="stationery-card relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#FDFCF9] border border-[#E2D6C5] shadow-[0_20px_50px_rgba(92,21,37,0.22)] animate-in zoom-in-95 duration-150"
      >
        <div className="h-1.5 w-full bg-linear-to-r from-[#5C1525] via-[#CBA469] to-[#5C1525]" />

        <div className="flex items-center justify-between border-b border-[#F0E8DC] px-6 py-4 bg-[#FAF7F2]">
          <div>
            <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#8E253D]">
              New Giftly Space
            </span>
            <h3 className="text-xl font-serif font-bold text-[#300A12]">
              Open a Gift-Planning Space
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[#9E8E81] hover:bg-[#EAE1D3] hover:text-[#300A12] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Format selection */}
          <div>
            <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#554743] mb-2">
              Giftly Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('secret')}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  type === 'secret'
                    ? 'border-[#5C1525] bg-[#FAF0F2] ring-1 ring-[#5C1525]'
                    : 'border-[#E2D6C5] bg-white hover:border-[#CBA469]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-[#8E253D]" />
                  <span className="text-xs font-serif font-bold text-[#300A12]">
                    Group Gift / Wishlist Tiles
                  </span>
                </div>
                <p className="text-[11px] text-[#7A6B63] font-sans">
                  Tiles for all group members with bulleted lists. Long-press to prepare or share!
                </p>
              </button>

              <button
                type="button"
                onClick={() => setType('celebration')}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  type === 'celebration'
                    ? 'border-[#5C1525] bg-[#FAF0F2] ring-1 ring-[#5C1525]'
                    : 'border-[#E2D6C5] bg-white hover:border-[#CBA469]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-4 h-4 text-[#8E253D]" />
                  <span className="text-xs font-serif font-bold text-[#300A12]">
                    Single Celebration
                  </span>
                </div>
                <p className="text-[11px] text-[#7A6B63] font-sans">
                  Milestone birthday, retirement, or baby shower for one honored person.
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#554743] mb-1">
              Event Title <span className="text-[#8E253D]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={type === 'secret' ? 'e.g. Design Team Holiday Exchange' : "e.g. Dad's 70th Birthday"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[#D6C8B5] bg-white px-3.5 py-2 text-xs text-[#300A12] focus:border-[#5C1525] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#554743] mb-1">
                Occasion
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full rounded-xl border border-[#D6C8B5] bg-white px-3 py-2 text-xs text-[#300A12] focus:border-[#5C1525] focus:outline-hidden"
              >
                <option value="Christmas / Secret Santa">Christmas / Secret Santa</option>
                <option value="Birthday">Birthday</option>
                <option value="Wedding / Shower">Wedding / Shower</option>
                <option value="Farewell / Graduation">Farewell / Graduation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#554743] mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-xl border border-[#D6C8B5] bg-white px-3 py-1.5 text-xs text-[#300A12] focus:border-[#5C1525] focus:outline-hidden"
              />
            </div>
          </div>

          {type === 'celebration' && (
            <div>
              <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#554743] mb-1">
                Honoree / Recipient Name
              </label>
              <input
                type="text"
                placeholder="e.g. Robert or Eleanor"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full rounded-xl border border-[#D6C8B5] bg-white px-3.5 py-2 text-xs text-[#300A12] focus:border-[#5C1525] focus:outline-hidden"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#F0E8DC]">
            <div>
              <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#554743] mb-1">
                Your Name (Organizer) <span className="text-[#8E253D]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="w-full rounded-xl border border-[#D6C8B5] bg-white px-3.5 py-2 text-xs text-[#300A12] focus:border-[#5C1525] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#554743] mb-1">
                Private Host Keyword
              </label>
              <input
                type="password"
                placeholder="e.g. pass123"
                value={organizerKeyword}
                onChange={(e) => setOrganizerKeyword(e.target.value)}
                className="w-full rounded-xl border border-[#D6C8B5] bg-white px-3.5 py-2 text-xs text-[#300A12] focus:border-[#5C1525] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0E8DC]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#E2D6C5] px-4 py-2 text-xs font-medium text-[#63544E] hover:bg-[#FAF7F2] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !organizerName.trim()}
              className="rounded-xl bg-[#5C1525] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#48111D] ring-1 ring-[#CBA469]/50 disabled:opacity-50 transition active:scale-98"
            >
              {isSubmitting ? 'Opening...' : 'Create Space'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
