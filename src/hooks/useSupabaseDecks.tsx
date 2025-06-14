import { useState, useEffect, useRef } from "react";
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
  
  // Refs para evitar bucles infinitos
  const isLoadingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cargar decks desde Supabase con protecciones
  useEffect(() => {
    if (!user || isLoadingRef.current || hasInitializedRef.current) {
      return;
    }

    console.log('Iniciando carga única de mazos para usuario:', user.id);
    loadDecks();
    hasInitializedRef.current = true;
  }, [user]);

  const loadDecks = async () => {
    if (!user || isLoadingRef.current) {
      console.log('Carga cancelada: usuario no encontrado o carga en progreso');
      return;
    }

    isLoadingRef.current = true;
    
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    try {
      console.log('Iniciando carga de mazos para usuario:', user.id);

      // Cargar decks primero
      const { data: decksData, error: decksError } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .abortSignal(abortControllerRef.current.signal);

      if (decksError) {
        console.error('Error cargando decks:', decksError);
        throw decksError;
      }

      console.log(`Cargados ${decksData?.length || 0} mazos`);

      // Cargar todas las tarjetas sin límite
      const { data: allCards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (cardsError) {
        console.error('Error cargando tarjetas:', cardsError);
        throw cardsError;
      }

      console.log(`Total de tarjetas cargadas: ${allCards?.length || 0}`);

      // Agrupar tarjetas por deck
      const decksWithCards: Deck[] = (decksData || []).map(deck => ({
        id: deck.id,
        name: deck.name,
        isImported: deck.is_imported,
        createdAt: new Date(deck.created_at),
        cards: (allCards || [])
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

      // Log del conteo de tarjetas por deck
      decksWithCards.forEach(deck => {
        console.log(`Deck "${deck.name}": ${deck.cards.length} tarjetas`);
      });

      setDecks(decksWithCards);

      // Si no hay decks, crear uno por defecto
      if (decksWithCards.length === 0) {
        console.log('No hay mazos, creando uno por defecto');
        await createDeck('Mis Tarjetas');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Petición cancelada');
        return;
      }
      
      console.error('Error loading decks:', error);
      toast({
        title: "Error",
        description: `No se pudieron cargar los mazos: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      isLoadingRef.current = false;
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

      // Actualizar estado local sin recargar todo
      setDecks(prevDecks => 
        prevDecks.map(deck => 
          deck.id === deckId 
            ? {
                ...deck,
                cards: [...deck.cards, {
                  id: data.id,
                  word: data.word,
                  reading: data.reading,
                  meaning: data.meaning,
                  createdAt: new Date(data.created_at),
                  difficulty: data.difficulty,
                  lastReviewed: new Date(data.last_reviewed),
                  nextReview: new Date(data.next_review),
                  reviewCount: data.review_count,
                  hasBeenWrong: data.has_been_wrong,
                  wasWrongInSession: data.was_wrong_in_session
                }]
              }
            : deck
        )
      );
      
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

      // Actualizar estado local
      const newDeck: Deck = {
        id: data.id,
        name: data.name,
        cards: [],
        isImported: data.is_imported,
        createdAt: new Date(data.created_at)
      };

      setDecks(prevDecks => [...prevDecks, newDeck]);
      
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
      
      // Actualizar estado local sin recargar
      setDecks(prevDecks => 
        prevDecks.map(deck => 
          deck.id === deckId 
            ? { ...deck, cards: deck.cards.filter(card => card.id !== cardId) }
            : deck
        )
      );
      
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

    console.log(`Intentando actualizar tarjeta ${cardId} en deck ${deckId}`);

    // Verificar que el cardId no sea temporal
    if (cardId.startsWith('temp_')) {
      console.error('Intento de actualizar tarjeta con ID temporal:', cardId);
      toast({
        title: "Error",
        description: "Error interno: ID de tarjeta inválido",
        variant: "destructive",
      });
      return;
    }

    try {
      const currentCard = decks
        .find(d => d.id === deckId)?.cards
        .find(c => c.id === cardId);

      if (!currentCard) {
        console.error('Tarjeta no encontrada:', cardId);
        return;
      }

      let newDifficulty: number;
      
      if (known) {
        // Si la tarjeta fue incorrecta en esta sesión, solo sube 0.5 niveles
        const increment = currentCard.wasWrongInSession ? 0.5 : 1;
        newDifficulty = Math.min(10, currentCard.difficulty + increment);
        console.log(`Tarjeta ${currentCard.word}: dificultad ${currentCard.difficulty} -> ${newDifficulty} (incremento: ${increment}, fue incorrecta en sesión: ${currentCard.wasWrongInSession})`);
      } else {
        // Si es incorrecta, baja 1 nivel
        newDifficulty = Math.max(0, currentCard.difficulty - 1);
        console.log(`Tarjeta ${currentCard.word}: dificultad ${currentCard.difficulty} -> ${newDifficulty} (respuesta incorrecta)`);
      }
      
      const now = new Date();
      const nextReview = new Date(now);
      
      // Intervalos basados en los niveles 0-10 (en días) - sistema mejorado
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

      if (error) {
        console.error('Error updating card in database:', error);
        throw error;
      }

      console.log(`Tarjeta ${cardId} actualizada exitosamente en la base de datos`);

      // Actualizar estado local
      setDecks(prevDecks => 
        prevDecks.map(deck => 
          deck.id === deckId 
            ? {
                ...deck,
                cards: deck.cards.map(card => 
                  card.id === cardId 
                    ? {
                        ...card,
                        difficulty: newDifficulty,
                        lastReviewed: now,
                        nextReview: nextReview,
                        reviewCount: card.reviewCount + 1,
                        hasBeenWrong: card.hasBeenWrong || !known,
                        wasWrongInSession: known ? false : true
                      }
                    : card
                )
              }
            : deck
        )
      );
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

      // Actualizar estado local
      setDecks(prevDecks => 
        prevDecks.map(deck => 
          deck.id === deckId 
            ? {
                ...deck,
                cards: deck.cards.map(card => ({ ...card, wasWrongInSession: false }))
              }
            : deck
        )
      );
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

      // Actualizar estado local
      setDecks(prevDecks => 
        prevDecks.map(deck => 
          deck.id === deckId 
            ? {
                ...deck,
                cards: deck.cards.map(card => ({
                  ...card,
                  difficulty: 0,
                  lastReviewed: now,
                  nextReview: now,
                  reviewCount: 0,
                  hasBeenWrong: false,
                  wasWrongInSession: false
                }))
              }
            : deck
        )
      );
      
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
      
      // Verificar conectividad con Supabase antes de proceder
      const { data: testConnection } = await supabase
        .from('decks')
        .select('count')
        .limit(1);
      
      console.log('Conexión con Supabase verificada');
      
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
        throw new Error(`Error al crear el mazo: ${deckError.message}`);
      }

      console.log('Deck creado:', deckData.id);

      const batchSize = 50; // Incrementar el tamaño del lote para mejor rendimiento
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

        try {
          const { error: cardsError, data: insertedCards } = await supabase
            .from('cards')
            .insert(cardsToInsert)
            .select();

          if (cardsError) {
            console.error('Error insertando tarjetas:', cardsError);
            throw new Error(`Error al insertar tarjetas: ${cardsError.message}`);
          }

          totalInserted += insertedCards?.length || 0;
          console.log(`Lote insertado exitosamente. Total insertadas: ${totalInserted}`);

          // Pausa más corta entre lotes para mejor rendimiento
          if (i + batchSize < cards.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } catch (batchError: any) {
          console.error(`Error en lote ${Math.floor(i/batchSize) + 1}:`, batchError);
          throw new Error(`Error al procesar lote de tarjetas: ${batchError.message}`);
        }
      }

      console.log(`Importación completada: ${totalInserted} tarjetas`);

      // Recargar datos después de la importación para obtener IDs reales
      await loadDecks();
      
      toast({
        title: "¡Deck importado!",
        description: `Se importó "${name}" con ${totalInserted} tarjetas correctamente`,
      });

      return deckData.id;
    } catch (error: any) {
      console.error('Error importing deck:', error);
      
      // Mensajes de error más específicos
      let errorMessage = "Error desconocido durante la importación";
      
      if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        errorMessage = "Error de conexión con el servidor. Verifica tu conexión a internet e inténtalo de nuevo.";
      } else if (error.message.includes('timeout')) {
        errorMessage = "La importación tardó demasiado. Intenta con un archivo más pequeño.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error al importar",
        description: errorMessage,
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

      // Actualizar estado local
      setDecks(prevDecks => prevDecks.filter(deck => deck.id !== deckId));
      
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
    const revisar = deck.cards.filter(card => card.hasBeenWrong && card.difficulty < 7).length;
    const aprendidas = deck.cards.filter(card => card.difficulty >= 7).length;
    const porAprender = deck.cards.length - aprendidas;

    return { nuevas, revisar, aprendidas, porAprender };
  };

  const getAllCards = () => decks.flatMap(deck => deck.cards);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
