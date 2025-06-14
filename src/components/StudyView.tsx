
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, PenTool, Settings, Upload } from "lucide-react";
import { Card, Deck } from "@/hooks/useSupabaseDecks";
import DeckSelector from "@/components/DeckSelector";
import DeckStats from "@/components/DeckStats";
import FlashCard from "@/components/FlashCard";
import WritingMode from "@/components/WritingMode";
import EmptyState from "@/components/EmptyState";
import ImportPopup from "@/components/ImportPopup";

interface StudyViewProps {
  decks: Deck[];
  currentDeckId: string;
  onSelectDeck: (deckId: string) => void;
  onCreateDeck: (name: string) => Promise<void>;
  reviewCards: Card[];
  currentDeck: Deck | undefined;
  deckStats: { nuevas: number; revisar: number; aprendidas: number; porAprender: number };
  onStartSession: () => void;
  onAddCard: () => void;
  onAnswer: (known: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentCards: Card[];
  currentCardIndex: number;
  onImport: (name: string, cards: any[]) => void;
}

const StudyView = ({
  decks,
  currentDeckId,
  onSelectDeck,
  onCreateDeck,
  reviewCards,
  currentDeck,
  deckStats,
  onStartSession,
  onAddCard,
  onAnswer,
  onNext,
  onPrevious,
  currentCards,
  currentCardIndex,
  onImport
}: StudyViewProps) => {
  const [studyMode, setStudyMode] = useState<'easy' | 'hard'>('easy');
  const [packSize, setPackSize] = useState<10 | 15>(10);

  // Filtrar decks que tienen tarjetas para mostrar en el selector
  const decksWithCards = decks.filter(deck => deck.cards.length > 0);

  if (!currentDeck || currentDeck.cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-2">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
          <div className="flex-1 w-full">
            <DeckSelector
              decks={decksWithCards}
              currentDeckId={currentDeckId}
              onSelectDeck={(deckId) => {
                onSelectDeck(deckId);
              }}
              onCreateDeck={onCreateDeck}
            />
          </div>
          <ImportPopup onImport={onImport} />
        </div>
        <EmptyState onAddCard={onAddCard} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-2">
      {/* Selector de deck con botón de importar */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
        <div className="flex-1 w-full">
          <DeckSelector
            decks={decksWithCards}
            currentDeckId={currentDeckId}
            onSelectDeck={(deckId) => {
              onSelectDeck(deckId);
            }}
            onCreateDeck={onCreateDeck}
          />
        </div>
        <ImportPopup onImport={onImport} />
      </div>

      {/* Estadísticas del deck */}
      <DeckStats stats={deckStats} />

      <div className="space-y-4 sm:space-y-6">
        {/* Configuración de sesión */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={studyMode === 'easy' ? 'default' : 'outline'}
              onClick={() => setStudyMode('easy')}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <Brain className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Modo fácil
            </Button>
            <Button
              variant={studyMode === 'hard' ? 'default' : 'outline'}
              onClick={() => setStudyMode('hard')}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <PenTool className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Modo difícil
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={packSize === 10 ? 'default' : 'outline'}
              onClick={() => setPackSize(10)}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Pack 10
            </Button>
            <Button
              variant={packSize === 15 ? 'default' : 'outline'}
              onClick={() => setPackSize(15)}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Pack 15
            </Button>
          </div>
        </div>

        {/* Información de tarjetas disponibles */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="mb-4">
            {reviewCards.length > 0 ? (
              <p className="text-sm sm:text-lg text-blue-600 font-medium">
                📚 {Math.min(reviewCards.length, packSize)} tarjetas listas para revisar
              </p>
            ) : (
              <p className="text-sm sm:text-lg text-green-600 font-medium">
                ✅ No hay tarjetas pendientes de revisión
              </p>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground">
              Total en este mazo: {currentDeck.cards.length} tarjetas
            </p>
          </div>

          <Button 
            onClick={onStartSession}
            size="lg"
            className="text-sm sm:text-lg px-4 sm:px-8 py-2 sm:py-3 w-full sm:w-auto"
            disabled={currentCards.length === 0}
          >
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            Comenzar sesión ({Math.min(currentCards.length, packSize)} tarjetas)
          </Button>
        </div>

        {/* Modo de estudio individual (legacy) */}
        <div className="pt-6 sm:pt-8 border-t border-muted">
          <h3 className="text-base sm:text-lg font-medium text-center mb-4 text-muted-foreground">
            O estudia tarjeta por tarjeta
          </h3>
          
          {/* Información de progreso */}
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              Tarjeta {currentCardIndex + 1} de {currentCards.length}
            </p>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentCardIndex + 1) / currentCards.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Tarjeta de estudio */}
          {currentCards.length > 0 && (
            studyMode === 'easy' ? (
              <FlashCard 
                card={currentCards[currentCardIndex]} 
                onAnswer={onAnswer}
                onNext={onNext}
                onPrevious={onPrevious}
                showNavigation={currentCards.length > 1}
              />
            ) : (
              <WritingMode 
                card={currentCards[currentCardIndex]} 
                onAnswer={onAnswer}
                onNext={onNext}
                onPrevious={onPrevious}
                showNavigation={currentCards.length > 1}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyView;
