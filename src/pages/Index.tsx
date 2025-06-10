
import { useState } from "react";
import AddCardForm from "@/components/AddCardForm";
import FlashCard from "@/components/FlashCard";
import WritingMode from "@/components/WritingMode";
import CardList from "@/components/CardList";
import { useDecks } from "@/hooks/useDecks";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, List, Brain, PenTool, Calculator, FileDown, LayoutPanelLeft, KanbanSquare } from "lucide-react";
import NumberExercise from "@/components/NumberExercise";
import ImportDeck from "@/components/ImportDeck";
import KanaExercise from "@/components/KanaExercise";

const Index = () => {
  const { decks, addCard, deleteCard, updateCardDifficulty, getCardsForReview, resetProgress, importDeck, deleteDeck } = useDecks();
  const [currentView, setCurrentView] = useState<'study' | 'add' | 'list' | 'numbers' | 'import' | 'kana'>('study');
  const [studyMode, setStudyMode] = useState<'easy' | 'hard'>('easy');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentDeckId, setCurrentDeckId] = useState<string>('default');

  const reviewCards = getCardsForReview(currentDeckId);
  const currentDeck = decks.find(deck => deck.id === currentDeckId);
  const currentCards = reviewCards.length > 0 ? reviewCards : (currentDeck?.cards || []);

  const nextCard = () => {
    if (currentCards.length > 0) {
      setCurrentCardIndex((prev) => (prev + 1) % currentCards.length);
    }
  };

  const prevCard = () => {
    if (currentCards.length > 0) {
      setCurrentCardIndex((prev) => (prev - 1 + currentCards.length) % currentCards.length);
    }
  };

  const handleAnswer = (known: boolean) => {
    if (currentCards.length > 0) {
      updateCardDifficulty(currentCards[currentCardIndex].id, known, currentDeckId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Tarjetas Japonés
            </h1>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={currentView === 'study' ? 'default' : 'outline'}
                onClick={() => setCurrentView('study')}
                size="sm"
                className="flex items-center gap-1"
              >
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Estudiar</span>
              </Button>
              <Button
                variant={currentView === 'numbers' ? 'default' : 'outline'}
                onClick={() => setCurrentView('numbers')}
                size="sm"
                className="flex items-center gap-1"
              >
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Números</span>
              </Button>
              <Button
                variant={currentView === 'kana' ? 'default' : 'outline'}
                onClick={() => setCurrentView('kana')}
                size="sm"
                className="flex items-center gap-1"
              >
                <KanbanSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Kana</span>
              </Button>
              <Button
                variant={currentView === 'add' ? 'default' : 'outline'}
                onClick={() => setCurrentView('add')}
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Añadir</span>
              </Button>
              <Button
                variant={currentView === 'import' ? 'default' : 'outline'}
                onClick={() => setCurrentView('import')}
                size="sm"
                className="flex items-center gap-1"
              >
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline">Importar</span>
              </Button>
              <Button
                variant={currentView === 'list' ? 'default' : 'outline'}
                onClick={() => setCurrentView('list')}
                size="sm"
                className="flex items-center gap-1"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Lista</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'study' && (
          <div className="max-w-2xl mx-auto">
            {/* Selector de deck */}
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto">
                  {decks.map(deck => (
                    <Button
                      key={deck.id}
                      variant={currentDeckId === deck.id ? 'default' : 'outline'}
                      onClick={() => {
                        setCurrentDeckId(deck.id);
                        setCurrentCardIndex(0);
                      }}
                      size="sm"
                      className={`flex items-center gap-2 ${deck.isImported ? 'border-indigo-300' : ''}`}
                    >
                      <LayoutPanelLeft className="h-4 w-4" />
                      {deck.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {currentDeck && currentDeck.cards.length > 0 ? (
              <div className="space-y-6">
                {/* Selector de modo */}
                <div className="flex justify-center gap-2">
                  <Button
                    variant={studyMode === 'easy' ? 'default' : 'outline'}
                    onClick={() => setStudyMode('easy')}
                    className="flex items-center gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    Modo Fácil
                  </Button>
                  <Button
                    variant={studyMode === 'hard' ? 'default' : 'outline'}
                    onClick={() => setStudyMode('hard')}
                    className="flex items-center gap-2"
                  >
                    <PenTool className="h-4 w-4" />
                    Modo Difícil
                  </Button>
                </div>

                {/* Información de progreso */}
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">
                    {reviewCards.length > 0 ? (
                      <>Tarjetas para revisar: {reviewCards.length} | </>
                    ) : null}
                    Tarjeta {currentCardIndex + 1} de {currentCards.length}
                  </p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentCardIndex + 1) / currentCards.length) * 100}%` }}
                    />
                  </div>
                  {reviewCards.length > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      Estudiando tarjetas pendientes de revisión
                    </p>
                  )}
                </div>

                {/* Tarjeta de estudio */}
                {currentCards.length > 0 && (
                  studyMode === 'easy' ? (
                    <FlashCard 
                      card={currentCards[currentCardIndex]} 
                      onAnswer={handleAnswer}
                      onNext={nextCard}
                      onPrevious={prevCard}
                      showNavigation={currentCards.length > 1}
                    />
                  ) : (
                    <WritingMode 
                      card={currentCards[currentCardIndex]} 
                      onAnswer={handleAnswer}
                      onNext={nextCard}
                      onPrevious={prevCard}
                      showNavigation={currentCards.length > 1}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-muted-foreground mb-2">
                  No hay tarjetas para estudiar
                </h2>
                <p className="text-muted-foreground mb-4">
                  Añade tu primera tarjeta para comenzar a estudiar
                </p>
                <Button onClick={() => setCurrentView('add')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Primera Tarjeta
                </Button>
              </div>
            )}
          </div>
        )}

        {currentView === 'numbers' && (
          <NumberExercise />
        )}
        
        {currentView === 'kana' && (
          <KanaExercise />
        )}

        {currentView === 'add' && (
          <div className="max-w-lg mx-auto">
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto">
                  {decks.map(deck => (
                    <Button
                      key={deck.id}
                      variant={currentDeckId === deck.id ? 'default' : 'outline'}
                      onClick={() => setCurrentDeckId(deck.id)}
                      size="sm"
                      className={`flex items-center gap-2 ${deck.isImported ? 'border-indigo-300' : ''}`}
                    >
                      <LayoutPanelLeft className="h-4 w-4" />
                      {deck.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <AddCardForm 
              onAddCard={(word, reading, meaning) => 
                addCard(word, reading, meaning, currentDeckId)
              } 
            />
          </div>
        )}
        
        {currentView === 'import' && (
          <div className="max-w-lg mx-auto">
            <ImportDeck onImport={importDeck} />
          </div>
        )}

        {currentView === 'list' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto">
                  {decks.map(deck => (
                    <Button
                      key={deck.id}
                      variant={currentDeckId === deck.id ? 'default' : 'outline'}
                      onClick={() => setCurrentDeckId(deck.id)}
                      size="sm"
                      className={`flex items-center gap-2 ${deck.isImported ? 'border-indigo-300' : ''}`}
                    >
                      <LayoutPanelLeft className="h-4 w-4" />
                      {deck.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <CardList 
              cards={currentDeck?.cards || []} 
              onDeleteCard={(id) => deleteCard(id, currentDeckId)} 
              onResetProgress={() => resetProgress(currentDeckId)}
              onDeleteDeck={() => {
                if (currentDeckId !== 'default') {
                  deleteDeck(currentDeckId);
                  setCurrentDeckId('default');
                }
              }}
              isDeletable={currentDeckId !== 'default'}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
