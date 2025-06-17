import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Volume2 } from "lucide-react";
import type { Card as CardType } from "@/hooks/useCards";
import { useSpeech } from "@/hooks/useSpeech";

interface FlashCardProps {
  card: CardType;
  onAnswer: (known: boolean) => void;
}

const FlashCard = ({ card, onAnswer }: FlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { speak, isSpeaking } = useSpeech();

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = () => {
    speak(card.word);
  };

  const handleKnown = () => {
    onAnswer(true);
    setIsFlipped(false);
  };

  const handleUnknown = () => {
    onAnswer(false);
    setIsFlipped(false);
  };

  return (
    <div className="perspective-1000">
        <Card 
          className="w-full max-w-lg mx-auto h-[350px] cursor-pointer transition-all duration-500 transform hover:scale-105 shadow-lg"
          onClick={handleFlip}
        >
          <CardContent className="p-8 flex flex-col items-center justify-center h-[350px] text-center relative">


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
              <div className="flex flex-col h-full justify-between">
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {card.word}
                  </div>
                  <div className="text-xl text-muted-foreground mb-4">
                    {card.reading}
                  </div>
                  <div className="text-xl font-medium">
                    {card.meaning}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    ¿Conocías esta tarjeta?
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleKnown();
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1 max-w-[120px] text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Lo sé
                    </Button>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnknown();
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1 max-w-[120px] text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      No lo sé
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
};

export default FlashCard;
