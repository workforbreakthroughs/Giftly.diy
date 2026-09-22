import {
  GiftlySpace,
  GiftItem,
  Participant,
  CurrentUserSession,
  ReactionType,
  PreparedStatus,
  CelebrationNote,
  NoteCategory,
} from '../types';
import { INITIAL_SPACES } from '../mockData';

const STORAGE_KEY = 'giftly_diy_spaces_v6';
const SESSION_PREFIX = 'giftly_diy_session_';

// Alias old space id if user bookmarked previous link
const LEGACY_ID_MAP: Record<string, string> = {
  'christmas-wishlist-ig-2026-ungd': 'christmas-wishlist-class-06-2026',
};

class ApiService {
  private getLocalData(): GiftlySpace[] {
    try {
      if (typeof window === 'undefined') return INITIAL_SPACES;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SPACES));
        return INITIAL_SPACES;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return INITIAL_SPACES;
    } catch (e) {
      console.warn('Failed reading from localStorage:', e);
      return INITIAL_SPACES;
    }
  }

  private saveLocalData(data: GiftlySpace[]) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch (e) {
      console.warn('Failed saving to localStorage:', e);
    }
  }

  public getInitialSpacesSync(): GiftlySpace[] {
    return this.getLocalData();
  }

  public async getSpaces(): Promise<GiftlySpace[]> {
    // Also try fetch from server if running Express
    try {
      const res = await fetch('/api/spaces');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          this.saveLocalData(data);
          return data;
        }
      }
    } catch {
      // client-side fallback
    }
    return this.getLocalData();
  }

  public async getSpace(id: string): Promise<GiftlySpace | null> {
    const spaces = await this.getSpaces();
    const resolvedId = LEGACY_ID_MAP[id] || id;
    return spaces.find((s) => s.id === resolvedId) || null;
  }

  public async createSpace(payload: {
    title: string;
    tagline?: string;
    type: 'secret' | 'celebration';
    occasion: string;
    recipientName?: string;
    organizerName: string;
    organizerKeyword?: string;
    targetDate?: string;
  }): Promise<{ space: GiftlySpace; organizer: Participant }> {
    const spaces = await this.getSpaces();
    const spaceId = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 32) + '-' + Math.random().toString(36).substring(2, 6);
    const organizerId = 'p-' + Math.random().toString(36).substring(2, 9);
    const keyword = payload.organizerKeyword?.trim() || Math.random().toString(36).substring(2, 7);

    const organizer: Participant = {
      id: organizerId,
      name: payload.organizerName.trim(),
      keyword: keyword,
      avatarColor: 'bg-[#5C1525]',
      isOrganizer: true,
      joinedAt: new Date().toISOString(),
    };

    const newSpace: GiftlySpace = {
      id: spaceId,
      title: payload.title,
      tagline: payload.tagline,
      type: payload.type,
      occasion: payload.occasion,
      recipientName: payload.recipientName,
      organizerName: payload.organizerName,
      organizerKeyword: keyword,
      currency: '$',
      createdAt: new Date().toISOString(),
      targetDate: payload.targetDate,
      participants: [organizer],
      gifts: [],
    };

    const updated = [newSpace, ...spaces];
    this.saveLocalData(updated);

    try {
      await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSpace),
      });
    } catch {
      // server optional
    }

    return { space: newSpace, organizer };
  }

  public async joinOrVerifyParticipant(
    spaceId: string,
    name: string,
    keyword: string
  ): Promise<{ participant: Participant; isNew: boolean }> {
    const spaces = await this.getSpaces();
    const space = spaces.find((s) => s.id === spaceId);
    if (!space) throw new Error('Space not found');

    const cleanName = name.trim();
    const cleanKey = keyword.trim().toLowerCase();

    const existing = space.participants.find(
      (p) => p.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (existing) {
      if (existing.keyword.toLowerCase() !== cleanKey) {
        throw new Error(`Participant "${cleanName}" exists, but the keyword didn't match.`);
      }
      return { participant: existing, isNew: false };
    }

    const AVATAR_COLORS = [
      'bg-[#5C1525]',
      'bg-[#741D30]',
      'bg-[#3A5A40]',
      'bg-[#8F5D38]',
      'bg-[#2C5282]',
      'bg-[#5B21B6]',
    ];

    const newParticipant: Participant = {
      id: 'p-' + Math.random().toString(36).substring(2, 9),
      name: cleanName,
      keyword: cleanKey,
      avatarColor: AVATAR_COLORS[space.participants.length % AVATAR_COLORS.length],
      joinedAt: new Date().toISOString(),
    };

    space.participants.push(newParticipant);
    this.saveLocalData(spaces);

    try {
      await fetch(`/api/spaces/${spaceId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newParticipant),
      });
    } catch {
      // client fallback
    }

    return { participant: newParticipant, isNew: true };
  }

  public async addGift(
    spaceId: string,
    giftData: {
      title: string;
      description?: string;
      price?: number;
      url?: string;
      category?: string;
      addedBy: { id: string; name: string };
      forParticipantId?: string;
      isGroupGift?: boolean;
    }
  ): Promise<GiftItem> {
    const spaces = await this.getSpaces();
    const space = spaces.find((s) => s.id === spaceId);
    if (!space) throw new Error('Space not found');

    const newGift: GiftItem = {
      id: 'g-' + Math.random().toString(36).substring(2, 9),
      title: giftData.title.trim(),
      description: giftData.description?.trim(),
      price: giftData.price,
      url: giftData.url?.trim(),
      category: giftData.category || 'Other',
      addedBy: giftData.addedBy,
      forParticipantId: giftData.forParticipantId,
      createdAt: new Date().toISOString(),
      isGroupGift: Boolean(giftData.isGroupGift),
      status: 'open',
      reactions: [],
      contributions: [],
    };

    space.gifts.push(newGift);
    this.saveLocalData(spaces);

    try {
      await fetch(`/api/spaces/${spaceId}/gifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGift),
      });
    } catch {
      // fallback
    }

    return newGift;
  }

  public async updateGift(
    spaceId: string,
    giftId: string,
    updates: Partial<GiftItem>
  ): Promise<GiftItem> {
    const spaces = await this.getSpaces();
    const space = spaces.find((s) => s.id === spaceId);
    if (!space) throw new Error('Space not found');

    const gift = space.gifts.find((g) => g.id === giftId);
    if (!gift) throw new Error('Gift not found');

    Object.assign(gift, updates);
    this.saveLocalData(spaces);

    try {
      await fetch(`/api/spaces/${spaceId}/gifts/${giftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {
      // fallback
    }

    return gift;
  }

  public async deleteGift(spaceId: string, giftId: string): Promise<void> {
    const spaces = await this.getSpaces();
    const space = spaces.find((s) => s.id === spaceId);
    if (!space) throw new Error('Space not found');

    space.gifts = space.gifts.filter((g) => g.id !== giftId);
    this.saveLocalData(spaces);

    try {
      await fetch(`/api/spaces/${spaceId}/gifts/${giftId}`, {
        method: 'DELETE',
      });
    } catch {
      // fallback
    }
  }

  // Mark that a member has prepared for it already / will gift the person
  public async markPrepared(
    spaceId: string,
    giftId: string,
    payload: {
      participantId: string;
      participantName: string;
      isPrepared: boolean; // toggle
      note?: string;
    }
  ): Promise<GiftItem> {
    const spaces = await this.getSpaces();
    const space = spaces.find((s) => s.id === spaceId);
    if (!space) throw new Error('Space not found');

    const gift = space.gifts.find((g) => g.id === giftId);
    if (!gift) throw new Error('Gift not found');

    if (payload.isPrepared) {
      gift.status = 'prepared';
      gift.preparedBy = {
        participantId: payload.participantId,
        participantName: payload.participantName,
        preparedAt: new Date().toISOString(),
        note: payload.note,
      };
    } else {
      gift.preparedBy = null;
      gift.status = gift.contributions.length > 0 ? 'sharing' : 'open';
    }

    this.saveLocalData(spaces);

    try {
      await fetch(`/api/spaces/${spaceId}/gifts/${giftId}/prepared`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // fallback
    }

    return gift;
  }

  // Volunteer to share / chip in ("will gift the person but sharing only")
  public async addContribution(
    spaceId: string,
    giftId: string,
    data: {
      participantId: string;
      participantName: string;
      amount?: number;
      isAnonymous?: boolean;
      note?: string;
    }
  ): Promise<GiftItem> {
    const spaces = await this.getSpaces();
    const space = spaces.find((s) => s.id === spaceId);
    if (!space) throw new Error('Space not found');

    const gift = space.gifts.find((g) => g.id === giftId);
    if (!gift) throw new Error('Gift not found');

    // Remove existing from same participant if updating
    gift.contributions = gift.contributions.filter((c) => c.participantId !== data.participantId);

    gift.contributions.push({
      id: 'c-' + Math.random().toString(36).substring(2, 9),
      participantId: data.participantId,
      participantName: data.participantName,
      amount: data.amount,
      isAnonymous: data.isAnonymous,
      note: data.note,
      createdAt: new Date().toISOString(),
    });

    if (gift.status !== 'prepared') {
      gift.status = 'sharing';
    }

    this.saveLocalData(spaces);

    try {
      await fetch(`/api/spaces/${spaceId}/gifts/${giftId}/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {
      // fallback
    }

    return gift;
  }

  public async deleteContribution(
    spaceId: string,
    giftId: string,
    contributionId: string
  ): Promise<GiftItem> {
    const spaces = await this.getSpaces();
    const space = spaces.find((s) => s.id === spaceId);
    if (!space) throw new Error('Space not found');

    const gift = space.gifts.find((g) => g.id === giftId);
    if (!gift) throw new Error('Gift not found');

    gift.contributions = gift.contributions.filter((c) => c.id !== contributionId);
    if (gift.status === 'sharing' && gift.contributions.length === 0) {
      gift.status = 'open';
    }

    this.saveLocalData(spaces);
    return gift;
  }

  public async toggleReaction(
    spaceId: string,
    giftId: string,
    data: {
      type: ReactionType;
      participantId: string;
      participantName: string;
      isAnonymous?: boolean;
    }
  ): Promise<GiftItem> {
    const spaces = await this.getSpaces();
    const space = spaces.find((s) => s.id === spaceId);
    if (!space) throw new Error('Space not found');

    const gift = space.gifts.find((g) => g.id === giftId);
    if (!gift) throw new Error('Gift not found');

    const existingIdx = gift.reactions.findIndex(
      (r) => r.participantId === data.participantId && r.type === data.type
    );

    if (existingIdx >= 0) {
      gift.reactions.splice(existingIdx, 1);
    } else {
      gift.reactions.push({
        id: 'r-' + Math.random().toString(36).substring(2, 9),
        type: data.type,
        participantId: data.participantId,
        participantName: data.participantName,
        isAnonymous: data.isAnonymous,
        createdAt: new Date().toISOString(),
      });
    }

    this.saveLocalData(spaces);
    return gift;
  }

  // Notes management for single celebration spaces (e.g. Mom's 60th Birthday)
  public async addNote(
    spaceId: string,
    data: {
      category: NoteCategory;
      content: string;
      addedBy: { id: string; name: string };
      isImportant?: boolean;
    }
  ): Promise<CelebrationNote> {
    const spaces = await this.getSpaces();
    const space = spaces.find((s) => s.id === spaceId);
    if (!space) throw new Error('Space not found');

    if (!space.notes) space.notes = [];

    const newNote: CelebrationNote = {
      id: 'note-' + Math.random().toString(36).substring(2, 9),
      category: data.category,
      content: data.content.trim(),
      addedBy: data.addedBy,
      createdAt: new Date().toISOString(),
      isImportant: Boolean(data.isImportant),
    };

    space.notes.unshift(newNote);
    this.saveLocalData(spaces);

    try {
      await fetch(`/api/spaces/${spaceId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });
    } catch {
      // fallback
    }

    return newNote;
  }

  public async deleteNote(spaceId: string, noteId: string): Promise<void> {
    const spaces = await this.getSpaces();
    const space = spaces.find((s) => s.id === spaceId);
    if (!space) throw new Error('Space not found');

    if (space.notes) {
      space.notes = space.notes.filter((n) => n.id !== noteId);
    }
    this.saveLocalData(spaces);

    try {
      await fetch(`/api/spaces/${spaceId}/notes/${noteId}`, {
        method: 'DELETE',
      });
    } catch {
      // fallback
    }
  }

  public async toggleNoteImportant(spaceId: string, noteId: string): Promise<void> {
    const spaces = await this.getSpaces();
    const space = spaces.find((s) => s.id === spaceId);
    if (!space) throw new Error('Space not found');

    if (space.notes) {
      const note = space.notes.find((n) => n.id === noteId);
      if (note) {
        note.isImportant = !note.isImportant;
      }
    }
    this.saveLocalData(spaces);
  }

  // Session
  public getSession(spaceId: string): CurrentUserSession | null {
    try {
      if (typeof window === 'undefined') return null;
      const raw = localStorage.getItem(`${SESSION_PREFIX}${spaceId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public saveSession(spaceId: string, session: CurrentUserSession) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${SESSION_PREFIX}${spaceId}`, JSON.stringify(session));
      }
    } catch (e) {
      console.warn('Session save failed:', e);
    }
  }

  public clearSession(spaceId: string) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`${SESSION_PREFIX}${spaceId}`);
      }
    } catch {
      // ignore
    }
  }

  // Privacy-safe local history: tracks only spaces accessed on THIS device
  public getRecentSpaceIds(): string[] {
    try {
      if (typeof window === 'undefined') return [];
      const raw = localStorage.getItem('giftly_recent_space_ids');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public addRecentSpaceId(spaceId: string) {
    try {
      if (typeof window === 'undefined' || !spaceId) return;
      const recents = this.getRecentSpaceIds().filter((id) => id !== spaceId);
      recents.unshift(spaceId);
      localStorage.setItem('giftly_recent_space_ids', JSON.stringify(recents.slice(0, 10)));
    } catch (e) {
      console.warn('Failed to save recent space:', e);
    }
  }

  public async resetDemo(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SPACES));
      }
    } catch {
      // ignore
    }
  }
}

export const api = new ApiService();
