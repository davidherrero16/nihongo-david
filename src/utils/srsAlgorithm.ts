import type { Card } from "@/types/deck";

// Interfaz para almacenar los datos del SRS en la base de datos
export interface SRSData {
  easeFactor: number;
  interval: number;
  repetitions: number;
  lastScore: number;
  intervalModifier: number;
}

// Tipos de respuestas del usuario basados en la escala 0-10
export enum AnswerQuality {
  BLACKOUT = 0,        // No recordé nada
  INCORRECT = 1,       // Incorrecto pero familiar
  INCORRECT_EASY = 2,  // Incorrecto pero me acordé al ver respuesta
  DIFFICULT = 3,       // Correcto pero muy difícil
  HESITANT = 4,        // Correcto pero con dudas
  NORMAL = 5,          // Correcto con esfuerzo normal
  EASY = 6,            // Correcto sin mucho esfuerzo
  VERY_EASY = 7,       // Correcto muy fácil
  PERFECT = 8,         // Perfecto, inmediato
  TOO_EASY = 9,        // Demasiado fácil
  MASTERED = 10        // Completamente dominado
}

// Configuración del algoritmo SRS
const SRS_CONFIG = {
  // Factor de facilidad inicial (como en SM-2)
  INITIAL_EASE_FACTOR: 2.5,
  
  // Intervalos iniciales para nuevas tarjetas (en días)
  INITIAL_INTERVALS: [1, 6], // Primera vez 1 día, segunda vez 6 días
  
  // Factor mínimo de facilidad
  MIN_EASE_FACTOR: 1.3,
  
  // Factor máximo de facilidad
  MAX_EASE_FACTOR: 3.0,
  
  // Modificadores de facilidad basados en la respuesta
  EASE_MODIFIERS: {
    [AnswerQuality.BLACKOUT]: -0.8,
    [AnswerQuality.INCORRECT]: -0.54,
    [AnswerQuality.INCORRECT_EASY]: -0.32,
    [AnswerQuality.DIFFICULT]: -0.14,
    [AnswerQuality.HESITANT]: -0.02,
    [AnswerQuality.NORMAL]: 0,
    [AnswerQuality.EASY]: 0.05,
    [AnswerQuality.VERY_EASY]: 0.10,
    [AnswerQuality.PERFECT]: 0.15,
    [AnswerQuality.TOO_EASY]: 0.20,
    [AnswerQuality.MASTERED]: 0.25
  },
  
  // Multiplicadores de intervalo según respuesta
  INTERVAL_MODIFIERS: {
    [AnswerQuality.BLACKOUT]: 0.2,
    [AnswerQuality.INCORRECT]: 0.4,
    [AnswerQuality.INCORRECT_EASY]: 0.6,
    [AnswerQuality.DIFFICULT]: 0.8,
    [AnswerQuality.HESITANT]: 0.9,
    [AnswerQuality.NORMAL]: 1.0,
    [AnswerQuality.EASY]: 1.1,
    [AnswerQuality.VERY_EASY]: 1.2,
    [AnswerQuality.PERFECT]: 1.3,
    [AnswerQuality.TOO_EASY]: 1.4,
    [AnswerQuality.MASTERED]: 1.5
  },
  
  // Fuzz factor para aleatorizar ligeramente los intervalos
  FUZZ_RANGE: 0.05, // ±5% de variación
  
  // Intervalo máximo en días (aproximadamente 1 año)
  MAX_INTERVAL: 365,
  
  // Graduación después de X repeticiones exitosas
  GRADUATION_THRESHOLD: 2
};

/**
 * Convierte la escala 0-10 a AnswerQuality enum
 */
export function difficultyToAnswerQuality(difficulty: number, wasCorrect: boolean): AnswerQuality {
  if (!wasCorrect) {
    // Si fue incorrecta, usar los valores bajos basados en qué tan familiar era
    if (difficulty <= 2) return AnswerQuality.BLACKOUT;
    if (difficulty <= 4) return AnswerQuality.INCORRECT;
    return AnswerQuality.INCORRECT_EASY;
  }
  
  // Si fue correcta, mapear el nivel de dificultad a calidad de respuesta
  if (difficulty === 10) return AnswerQuality.MASTERED;
  if (difficulty === 9) return AnswerQuality.TOO_EASY;
  if (difficulty === 8) return AnswerQuality.PERFECT;
  if (difficulty === 7) return AnswerQuality.VERY_EASY;
  if (difficulty === 6) return AnswerQuality.EASY;
  if (difficulty === 5) return AnswerQuality.NORMAL;
  if (difficulty === 4) return AnswerQuality.HESITANT;
  return AnswerQuality.DIFFICULT; // 3 o menos
}

/**
 * Obtiene datos SRS de una tarjeta, con valores por defecto si no existen
 */
export function getSRSData(card: Card): SRSData {
  // Si la tarjeta ya tiene datos SRS en un campo de metadatos, usarlos
  // Si no, crear datos iniciales basados en el estado actual de la tarjeta
  return {
    easeFactor: SRS_CONFIG.INITIAL_EASE_FACTOR,
    interval: 1,
    repetitions: card.reviewCount || 0,
    lastScore: card.difficulty >= 7 ? 6 : (card.difficulty >= 4 ? 3 : 1),
    intervalModifier: 1.0
  };
}

/**
 * Aplica fuzz (aleatorización) al intervalo
 */
function applyFuzz(interval: number): number {
  const fuzzRange = SRS_CONFIG.FUZZ_RANGE;
  const randomFactor = 1 + (Math.random() - 0.5) * 2 * fuzzRange;
  return Math.round(interval * randomFactor);
}

/**
 * Calcula el próximo intervalo y actualiza los datos SRS
 */
export function calculateNextReview(
  card: Card, 
  answerQuality: AnswerQuality,
  isLate: boolean = false,
  daysLate: number = 0
): {
  nextReviewDate: Date;
  newDifficulty: number;
  srsData: SRSData;
  interval: number;
} {
  const currentSRS = getSRSData(card);
  const wasCorrect = answerQuality >= AnswerQuality.DIFFICULT;
  
  let newEaseFactor = currentSRS.easeFactor;
  let newInterval = currentSRS.interval;
  let newRepetitions = currentSRS.repetitions;
  
  // Ajustar factor de facilidad basado en la respuesta
  const easeAdjustment = SRS_CONFIG.EASE_MODIFIERS[answerQuality];
  newEaseFactor = Math.max(
    SRS_CONFIG.MIN_EASE_FACTOR,
    Math.min(SRS_CONFIG.MAX_EASE_FACTOR, newEaseFactor + easeAdjustment)
  );
  
  // Si la respuesta fue incorrecta, reiniciar el proceso de graduación
  if (!wasCorrect) {
    newRepetitions = 0;
    newInterval = SRS_CONFIG.INITIAL_INTERVALS[0]; // Volver a 1 día
  } else {
    newRepetitions += 1;
    
    // Si es una tarjeta nueva o en período de graduación
    if (newRepetitions <= SRS_CONFIG.GRADUATION_THRESHOLD) {
      newInterval = SRS_CONFIG.INITIAL_INTERVALS[Math.min(newRepetitions - 1, 1)];
    } else {
      // Tarjeta graduada: usar fórmula SM-2 modificada
      const intervalModifier = SRS_CONFIG.INTERVAL_MODIFIERS[answerQuality];
      newInterval = Math.round(currentSRS.interval * newEaseFactor * intervalModifier);
    }
  }
  
  // Ajustar si la revisión fue tarde
  if (isLate && wasCorrect && daysLate > 0) {
    // Si respondió correctamente pese a estar tarde, la tarjeta es más fácil de lo pensado
    const bonusMultiplier = 1 + (daysLate / currentSRS.interval) * 0.1;
    newInterval = Math.round(newInterval * bonusMultiplier);
    newEaseFactor = Math.min(SRS_CONFIG.MAX_EASE_FACTOR, newEaseFactor + 0.05);
  }
  
  // Aplicar límites
  newInterval = Math.min(SRS_CONFIG.MAX_INTERVAL, Math.max(1, newInterval));
  
  // Aplicar fuzz para evitar que todas las tarjetas se revisen el mismo día
  const fuzzedInterval = applyFuzz(newInterval);
  
  // Calcular nueva dificultad basada en SRS
  let newDifficulty: number;
  if (!wasCorrect) {
    newDifficulty = Math.max(0, card.difficulty - 2);
  } else {
    // Mapear factor de facilidad y repeticiones a escala 0-10
    const progressFactor = Math.min(newRepetitions / 10, 1); // Progreso hacia maestría
    const easeFactor = (newEaseFactor - SRS_CONFIG.MIN_EASE_FACTOR) / 
                       (SRS_CONFIG.MAX_EASE_FACTOR - SRS_CONFIG.MIN_EASE_FACTOR);
    
    newDifficulty = Math.round(progressFactor * 5 + easeFactor * 3 + answerQuality * 0.2);
    newDifficulty = Math.min(10, Math.max(0, newDifficulty));
  }
  
  // Crear fecha de próxima revisión
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + fuzzedInterval);
  
  const newSRSData: SRSData = {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    lastScore: answerQuality,
    intervalModifier: SRS_CONFIG.INTERVAL_MODIFIERS[answerQuality]
  };
  
  return {
    nextReviewDate,
    newDifficulty,
    srsData: newSRSData,
    interval: fuzzedInterval
  };
}

/**
 * Obtiene tarjetas listas para revisar basándose en el SRS
 */
export function getCardsForReview(cards: Card[]): Card[] {
  const now = new Date();
  
  return cards
    .filter(card => {
      const nextReview = new Date(card.nextReview);
      return nextReview <= now;
    })
    .sort((a, b) => {
      // Priorizar por:
      // 1. Tarjetas que han fallado antes (has_been_wrong)
      // 2. Menor dificultad (más difíciles primero)
      // 3. Fecha de revisión más temprana
      
      if (a.hasBeenWrong !== b.hasBeenWrong) {
        return a.hasBeenWrong ? -1 : 1;
      }
      
      if (a.difficulty !== b.difficulty) {
        return a.difficulty - b.difficulty;
      }
      
      return new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime();
    });
}

/**
 * Calcula estadísticas del deck basadas en SRS
 */
export function getDeckSRSStats(cards: Card[]) {
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  
  const stats = {
    new: 0,        // Nivel 0
    learning: 0,   // Niveles 1-3, próxima revisión < 7 días
    young: 0,      // Niveles 4-6, próxima revisión < 21 días  
    mature: 0,     // Niveles 7-8, próxima revisión >= 21 días
    mastered: 0,   // Niveles 9-10
    overdue: 0     // Vencidas
  };
  
  cards.forEach(card => {
    const nextReview = new Date(card.nextReview);
    const daysUntilReview = (nextReview.getTime() - now.getTime()) / oneDay;
    
    if (nextReview < now) {
      stats.overdue++;
      return;
    }
    
    if (card.difficulty === 0) {
      stats.new++;
    } else if (card.difficulty <= 3) {
      stats.learning++;
    } else if (card.difficulty <= 6) {
      stats.young++;
    } else if (card.difficulty <= 8) {
      stats.mature++;
    } else {
      stats.mastered++;
    }
  });
  
  return stats;
}

/**
 * Mapea respuesta simple (lo sé/no lo sé) a AnswerQuality basándose en el historial
 */
export function mapSimpleAnswerToQuality(
  known: boolean, 
  card: Card, 
  responseTime?: number
): AnswerQuality {
  if (!known) {
    // Determinar tipo de fallo basado en el nivel de dificultad actual
    if (card.difficulty <= 2) return AnswerQuality.BLACKOUT;
    if (card.difficulty <= 4) return AnswerQuality.INCORRECT;
    return AnswerQuality.INCORRECT_EASY;
  }
  
  // Para respuestas correctas, determinar calidad basándose en:
  // - Nivel de dificultad actual
  // - Tiempo de respuesta (si está disponible)
  // - Historial de revisiones
  
  const baseQuality = card.difficulty >= 8 ? AnswerQuality.EASY : 
                     card.difficulty >= 6 ? AnswerQuality.NORMAL :
                     card.difficulty >= 4 ? AnswerQuality.HESITANT :
                     AnswerQuality.DIFFICULT;
  
  // Ajustar basándose en tiempo de respuesta si está disponible
  if (responseTime !== undefined) {
    // Tiempos rápidos (< 3 segundos) mejoran la calidad
    // Tiempos lentos (> 10 segundos) la empeoran
    if (responseTime < 3000 && baseQuality < AnswerQuality.PERFECT) {
      return Math.min(AnswerQuality.PERFECT, baseQuality + 1);
    } else if (responseTime > 10000 && baseQuality > AnswerQuality.DIFFICULT) {
      return Math.max(AnswerQuality.DIFFICULT, baseQuality - 1);
    }
  }
  
  return baseQuality;
} 