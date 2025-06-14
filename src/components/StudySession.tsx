
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, RotateCcw, ArrowRight } from "lucide-react";
import FlashCard from "@/components/FlashCard";
import type { Card as CardType } from "@/hooks/useDecks";

interface StudySessionProps {
  cards: CardType[];
  packSize: number;
  onComplete: () => void;
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
  // Tomar exactamente packSize tarjetas para la sesión
  const initialCards = cards.slice(0, packSize);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<SessionResult[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  const [sessionCards, setSessionCards] = useState<CardType[]>(
    initialCards.map(card => ({ ...card, wasWrongInSession: false }))
  );

  const currentCard = sessionCards[currentIndex];
  const totalCards = initialCards.length;
  const progress = (completedCards.size / totalCards) * 100;

  console.log(`Estado actual: ${completedCards.size}/${totalCards} completadas, ${sessionCards.length} en ronda actual`);

  const handleAnswer = (known: boolean) => {
    if (!currentCard) return;

    console.log(`Respuesta para tarjeta ${currentCard.word}: ${known ? 'Correcta' : 'Incorrecta'}`);

    // Guardar resultado de la sesión
    const result: SessionResult = {
      cardId: currentCard.id,
      known,
      card: currentCard
    };

    setSessionResults(prev => [...prev, result]);
    
    // Actualizar la tarjeta en la base de datos
    onUpdateCard(currentCard.id, known);

    if (known) {
      // Si es correcta, marcar como completada
      setCompletedCards(prev => new Set([...prev, currentCard.id]));
      
      // Remover la tarjeta actual de sessionCards
      const newSessionCards = sessionCards.filter((_, index) => index !== currentIndex);
      setSessionCards(newSessionCards);
      
      console.log(`Tarjeta ${currentCard.word} completada. Completadas: ${completedCards.size + 1}/${totalCards}, quedan ${newSessionCards.length} en ronda`);
      
      // Si hemos completado todas las tarjetas originales, mostrar resumen
      if (completedCards.size + 1 >= totalCards) {
        console.log('Todas las tarjetas completadas, mostrando resumen');
        setShowSummary(true);
        return;
      }
      
      // Ajustar índice si es necesario
      if (currentIndex >= newSessionCards.length && newSessionCards.length > 0) {
        setCurrentIndex(0);
      }
    } else {
      // Si es incorrecta, marcar como incorrecta en sesión y continuar
      setSessionCards(prev => prev.map((card, index) => 
        index === currentIndex 
          ? { ...card, wasWrongInSession: true }
          : card
      ));
      
      console.log(`Tarjeta ${currentCard.word} marcada como incorrecta en sesión`);
      
      // Avanzar al siguiente índice
      if (currentIndex + 1 >= sessionCards.length) {
        setCurrentIndex(0);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }
  };

  const handleNext = () => {
    if (sessionCards.length === 0) return;
    
    if (currentIndex + 1 < sessionCards.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrevious = () => {
    if (sessionCards.length === 0) return;
    
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(sessionCards.length - 1);
    }
  };

  const handleFinishSession = () => {
    onResetSessionMarks();
    setShowSummary(false);
    setCurrentIndex(0);
    setSessionResults([]);
    setCompletedCards(new Set());
    setSessionCards(initialCards.map(card => ({ ...card, wasWrongInSession: false })));
    onComplete();
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

  if (showSummary) {
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

            {incorrectAnswers > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700 mb-2">
                  Las tarjetas incorrectas aparecerán de nuevo según el sistema de repetición espaciada.
                </p>
                <p className="text-xs text-blue-600">
                  Próxima revisión: mañana o en los próximos días según la dificultad.
                </p>
              </div>
            )}

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
                onClick={handleFinishSession}
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

  if (!currentCard || sessionCards.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No hay tarjetas disponibles para estudiar</p>
        <Button onClick={onComplete} className="mt-4">Volver</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progreso de la sesión */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progreso de la sesión</span>
          <span>{completedCards.size} / {totalCards} completadas</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="text-center text-sm text-muted-foreground">
          En ronda actual: {sessionCards.length} tarjetas
          {sessionCards.filter(card => card.wasWrongInSession).length > 0 && (
            <span className="text-orange-600 ml-2">
              ({sessionCards.filter(card => card.wasWrongInSession).length} incorrectas)
            </span>
          )}
        </div>
      </div>

      {/* Usar FlashCard para mostrar la tarjeta */}
      <FlashCard 
        card={currentCard}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onPrevious={handlePrevious}
        showNavigation={sessionCards.length > 1}
      />
    </div>
  );
};

export default StudySession;
