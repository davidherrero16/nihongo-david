
import { useState, useEffect } from "react";

export interface Card {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  createdAt: Date;
  difficulty: number; // 0-5, donde 0 es muy difícil y 5 es muy fácil
  lastReviewed: Date;
  nextReview: Date;
  reviewCount: number;
}

export const useCards = () => {
  const [cards, setCards] = useState<Card[]>([]);

  // Cargar tarjetas del localStorage al iniciar
  useEffect(() => {
    const savedCards = localStorage.getItem('japanese-cards');
    if (savedCards) {
      try {
        const parsedCards = JSON.parse(savedCards).map((card: any) => ({
          ...card,
          createdAt: new Date(card.createdAt),
          lastReviewed: new Date(card.lastReviewed),
          nextReview: new Date(card.nextReview)
        }));
        setCards(parsedCards);
      } catch (error) {
        console.error('Error al cargar las tarjetas:', error);
      }
    }
  }, []);

  // Guardar tarjetas en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('japanese-cards', JSON.stringify(cards));
  }, [cards]);

  const addCard = (word: string, reading: string, meaning: string) => {
    const now = new Date();
    const newCard: Card = {
      id: Date.now().toString(),
      word,
      reading,
      meaning,
      createdAt: now,
      difficulty: 0,
      lastReviewed: now,
      nextReview: now,
      reviewCount: 0
    };
    setCards(prev => [...prev, newCard]);
  };

  const deleteCard = (id: string) => {
    setCards(prev => prev.filter(card => card.id !== id));
  };

  const updateCardDifficulty = (id: string, known: boolean) => {
    setCards(prev => prev.map(card => {
      if (card.id === id) {
        const newDifficulty = known 
          ? Math.min(5, card.difficulty + 1)
          : Math.max(0, card.difficulty - 1);
        
        const now = new Date();
        const nextReview = new Date(now);
        
        // Algoritmo de repetición espaciada simplificado
        const intervals = [1, 2, 4, 8, 16, 32]; // días
        const intervalDays = intervals[newDifficulty] || 32;
        nextReview.setDate(now.getDate() + intervalDays);

        return {
          ...card,
          difficulty: newDifficulty,
          lastReviewed: now,
          nextReview,
          reviewCount: card.reviewCount + 1
        };
      }
      return card;
    }));
  };

  const getCardsForReview = () => {
    const now = new Date();
    return cards.filter(card => card.nextReview <= now).sort((a, b) => {
      // Priorizar tarjetas más difíciles
      if (a.difficulty !== b.difficulty) {
        return a.difficulty - b.difficulty;
      }
      return a.nextReview.getTime() - b.nextReview.getTime();
    });
  };

  return {
    cards,
    addCard,
    deleteCard,
    updateCardDifficulty,
    getCardsForReview
  };
};
