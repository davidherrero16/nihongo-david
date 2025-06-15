import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, RotateCcw, ArrowRight, Brain, Clock, Target } from "lucide-react";
import FlashCard from "@/components/FlashCard";
import type { Card as CardType } from "@/types/deck";
import { useFSRS } from "@/hooks/useFSRS";
import { useAuth } from "@/hooks/useAuth";
import FSRSInfo from "@/components/FSRSInfo";

interface StudySessionProps {
  cards: CardType[];
  packSize: number;
  onComplete: (finalStats: { correct: number; total: number }) => void;
  onUpdateCard: (cardId: string, known: boolean) => void;
  studyMode: 'easy' | 'hard';
  deckId: string;
  onResetSessionMarks: () => void;
}

interface SessionResult {
  cardId: string;
  known: boolean;
  card: CardType;
}

const StudySession = ({ cards, packSize, onComplete, onUpdateCard, studyMode, deckId, onResetSessionMarks }: StudySessionProps) => {
  // Hooks
  const { user } = useAuth();
  const { 
    processAnswer, 
    startCardTimer, 
    getCardPerformance, 
    analytics, 
    recommendations,
    sessionStats,
    getSessionSummary,
    resetSessionStats,
    hasCardsToReview,
    isSessionActive 
  } = useFSRS(cards, user?.id || '');
  
  // Filtrar tarjetas con IDs válidos y tomar exactamente packSize tarjetas
  const validCards = cards.filter(card => !card.id.startsWith('temp_'));
  const initialCards = validCards.slice(0, packSize);
  
  console.log(`Iniciando sesión FSRS con ${initialCards.length} tarjetas válidas de ${cards.length} disponibles`);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<SessionResult[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  const [sessionCards, setSessionCards] = useState<CardType[]>(
    initialCards.map(card => ({ ...card, wasWrongInSession: false }))
  );
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [showFSRSInfo, setShowFSRSInfo] = useState(false);

  // Obtener tarjetas no completadas para navegar
  const remainingCards = sessionCards.filter(card => !completedCards.has(card.id));
  const currentCard = remainingCards.length > 0 ? remainingCards[currentIndex % remainingCards.length] : null;
  const totalCards = initialCards.length;
  const progress = (completedCards.size / totalCards) * 100;

  console.log(`Estado actual: ${completedCards.size}/${totalCards} completadas, ${remainingCards.length} restantes, índice: ${currentIndex}`);

  // Inicializar cronómetro para la primera tarjeta
  useEffect(() => {
    if (currentCard) {
      startCardTimer();
    }
  }, [currentCard, startCardTimer]);

  const handleAnswer = async (known: boolean) => {
    if (!currentCard || !user) return;

    console.log(`FSRS: Respuesta para tarjeta ${currentCard.word}: ${known ? 'Correcta' : 'Incorrecta'}`);

    try {
      // Procesar respuesta con FSRS
      const fsrsResult = await processAnswer(currentCard, known);

      console.log(`FSRS: Tarjeta procesada exitosamente. Próximo intervalo: ${fsrsResult.interval} días`);
      
      // Guardar resultado de la sesión con información FSRS
      const result: SessionResult = {
        cardId: currentCard.id,
        known,
        card: fsrsResult.updatedCard
      };

      setSessionResults(prev => [...prev, result]);
      
      // Actualizar la tarjeta en el estado local también (para compatibilidad)
      onUpdateCard(currentCard.id, known);

      if (known) {
        // Si es correcta, marcar como completada
        const newCompletedCards = new Set([...completedCards, currentCard.id]);
        setCompletedCards(newCompletedCards);
        
        console.log(`FSRS: Tarjeta ${currentCard.word} completada. Completadas: ${newCompletedCards.size}/${totalCards}`);
        
        // Verificar si hemos completado todas las tarjetas originales
        if (newCompletedCards.size >= totalCards) {
          console.log('FSRS: Todas las tarjetas completadas, mostrando resumen');
          setShowSummary(true);
          return;
        }
        
        // Calcular el siguiente índice para tarjetas restantes
        const newRemainingCards = sessionCards.filter(card => !newCompletedCards.has(card.id));
        if (newRemainingCards.length === 0) {
          console.log('FSRS: No quedan tarjetas en la ronda actual, mostrando resumen');
          setShowSummary(true);
          return;
        }
        
        // Ajustar el índice para la siguiente tarjeta disponible
        setCurrentIndex(prev => prev % newRemainingCards.length);
      } else {
        // Si es incorrecta, marcar como incorrecta en sesión y continuar
        setSessionCards(prev => prev.map(card => 
          card.id === currentCard.id
            ? { ...card, wasWrongInSession: true }
            : card
        ));
        
        console.log(`FSRS: Tarjeta ${currentCard.word} marcada como incorrecta en sesión`);
        
        // Avanzar al siguiente índice
        if (remainingCards.length > 1) {
          setCurrentIndex(prev => (prev + 1) % remainingCards.length);
        }
      }

    } catch (error) {
      console.error('FSRS: Error inesperado procesando respuesta:', error);
      // Fallback al método original si falla FSRS
      onUpdateCard(currentCard.id, known);
    }
    
    // Reiniciar tiempo de respuesta para la siguiente tarjeta
    setStartTime(new Date());
  };

  const handleFinishSession = () => {
    const correctAnswers = sessionResults.filter(result => result.known).length;
    const totalAnswers = sessionResults.length;
    
    onResetSessionMarks();
    setShowSummary(false);
    setCurrentIndex(0);
    setSessionResults([]);
    setCompletedCards(new Set());
    setSessionCards(initialCards.map(card => ({ ...card, wasWrongInSession: false })));
    resetSessionStats();
    onComplete({ correct: correctAnswers, total: totalAnswers });
  };

  const handleRetryFailed = () => {
    const failedCards = sessionResults.filter(result => !result.known);
    if (failedCards.length === 0) {
      handleFinishSession();
      return;
    }

    // Reiniciar con las tarjetas falladas
    setSessionCards(failedCards.map(result => ({ ...result.card, wasWrongInSession: true })));
    setCurrentIndex(0);
    setSessionResults([]);
    setShowSummary(false);
    setCompletedCards(new Set());
  };

  // Create wrapper functions for button clicks
  const handleFinishButtonClick = () => {
    handleFinishSession();
  };

  const handleBackToStudyClick = () => {
    onComplete({ correct: 0, total: 0 });
  };

  // Verificar si no hay tarjetas válidas para estudiar
  if (initialCards.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No hay tarjetas válidas disponibles para estudiar</p>
        <Button onClick={handleBackToStudyClick} className="mt-4">Volver</Button>
      </div>
    );
  }

  // Verificar si la sesión está completa o debería mostrar resumen
  const shouldShowSummary = showSummary || 
    completedCards.size >= totalCards || 
    (sessionCards.length === 0 && completedCards.size > 0);

  console.log(`Estado de la sesión: showSummary=${showSummary}, completedCards=${completedCards.size}/${totalCards}, sessionCards=${sessionCards.length}, shouldShowSummary=${shouldShowSummary}`);

  if (shouldShowSummary) {
    console.log('Mostrando resumen de sesión');
    const correctAnswers = sessionResults.filter(result => result.known).length;
    const incorrectAnswers = sessionResults.filter(result => !result.known).length;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Sesión Completada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {completedCards.size}/{totalCards}
              </div>
              <p className="text-muted-foreground">Tarjetas dominadas en esta sesión</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Respuestas correctas
                </span>
                <span className="font-semibold text-green-600">{correctAnswers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Respuestas incorrectas
                </span>
                <span className="font-semibold text-red-600">{incorrectAnswers}</span>
              </div>
            </div>

            {/* Información del FSRS */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">Resumen FSRS</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Tarjetas mejoradas:</span>
                  <div className="font-semibold text-green-600">
                    {sessionResults.filter(r => r.known).length}
                  </div>
                </div>
                <div>
                  <span className="text-blue-700">Necesitan repaso:</span>
                  <div className="font-semibold text-orange-600">
                    {sessionResults.filter(r => !r.known).length}
                  </div>
                </div>
              </div>
              
              {incorrectAnswers > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600">
                    💡 Las tarjetas incorrectas aparecerán más frecuentemente según el algoritmo FSRS
                  </p>
                </div>
              )}
              
              {correctAnswers > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600">
                    🎯 Las tarjetas correctas tendrán intervalos más largos para optimizar el aprendizaje
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-center pt-4">
              {incorrectAnswers > 0 && (
                <Button 
                  onClick={handleRetryFailed}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Repasar Falladas
                </Button>
              )}
              <Button 
                onClick={handleFinishButtonClick}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Finalizar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Solo mostrar "No hay tarjetas disponibles" si realmente no hay tarjetas desde el inicio
  if ((!currentCard || sessionCards.length === 0) && completedCards.size === 0) {
    console.log('Mostrando mensaje de no hay tarjetas disponibles');
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No hay tarjetas disponibles para estudiar</p>
        <Button onClick={handleBackToStudyClick} className="mt-4">Volver</Button>
      </div>
    );
  }

  // Verificación adicional para evitar el crash si currentCard es undefined
  if (!currentCard) {
    console.log('currentCard es undefined, esperando...');
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Cargando siguiente tarjeta...</p>
      </div>
    );
  }

  // Calcular información FSRS para mostrar
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty === 0) return "text-gray-500";
    if (difficulty <= 2) return "text-red-500";
    if (difficulty <= 4) return "text-orange-500";
    if (difficulty <= 6) return "text-yellow-500";
    if (difficulty <= 8) return "text-green-500";
    return "text-blue-500";
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty === 0) return "Nueva";
    if (difficulty <= 2) return "Difícil";
    if (difficulty <= 4) return "En progreso";
    if (difficulty <= 6) return "Familiar";
    if (difficulty <= 8) return "Fácil";
    return "Dominada";
  };

  const formatNextReview = (card: CardType) => {
    const nextReview = new Date(card.nextReview);
    const now = new Date();
    const diffDays = Math.ceil((nextReview.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "Vencida";
    if (diffDays === 1) return "Mañana";
    if (diffDays < 7) return `En ${diffDays} días`;
    if (diffDays < 30) return `En ${Math.ceil(diffDays / 7)} semanas`;
    return `En ${Math.ceil(diffDays / 30)} meses`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Información FSRS de la tarjeta actual */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Sistema de Repetición Espaciada FSRS</span>
          </div>
          {isSessionActive && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-xs">Analizando...</span>
            </div>
          )}
        </div>
        
        {currentCard && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-600 font-medium">Dificultad:</span>
              <div className={`text-lg font-bold ${getDifficultyColor(currentCard.difficulty)}`}>
                {getDifficultyLabel(currentCard.difficulty)}
              </div>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Próxima revisión:</span>
              <div className="text-sm text-gray-700">
                {formatNextReview(currentCard)}
              </div>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Estabilidad:</span>
              <div className="text-sm font-semibold">
                {(currentCard.easeFactor || 1).toFixed(1)}
              </div>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Repeticiones:</span>
              <div className="text-sm font-semibold">
                {currentCard.repetitions || 0}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-blue-600">
            💡 Las tarjetas incorrectas aparecerán más frecuentemente según el algoritmo FSRS
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso de la sesión</span>
          <span className="text-sm text-gray-500">
            {completedCards.size} / {totalCards} completadas
          </span>
        </div>
        <Progress value={progress} className="h-3" />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{completedCards.size} correctas</span>
          <span>{sessionResults.filter(r => !r.known).length} incorrectas</span>
        </div>
      </div>

      {/* FlashCard component */}
      {currentCard && (
        <FlashCard
          card={currentCard}
          onAnswer={handleAnswer}
        />
      )}

      {/* Estadísticas FSRS en tiempo real */}
      {isSessionActive && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600" />
            Estadísticas FSRS de la Sesión
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tarjetas estudiadas:</span>
                <span className="font-semibold">{sessionStats.cardsStudied}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Retención:</span>
                <span className={`font-semibold ${
                  sessionStats.retentionRate >= 85 ? 'text-green-600' :
                  sessionStats.retentionRate >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {sessionStats.retentionRate.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tiempo promedio:</span>
                <span className="font-semibold">
                  {Math.round(sessionStats.averageResponseTime / 1000)}s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Eficiencia:</span>
                <span className="font-semibold text-blue-600">
                  {sessionStats.retentionRate >= 85 ? 'Excelente' :
                   sessionStats.retentionRate >= 70 ? 'Buena' :
                   sessionStats.retentionRate >= 50 ? 'Regular' : 'Necesita mejora'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudySession;
