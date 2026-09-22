export type GiftlyType = 'secret' | 'celebration';

export type ReactionType = 'love' | 'excited' | 'idea' | 'check';

export interface Participant {
  id: string;
  name: string;
  keyword: string;
  avatarColor?: string;
  isOrganizer?: boolean;
  joinedAt?: string;
  tagline?: string;
}

export interface Contribution {
  id: string;
  participantId: string;
  participantName: string;
  amount?: number;
  isAnonymous?: boolean;
  note?: string;
  createdAt: string;
}

export interface Reaction {
  id: string;
  type: ReactionType;
  participantId: string;
  participantName: string;
  isAnonymous?: boolean;
  createdAt?: string;
}

export interface PreparedStatus {
  participantId: string;
  participantName: string;
  preparedAt: string;
  note?: string;
}

export interface GiftItem {
  id: string;
  title: string;
  description?: string;
  price?: number;
  url?: string;
  category?: string;
  addedBy: {
    id: string;
    name: string;
  };
  forParticipantId?: string; // Recipient member in group gift
  createdAt: string;
  isGroupGift?: boolean;
  status: 'open' | 'prepared' | 'sharing';
  preparedBy?: PreparedStatus | null; // He prepared for it already / will gift the person
  reactions: Reaction[];
  contributions: Contribution[]; // Will gift the person but sharing only / co-gift
}

export type NoteCategory = 'preference' | 'dislike' | 'allergy' | 'already_bought' | 'tip';

export interface CelebrationNote {
  id: string;
  category: NoteCategory;
  content: string;
  addedBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  isImportant?: boolean;
}

export interface GiftlySpace {
  id: string;
  title: string;
  tagline?: string;
  type: GiftlyType; // 'secret' = group gift with member tiles, 'celebration' = single person celebration
  occasion: string;
  recipientName?: string;
  organizerName: string;
  organizerKeyword?: string;
  currency: string;
  createdAt: string;
  targetDate?: string;
  participants: Participant[];
  gifts: GiftItem[];
  notes?: CelebrationNote[];
}

export interface CurrentUserSession {
  participantId: string;
  name: string;
  keyword: string;
  isOrganizer?: boolean;
}
