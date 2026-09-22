import React, { useState } from 'react';
import { GiftlySpace, Participant, CurrentUserSession } from '../types';
import { X, KeyRound, User, UserPlus, CheckCircle2 } from 'lucide-react';

interface AccessModalProps {
  isOpen: boolean;
  space: GiftlySpace;
  currentUser: CurrentUserSession | null;
  onClose: () => void;
  onAuthenticate: (p: Participant) => void;
  onJoin: (name: string, keyword: string) => Promise<void>;
}

export const AccessModal: React.FC<AccessModalProps> = ({
  isOpen,
  space,
  currentUser,
  onClose,
  onAuthenticate,
  onJoin,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'switch' | 'join'>('switch');
  const [name, setName] = useState('');
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !keyword.trim()) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await onJoin(name.trim(), keyword.trim());
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="access-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#300A12]/50 backdrop-blur-xs">
      <div
        id="access-card"
        className="stationery-card relative w-full max-w-md overflow-hidden rounded-3xl bg-[#FDFCF9] border border-[#E2D6C5] shadow-[0_20px_50px_rgba(92,21,37,0.22)] animate-in zoom-in-95 duration-150"
      >
        <div className="h-1.5 w-full bg-linear-to-r from-[#5C1525] via-[#CBA469] to-[#5C1525]" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F0E8DC] px-6 py-4 bg-[#FAF7F2]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#5C1525] text-white">
              <KeyRound className="w-4 h-4 text-[#E5CA9E]" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#300A12]">
                Group Member Access
              </h3>
              <p className="text-[11px] text-[#7A6B63] font-sans">
                {space.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[#9E8E81] hover:bg-[#EAE1D3] hover:text-[#300A12] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex border-b border-[#F0E8DC] bg-[#FAF7F2] p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode('switch')}
            className={`flex-1 py-2 font-semibold rounded-xl transition ${
              mode === 'switch'
                ? 'bg-white text-[#5C1525] shadow-2xs border border-[#E2D6C5]'
                : 'text-[#7A6B63] hover:text-[#300A12]'
            }`}
          >
            Select Existing Member
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`flex-1 py-2 font-semibold rounded-xl transition ${
              mode === 'join'
                ? 'bg-white text-[#5C1525] shadow-2xs border border-[#E2D6C5]'
                : 'text-[#7A6B63] hover:text-[#300A12]'
            }`}
          >
            + Add / Join Member
          </button>
        </div>

        <div className="p-6">
          {mode === 'switch' ? (
            <div className="space-y-3">
              <p className="text-xs text-[#7A6B63] font-sans">
                Choose who you are participating as. Your identity lets you mark gifts as prepared, volunteer to share, and manage your wishlist tile:
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {space.participants.map((p) => {
                  const isCurrent = currentUser?.participantId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onAuthenticate(p);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                        isCurrent
                          ? 'border-[#5C1525] bg-[#FAF0F2]'
                          : 'border-[#E2D6C5] bg-white hover:border-[#CBA469] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl text-white font-serif font-bold text-sm ${
                            p.avatarColor || 'bg-[#5C1525]'
                          }`}
                        >
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-serif font-bold text-[#300A12]">
                              {p.name}
                            </span>
                            {p.isOrganizer && (
                              <span className="text-[10px] bg-[#FAF3E6] border border-[#ECD7AF] px-1.5 py-0.2 rounded-full font-semibold text-[#741D30]">
                                Host
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#7A6B63] font-sans">
                            Keyword pass: ••••••••
                          </span>
                        </div>
                      </div>

                      {isCurrent ? (
                        <CheckCircle2 className="w-4 h-4 text-[#8E253D]" />
                      ) : (
                        <span className="text-[11px] font-semibold text-[#741D30]">
                          Select →
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <p className="text-xs text-[#7A6B63] font-sans">
                Enter your name and a private secret keyword to create your wishlist tile and start coordinating with the group:
              </p>

              {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#554743] mb-1">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E8E81]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D6C8B5] bg-white text-xs text-[#300A12] focus:border-[#5C1525] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-serif font-bold uppercase tracking-wider text-[#554743] mb-1">
                  Secret Keyword / Passcode
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E8E81]" />
                  <input
                    type="password"
                    required
                    placeholder="e.g. holiday2026 or coffee99"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D6C8B5] bg-white text-xs text-[#300A12] focus:border-[#5C1525] focus:outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-[#9E8E81] mt-1 font-sans">
                  Use this to identify your tile on any device.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || !keyword.trim()}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#5C1525] py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#48111D] disabled:opacity-50 transition active:scale-98"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Joining...' : 'Create My Member Tile'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
