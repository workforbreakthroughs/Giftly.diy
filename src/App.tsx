import React, { useState, useEffect, useCallback } from 'react';
import { GiftlySpace, GiftItem, CurrentUserSession, Participant, ReactionType, GiftlyType, NoteCategory } from './types';
import { api } from './lib/api';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { GroupGiftTilesView } from './components/GroupGiftTilesView';
import { CelebrationView } from './components/CelebrationView';
import { AddWishModal } from './components/AddWishModal';
import { AccessModal } from './components/AccessModal';
import { CreateSpaceModal } from './components/CreateSpaceModal';
import { CheckCircle2, X, Gift, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function App() {
  const [spaces, setSpaces] = useState<GiftlySpace[]>(() => api.getInitialSpacesSync());

  // Privacy-first: only load a space if the URL has ?giftly=<id>
  const [currentSpaceId, setCurrentSpaceId] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined' && window.location?.search) {
        const params = new URLSearchParams(window.location.search);
        const req = params.get('giftly');
        if (req) {
          return req === 'christmas-wishlist-ig-2026-ungd' ? 'christmas-wishlist-class-06-2026' : req;
        }
      }
      return '';
    } catch {
      return '';
    }
  });

  const [currentUser, setCurrentUser] = useState<CurrentUserSession | null>(null);

  // Modals state
  const [isAddWishOpen, setIsAddWishOpen] = useState(false);
  const [addWishParticipantId, setAddWishParticipantId] = useState<string | undefined>(undefined);
  const [wishToEdit, setWishToEdit] = useState<GiftItem | null>(null);

  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3200);
  };

  const loadSpaces = useCallback(async () => {
    try {
      const data = await api.getSpaces();
      if (data && data.length > 0) {
        setSpaces(data);
      }
    } catch (err) {
      console.warn('Sync notice:', err);
    }
  }, []);

  useEffect(() => {
    loadSpaces();
  }, [loadSpaces]);

  // Sync URL when currentSpaceId changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    if (currentSpaceId) {
      api.addRecentSpaceId(currentSpaceId);
      url.searchParams.set('giftly', currentSpaceId);
      window.history.replaceState({}, '', url.toString());
    } else {
      url.searchParams.delete('giftly');
      window.history.replaceState({}, '', url.toString());
    }

    // Scroll to the top when entering or leaving a space
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentSpaceId]);

  // Listen to browser popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const req = params.get('giftly') || '';
      setCurrentSpaceId(req === 'christmas-wishlist-ig-2026-ungd' ? 'christmas-wishlist-class-06-2026' : req);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync user session when switching space
  useEffect(() => {
    if (!currentSpaceId) {
      setCurrentUser(null);
      return;
    }

    try {
      const saved = api.getSession(currentSpaceId);
      if (saved) {
        setCurrentUser(saved);
      } else {
        const space = spaces.find((s) => s.id === currentSpaceId);
        if (space && space.participants.length > 0) {
          const firstParticipant = space.participants[0];
          const session: CurrentUserSession = {
            participantId: firstParticipant.id,
            name: firstParticipant.name,
            keyword: firstParticipant.keyword,
            isOrganizer: firstParticipant.isOrganizer,
          };
          api.saveSession(currentSpaceId, session);
          setCurrentUser(session);
        } else {
          setCurrentUser(null);
        }
      }
    } catch (e) {
      console.warn('Session setup error:', e);
    }
  }, [currentSpaceId, spaces]);

  const currentSpace = currentSpaceId ? spaces.find((s) => s.id === currentSpaceId) || null : null;
  const isInvalidSpace = Boolean(currentSpaceId && !currentSpace);

  // Actions
  const handleSelectSpace = (id: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setCurrentSpaceId(id);
    const space = spaces.find((s) => s.id === id);
    if (space) {
      showToast(`Entering private space: "${space.title}"`);
    }
  };

  const handleGoHome = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setCurrentSpaceId('');
  };

  const handleAuthenticateParticipant = (p: Participant) => {
    if (!currentSpaceId) return;
    const session: CurrentUserSession = {
      participantId: p.id,
      name: p.name,
      keyword: p.keyword,
      isOrganizer: p.isOrganizer,
    };
    api.saveSession(currentSpaceId, session);
    setCurrentUser(session);
    showToast(`Signed in as ${p.name}`);
  };

  const handleJoinParticipant = async (name: string, keyword: string) => {
    if (!currentSpaceId) return;
    const res = await api.joinOrVerifyParticipant(currentSpaceId, name, keyword);
    handleAuthenticateParticipant(res.participant);
    const refreshed = await api.getSpaces();
    setSpaces(refreshed);
    showToast(`Created wishlist tile for ${name}!`);
  };

  const handleLogout = () => {
    if (currentSpaceId) {
      api.clearSession(currentSpaceId);
    }
    setCurrentUser(null);
    showToast('Signed out of participant tile.');
  };

  const handleQuickSwitchUser = (p: Participant) => {
    handleAuthenticateParticipant(p);
  };

  // Wish actions
  const handleOpenAddWish = (forParticipantId?: string) => {
    if (currentSpace?.type === 'secret' && !currentUser) {
      setIsAccessModalOpen(true);
      return;
    }
    setWishToEdit(null);
    setAddWishParticipantId(currentSpace?.type === 'secret' ? currentUser?.participantId : forParticipantId);
    setIsAddWishOpen(true);
  };

  const handleOpenEditWish = (gift: GiftItem) => {
    setWishToEdit(gift);
    setAddWishParticipantId(gift.forParticipantId);
    setIsAddWishOpen(true);
  };

  const handleSubmitWish = async (wishData: {
    title: string;
    description?: string;
    price?: number;
    url?: string;
    category?: string;
    forParticipantId?: string;
    isGroupGift?: boolean;
  }) => {
    if (!currentSpaceId) return;

    const targetForParticipantId = currentSpace?.type === 'secret'
      ? (currentUser?.participantId || wishData.forParticipantId)
      : wishData.forParticipantId;

    if (wishToEdit) {
      await api.updateGift(currentSpaceId, wishToEdit.id, {
        ...wishData,
        forParticipantId: targetForParticipantId,
      });
      showToast(`Updated "${wishData.title}"`);
    } else {
      await api.addGift(currentSpaceId, {
        ...wishData,
        forParticipantId: targetForParticipantId,
        addedBy: currentUser
          ? { id: currentUser.participantId, name: currentUser.name }
          : { id: 'anon', name: 'Teammate' },
      });
      showToast(`Added "${wishData.title}" to wishlist!`);
    }

    const refreshed = await api.getSpaces();
    setSpaces(refreshed);
  };

  const handleDeleteWish = async (giftId: string) => {
    if (!currentSpaceId) return;
    await api.deleteGift(currentSpaceId, giftId);
    const refreshed = await api.getSpaces();
    setSpaces(refreshed);
    showToast('Wish removed.');
  };

  // Mark prepared: "prepared for it already / will gift the person"
  const handleMarkPrepared = async (giftId: string, isPrepared: boolean, note?: string) => {
    if (!currentSpaceId || !currentUser) {
      setIsAccessModalOpen(true);
      return;
    }

    await api.markPrepared(currentSpaceId, giftId, {
      participantId: currentUser.participantId,
      participantName: currentUser.name,
      isPrepared,
      note,
    });

    const refreshed = await api.getSpaces();
    setSpaces(refreshed);
    showToast(isPrepared ? '🎁 Marked as prepared! Teammates can see it is covered.' : 'Preparation claim cancelled.');
  };

  // "will gift the person but sharing only"
  const handleAddSharingPledge = async (giftId: string, amount?: number, note?: string) => {
    if (!currentSpaceId || !currentUser) {
      setIsAccessModalOpen(true);
      return;
    }

    await api.addContribution(currentSpaceId, giftId, {
      participantId: currentUser.participantId,
      participantName: currentUser.name,
      amount,
      note,
    });

    const refreshed = await api.getSpaces();
    setSpaces(refreshed);
    showToast(amount ? `🤝 Shared ${currentSpace?.currency || '$'}${amount} pledge recorded!` : 'Sharing pledge recorded!');
  };

  const handleRemoveSharingPledge = async (giftId: string, contribId: string) => {
    if (!currentSpaceId) return;
    await api.deleteContribution(currentSpaceId, giftId, contribId);
    const refreshed = await api.getSpaces();
    setSpaces(refreshed);
    showToast('Sharing pledge removed.');
  };

  const handleToggleReaction = async (giftId: string, type: ReactionType) => {
    if (!currentSpaceId || !currentUser) {
      setIsAccessModalOpen(true);
      return;
    }

    await api.toggleReaction(currentSpaceId, giftId, {
      type,
      participantId: currentUser.participantId,
      participantName: currentUser.name,
    });

    const refreshed = await api.getSpaces();
    setSpaces(refreshed);
  };

  // Celebration Notes (Dislikes, Allergies, Preferences, Sizing)
  const handleAddNote = async (noteData: {
    category: NoteCategory;
    content: string;
    authorName: string;
    isImportant?: boolean;
  }) => {
    if (!currentSpaceId) return;
    await api.addNote(currentSpaceId, {
      category: noteData.category,
      content: noteData.content,
      addedBy: currentUser
        ? { id: currentUser.participantId, name: noteData.authorName || currentUser.name }
        : { id: 'p-' + Math.random().toString(36).substring(2, 7), name: noteData.authorName || 'Teammate' },
      isImportant: noteData.isImportant,
    });
    const refreshed = await api.getSpaces();
    setSpaces(refreshed);
    showToast('Preference note added to board!');
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!currentSpaceId) return;
    await api.deleteNote(currentSpaceId, noteId);
    const refreshed = await api.getSpaces();
    setSpaces(refreshed);
    showToast('Note removed.');
  };

  const handleToggleNoteImportant = async (noteId: string) => {
    if (!currentSpaceId) return;
    await api.toggleNoteImportant(currentSpaceId, noteId);
    const refreshed = await api.getSpaces();
    setSpaces(refreshed);
  };

  const handleCreateSpace = async (payload: {
    title: string;
    tagline?: string;
    type: GiftlyType;
    occasion: string;
    recipientName?: string;
    organizerName: string;
    organizerKeyword?: string;
    targetDate?: string;
  }) => {
    const result = await api.createSpace(payload);
    const refreshed = await api.getSpaces();
    setSpaces(refreshed);
    setCurrentSpaceId(result.space.id);
    handleAuthenticateParticipant(result.organizer);
    showToast(`Created private space "${result.space.title}"!`);
  };

  const handleResetDemo = async () => {
    await api.resetDemo();
    await loadSpaces();
    showToast('Demo spaces reset.');
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#300A12] font-sans flex flex-col selection:bg-[#FAF0F2] selection:text-[#5C1525]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl bg-[#5C1525] border border-[#CBA469]/50 px-4 py-3 text-xs font-semibold text-[#FAF7F2] shadow-[0_8px_24px_rgba(92,21,37,0.35)] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#E5CA9E] shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-[#E5CA9E] hover:text-[#FAF7F2] transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentSpace={currentSpace}
        currentUser={currentUser}
        onGoHome={handleGoHome}
        onOpenCreateModal={() => setIsCreateSpaceOpen(true)}
        onOpenAccessModal={() => setIsAccessModalOpen(true)}
        onLogout={handleLogout}
        onQuickSwitchUser={handleQuickSwitchUser}
        showToast={showToast}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {isInvalidSpace ? (
          /* Invalid or Private Link Error */
          <div className="py-16 text-center stationery-card rounded-3xl p-10 max-w-lg mx-auto border border-[#E2D6C5]">
            <div className="wax-seal mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-sm mb-4">
              <ShieldAlert className="w-7 h-7 text-[#FAF7F2]" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#300A12]">
              Private Space Not Found
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#7A6B63] font-sans">
              This space does not exist or the link may have expired. Because Giftly spaces are private, you must have the exact link from the organizer to view it.
            </p>
            <button
              onClick={handleGoHome}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#5C1525] px-5 py-2.5 text-xs font-semibold text-[#FAF7F2] shadow-sm hover:bg-[#48111D] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Giftly.diy Home</span>
            </button>
          </div>
        ) : currentSpace ? (
          /* Active Space View */
          currentSpace.type === 'secret' ? (
            /* GROUP GIFT: TILES ARE THE PERSONS/MEMBERS OF THE GROUP */
            <GroupGiftTilesView
              space={currentSpace}
              currentUser={currentUser}
              onOpenAddWish={handleOpenAddWish}
              onOpenAddMember={() => setIsAccessModalOpen(true)}
              onMarkPrepared={handleMarkPrepared}
              onAddSharingPledge={handleAddSharingPledge}
              onRemoveSharingPledge={handleRemoveSharingPledge}
              onToggleReaction={handleToggleReaction}
              onEditWish={handleOpenEditWish}
              onDeleteWish={handleDeleteWish}
              onRequireAuth={() => setIsAccessModalOpen(true)}
              onQuickSwitchUser={handleQuickSwitchUser}
            />
          ) : (
            /* Single Celebration View */
            <CelebrationView
              space={currentSpace}
              currentUser={currentUser}
              onOpenAddWish={() => handleOpenAddWish(undefined)}
              onMarkPrepared={handleMarkPrepared}
              onAddSharingPledge={handleAddSharingPledge}
              onRemoveSharingPledge={handleRemoveSharingPledge}
              onToggleReaction={handleToggleReaction}
              onEditWish={handleOpenEditWish}
              onDeleteWish={handleDeleteWish}
              onRequireAuth={() => setIsAccessModalOpen(true)}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              onToggleNoteImportant={handleToggleNoteImportant}
              onQuickSwitchUser={handleQuickSwitchUser}
            />
          )
        ) : (
          /* WELCOME SCREEN: Shown to passersby on www.giftly.diy */
          <WelcomeScreen
            spaces={spaces}
            recentSpaceIds={api.getRecentSpaceIds()}
            onSelectSpace={handleSelectSpace}
            onOpenCreateModal={() => setIsCreateSpaceOpen(true)}
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E8DECd] bg-[#FAF7F2] py-6 text-center text-xs text-[#7A6B63]">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGoHome}
              className="font-serif font-bold text-[#300A12] text-sm hover:text-[#5C1525] transition"
            >
              Giftly.diy
            </button>
            <span className="text-[#CBA469]">•</span>
            <span className="font-serif italic text-[#741D30]">Private Collaborative Gift Spaces</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#86756D]">
            <span>Privacy First</span>
            <span>•</span>
            <span>Shared Link Only</span>
            <span>•</span>
            <button
              onClick={handleResetDemo}
              className="hover:text-[#300A12] underline inline-flex items-center gap-1 cursor-pointer"
            >
              Reset Demo
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {currentSpace && (
        <>
          <AddWishModal
            isOpen={isAddWishOpen}
            space={currentSpace}
            initialForParticipantId={addWishParticipantId}
            initialGift={wishToEdit}
            currentUser={currentUser}
            onClose={() => {
              setIsAddWishOpen(false);
              setWishToEdit(null);
            }}
            onSubmit={handleSubmitWish}
          />

          <AccessModal
            isOpen={isAccessModalOpen}
            space={currentSpace}
            currentUser={currentUser}
            onClose={() => setIsAccessModalOpen(false)}
            onAuthenticate={handleAuthenticateParticipant}
            onJoin={handleJoinParticipant}
          />
        </>
      )}

      <CreateSpaceModal
        isOpen={isCreateSpaceOpen}
        onClose={() => setIsCreateSpaceOpen(false)}
        onCreate={handleCreateSpace}
      />
    </div>
  );
}
