import { useState, useCallback, useMemo } from "react";
import { 
  calculateNextReviewFSRS, 
  getCardsForReviewFSRS, 
  getFSRSStats, 
  predictPerformanceFSRS,
  getStudyRecommendationsFSRS,
  FSRSData 
} from "@/utils/fsrsAlgorithm";
import { Rating } from "ts-fsrs";
import type { Card } from "@/types/deck";
import { cardService } from "@/services/cardService";

export interface FSRSSessionStats {
  cardsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageResponseTime: number;
  sessionDuration: number;
  totalTimeSpent: number;
  retentionRate: number;
  difficultyDistribution: { [key: number]: number };
}

export interface FSRSRecommendations {
  recommendedDailyCards: number;
  optimalStudyTime: string;
  difficultyFocus: string;
  retentionAdvice: string;
  nextStudySession: string;
}

export interface FSRSAnalytics {
  new: number;
  learning: number;
  young: number;
  mature: number;
  relearning: number;
  overdue: number;
  total: number;
  avgStability: number;
  avgDifficulty: number;
  retentionRate: number;
  avgInterval: number;
  expectedReviews: number;
  expectedWorkload: number; // en minutos
  retentionPrediction: number;
}

export function useFSRS(cards: Card[], userId: string) {
  const [sessionStats, setSessionStats] = useState<FSRSSessionStats>({
    cardsStudied: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    averageResponseTime: 0,
    sessionDuration: 0,
    totalTimeSpent: 0,
    retentionRate: 0,
    difficultyDistribution: {}
  });

  const [sessionStartTime] = useState(new Date());
  const [currentCardStartTime, setCurrentCardStartTime] = useState<Date | null>(null);

  // Obtener tarjetas para revisar usando FSRS
  const cardsForReview = useMemo(() => {
    return getCardsForReviewFSRS(cards);
  }, [cards]);

  // Obtener estadísticas y análisis FSRS
  const analytics = useMemo((): FSRSAnalytics => {
    const stats = getFSRSStats(cards);
    const prediction = predictPerformanceFSRS(cards, 30);
    
    return {
      ...stats,
      ...prediction
    };
  }, [cards]);

  // Obtener recomendaciones de estudio
  const recommendations = useMemo((): FSRSRecommendations => {
    const recs = getStudyRecommendationsFSRS(cards);
    
    // Calcular próxima sesión de estudio
    const nextStudyHours = analytics.overdue > 0 ? 0 : 
                          analytics.expectedReviews > 20 ? 4 : 
                          analytics.expectedReviews > 10 ? 8 : 24;
    
    const nextSession = new Date();
    nextSession.setHours(nextSession.getHours() + nextStudyHours);
    
    return {
      ...recs,
      nextStudySession: nextSession.toLocaleString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  }, [cards, analytics]);

  // Función para procesar respuesta usando FSRS
  const processAnswer = useCallback(async (
    card: Card, 
    known: boolean,
    responseTime?: number,
    onLocalUpdate?: (cardId: string, known: boolean) => void
  ): Promise<{
    updatedCard: Card;
    fsrsData: FSRSData;
    rating: Rating;
    interval: number;
    nextReviewDate: Date;
  }> => {
    const reviewTime = new Date();
    const actualResponseTime = responseTime || 
      (currentCardStartTime ? reviewTime.getTime() - currentCardStartTime.getTime() : 30000);

    // Calcular próxima revisión con FSRS
    const fsrsResult = calculateNextReviewFSRS(card, known, actualResponseTime, reviewTime);
    
    // Crear tarjeta actualizada
    const updatedCard: Card = {
      ...card,
      difficulty: fsrsResult.newDifficulty,
      reviewCount: card.reviewCount + 1,
      lastReviewed: reviewTime,
      nextReview: fsrsResult.nextReviewDate,
      hasBeenWrong: !known || card.hasBeenWrong,
      wasWrongInSession: !known,
      
      // Campos FSRS específicos
      easeFactor: fsrsResult.fsrsData.stability,
      srsInterval: fsrsResult.interval,
      repetitions: fsrsResult.fsrsData.reps,
      lastScore: known ? fsrsResult.newDifficulty : 1,
      intervalModifier: 1,
      responseTime: actualResponseTime
    };

    // Actualizar estadísticas de la sesión
    setSessionStats(prev => {
      const newStats = {
        ...prev,
        cardsStudied: prev.cardsStudied + 1,
        correctAnswers: known ? prev.correctAnswers + 1 : prev.correctAnswers,
        incorrectAnswers: known ? prev.incorrectAnswers : prev.incorrectAnswers + 1,
        totalTimeSpent: prev.totalTimeSpent + actualResponseTime,
        sessionDuration: Date.now() - sessionStartTime.getTime(),
        difficultyDistribution: {
          ...prev.difficultyDistribution,
          [fsrsResult.newDifficulty]: (prev.difficultyDistribution[fsrsResult.newDifficulty] || 0) + 1
        }
      };
      
      newStats.averageResponseTime = newStats.totalTimeSpent / newStats.cardsStudied;
      newStats.retentionRate = (newStats.correctAnswers / newStats.cardsStudied) * 100;
      
      return newStats;
    });

    // Actualizar en la base de datos usando cardService
    try {
      await cardService.updateCardDifficulty(card.id, userId, fsrsResult.newDifficulty, {
        lastReviewed: reviewTime,
        nextReview: fsrsResult.nextReviewDate,
        reviewCount: card.reviewCount + 1,
        hasBeenWrong: !known || card.hasBeenWrong,
        wasWrongInSession: !known,
        easeFactor: fsrsResult.fsrsData.stability,
        srsInterval: fsrsResult.interval,
        repetitions: fsrsResult.fsrsData.reps,
        lastScore: known ? fsrsResult.newDifficulty : 1,
        intervalModifier: 1,
        responseTime: actualResponseTime
      });

      // No llamar onLocalUpdate aquí ya que la actualización ya se hizo en la base de datos
      // El estado local se actualizará a través de la recarga de datos

    } catch (error) {
      console.error('Error actualizando tarjeta con FSRS:', error);
      throw error; // Re-throw para que StudySession pueda manejar el error
    }

    return {
      updatedCard,
      fsrsData: fsrsResult.fsrsData,
      rating: fsrsResult.rating,
      interval: fsrsResult.interval,
      nextReviewDate: fsrsResult.nextReviewDate
    };
  }, [currentCardStartTime, sessionStartTime, userId]);

  // Iniciar cronómetro para una tarjeta
  const startCardTimer = useCallback(() => {
    setCurrentCardStartTime(new Date());
  }, []);

  // Obtener información de rendimiento de una tarjeta específica
  const getCardPerformance = useCallback((card: Card) => {
    const now = new Date();
    const nextReview = new Date(card.nextReview);
    const overdueDays = Math.max(0, Math.floor((now.getTime() - nextReview.getTime()) / (1000 * 60 * 60 * 24)));
    
    let status: 'new' | 'learning' | 'young' | 'mature' | 'overdue' | 'relearning' = 'new';
    let color = 'text-blue-600';
    
    if (card.reviewCount === 0) {
      status = 'new';
      color = 'text-blue-600';
    } else if (overdueDays > 0) {
      status = 'overdue';
      color = 'text-red-600';
    } else if (card.hasBeenWrong && (card.srsInterval || 1) < 7) {
      status = 'relearning';
      color = 'text-orange-600';
    } else if ((card.srsInterval || 1) < 21) {
      status = 'learning';
      color = 'text-yellow-600';
    } else {
      status = 'mature';
      color = 'text-green-600';
    }

    return {
      status,
      color,
      overdueDays,
      interval: card.srsInterval || 1,
      stability: card.easeFactor || 1,
      difficulty: card.difficulty,
      repetitions: card.repetitions || 0,
      lapses: card.hasBeenWrong ? 1 : 0
    };
  }, []);

  // Reiniciar estadísticas de la sesión
  const resetSessionStats = useCallback(() => {
    setSessionStats({
      cardsStudied: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      averageResponseTime: 0,
      sessionDuration: 0,
      totalTimeSpent: 0,
      retentionRate: 0,
      difficultyDistribution: {}
    });
  }, []);

  // Obtener resumen de la sesión
  const getSessionSummary = useCallback(() => {
    const duration = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000 / 60); // en minutos
    const efficiency = sessionStats.cardsStudied > 0 ? 
      Math.round((sessionStats.cardsStudied / Math.max(duration, 1)) * 60 * 100) / 100 : 0; // tarjetas por hora
    
    return {
      ...sessionStats,
      sessionDuration: duration,
      efficiency,
      averageResponseTimeSeconds: Math.round(sessionStats.averageResponseTime / 1000),
      studyEffectiveness: sessionStats.retentionRate >= 85 ? 'Excelente' :
                         sessionStats.retentionRate >= 70 ? 'Bueno' :
                         sessionStats.retentionRate >= 50 ? 'Regular' : 'Necesita mejora'
    };
  }, [sessionStats, sessionStartTime]);

  return {
    // Datos principales
    cardsForReview,
    analytics,
    recommendations,
    sessionStats,
    
    // Funciones principales
    processAnswer,
    startCardTimer,
    getCardPerformance,
    getSessionSummary,
    resetSessionStats,
    
    // Información útil
    hasCardsToReview: cardsForReview.length > 0,
    isSessionActive: sessionStats.cardsStudied > 0,
    currentSessionDuration: Math.floor((Date.now() - sessionStartTime.getTime()) / 1000 / 60)
  };
} 