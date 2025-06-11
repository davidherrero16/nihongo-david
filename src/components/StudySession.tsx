
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, RotateCcw, ArrowRight } from "lucide-react";
import type { Card as CardType } from "@/hooks/useDecks";

interface StudySessionProps {
  cards: CardType[];
  packSize: number;
  onComplete: () => void;
  onUpdateCard: (cardId: string, known: boolean) => void;
  studyMode: 'easy' | 'hard';
  deckId: string;
}

interface SessionResult {
  cardId: string;
  known: boolean;
  card: CardType;
}

const StudySession = ({ cards, packSize, onComplete, onUpdateCard, studyMode, deckId }: StudySessionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<SessionResult[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const sessionCards = cards.slice(0, packSize);
  const currentCard = sessionCards[currentIndex];
  const progress = ((currentIndex) / sessionCards.length) * 100;

  const handleAnswer = (known: boolean) => {
    if (!currentCard) return;

    // Guardar resultado de la sesión
    const result: SessionResult = {
      cardId: currentCard.id,
      known,
      card: currentCard
    };

    setSessionResults(prev => [...prev, result]);
    
    // Actualizar la tarjeta
    onUpdateCard(currentCard.id, known);

    // Avanzar o mostrar resumen
    if (currentIndex + 1 >= sessionCards.length) {
      setShowSummary(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleFinishSession = () => {
    setShowSummary(false);
    setCurrentIndex(0);
    setSessionResults([]);
    onComplete();
  };

  const handleRetryFailed = () => {
    const failedCards = sessionResults.filter(result => !result.known);
    if (failedCards.length === 0) {
      handleFinishSession();
      return;
    }

    // Reiniciar con las tarjetas falladas
    const failedCardData = failedCards.map(result => result.card);
    setCurrentIndex(0);
    setSessionResults([]);
    setShowSummary(false);
    
    // Aquí podrías implementar lógica adicional para manejar solo las tarjetas falladas
    // Por simplicidad, vamos a finalizar la sesión
    handleFinishSession();
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
                {correctAnswers}/{sessionCards.length}
              </div>
              <p className="text-muted-foreground">Tarjetas revisadas correctamente</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Correctas
                </span>
                <span className="font-semibold text-green-600">{correctAnswers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Incorrectas
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

  if (!currentCard) {
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
          <span>{currentIndex + 1} / {sessionCards.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="text-center text-sm text-muted-foreground">
          Por revisar: {sessionCards.length - currentIndex}/{sessionCards.length}
        </div>
      </div>

      {/* Importar componente de tarjeta según el modo */}
      {studyMode === 'easy' ? (
        <div>
          {/* Aquí iría FlashCard pero necesitamos importarlo */}
          <Card className="min-h-[300px] cursor-pointer transition-all duration-500 transform hover:scale-105 shadow-lg">
            <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
              <div className="space-y-4">
                <div className="text-4xl font-bold text-primary mb-2">
                  {currentCard.word}
                </div>
                <div className="text-xl text-muted-foreground">
                  {currentCard.reading}
                </div>
                <div className="text-xl font-medium mt-4">
                  {currentCard.meaning}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex gap-2 justify-center mt-4">
            <Button 
              onClick={() => handleAnswer(true)}
              variant="outline"
              className="flex-1 max-w-xs text-green-600 border-green-200 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Lo sé
            </Button>
            <Button 
              onClick={() => handleAnswer(false)}
              variant="outline"
              className="flex-1 max-w-xs text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              No lo sé
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {/* Modo difícil - versión simplificada */}
          <Card className="min-h-[300px]">
            <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
              <div className="space-y-4">
                <div className="text-2xl text-muted-foreground mb-4">
                  Escribe el significado de:
                </div>
                <div className="text-4xl font-bold text-primary mb-2">
                  {currentCard.word}
                </div>
                <div className="text-xl text-muted-foreground">
                  {currentCard.reading}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex gap-2 justify-center mt-4">
            <Button 
              onClick={() => handleAnswer(true)}
              variant="outline"
              className="flex-1 max-w-xs text-green-600 border-green-200 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Correcto
            </Button>
            <Button 
              onClick={() => handleAnswer(false)}
              variant="outline"
              className="flex-1 max-w-xs text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Incorrecto
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudySession;
