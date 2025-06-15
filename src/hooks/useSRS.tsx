import { useState, useCallback } from "react";
import type { Card } from "@/types/deck";
import { 
  calculateNextReview, 
  mapSimpleAnswerToQuality, 
  getCardsForReview as getSRSCardsForReview,
  getDeckSRSStats,
  AnswerQuality
} from "@/utils/srsAlgorithm";
import { cardService } from "@/services/cardService";

export const useSRS = () => {
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);

  /**
   * Procesa una respuesta del usuario y actualiza la tarjeta con SRS
   */
  const processAnswer = useCallback(async (
    card: Card,
    known: boolean,
    userId: string,
    responseTime?: number
  ): Promise<{
    success: boolean;
    updatedCard: Card;
    nextInterval: number;
    error?: string;
  }> => {
    try {
      setIsProcessingAnswer(true);

      // Determinar si la revisión está tarde
      const now = new Date();
      const nextReview = new Date(card.nextReview);
      const isLate = now > nextReview;
      const daysLate = isLate ? (now.getTime() - nextReview.getTime()) / (1000 * 60 * 60 * 24) : 0;

      // Mapear respuesta simple a calidad de respuesta SRS
      const answerQuality = mapSimpleAnswerToQuality(known, card, responseTime);

      // Calcular próxima revisión usando SRS
      const srsResult = calculateNextReview(card, answerQuality, isLate, daysLate);

      // Crear datos de revisión para actualizar en la base de datos
      const reviewData = {
        lastReviewed: now,
        nextReview: srsResult.nextReviewDate,
        reviewCount: card.reviewCount + 1,
        hasBeenWrong: card.hasBeenWrong || !known,
        wasWrongInSession: known ? false : true,
        // Datos SRS
        easeFactor: srsResult.srsData.easeFactor,
        srsInterval: srsResult.srsData.interval,
        repetitions: srsResult.srsData.repetitions,
        lastScore: srsResult.srsData.lastScore,
        intervalModifier: srsResult.srsData.intervalModifier,
        responseTime: responseTime
      };

      // Actualizar en la base de datos
      await cardService.updateCardDifficulty(
        card.id,
        userId,
        srsResult.newDifficulty,
        reviewData
      );

      // Crear tarjeta actualizada
      const updatedCard: Card = {
        ...card,
        difficulty: srsResult.newDifficulty,
        lastReviewed: now,
        nextReview: srsResult.nextReviewDate,
        reviewCount: card.reviewCount + 1,
        hasBeenWrong: card.hasBeenWrong || !known,
        wasWrongInSession: known ? false : true,
        easeFactor: srsResult.srsData.easeFactor,
        srsInterval: srsResult.srsData.interval,
        repetitions: srsResult.srsData.repetitions,
        lastScore: srsResult.srsData.lastScore,
        intervalModifier: srsResult.srsData.intervalModifier,
        responseTime: responseTime
      };

      console.log(`SRS: Tarjeta ${card.word} actualizada:`, {
        answerQuality: AnswerQuality[answerQuality],
        newDifficulty: srsResult.newDifficulty,
        newInterval: srsResult.interval,
        nextReview: srsResult.nextReviewDate.toLocaleDateString(),
        easeFactor: srsResult.srsData.easeFactor,
        repetitions: srsResult.srsData.repetitions
      });

      return {
        success: true,
        updatedCard,
        nextInterval: srsResult.interval
      };

    } catch (error) {
      console.error('Error procesando respuesta SRS:', error);
      return {
        success: false,
        updatedCard: card,
        nextInterval: 1,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    } finally {
      setIsProcessingAnswer(false);
    }
  }, []);

  /**
   * Obtiene tarjetas listas para revisar ordenadas por prioridad SRS
   */
  const getCardsForReview = useCallback((cards: Card[]): Card[] => {
    return getSRSCardsForReview(cards);
  }, []);

  /**
   * Obtiene estadísticas SRS del deck
   */
  const getSRSStats = useCallback((cards: Card[]) => {
    return getDeckSRSStats(cards);
  }, []);

  /**
   * Calcula la dificultad promedio de las tarjetas que necesitan revisión
   */
  const getAverageDifficultyForReview = useCallback((cards: Card[]): number => {
    const reviewCards = getCardsForReview(cards);
    if (reviewCards.length === 0) return 0;
    
    const totalDifficulty = reviewCards.reduce((sum, card) => sum + card.difficulty, 0);
    return Math.round(totalDifficulty / reviewCards.length);
  }, [getCardsForReview]);

  /**
   * Predice cuándo será la próxima sesión de estudio basándose en tarjetas pendientes
   */
  const predictNextStudySession = useCallback((cards: Card[]): {
    nextSessionDate: Date | null;
    cardsCount: number;
  } => {
    const futureCards = cards
      .filter(card => new Date(card.nextReview) > new Date())
      .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());

    if (futureCards.length === 0) {
      return { nextSessionDate: null, cardsCount: 0 };
    }

    // Agrupar tarjetas por día
    const cardsByDay = new Map<string, number>();
    futureCards.forEach(card => {
      const dateKey = new Date(card.nextReview).toDateString();
      cardsByDay.set(dateKey, (cardsByDay.get(dateKey) || 0) + 1);
    });

    // Encontrar el primer día con al menos 5 tarjetas o el primer día disponible
    for (const [dateKey, count] of cardsByDay.entries()) {
      if (count >= 5) {
        return {
          nextSessionDate: new Date(dateKey),
          cardsCount: count
        };
      }
    }

    // Si no hay ningún día con 5+ tarjetas, devolver el primer día disponible
    const firstDate = futureCards[0].nextReview;
    const firstDateKey = new Date(firstDate).toDateString();
    return {
      nextSessionDate: new Date(firstDate),
      cardsCount: cardsByDay.get(firstDateKey) || 1
    };
  }, []);

  /**
   * Calcula estadísticas de retención basadas en el historial SRS
   */
  const getRetentionStats = useCallback((cards: Card[]): {
    overallRetention: number;
    retentionByLevel: { [level: number]: number };
    averageInterval: number;
  } => {
    if (cards.length === 0) {
      return {
        overallRetention: 0,
        retentionByLevel: {},
        averageInterval: 0
      };
    }

    const reviewedCards = cards.filter(card => card.reviewCount > 0);
    const correctAnswers = reviewedCards.filter(card => card.difficulty >= 4).length;
    const overallRetention = reviewedCards.length > 0 ? (correctAnswers / reviewedCards.length) * 100 : 0;

    const retentionByLevel: { [level: number]: number } = {};
    for (let level = 0; level <= 10; level++) {
      const levelCards = cards.filter(card => card.difficulty === level && card.reviewCount > 0);
      const levelCorrect = levelCards.filter(card => !card.hasBeenWrong).length;
      retentionByLevel[level] = levelCards.length > 0 ? (levelCorrect / levelCards.length) * 100 : 0;
    }

    const totalInterval = cards.reduce((sum, card) => sum + (card.srsInterval || 1), 0);
    const averageInterval = cards.length > 0 ? totalInterval / cards.length : 0;

    return {
      overallRetention,
      retentionByLevel,
      averageInterval
    };
  }, []);

  return {
    processAnswer,
    getCardsForReview,
    getSRSStats,
    getAverageDifficultyForReview,
    predictNextStudySession,
    getRetentionStats,
    isProcessingAnswer
  };
}; 