import { useState, useEffect } from "react";

export interface Card {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  createdAt: Date;
  difficulty: number; // 0-10, donde 0 es muy difícil y 10 es muy fácil
  lastReviewed: Date;
  nextReview: Date;
  reviewCount: number;
  hasBeenWrong: boolean; // Nueva propiedad para saber si alguna vez fue incorrecta
}

export interface Deck {
  id: string;
  name: string;
  cards: Card[];
  isImported: boolean;
  createdAt: Date;
}

export const useDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([]);

  // Cargar decks del localStorage al iniciar
  useEffect(() => {
    const savedDecks = localStorage.getItem('japanese-decks');
    if (savedDecks) {
      try {
        const parsedDecks = JSON.parse(savedDecks).map((deck: any) => ({
          ...deck,
          createdAt: new Date(deck.createdAt),
          cards: deck.cards.map((card: any) => ({
            ...card,
            createdAt: new Date(card.createdAt),
            lastReviewed: new Date(card.lastReviewed),
            nextReview: new Date(card.nextReview),
            hasBeenWrong: card.hasBeenWrong || false // Migrar tarjetas existentes
          }))
        }));
        setDecks(parsedDecks);
      } catch (error) {
        console.error('Error al cargar los decks:', error);
        // Migrar desde el formato antiguo si existe
        const oldCards = localStorage.getItem('japanese-cards');
        if (oldCards) {
          try {
            const parsedCards = JSON.parse(oldCards).map((card: any) => ({
              ...card,
              createdAt: new Date(card.createdAt),
              lastReviewed: new Date(card.lastReviewed),
              nextReview: new Date(card.nextReview),
              hasBeenWrong: false
            }));
            const defaultDeck: Deck = {
              id: 'default',
              name: 'Mis Tarjetas',
              cards: parsedCards,
              isImported: false,
              createdAt: new Date()
            };
            setDecks([defaultDeck]);
          } catch (migrationError) {
            console.error('Error en migración:', migrationError);
          }
        }
      }
    } else {
      // Crear deck por defecto
      const defaultDeck: Deck = {
        id: 'default',
        name: 'Mis Tarjetas',
        cards: [],
        isImported: false,
        createdAt: new Date()
      };
      setDecks([defaultDeck]);
    }
  }, []);

  // Guardar decks en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('japanese-decks', JSON.stringify(decks));
  }, [decks]);

  const addCard = (word: string, reading: string, meaning: string, deckId: string = 'default') => {
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
      reviewCount: 0,
      hasBeenWrong: false
    };
    
    setDecks(prev => prev.map(deck => 
      deck.id === deckId 
        ? { ...deck, cards: [...deck.cards, newCard] }
        : deck
    ));
  };

  const createDeck = (name: string) => {
    const newDeck: Deck = {
      id: Date.now().toString(),
      name,
      cards: [],
      isImported: false,
      createdAt: new Date()
    };
    setDecks(prev => [...prev, newDeck]);
    return newDeck.id;
  };

  const deleteCard = (cardId: string, deckId: string) => {
    setDecks(prev => prev.map(deck => 
      deck.id === deckId 
        ? { ...deck, cards: deck.cards.filter(card => card.id !== cardId) }
        : deck
    ));
  };

  const updateCardDifficulty = (cardId: string, known: boolean, deckId: string) => {
    setDecks(prev => prev.map(deck => {
      if (deck.id === deckId) {
        return {
          ...deck,
          cards: deck.cards.map(card => {
            if (card.id === cardId) {
              const newDifficulty = known 
                ? Math.min(10, card.difficulty + 1) // Ahora el máximo es 10
                : Math.max(0, card.difficulty - 1);
              
              const now = new Date();
              const nextReview = new Date(now);
              // Nuevos intervalos para niveles 0-10
              const intervals = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]; // días (Fibonacci)
              const intervalDays = intervals[newDifficulty] || 89;
              nextReview.setDate(now.getDate() + intervalDays);

              return {
                ...card,
                difficulty: newDifficulty,
                lastReviewed: now,
                nextReview,
                reviewCount: card.reviewCount + 1,
                hasBeenWrong: card.hasBeenWrong || !known // Marcar si alguna vez fue incorrecta
              };
            }
            return card;
          })
        };
      }
      return deck;
    }));
  };

  const resetProgress = (deckId: string) => {
    const now = new Date();
    setDecks(prev => prev.map(deck => 
      deck.id === deckId 
        ? {
            ...deck,
            cards: deck.cards.map(card => ({
              ...card,
              difficulty: 0,
              lastReviewed: now,
              nextReview: now,
              reviewCount: 0,
              hasBeenWrong: false
            }))
          }
        : deck
    ));
  };

  const importDeck = (name: string, cards: Omit<Card, 'id' | 'createdAt' | 'difficulty' | 'lastReviewed' | 'nextReview' | 'reviewCount' | 'hasBeenWrong'>[]) => {
    const now = new Date();
    const newDeck: Deck = {
      id: Date.now().toString(),
      name,
      isImported: true,
      createdAt: now,
      cards: cards.map((card, index) => ({
        ...card,
        id: `${Date.now()}-${index}`,
        createdAt: now,
        difficulty: 0,
        lastReviewed: now,
        nextReview: now,
        reviewCount: 0,
        hasBeenWrong: false
      }))
    };
    setDecks(prev => [...prev, newDeck]);
    return newDeck.id;
  };

  const deleteDeck = (deckId: string) => {
    if (deckId === 'default') return; // No permitir eliminar el deck por defecto
    setDecks(prev => prev.filter(deck => deck.id !== deckId));
  };

  const getCardsForReview = (deckId?: string) => {
    const now = new Date();
    const allCards = deckId 
      ? decks.find(deck => deck.id === deckId)?.cards || []
      : decks.flatMap(deck => deck.cards);
    
    return allCards.filter(card => card.nextReview <= now).sort((a, b) => {
      if (a.difficulty !== b.difficulty) {
        return a.difficulty - b.difficulty;
      }
      return a.nextReview.getTime() - b.nextReview.getTime();
    });
  };

  // Nueva función para obtener estadísticas del deck
  const getDeckStats = (deckId: string) => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return { nuevas: 0, revisar: 0, aprendidas: 0, porAprender: 0 };

    const nuevas = deck.cards.filter(card => card.reviewCount === 0).length;
    const revisar = deck.cards.filter(card => card.hasBeenWrong && card.difficulty < 5).length;
    const aprendidas = deck.cards.filter(card => card.difficulty >= 5).length;
    const porAprender = deck.cards.length - aprendidas;

    return { nuevas, revisar, aprendidas, porAprender };
  };

  const getAllCards = () => decks.flatMap(deck => deck.cards);

  return {
    decks,
    addCard,
    createDeck,
    deleteCard,
    updateCardDifficulty,
    getCardsForReview,
    resetProgress,
    importDeck,
    deleteDeck,
    getAllCards,
    getDeckStats
  };
};
