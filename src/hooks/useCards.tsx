
import { useState, useEffect } from "react";

export interface Card {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  createdAt: Date;
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
          createdAt: new Date(card.createdAt)
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
    const newCard: Card = {
      id: Date.now().toString(),
      word,
      reading,
      meaning,
      createdAt: new Date()
    };
    setCards(prev => [...prev, newCard]);
  };

  const deleteCard = (id: string) => {
    setCards(prev => prev.filter(card => card.id !== id));
  };

  return {
    cards,
    addCard,
    deleteCard
  };
};
