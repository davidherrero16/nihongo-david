
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Eye, ArrowLeft, ArrowRight, Volume2 } from "lucide-react";
import type { Card as CardType } from "@/hooks/useCards";
import { useSpeech } from "@/hooks/useSpeech";

interface WritingModeProps {
  card: CardType;
  onAnswer: (known: boolean) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showNavigation?: boolean;
}

const WritingMode = ({ card, onAnswer, onNext, onPrevious, showNavigation = true }: WritingModeProps) => {
  const [userInput, setUserInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const { speak, isSpeaking } = useSpeech();

  const handleCheck = () => {
    const correct = userInput.trim().toLowerCase() === card.reading.toLowerCase();
    setIsCorrect(correct);
    setShowAnswer(true);
  };

  const handleSpeak = () => {
    speak(card.word);
  };

  const handleKnown = () => {
    onAnswer(true);
    resetCard();
  };

  const handleUnknown = () => {
    onAnswer(false);
    resetCard();
  };

  const resetCard = () => {
    setUserInput("");
    setShowAnswer(false);
    setIsCorrect(null);
    onNext?.();
  };

  const handleNext = () => {
    resetCard();
  };

  const handlePrevious = () => {
    resetCard();
    onPrevious?.();
  };

  return (
    <div className="space-y-4">
      <Card className="min-h-[350px] shadow-lg">
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[350px] text-center relative">
          {/* Speaker button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-muted-foreground hover:text-primary"
            onClick={handleSpeak}
            disabled={isSpeaking}
          >
            <Volume2 className={`h-4 w-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
          </Button>

          <div className="space-y-6 w-full max-w-md">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-4xl font-bold text-primary">
                {card.word}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSpeak}
                disabled={isSpeaking}
                className="text-muted-foreground hover:text-primary"
              >
                <Volume2 className={`h-4 w-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
              </Button>
            </div>
            
            <div className="text-lg text-muted-foreground mb-6">
              {card.meaning}
            </div>

            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Escribe la lectura en hiragana/katakana:
              </div>
              
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="ej: ほん"
                className="text-lg text-center"
                disabled={showAnswer}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !showAnswer && userInput.trim()) {
                    handleCheck();
                  }
                }}
              />

              {!showAnswer ? (
                <Button 
                  onClick={handleCheck}
                  disabled={!userInput.trim()}
                  className="w-full"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Comprobar
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className={`text-lg font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                    </div>
                    <div className="text-sm mt-2">
                      Respuesta correcta: <span className="font-medium">{card.reading}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleKnown}
                      variant="outline"
                      className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Lo sé
                    </Button>
                    <Button 
                      onClick={handleUnknown}
                      variant="outline"
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      No lo sé
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showNavigation && (
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSpeak}
              variant="secondary"
              size="sm"
              disabled={isSpeaking}
              className="flex items-center gap-2"
            >
              <Volume2 className={`h-4 w-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
              Pronunciar
            </Button>
            <Button 
              onClick={() => setShowAnswer(!showAnswer)} 
              variant="secondary"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showAnswer ? 'Ocultar' : 'Ver'} Respuesta
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleNext}
            className="flex items-center gap-2"
          >
            Siguiente
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default WritingMode;
