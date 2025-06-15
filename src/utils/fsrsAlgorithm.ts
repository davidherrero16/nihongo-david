import { 
  FSRS, 
  Card as FSRSCard, 
  Rating, 
  RecordLogItem,
  createEmptyCard,
  generatorParameters,
  State
} from 'ts-fsrs';
import type { Card } from "@/types/deck";

// Tipo Grade derivado de Rating (excluyendo Manual)
type Grade = Exclude<Rating, Rating.Manual>;

// Configuración del algoritmo FSRS
const FSRS_CONFIG = {
  // Retención objetivo (90% por defecto, recomendado 80-90%)
  request_retention: 0.90,
  
  // Intervalo máximo en días
  maximum_interval: 36500, // ~100 años
  
  // Configuraciones adicionales
  enable_fuzz: true,
  enable_short_term: true,
  
  // Pasos de aprendizaje y reaprendizaje
  learning_steps: ['1m', '10m'] as const,
  relearning_steps: ['10m'] as const,
  
  // Parámetros del modelo FSRS (optimizados para aprendizaje general)
  // Estos pueden ser personalizados con datos del usuario
  w: [
    0.5701, 1.4436, 4.1386, 10.9355, 5.1443, 1.2006, 0.8627, 0.0362, 
    1.629, 0.1342, 1.0166, 2.1174, 0.0839, 0.3204, 1.4676, 0.219, 2.8237
  ] as const
};

// Instancia del algoritmo FSRS
const fsrs = new FSRS(generatorParameters(FSRS_CONFIG));

/**
 * Convierte nuestra dificultad y respuesta a grade FSRS
 */
export function difficultyToFSRSGrade(difficulty: number, wasCorrect: boolean): Grade {
  if (!wasCorrect) {
    // Para respuestas incorrectas
    return Rating.Again as Grade;
  }
  
  // Para respuestas correctas, clasificar basado en la dificultad actual
  // Tarjetas más difíciles que se responden correctamente son más significativas
  if (difficulty <= 2) return Rating.Hard as Grade;    // Correcto pero difícil (0-2)
  if (difficulty <= 5) return Rating.Good as Grade;    // Correcto normal (3-5)
  if (difficulty <= 8) return Rating.Good as Grade;    // Correcto bueno (6-8)
  return Rating.Easy as Grade;                         // Correcto muy fácil (9-10)
}

/**
 * Mapeo de rating FSRS a nuestra escala 0-10 con progresión más realista
 */
export function fsrsRatingToDifficulty(rating: Rating, currentDifficulty: number = 0): number {
  switch (rating) {
    case Rating.Again: 
      // Para respuestas incorrectas, reducir significativamente
      return Math.max(0, currentDifficulty - 2);
    
    case Rating.Hard: 
      // Para respuestas correctas pero difíciles, incremento pequeño
      return Math.min(10, currentDifficulty + 0.5);
    
    case Rating.Good: 
      // Para respuestas correctas normales, incremento moderado
      return Math.min(10, currentDifficulty + 1);
    
    case Rating.Easy: 
      // Para respuestas muy fáciles, incremento mayor
      return Math.min(10, currentDifficulty + 1.5);
    
    case Rating.Manual:
    default: 
      return currentDifficulty;
  }
}

/**
 * Convierte una tarjeta de nuestra app a formato FSRS
 */
export function cardToFSRS(card: Card): FSRSCard {
  const fsrsCard = createEmptyCard();
  
  // Si la tarjeta tiene datos FSRS previos, usarlos
  if (card.easeFactor && card.srsInterval && card.repetitions !== undefined) {
    fsrsCard.due = new Date(card.nextReview);
    fsrsCard.stability = card.srsInterval || 1;
    fsrsCard.difficulty = Math.max(1, Math.min(10, card.difficulty));
    fsrsCard.scheduled_days = card.srsInterval || 1;
    fsrsCard.reps = card.repetitions || 0;
    fsrsCard.lapses = card.hasBeenWrong ? 1 : 0;
    
    // Mapear estado basado en condiciones
    if (card.reviewCount === 0) {
      fsrsCard.state = State.New;
    } else if (card.hasBeenWrong && card.srsInterval < 7) {
      fsrsCard.state = State.Relearning;
    } else if (card.srsInterval < 21) {
      fsrsCard.state = State.Learning;
    } else {
      fsrsCard.state = State.Review;
    }
    
    fsrsCard.last_review = card.lastReviewed ? new Date(card.lastReviewed) : undefined;
  }
  
  return fsrsCard;
}

/**
 * Datos extendidos de FSRS para almacenar en la base de datos
 */
export interface FSRSData {
  due: Date;
  stability: number;
  difficulty: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: Date;
}

/**
 * Calcula la próxima revisión usando FSRS
 */
export function calculateNextReviewFSRS(
  card: Card,
  known: boolean,
  responseTime?: number,
  reviewTime?: Date
): {
  nextReviewDate: Date;
  newDifficulty: number;
  fsrsData: FSRSData;
  interval: number;
  rating: Rating;
} {
  // Convertir tarjeta a formato FSRS
  const fsrsCard = cardToFSRS(card);
  
  // Determinar el grade basado en la respuesta
  const grade = difficultyToFSRSGrade(card.difficulty, known);
  
  console.log(`FSRS: Tarjeta "${card.word}" - Dificultad actual: ${card.difficulty}, Respuesta: ${known ? 'Correcta' : 'Incorrecta'}, Grade: ${grade}`);
  
  // Calcular próxima revisión con FSRS
  const schedulingCards = fsrs.repeat(fsrsCard, reviewTime || new Date());
  const selectedCard = schedulingCards[grade];
  
  // Extraer datos del resultado
  const nextReviewDate = selectedCard.card.due;
  const interval = selectedCard.card.scheduled_days;
  const newDifficulty = fsrsRatingToDifficulty(grade, card.difficulty);
  
  console.log(`FSRS: Nueva dificultad: ${newDifficulty}, Intervalo: ${interval} días`);
  
  // Crear datos FSRS para almacenar
  const fsrsData: FSRSData = {
    due: selectedCard.card.due,
    stability: selectedCard.card.stability,
    difficulty: selectedCard.card.difficulty,
    scheduled_days: selectedCard.card.scheduled_days,
    reps: selectedCard.card.reps,
    lapses: selectedCard.card.lapses,
    state: selectedCard.card.state,
    last_review: selectedCard.card.last_review
  };
  
  return {
    nextReviewDate,
    newDifficulty,
    fsrsData,
    interval,
    rating: grade
  };
}

/**
 * Optimiza los parámetros FSRS basándose en el historial del usuario
 */
export function optimizeFSRSParameters(reviewLogs: any[]): number[] {
  try {
    // Esta función requeriría el optimizador FSRS
    // Por ahora, retornamos los parámetros por defecto optimizados
    return Array.from(FSRS_CONFIG.w);
  } catch (error) {
    console.warn('Error optimizando parámetros FSRS:', error);
    return Array.from(FSRS_CONFIG.w);
  }
}

/**
 * Obtiene tarjetas listas para revisar usando lógica FSRS
 */
export function getCardsForReviewFSRS(cards: Card[]): Card[] {
  const now = new Date();
  
  return cards
    .filter(card => {
      const nextReview = new Date(card.nextReview);
      return nextReview <= now;
    })
    .sort((a, b) => {
      // Priorizar por:
      // 1. Estado de la tarjeta (nuevas, en aprendizaje, revisión)
      // 2. Tarjetas vencidas (más vencidas primero)
      // 3. Dificultad (más difíciles primero)
      
      const aOverdue = Math.max(0, now.getTime() - new Date(a.nextReview).getTime());
      const bOverdue = Math.max(0, now.getTime() - new Date(b.nextReview).getTime());
      
      // Priorizar tarjetas más vencidas
      if (aOverdue !== bOverdue) {
        return bOverdue - aOverdue;
      }
      
      // Priorizar tarjetas más difíciles
      if (a.difficulty !== b.difficulty) {
        return a.difficulty - b.difficulty;
      }
      
      // Priorizar tarjetas que han fallado antes
      if (a.hasBeenWrong !== b.hasBeenWrong) {
        return a.hasBeenWrong ? -1 : 1;
      }
      
      return new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime();
    });
}

/**
 * Calcula estadísticas avanzadas del rendimiento FSRS
 */
export function getFSRSStats(cards: Card[]) {
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  
  const stats = {
    new: 0,           // Tarjetas nuevas (nunca estudiadas)
    learning: 0,      // En proceso de aprendizaje
    young: 0,         // Intervalo < 21 días
    mature: 0,        // Intervalo >= 21 días
    relearning: 0,    // Reaprendiendo después de fallo
    overdue: 0,       // Vencidas
    total: cards.length,
    
    // Estadísticas adicionales FSRS
    avgStability: 0,
    avgDifficulty: 0,
    retentionRate: 0,
    avgInterval: 0
  };
  
  let totalStability = 0;
  let totalDifficulty = 0;
  let totalInterval = 0;
  let reviewedCards = 0;
  let correctAnswers = 0;
  
  cards.forEach(card => {
    const nextReview = new Date(card.nextReview);
    const interval = card.srsInterval || 1;
    
    // Clasificar por estado
    if (card.reviewCount === 0) {
      stats.new++;
    } else if (nextReview < now) {
      stats.overdue++;
    } else if (card.hasBeenWrong && interval < 7) {
      stats.relearning++;
    } else if (interval < 21) {
      stats.young++;
    } else {
      stats.mature++;
    }
    
    // Acumular estadísticas
    if (card.reviewCount > 0) {
      reviewedCards++;
      totalInterval += interval;
      totalDifficulty += card.difficulty;
      
      if (card.difficulty >= 6) {
        correctAnswers++;
      }
    }
    
    // Estabilidad (usar intervalo como proxy)
    totalStability += interval;
  });
  
  // Calcular promedios
  if (cards.length > 0) {
    stats.avgStability = totalStability / cards.length;
    stats.avgInterval = totalInterval / Math.max(reviewedCards, 1);
  }
  
  if (reviewedCards > 0) {
    stats.avgDifficulty = totalDifficulty / reviewedCards;
    stats.retentionRate = (correctAnswers / reviewedCards) * 100;
  }
  
  return stats;
}

/**
 * Predice el rendimiento futuro usando FSRS
 */
export function predictPerformanceFSRS(cards: Card[], days: number = 30): {
  expectedReviews: number;
  expectedWorkload: number;
  retentionPrediction: number;
} {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  let expectedReviews = 0;
  let expectedWorkload = 0;
  let totalPredictedRetention = 0;
  
  cards.forEach(card => {
    const fsrsCard = cardToFSRS(card);
    
    // Simular revisiones futuras
    let currentDate = new Date();
    let tempCard = fsrsCard;
    
    while (currentDate < endDate) {
      if (tempCard.due <= endDate) {
        expectedReviews++;
        
        // Estimar tiempo de revisión (30 segundos base + factor de dificultad)
        const reviewTime = 30 + (card.difficulty * 5);
        expectedWorkload += reviewTime;
        
        // Simular respuesta basada en dificultad histórica
        const successRate = Math.max(0.5, (card.difficulty / 10));
        const grade = Math.random() < successRate ? Rating.Good as Grade : Rating.Again as Grade;
        
        // Programar próxima revisión
        const scheduling = fsrs.repeat(tempCard, tempCard.due);
        tempCard = scheduling[grade].card;
        
        totalPredictedRetention += successRate;
      } else {
        break;
      }
      
      currentDate = new Date(tempCard.due);
    }
  });
  
  return {
    expectedReviews,
    expectedWorkload: Math.round(expectedWorkload / 60), // en minutos
    retentionPrediction: expectedReviews > 0 ? (totalPredictedRetention / expectedReviews) * 100 : 90
  };
}

/**
 * Genera recomendaciones de estudio basadas en FSRS
 */
export function getStudyRecommendationsFSRS(cards: Card[]): {
  recommendedDailyCards: number;
  optimalStudyTime: string;
  difficultyFocus: string;
  retentionAdvice: string;
} {
  const stats = getFSRSStats(cards);
  const prediction = predictPerformanceFSRS(cards, 7);
  
  const recommendedDailyCards = Math.min(50, Math.max(10, Math.ceil(prediction.expectedReviews / 7)));
  
  let optimalStudyTime = "Mañana";
  if (stats.overdue > 20) optimalStudyTime = "Lo antes posible";
  else if (stats.overdue > 10) optimalStudyTime = "Hoy";
  
  let difficultyFocus = "Equilibrado";
  if (stats.avgDifficulty < 4) difficultyFocus = "Enfócate en tarjetas difíciles";
  else if (stats.avgDifficulty > 7) difficultyFocus = "Añade más tarjetas nuevas";
  
  let retentionAdvice = "Rendimiento óptimo";
  if (stats.retentionRate < 70) retentionAdvice = "Considera reducir la carga diaria";
  else if (stats.retentionRate > 95) retentionAdvice = "Puedes aumentar la carga diaria";
  
  return {
    recommendedDailyCards,
    optimalStudyTime,
    difficultyFocus,
    retentionAdvice
  };
}

/**
 * Función de utilidad para verificar el estado de las tarjetas
 */
export function debugCardState(cards: Card[], cardId?: string) {
  const targetCards = cardId ? cards.filter(c => c.id === cardId) : cards;
  
  console.log(`=== Estado de ${targetCards.length} tarjeta(s) ===`);
  targetCards.forEach(card => {
    console.log(`Tarjeta: "${card.word}"`);
    console.log(`  - ID: ${card.id}`);
    console.log(`  - Dificultad: ${card.difficulty}`);
    console.log(`  - Review count: ${card.reviewCount}`);
    console.log(`  - Has been wrong: ${card.hasBeenWrong}`);
    console.log(`  - Last reviewed: ${card.lastReviewed}`);
    console.log(`  - Next review: ${card.nextReview}`);
    console.log(`  - SRS interval: ${card.srsInterval || 'N/A'}`);
    console.log(`  - Ease factor: ${card.easeFactor || 'N/A'}`);
    console.log(`  - Repetitions: ${card.repetitions || 'N/A'}`);
    console.log('---');
  });
} 