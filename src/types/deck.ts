
export interface Card {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  createdAt: Date;
  difficulty: number;
  lastReviewed: Date;
  nextReview: Date;
  reviewCount: number;
  hasBeenWrong: boolean;
  wasWrongInSession?: boolean;
}

export interface Deck {
  id: string;
  name: string;
  cards: Card[];
  isImported: boolean;
  createdAt: Date;
}

export interface DeckStats {
  nuevas: number;
  revisar: number;
  aprendidas: number;
  porAprender: number;
}
