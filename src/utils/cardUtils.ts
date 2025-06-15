
import { Card, DeckStats } from "@/types/deck";

export const cardUtils = {
  getCardsForReview: (cards: Card[]) => {
    const now = new Date();
    return cards.filter(card => card.nextReview <= now).sort((a, b) => {
      if (a.difficulty !== b.difficulty) {
        return a.difficulty - b.difficulty;
      }
      return a.nextReview.getTime() - b.nextReview.getTime();
    });
  },

  calculateNextReview: (difficulty: number) => {
    const now = new Date();
    const nextReview = new Date(now);
    
    // Intervalos basados en los niveles 0-10 (en días)
    const intervals = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
    const intervalIndex = Math.floor(difficulty);
    const intervalDays = intervals[intervalIndex] || 89;
    
    nextReview.setDate(now.getDate() + intervalDays);
    return nextReview;
  },

  calculateNewDifficulty: (currentDifficulty: number, known: boolean, wasWrongInSession: boolean) => {
    if (known) {
      const increment = wasWrongInSession ? 0.5 : 1;
      return Math.min(10, currentDifficulty + increment);
    } else {
      return Math.max(0, currentDifficulty - 1);
    }
  },

  getDeckStats: (cards: Card[]): DeckStats => {
    const nuevas = cards.filter(card => card.reviewCount === 0).length;
    const revisar = cards.filter(card => card.hasBeenWrong && card.difficulty < 7).length;
    const aprendidas = cards.filter(card => card.difficulty >= 7).length;
    const porAprender = cards.length - aprendidas;

    return { nuevas, revisar, aprendidas, porAprender };
  },

  transformDbCardToCard: (dbCard: any): Card => ({
    id: dbCard.id,
    word: dbCard.word,
    reading: dbCard.reading,
    meaning: dbCard.meaning,
    createdAt: new Date(dbCard.created_at),
    difficulty: dbCard.difficulty,
    lastReviewed: new Date(dbCard.last_reviewed),
    nextReview: new Date(dbCard.next_review),
    reviewCount: dbCard.review_count,
    hasBeenWrong: dbCard.has_been_wrong,
    wasWrongInSession: dbCard.was_wrong_in_session
  })
};
