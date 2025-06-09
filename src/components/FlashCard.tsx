
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import type { Card as CardType } from "@/hooks/useCards";

interface FlashCardProps {
  card: CardType;
  onAnswer: (known: boolean) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showNavigation?: boolean;
}

const FlashCard = ({ card, onAnswer, onNext, onPrevious, showNavigation = true }: FlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKnown = () => {
    onAnswer(true);
    setIsFlipped(false);
    onNext?.();
  };

  const handleUnknown = () => {
    onAnswer(false);
    setIsFlipped(false);
    onNext?.();
  };

  const handleNext = () => {
    setIsFlipped(false);
    onNext?.();
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    onPrevious?.();
  };

  return (
    <div className="space-y-4">
      <div className="perspective-1000">
        <Card 
          className="min-h-[300px] cursor-pointer transition-all duration-500 transform hover:scale-105 shadow-lg"
          onClick={handleFlip}
        >
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
            {!isFlipped ? (
              // Frente de la tarjeta
              <div className="space-y-4">
                <div className="text-4xl font-bold text-primary mb-2">
                  {card.word}
                </div>
                <div className="text-xl text-muted-foreground">
                  {card.reading}
                </div>
                <p className="text-sm text-muted-foreground mt-8">
                  Haz clic para ver el significado
                </p>
              </div>
            ) : (
              // Reverso de la tarjeta
              <div className="space-y-4">
                <div className="text-2xl font-semibold text-primary mb-2">
                  {card.word}
                </div>
                <div className="text-lg text-muted-foreground mb-4">
                  {card.reading}
                </div>
                <div className="text-xl font-medium">
                  {card.meaning}
                </div>
                <p className="text-sm text-muted-foreground mt-8">
                  ¿Conocías esta tarjeta?
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {isFlipped && (
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={handleKnown}
              variant="outline"
              className="flex-1 max-w-xs text-green-600 border-green-200 hover:bg-green-50"
            >
              <Check className="h-4 w-4 mr-2" />
              Lo sé
            </Button>
            <Button 
              onClick={handleUnknown}
              variant="outline"
              className="flex-1 max-w-xs text-red-600 border-red-200 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-2" />
              No lo sé
            </Button>
          </div>
        )}

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
            
            <Button onClick={handleFlip} variant="secondary">
              {isFlipped ? 'Ver Palabra' : 'Ver Significado'}
            </Button>
            
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
    </div>
  );
};

export default FlashCard;
