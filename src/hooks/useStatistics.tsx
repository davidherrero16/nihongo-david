
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { useSupabaseDecks } from "./useSupabaseDecks";

export interface StudySession {
  id: string;
  date: string;
  cardsStudied: number;
  correctAnswers: number;
  timeSpent: number; // en minutos
  deckId: string;
  deckName: string;
}

export interface DailyStats {
  date: string;
  cardsStudied: number;
  timeSpent: number;
  accuracy: number;
}

export interface WeeklyStats {
  week: string;
  cardsStudied: number;
  timeSpent: number;
  accuracy: number;
}

export interface MonthlyStats {
  month: string;
  cardsStudied: number;
  timeSpent: number;
  accuracy: number;
}

export interface OverallStats {
  totalCards: number;
  cardsLearned: number; // nivel 7+
  cardsInProgress: number; // nivel 1-6
  cardsNew: number; // nivel 0
  totalTimeSpent: number;
  averageAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
}

export const useStatistics = () => {
  const { user } = useAuth();
  const { decks, getAllCards } = useSupabaseDecks();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar sesiones desde localStorage
  useEffect(() => {
    if (user) {
      const savedSessions = localStorage.getItem(`study-sessions-${user.id}`);
      if (savedSessions) {
        try {
          setSessions(JSON.parse(savedSessions));
        } catch (error) {
          console.error('Error loading sessions:', error);
          setSessions([]);
        }
      }
    }
    setLoading(false);
  }, [user]);

  // Guardar sesiones en localStorage
  useEffect(() => {
    if (user && sessions.length > 0) {
      localStorage.setItem(`study-sessions-${user.id}`, JSON.stringify(sessions));
    }
  }, [user, sessions]);

  // Añadir nueva sesión de estudio
  const addStudySession = (session: Omit<StudySession, 'id' | 'date'>) => {
    const newSession: StudySession = {
      ...session,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    };
    
    setSessions(prev => [...prev, newSession]);
  };

  // Calcular estadísticas diarias
  const getDailyStats = (days: number = 30): DailyStats[] => {
    const today = new Date();
    const dailyStats: DailyStats[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const daySessions = sessions.filter(s => s.date === dateStr);
      const cardsStudied = daySessions.reduce((sum, s) => sum + s.cardsStudied, 0);
      const timeSpent = daySessions.reduce((sum, s) => sum + s.timeSpent, 0);
      const totalCorrect = daySessions.reduce((sum, s) => sum + s.correctAnswers, 0);
      const accuracy = cardsStudied > 0 ? (totalCorrect / cardsStudied) * 100 : 0;

      dailyStats.push({
        date: dateStr,
        cardsStudied,
        timeSpent,
        accuracy
      });
    }

    return dailyStats;
  };

  // Calcular estadísticas semanales
  const getWeeklyStats = (weeks: number = 12): WeeklyStats[] => {
    const weeklyStats: WeeklyStats[] = [];
    const today = new Date();

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (today.getDay() + 7 * i));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekSessions = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });

      const cardsStudied = weekSessions.reduce((sum, s) => sum + s.cardsStudied, 0);
      const timeSpent = weekSessions.reduce((sum, s) => sum + s.timeSpent, 0);
      const totalCorrect = weekSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
      const accuracy = cardsStudied > 0 ? (totalCorrect / cardsStudied) * 100 : 0;

      weeklyStats.push({
        week: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
        cardsStudied,
        timeSpent,
        accuracy
      });
    }

    return weeklyStats;
  };

  // Calcular estadísticas mensuales
  const getMonthlyStats = (months: number = 6): MonthlyStats[] => {
    const monthlyStats: MonthlyStats[] = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

      const monthSessions = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate >= month && sessionDate <= monthEnd;
      });

      const cardsStudied = monthSessions.reduce((sum, s) => sum + s.cardsStudied, 0);
      const timeSpent = monthSessions.reduce((sum, s) => sum + s.timeSpent, 0);
      const totalCorrect = monthSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
      const accuracy = cardsStudied > 0 ? (totalCorrect / cardsStudied) * 100 : 0;

      monthlyStats.push({
        month: month.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        cardsStudied,
        timeSpent,
        accuracy
      });
    }

    return monthlyStats;
  };

  // Calcular racha actual y más larga
  const calculateStreaks = () => {
    const today = new Date();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Obtener todas las fechas únicas con sesiones
    const uniqueDates = [...new Set(sessions.map(s => s.date))].sort();
    
    // Calcular racha actual (desde hoy hacia atrás)
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (uniqueDates.includes(dateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calcular racha más larga
    for (const date of uniqueDates) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
      
      // Verificar si hay un gap en las fechas
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDateStr = nextDay.toISOString().split('T')[0];
      
      if (!uniqueDates.includes(nextDateStr)) {
        tempStreak = 0;
      }
    }

    return { currentStreak, longestStreak };
  };

  // Calcular estadísticas generales
  const getOverallStats = (): OverallStats => {
    const allCards = getAllCards();
    const { currentStreak, longestStreak } = calculateStreaks();

    const totalCards = allCards.length;
    const cardsLearned = allCards.filter(card => card.difficulty >= 7).length;
    const cardsInProgress = allCards.filter(card => card.difficulty >= 1 && card.difficulty < 7).length;
    const cardsNew = allCards.filter(card => card.difficulty === 0).length;

    const totalTimeSpent = sessions.reduce((sum, s) => sum + s.timeSpent, 0);
    const totalCardsStudied = sessions.reduce((sum, s) => sum + s.cardsStudied, 0);
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const averageAccuracy = totalCardsStudied > 0 ? (totalCorrect / totalCardsStudied) * 100 : 0;

    return {
      totalCards,
      cardsLearned,
      cardsInProgress,
      cardsNew,
      totalTimeSpent,
      averageAccuracy,
      currentStreak,
      longestStreak,
      totalSessions: sessions.length
    };
  };

  // Obtener datos para el heatmap
  const getHeatmapData = (year?: number) => {
    const targetYear = year || new Date().getFullYear();
    const yearSessions = sessions.filter(s => new Date(s.date).getFullYear() === targetYear);
    
    const heatmapData: { [date: string]: number } = {};
    
    yearSessions.forEach(session => {
      if (heatmapData[session.date]) {
        heatmapData[session.date] += session.cardsStudied;
      } else {
        heatmapData[session.date] = session.cardsStudied;
      }
    });

    return heatmapData;
  };

  // Obtener estadísticas por deck
  const getDeckAnalysis = () => {
    const deckStats = decks.map(deck => {
      const deckSessions = sessions.filter(s => s.deckId === deck.id);
      const totalCards = deck.cards.length;
      const cardsLearned = deck.cards.filter(card => card.difficulty >= 7).length;
      const averageDifficulty = deck.cards.reduce((sum, card) => sum + card.difficulty, 0) / totalCards || 0;
      const totalTimeSpent = deckSessions.reduce((sum, s) => sum + s.timeSpent, 0);
      const totalStudied = deckSessions.reduce((sum, s) => sum + s.cardsStudied, 0);
      const accuracy = totalStudied > 0 ? 
        (deckSessions.reduce((sum, s) => sum + s.correctAnswers, 0) / totalStudied) * 100 : 0;

      return {
        id: deck.id,
        name: deck.name,
        totalCards,
        cardsLearned,
        progress: totalCards > 0 ? (cardsLearned / totalCards) * 100 : 0,
        averageDifficulty,
        totalTimeSpent,
        accuracy,
        lastStudied: deckSessions.length > 0 ? 
          Math.max(...deckSessions.map(s => new Date(s.date).getTime())) : null
      };
    });

    return deckStats.sort((a, b) => b.progress - a.progress);
  };

  return {
    sessions,
    loading,
    addStudySession,
    getDailyStats,
    getWeeklyStats,
    getMonthlyStats,
    getOverallStats,
    getHeatmapData,
    getDeckAnalysis
  };
};
