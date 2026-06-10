export type CardType = "qa" | "mcq" | "tf";
export type DifficultyLevel = "easy" | "medium" | "hard";

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  type: CardType;
  options?: string[]; // Used for Multiple Choice cards (MCQ)
  tag?: string;
  difficulty: DifficultyLevel;
  
  // Spaced Repetition (SuperMemo SM-2 parameters)
  interval: number; // in days
  repetition: number;
  easeFactor: number;
  nextReviewDate: string; // ISO string
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  category: string;
  cardsCount: number;
  masteredPercent: number; // 0 to 100
  cards: Card[];
  isCommunity?: boolean;
  author?: string;
  isOfficial?: boolean;
}

export interface Notice {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  badge?: string;
}

export interface TeacherPulse {
  activeToday: number;
  avgScore: number;
  completionRate: number;
  attentionNeeded: {
    name: string;
    avatar: string;
    reason: string;
    deckName: string;
    accuracy: number;
  }[];
}

export interface Scholar {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
}

export interface Community {
  id: string;
  name: string;
  tagline: string;
  members: number;
  noticeBoard: Notice[];
  officialDecks: Deck[];
  teacherPulse: TeacherPulse;
  topScholars: Scholar[];
}

export interface StudyActivity {
  day: string; // E.g. "Seg", "Ter"
  cardsCount: number;
}
