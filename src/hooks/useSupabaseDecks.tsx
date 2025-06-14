import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

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

export const useSupabaseDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Cargar decks desde Supabase
  useEffect(() => {
    if (user) {
      loadDecks();
    }
  }, [user]);

  const loadDecks = async () => {
    if (!user) return;

    try {
      // Cargar decks
      const { data: decksData, error: decksError } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (decksError) throw decksError;

      // Cargar tarjetas
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (cardsError) throw cardsError;

      // Agrupar tarjetas por deck
      const decksWithCards: Deck[] = (decksData || []).map(deck => ({
        id: deck.id,
        name: deck.name,
        isImported: deck.is_imported,
        createdAt: new Date(deck.created_at),
        cards: (cardsData || [])
          .filter(card => card.deck_id === deck.id)
          .map(card => ({
            id: card.id,
            word: card.word,
            reading: card.reading,
            meaning: card.meaning,
            createdAt: new Date(card.created_at),
            difficulty: card.difficulty,
            lastReviewed: new Date(card.last_reviewed),
            nextReview: new Date(card.next_review),
            reviewCount: card.review_count,
            hasBeenWrong: card.has_been_wrong,
            wasWrongInSession: card.was_wrong_in_session
          }))
      }));

      setDecks(decksWithCards);

      // Si no hay decks, crear uno por defecto
      if (decksWithCards.length === 0) {
        await createDeck('Mis Tarjetas');
      }
    } catch (error: any) {
      console.error('Error loading decks:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los mazos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCard = async (word: string, reading: string, meaning: string, deckId: string) => {
    if (!user) return;

    try {
      const now = new Date();
      const { data, error } = await supabase
        .from('cards')
        .insert({
          deck_id: deckId,
          user_id: user.id,
          word,
          reading,
          meaning,
          difficulty: 0,
          last_reviewed: now.toISOString(),
          next_review: now.toISOString(),
          review_count: 0,
          has_been_wrong: false,
          was_wrong_in_session: false
        })
        .select()
        .single();

      if (error) throw error;

      await loadDecks();
      
      toast({
        title: "Tarjeta añadida",
        description: `Se añadió "${word}" al mazo`,
      });
    } catch (error: any) {
      console.error('Error adding card:', error);
      toast({
        title: "Error",
        description: "No se pudo añadir la tarjeta",
        variant: "destructive",
      });
    }
  };

  const createDeck = async (name: string) => {
    if (!user) return '';

    try {
      const { data, error } = await supabase
        .from('decks')
        .insert({
          user_id: user.id,
          name,
          is_imported: false
        })
        .select()
        .single();

      if (error) throw error;

      await loadDecks();
      
      toast({
        title: "Mazo creado",
        description: `Se creó el mazo "${name}"`,
      });

      return data.id;
    } catch (error: any) {
      console.error('Error creating deck:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el mazo",
        variant: "destructive",
      });
      return '';
    }
  };

  const deleteCard = async (cardId: string, deckId: string) => {
    if (!user) {
      console.error('No user found for deleteCard operation');
      toast({
        title: "Error",
        description: "No hay usuario autenticado",
        variant: "destructive",
      });
      return;
    }

    console.log(`Starting deletion process for card ${cardId} from deck ${deckId} for user ${user.id}`);

    try {
      const { data: existingCard, error: fetchError } = await supabase
        .from('cards')
        .select('id, user_id, deck_id')
        .eq('id', cardId)
        .eq('user_id', user.id)
        .eq('deck_id', deckId)
        .single();

      if (fetchError) {
        console.error('Error fetching card for verification:', fetchError);
        throw new Error(`Error verificando la tarjeta: ${fetchError.message}`);
      }

      if (!existingCard) {
        console.error('Card not found or access denied');
        throw new Error('La tarjeta no existe o no tienes permisos para eliminarla');
      }

      const { error: deleteError } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user.id)
        .eq('deck_id', deckId);

      if (deleteError) {
        console.error('Error deleting card:', deleteError);
        throw new Error(`Error eliminando la tarjeta: ${deleteError.message}`);
      }

      console.log(`Card ${cardId} deleted successfully`);
      
      await loadDecks();
      
      toast({
        title: "Tarjeta eliminada",
        description: "La tarjeta se eliminó correctamente",
      });
    } catch (error: any) {
      console.error('Error in deleteCard function:', error);
      toast({
        title: "Error",
        description: error.message || 'No se pudo eliminar la tarjeta',
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCardDifficulty = async (cardId: string, known: boolean, deckId: string) => {
    if (!user) return;

    try {
      const currentCard = decks
        .find(d => d.id === deckId)?.cards
        .find(c => c.id === cardId);

      if (!currentCard) return;

      let newDifficulty: number;
      
      if (known) {
        const increment = currentCard.wasWrongInSession ? 0.5 : 1;
        newDifficulty = Math.min(10, currentCard.difficulty + increment);
      } else {
        newDifficulty = Math.max(0, currentCard.difficulty - 1);
      }
      
      const now = new Date();
      const nextReview = new Date(now);
      
      const intervals = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
      const intervalIndex = Math.floor(newDifficulty);
      const intervalDays = intervals[intervalIndex] || 89;
      nextReview.setDate(now.getDate() + intervalDays);

      const { error } = await supabase
        .from('cards')
        .update({
          difficulty: newDifficulty,
          last_reviewed: now.toISOString(),
          next_review: nextReview.toISOString(),
          review_count: currentCard.reviewCount + 1,
          has_been_wrong: currentCard.hasBeenWrong || !known,
          was_wrong_in_session: known ? false : true
        })
        .eq('id', cardId)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadDecks();
    } catch (error: any) {
      console.error('Error updating card:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarjeta",
        variant: "destructive",
      });
    }
  };

  const resetSessionMarks = async (deckId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cards')
        .update({ was_wrong_in_session: false })
        .eq('deck_id', deckId)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadDecks();
    } catch (error: any) {
      console.error('Error resetting session marks:', error);
    }
  };

  const resetProgress = async (deckId: string) => {
    if (!user) return;

    try {
      const now = new Date();
      const { error } = await supabase
        .from('cards')
        .update({
          difficulty: 0,
          last_reviewed: now.toISOString(),
          next_review: now.toISOString(),
          review_count: 0,
          has_been_wrong: false,
          was_wrong_in_session: false
        })
        .eq('deck_id', deckId)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadDecks();
      
      toast({
        title: "Progreso reiniciado",
        description: "Se reinició el progreso de todas las tarjetas",
      });
    } catch (error: any) {
      console.error('Error resetting progress:', error);
      toast({
        title: "Error",
        description: "No se pudo reiniciar el progreso",
        variant: "destructive",
      });
    }
  };

  const importDeck = async (name: string, cards: Omit<Card, 'id' | 'createdAt' | 'difficulty' | 'lastReviewed' | 'nextReview' | 'reviewCount' | 'hasBeenWrong'>[]) => {
    if (!user) return '';

    try {
      console.log(`Iniciando importación de ${cards.length} tarjetas`);
      
      // Crear el deck
      const { data: deckData, error: deckError } = await supabase
        .from('decks')
        .insert({
          user_id: user.id,
          name,
          is_imported: true
        })
        .select()
        .single();

      if (deckError) {
        console.error('Error creando deck:', deckError);
        throw deckError;
      }

      console.log('Deck creado:', deckData.id);

      // Procesar tarjetas en lotes más pequeños para mejor rendimiento
      const batchSize = 50; // Reducido para mejor estabilidad
      const now = new Date();
      let totalInserted = 0;

      for (let i = 0; i < cards.length; i += batchSize) {
        const batch = cards.slice(i, i + batchSize);
        
        const cardsToInsert = batch.map(card => ({
          deck_id: deckData.id,
          user_id: user.id,
          word: card.word || '',
          reading: card.reading || '',
          meaning: card.meaning || '',
          difficulty: 0,
          last_reviewed: now.toISOString(),
          next_review: now.toISOString(),
          review_count: 0,
          has_been_wrong: false,
          was_wrong_in_session: false
        }));

        console.log(`Insertando lote ${Math.floor(i/batchSize) + 1} de ${Math.ceil(cards.length/batchSize)}: ${cardsToInsert.length} tarjetas`);

        const { error: cardsError, data: insertedCards } = await supabase
          .from('cards')
          .insert(cardsToInsert)
          .select();

        if (cardsError) {
          console.error('Error insertando tarjetas:', cardsError);
          throw cardsError;
        }

        totalInserted += insertedCards?.length || 0;
        console.log(`Lote insertado exitosamente. Total insertadas: ${totalInserted}`);

        // Pequeña pausa entre lotes para evitar sobrecargar la base de datos
        if (i + batchSize < cards.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`Importación completada: ${totalInserted} tarjetas`);

      // Recargar datos después de la importación
      await loadDecks();
      
      toast({
        title: "¡Deck importado!",
        description: `Se importó "${name}" con ${totalInserted} tarjetas correctamente`,
      });

      return deckData.id;
    } catch (error: any) {
      console.error('Error importing deck:', error);
      toast({
        title: "Error",
        description: `No se pudo importar el mazo: ${error.message}`,
        variant: "destructive",
      });
      return '';
    }
  };

  const deleteDeck = async (deckId: string) => {
    if (!user || deckId === 'default') return;

    try {
      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', deckId)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadDecks();
      
      toast({
        title: "Mazo eliminado",
        description: "El mazo se eliminó correctamente",
      });
    } catch (error: any) {
      console.error('Error deleting deck:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el mazo",
        variant: "destructive",
      });
    }
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
    loading,
    addCard,
    createDeck,
    deleteCard,
    updateCardDifficulty,
    getCardsForReview,
    resetProgress,
    importDeck,
    deleteDeck,
    getAllCards,
    getDeckStats,
    resetSessionMarks
  };
};
