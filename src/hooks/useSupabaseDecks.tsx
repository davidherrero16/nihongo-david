
import { useState, useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, Deck } from "@/types/deck";
import { cardService } from "@/services/cardService";
import { deckService } from "@/services/deckService";
import { cardUtils } from "@/utils/cardUtils";

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

      // Cargar decks y tarjetas
      const [decksData, { cards: allCards, count }] = await Promise.all([
        deckService.loadDecks(user.id),
        cardService.loadAllCards(user.id)
      ]);

      // Log detallado por deck para debug
      if (decksData && allCards) {
        decksData.forEach(deck => {
          const cardsForThisDeck = allCards.filter(card => card.deck_id === deck.id);
          console.log(`Deck "${deck.name}" (ID: ${deck.id}): ${cardsForThisDeck.length} tarjetas encontradas`);
          
          // Si es el deck Kaishi, mostrar más detalles
          if (deck.name.includes('Kaishi')) {
            console.log(`Primeras 5 tarjetas del deck Kaishi:`, cardsForThisDeck.slice(0, 5).map(c => ({
              id: c.id,
              word: c.word,
              deck_id: c.deck_id
            })));
          }
        });
      }

      // Agrupar tarjetas por deck
      const decksWithCards: Deck[] = decksData.map(deck => ({
        id: deck.id,
        name: deck.name,
        isImported: deck.is_imported,
        createdAt: new Date(deck.created_at),
        cards: allCards
          .filter(card => card.deck_id === deck.id)
          .map(cardUtils.transformDbCardToCard)
      }));

      // Log del conteo final de tarjetas por deck
      decksWithCards.forEach(deck => {
        console.log(`Deck procesado "${deck.name}": ${deck.cards.length} tarjetas`);
      });

      // Verificar si hay discrepancia
      const totalCardsProcessed = decksWithCards.reduce((sum, deck) => sum + deck.cards.length, 0);
      console.log(`Total tarjetas procesadas: ${totalCardsProcessed}`);
      console.log(`Total tarjetas de la consulta: ${allCards?.length || 0}`);
      
      if (totalCardsProcessed !== (allCards?.length || 0)) {
        console.warn('¡DISCREPANCIA DETECTADA! Hay tarjetas que no se están asignando correctamente a los decks');
        
        // Buscar tarjetas huérfanas
        const assignedCardIds = new Set(decksWithCards.flatMap(deck => deck.cards.map(card => card.id)));
        const orphanCards = allCards.filter(card => !assignedCardIds.has(card.id));
        
        if (orphanCards.length > 0) {
          console.error(`Tarjetas huérfanas encontradas (${orphanCards.length}):`, orphanCards.slice(0, 5).map(c => ({
            id: c.id,
            word: c.word,
            deck_id: c.deck_id
          })));
        }
      }

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
      const data = await cardService.addCard(deckId, user.id, word, reading, meaning);

      // Actualizar estado local sin recargar todo
      setDecks(prevDecks => 
        prevDecks.map(deck => 
          deck.id === deckId 
            ? {
                ...deck,
                cards: [...deck.cards, cardUtils.transformDbCardToCard(data)]
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
      const data = await deckService.createDeck(user.id, name);

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
        description: `Se creó el mazo "${name}", ve a la página de tarjetas para comenzar a añadir tarjetas`,
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
      await cardService.deleteCard(cardId, user.id, deckId);

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

      const newDifficulty = cardUtils.calculateNewDifficulty(
        currentCard.difficulty, 
        known, 
        currentCard.wasWrongInSession || false
      );
      
      console.log(`Tarjeta ${currentCard.word}: dificultad ${currentCard.difficulty} -> ${newDifficulty}`);
      
      const now = new Date();
      const nextReview = cardUtils.calculateNextReview(newDifficulty);

      await cardService.updateCardDifficulty(cardId, user.id, newDifficulty, {
        lastReviewed: now,
        nextReview,
        reviewCount: currentCard.reviewCount + 1,
        hasBeenWrong: currentCard.hasBeenWrong || !known,
        wasWrongInSession: known ? false : true
      });

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
      await cardService.resetSessionMarks(deckId, user.id);

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
      await cardService.resetProgress(deckId, user.id);

      // Actualizar estado local
      const now = new Date();
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
      
      const deckData = await deckService.createDeck(user.id, name, true);
      console.log('Deck creado:', deckData.id);

      const totalInserted = await cardService.importCards(deckData.id, user.id, cards);
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
      await deckService.deleteDeck(deckId, user.id);

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
    const allCards = deckId 
      ? decks.find(deck => deck.id === deckId)?.cards || []
      : decks.flatMap(deck => deck.cards);
    
    return cardUtils.getCardsForReview(allCards);
  };

  const getDeckStats = (deckId: string) => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return { nuevas: 0, revisar: 0, aprendidas: 0, porAprender: 0 };

    return cardUtils.getDeckStats(deck.cards);
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
