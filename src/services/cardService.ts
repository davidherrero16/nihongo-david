import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/types/deck";

export const cardService = {
  async loadAllCards(userId: string) {
    console.log('Iniciando consulta de tarjetas...');
    
    let allCards: any[] = [];
    let hasMore = true;
    let from = 0;
    const pageSize = 1000; // Tamaño de página para evitar el límite por defecto
    
    // Obtener el conteo total primero
    const { count: totalCount, error: countError } = await supabase
      .from('cards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (countError) {
      console.error('Error obteniendo conteo de tarjetas:', countError);
      throw countError;
    }
    
    console.log(`Total de tarjetas en la BD: ${totalCount}`);
    
    // Cargar todas las tarjetas usando paginación
    while (hasMore) {
      const { data: pageCards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .range(from, from + pageSize - 1);

      if (cardsError) {
        console.error('Error cargando tarjetas:', cardsError);
        throw cardsError;
      }

      if (pageCards && pageCards.length > 0) {
        allCards = [...allCards, ...pageCards];
        from += pageSize;
        console.log(`Cargadas ${allCards.length} tarjetas de ${totalCount}`);
      } else {
        hasMore = false;
      }
      
      // Si ya cargamos todas las tarjetas, salir del bucle
      if (allCards.length >= totalCount) {
        hasMore = false;
      }
    }

    console.log(`Total de tarjetas cargadas: ${allCards.length}`);
    console.log(`Conteo exacto de tarjetas en la BD: ${totalCount}`);

    return { cards: allCards, count: totalCount };
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
        was_wrong_in_session: false,
        // Valores SRS iniciales
        ease_factor: 2.5,
        srs_interval: 1,
        repetitions: 0,
        last_score: 0,
        interval_modifier: 1.0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCard(cardId: string, userId: string, deckId: string) {
    console.log(`Attempting to delete card ${cardId} for user ${userId} in deck ${deckId}`);
    
    // Simplificar la consulta de verificación usando solo filtros esenciales
    const { data: existingCard, error: fetchError } = await supabase
      .from('cards')
      .select('id, user_id, deck_id')
      .eq('id', cardId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching card for verification:', fetchError);
      throw new Error(`Error verificando la tarjeta: ${fetchError.message}`);
    }

    if (!existingCard) {
      throw new Error('La tarjeta no existe o no tienes permisos para eliminarla');
    }

    // Verificar que la tarjeta pertenece al deck correcto
    if (existingCard.deck_id !== deckId) {
      throw new Error('La tarjeta no pertenece al deck especificado');
    }

    // Simplificar la consulta de eliminación
    const { error: deleteError } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting card:', deleteError);
      throw new Error(`Error eliminando la tarjeta: ${deleteError.message}`);
    }
    
    console.log(`Card ${cardId} deleted successfully`);
  },

  async updateCardDifficulty(cardId: string, userId: string, difficulty: number, reviewData: {
    lastReviewed: Date;
    nextReview: Date;
    reviewCount: number;
    hasBeenWrong: boolean;
    wasWrongInSession: boolean;
    // Campos SRS opcionales
    easeFactor?: number;
    srsInterval?: number;
    repetitions?: number;
    lastScore?: number;
    intervalModifier?: number;
    responseTime?: number;
  }) {
    console.log(`[cardService] Actualizando tarjeta ${cardId} para usuario ${userId} - Nueva dificultad: ${difficulty}, Review count: ${reviewData.reviewCount}`);
    
    const updateData: any = {
      difficulty,
      last_reviewed: reviewData.lastReviewed.toISOString(),
      next_review: reviewData.nextReview.toISOString(),
      review_count: reviewData.reviewCount,
      has_been_wrong: reviewData.hasBeenWrong,
      was_wrong_in_session: reviewData.wasWrongInSession
    };

    // Agregar campos SRS si están presentes
    if (reviewData.easeFactor !== undefined) updateData.ease_factor = reviewData.easeFactor;
    if (reviewData.srsInterval !== undefined) updateData.srs_interval = reviewData.srsInterval;
    if (reviewData.repetitions !== undefined) updateData.repetitions = reviewData.repetitions;
    if (reviewData.lastScore !== undefined) updateData.last_score = reviewData.lastScore;
    if (reviewData.intervalModifier !== undefined) updateData.interval_modifier = reviewData.intervalModifier;
    if (reviewData.responseTime !== undefined) updateData.response_time = reviewData.responseTime;

    const { error } = await supabase
      .from('cards')
      .update(updateData)
      .eq('id', cardId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating card in database:', error);
      throw error;
    }
    
    console.log(`Tarjeta ${cardId} actualizada exitosamente en la base de datos`);
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
        was_wrong_in_session: false,
        // Reset valores SRS
        ease_factor: 2.5,
        srs_interval: 1,
        repetitions: 0,
        last_score: 0,
        interval_modifier: 1.0
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
        was_wrong_in_session: false,
        // Valores SRS iniciales
        ease_factor: 2.5,
        srs_interval: 1,
        repetitions: 0,
        last_score: 0,
        interval_modifier: 1.0
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
