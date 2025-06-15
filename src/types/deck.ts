
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
  // Campos SRS
  easeFactor?: number;
  srsInterval?: number;
  repetitions?: number;
  lastScore?: number;
  intervalModifier?: number;
  responseTime?: number;
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

export interface SRSStats {
  new: number;        // Nivel 0
  learning: number;   // Niveles 1-3, próxima revisión < 7 días
  young: number;      // Niveles 4-6, próxima revisión < 21 días  
  mature: number;     // Niveles 7-8, próxima revisión >= 21 días
  mastered: number;   // Niveles 9-10
  overdue: number;    // Vencidas
}
