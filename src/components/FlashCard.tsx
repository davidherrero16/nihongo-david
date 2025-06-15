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
    <div className="space-y-6">
      <div className="perspective-1000">
        <Card 
          className="min-h-[320px] cursor-pointer transition-all duration-500 transform hover:scale-102 shadow-japanese-lg border-japanese bg-gradient-to-br from-white to-japanese-sakura/30"
          onClick={handleFlip}
        >
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[320px] text-center relative">
            {/* Speaker button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-japanese-secondary hover:text-japanese-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleSpeak();
              }}
              disabled={isSpeaking}
            >
              <Volume2 className={`h-5 w-5 ${isSpeaking ? 'animate-pulse text-japanese-accent' : ''}`} />
            </Button>

            {!isFlipped ? (
              // Frente de la tarjeta - Palabra japonesa
              <div className="space-y-6">
                <div className="flashcard-word japanese-text">
                  {card.word}
                </div>
                <div className="flashcard-reading japanese-text">
                  {card.reading}
                </div>
                <p className="text-sm text-japanese-secondary mt-12 font-japanese">
                  Haz clic para ver el significado
                </p>
              </div>
            ) : (
              // Reverso de la tarjeta - Significado
              <div className="space-y-6">
                <div className="text-kanji-lg font-japanese-serif font-medium text-japanese-primary mb-2">
                  {card.word}
                </div>
                <div className="text-kanji-base font-japanese text-japanese-secondary mb-6">
                  {card.reading}
                </div>
                <div className="flashcard-meaning font-japanese">
                  {card.meaning}
                </div>
                <p className="text-sm text-japanese-secondary mt-12 font-japanese">
                  ¿Conocías esta tarjeta?
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {isFlipped && (
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={handleKnown}
              variant="outline"
              className="flex-1 max-w-xs font-japanese text-base py-3 h-auto bg-gradient-to-r from-japanese-wakaba/10 to-japanese-midori/10 text-japanese-midori border-japanese-midori/30 hover:bg-japanese-midori/5 hover:border-japanese-midori/50 transition-all duration-300"
            >
              <Check className="h-5 w-5 mr-2" />
              Lo sé
            </Button>
            <Button 
              onClick={handleUnknown}
              variant="outline"
              className="flex-1 max-w-xs font-japanese text-base py-3 h-auto bg-gradient-to-r from-japanese-beni/10 to-japanese-aka/10 text-japanese-beni border-japanese-beni/30 hover:bg-japanese-beni/5 hover:border-japanese-beni/50 transition-all duration-300"
            >
              <X className="h-5 w-5 mr-2" />
              No lo sé
            </Button>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <Button 
            onClick={handleSpeak}
            variant="secondary"
            size="default"
            disabled={isSpeaking}
            className="flex items-center gap-2 font-japanese bg-japanese-asagi/10 text-japanese-ai border-japanese-asagi/30 hover:bg-japanese-asagi/20 transition-all duration-300"
          >
            <Volume2 className={`h-4 w-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
            Pronunciar
          </Button>
          <Button 
            onClick={handleFlip} 
            variant="secondary"
            className="font-japanese bg-japanese-fujiro/10 text-japanese-murasaki border-japanese-fujiro/30 hover:bg-japanese-fujiro/20 transition-all duration-300"
          >
            {isFlipped ? 'Ver palabra' : 'Ver significado'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;
