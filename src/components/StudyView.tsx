
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, PenTool, Settings, Upload } from "lucide-react";
import { Card, Deck } from "@/types/deck";
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Estudiar</h1>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border-0 p-8">
            <DeckSelector
              decks={decksWithCards}
              currentDeckId={currentDeckId}
              onSelectDeck={onSelectDeck}
              onCreateDeck={onCreateDeck}
            />
            <div className="mt-6 flex justify-end">
              <ImportPopup onImport={onImport} />
            </div>
          </div>
          
          <EmptyState onAddCard={onAddCard} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-full">
            <Brain className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Estudiar</h1>
        </div>
      </div>

      {/* Deck selector card */}
      <div className="bg-white rounded-2xl shadow-lg border-0 p-6">
        <DeckSelector
          decks={decksWithCards}
          currentDeckId={currentDeckId}
          onSelectDeck={onSelectDeck}
          onCreateDeck={onCreateDeck}
        />
        <div className="mt-6 flex justify-end">
          <ImportPopup onImport={onImport} />
        </div>
      </div>

      {/* Stats card */}
      <div className="bg-white rounded-2xl shadow-lg border-0 p-6">
        <DeckStats stats={deckStats} />
      </div>

      {/* Main study card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border-0 p-8 space-y-8">
        {/* Configuration section */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Configuración de estudio</h3>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Modo:</span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant={studyMode === 'easy' ? 'default' : 'outline'}
                  onClick={() => setStudyMode('easy')}
                  size="sm"
                  className="min-w-[120px] rounded-xl"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Modo fácil
                </Button>
                <Button
                  variant={studyMode === 'hard' ? 'default' : 'outline'}
                  onClick={() => setStudyMode('hard')}
                  size="sm"
                  className="min-w-[120px] rounded-xl"
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  Modo difícil
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Tamaño del pack:</span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant={packSize === 10 ? 'default' : 'outline'}
                  onClick={() => setPackSize(10)}
                  size="sm"
                  className="min-w-[100px] rounded-xl"
                >
                  Pack 10
                </Button>
                <Button
                  variant={packSize === 15 ? 'default' : 'outline'}
                  onClick={() => setPackSize(15)}
                  size="sm"
                  className="min-w-[100px] rounded-xl"
                >
                  Pack 15
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Session info and start button */}
        <div className="text-center space-y-6 py-6 border-t border-gray-100">
          <div className="space-y-4">
            {reviewCards.length > 0 ? (
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <p className="text-lg text-blue-600 font-medium">
                  📚 {Math.min(reviewCards.length, packSize)} tarjetas listas para revisar
                </p>
              </div>
            ) : (
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                <p className="text-lg text-green-600 font-medium">
                  ✅ No hay tarjetas pendientes de revisión
                </p>
              </div>
            )}
            <p className="text-sm text-gray-600">
              Total en este mazo: {currentDeck.cards.length} tarjetas
            </p>
          </div>

          <Button 
            onClick={onStartSession}
            size="lg"
            className="text-lg px-8 py-4 rounded-xl min-w-[250px]"
            disabled={currentCards.length === 0}
          >
            <Brain className="h-5 w-5 mr-2" />
            Comenzar sesión ({Math.min(currentCards.length, packSize)} tarjetas)
          </Button>
        </div>

        {/* Individual study mode */}
        <div className="pt-8 border-t border-gray-100 space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-4">
              O estudia tarjeta por tarjeta
            </h3>
          </div>
          
          {/* Progress info */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Tarjeta {currentCardIndex + 1} de {currentCards.length}
            </p>
            <div className="max-w-md mx-auto bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((currentCardIndex + 1) / currentCards.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Study card */}
          {currentCards.length > 0 && (
            <div className="max-w-2xl mx-auto">
              {studyMode === 'easy' ? (
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyView;
