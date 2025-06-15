
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/types/deck";

export const cardService = {
  async loadAllCards(userId: string) {
    console.log('Iniciando consulta de tarjetas...');
    const { data: allCards, error: cardsError, count } = await supabase
      .from('cards')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (cardsError) {
      console.error('Error cargando tarjetas:', cardsError);
      throw cardsError;
    }

    console.log(`Total de tarjetas en la consulta: ${allCards?.length || 0}`);
    console.log(`Conteo exacto de tarjetas en la BD: ${count}`);

    return { cards: allCards || [], count };
  },

  async addCard(deckId: string, userId: string, word: string, reading: string, meaning: string) {
    const now = new Date();
    const { data, error } = await supabase
      .from('cards')
      .insert({
        deck_id: deckId,
        user_id: userId,
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
    return data;
  },

  async deleteCard(cardId: string, userId: string, deckId: string) {
    // Verificar que la tarjeta existe y pertenece al usuario
    const { data: existingCard, error: fetchError } = await supabase
      .from('cards')
      .select('id, user_id, deck_id')
      .eq('id', cardId)
      .eq('user_id', userId)
      .eq('deck_id', deckId)
      .single();

    if (fetchError) {
      console.error('Error fetching card for verification:', fetchError);
      throw new Error(`Error verificando la tarjeta: ${fetchError.message}`);
    }

    if (!existingCard) {
      throw new Error('La tarjeta no existe o no tienes permisos para eliminarla');
    }

    const { error: deleteError } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)
      .eq('user_id', userId)
      .eq('deck_id', deckId);

    if (deleteError) {
      console.error('Error deleting card:', deleteError);
      throw new Error(`Error eliminando la tarjeta: ${deleteError.message}`);
    }
  },

  async updateCardDifficulty(cardId: string, userId: string, difficulty: number, reviewData: {
    lastReviewed: Date;
    nextReview: Date;
    reviewCount: number;
    hasBeenWrong: boolean;
    wasWrongInSession: boolean;
  }) {
    const { error } = await supabase
      .from('cards')
      .update({
        difficulty,
        last_reviewed: reviewData.lastReviewed.toISOString(),
        next_review: reviewData.nextReview.toISOString(),
        review_count: reviewData.reviewCount,
        has_been_wrong: reviewData.hasBeenWrong,
        was_wrong_in_session: reviewData.wasWrongInSession
      })
      .eq('id', cardId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating card in database:', error);
      throw error;
    }
  },

  async resetSessionMarks(deckId: string, userId: string) {
    const { error } = await supabase
      .from('cards')
      .update({ was_wrong_in_session: false })
      .eq('deck_id', deckId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async resetProgress(deckId: string, userId: string) {
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
      .eq('user_id', userId);

    if (error) throw error;
  },

  async importCards(deckId: string, userId: string, cards: Array<{
    word: string;
    reading: string;
    meaning: string;
  }>) {
    const batchSize = 50;
    const now = new Date();
    let totalInserted = 0;

    for (let i = 0; i < cards.length; i += batchSize) {
      const batch = cards.slice(i, i + batchSize);
      
      const cardsToInsert = batch.map(card => ({
        deck_id: deckId,
        user_id: userId,
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
        throw new Error(`Error al insertar tarjetas: ${cardsError.message}`);
      }

      totalInserted += insertedCards?.length || 0;
      console.log(`Lote insertado exitosamente. Total insertadas: ${totalInserted}`);

      if (i + batchSize < cards.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return totalInserted;
  }
};
