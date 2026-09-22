import React, { useState } from 'react';
import { NoteCategory, CurrentUserSession } from '../types';
import { X, AlertTriangle, Ban, Heart, ShoppingBag, Lightbulb, ShieldCheck, Sparkles } from 'lucide-react';

interface AddNoteModalProps {
  isOpen: boolean;
  celebrantName?: string;
  currentUser: CurrentUserSession | null;
  onClose: () => void;
  onSubmit: (noteData: {
    category: NoteCategory;
    content: string;
    authorName: string;
    isImportant?: boolean;
  }) => Promise<void>;
}

const CATEGORIES: {
  id: NoteCategory;
  label: string;
  icon: React.ElementType;
  color: string;
  bgActive: string;
  borderActive: string;
  example: string;
}[] = [
  {
    id: 'dislike',
    label: 'Dislike / Avoid',
    icon: Ban,
    color: 'text-[#8E253D]',
    bgActive: 'bg-[#FAF0F2]',
    borderActive: 'border-[#E8C5CD]',
    example: "e.g. Mom doesn't like black colors, no synthetic leather...",
  },
  {
    id: 'allergy',
    label: 'Allergy / Sensitivity',
    icon: AlertTriangle,
    color: 'text-[#B45309]',
    bgActive: 'bg-[#FEF3C7]',
    borderActive: 'border-[#FCD34D]',
    example: 'e.g. Allergic to synthetic lavender scent or strong perfumes...',
  },
  {
    id: 'already_bought',
    label: 'Already Claimed / Bought',
    icon: ShoppingBag,
    color: 'text-[#4338CA]',
    bgActive: 'bg-[#EEF2FF]',
    borderActive: 'border-[#C7D2FE]',
    example: 'e.g. Auntie Eleanor already bought her a scarf, so skip scarves...',
  },
  {
    id: 'preference',
    label: 'Favorite / Preference',
    icon: Heart,
    color: 'text-[#15803D]',
    bgActive: 'bg-[#F0FDF4]',
    borderActive: 'border-[#BBF7D0]',
    example: 'e.g. Shoe size is 7.5, loves warm earth tones and pottery...',
  },
  {
    id: 'tip',
    label: 'Helpful Tip / Sizing',
    icon: Lightbulb,
    color: 'text-[#7A6B63]',
    bgActive: 'bg-[#FAF7F2]',
    borderActive: 'border-[#D6C8B5]',
    example: 'e.g. Limited counter space in the kitchen, prefers compact items...',
  },
];

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  celebrantName = 'the celebrant',
  currentUser,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [category, setCategory] = useState<NoteCategory>('dislike');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState(currentUser?.name || '');
  const [isImportant, setIsImportant] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCat = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        category,
        content: content.trim(),
        authorName: authorName.trim() || currentUser?.name || 'Teammate',
        isImportant: category === 'allergy' || category === 'dislike' ? isImportant : false,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="add-note-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#300A12]/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="add-note-card"
        className="stationery-card relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#FDFCF9] border border-[#E2D6C5] shadow-[0_20px_50px_rgba(92,21,37,0.22)] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-linear-to-r from-[#5C1525] via-[#CBA469] to-[#5C1525]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#F0E8DC] px-6 py-4 bg-[#FAF7F2]">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF0F2] border border-[#E8C5CD] px-2.5 py-0.5 text-[10px] font-bold text-[#8E253D] mb-1">
              <Sparkles className="w-3 h-3 text-[#8E253D]" />
              Helpful Notes & Preferences
            </span>
            <h3 className="text-xl font-serif font-bold text-[#300A12]">
              Add Note for {celebrantName}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Category Chips */}
          <div>
            <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#554743] mb-2">
              Note Category:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      if (cat.id === 'allergy' || cat.id === 'dislike') {
                        setIsImportant(true);
                      }
                    }}
                    className={`flex items-center gap-2 rounded-xl p-2.5 text-xs text-left border transition ${
                      isSelected
                        ? `${cat.bgActive} ${cat.borderActive} font-bold shadow-2xs`
                        : 'bg-white border-[#E5D9C8] text-[#63544E] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${cat.color}`} />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Content */}
          <div>
            <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#554743] mb-1.5">
              The Note / Tip / Detail <span className="text-[#8E253D]">*</span>
            </label>
            <textarea
              id="note-content-input"
              required
              rows={3}
              placeholder={selectedCat.example}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-xl border border-[#D6C8B5] bg-white p-3 text-xs sm:text-sm text-[#300A12] focus:border-[#5C1525] focus:outline-hidden"
            />
            <p className="text-[11px] text-[#7A6B63] mt-1 font-sans">
              Share details so friends & family avoid duplicate or unsuitable gifts.
            </p>
          </div>

          {/* Important Warning Checkbox */}
          <div className="rounded-xl border border-[#ECD7AF] bg-[#FAF6EC] p-3 flex items-start gap-2.5">
            <input
              id="note-important-checkbox"
              type="checkbox"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
              className="mt-0.5 rounded border-[#CBA469] text-[#5C1525] focus:ring-[#5C1525]"
            />
            <label htmlFor="note-important-checkbox" className="text-xs text-[#554743] cursor-pointer">
              <strong className="text-[#300A12] font-semibold block">Highlight as Essential Warning</strong>
              Pointers like allergies, strong dislikes, or items already bought can be pinned with a priority highlight.
            </label>
          </div>

          {/* Author attribution */}
          <div>
            <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#554743] mb-1.5">
              Your Name (Author attribution)
            </label>
            <input
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Michael, Sarah, Aunt Claire"
              className="w-full rounded-xl border border-[#D6C8B5] bg-white px-3.5 py-2 text-xs text-[#300A12] focus:border-[#5C1525] focus:outline-hidden"
            />
          </div>

          {/* Organizer Notice */}
          <div className="rounded-xl border border-[#E2D6C5] bg-[#FAF7F2] p-2.5 flex items-center gap-2 text-[11px] text-[#7A6B63]">
            <ShieldCheck className="w-4 h-4 text-[#CBA469] shrink-0" />
            <span>
              The organizer can review, curate, and remove any notes deemed not suitable or inaccurate.
            </span>
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
              disabled={isSubmitting || !content.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#5C1525] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#48111D] ring-1 ring-[#CBA469]/50 disabled:opacity-50 transition active:scale-98"
            >
              {isSubmitting ? 'Saving Note...' : 'Add Note to Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
