import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseDecks } from "@/hooks/useSupabaseDecks";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, List, Brain, PenTool, Calculator, FileDown, Settings, LogOut, Plus } from "lucide-react";
import AddCardForm from "@/components/AddCardForm";
import FlashCard from "@/components/FlashCard";
import WritingMode from "@/components/WritingMode";
import CardList from "@/components/CardList";
import StudySession from "@/components/StudySession";
import DeckSelector from "@/components/DeckSelector";
import DeckStats from "@/components/DeckStats";
import NumberExercise from "@/components/NumberExercise";
import ImportDeck from "@/components/ImportDeck";
import KanaExercise from "@/components/KanaExercise";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const { 
    decks, 
    loading: decksLoading,
    addCard, 
    createDeck, 
    deleteCard, 
    updateCardDifficulty, 
    getCardsForReview, 
    resetProgress, 
    importDeck, 
    deleteDeck, 
    getDeckStats, 
    resetSessionMarks 
  } = useSupabaseDecks();

  const [currentView, setCurrentView] = useState<'study' | 'add' | 'list' | 'numbers' | 'import' | 'kana' | 'session'>('study');
  const [studyMode, setStudyMode] = useState<'easy' | 'hard'>('easy');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentDeckId, setCurrentDeckId] = useState<string>('');
  const [packSize, setPackSize] = useState<10 | 15>(10);

  // Establecer el primer deck como actual cuando se carguen
  useEffect(() => {
    if (decks.length > 0 && !currentDeckId) {
      setCurrentDeckId(decks[0].id);
    }
  }, [decks, currentDeckId]);

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleCreateDeck = async (name: string) => {
    const newDeckId = await createDeck(name);
    if (newDeckId) {
      setCurrentDeckId(newDeckId);
      setCurrentCardIndex(0);
    }
  };

  if (authLoading || decksLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const reviewCards = getCardsForReview(currentDeckId);
  const currentDeck = decks.find(deck => deck.id === currentDeckId);
  const currentCards = reviewCards.length > 0 ? reviewCards : (currentDeck?.cards || []);
  const deckStats = getDeckStats(currentDeckId);

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

  const handleStartSession = () => {
    setCurrentView('session');
  };

  const handleCompleteSession = () => {
    setCurrentView('study');
    setCurrentCardIndex(0);
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
            <div className="flex items-center gap-4">
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
                  <span className="text-sm">あ</span>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'session' && (
          <StudySession
            cards={currentCards}
            packSize={packSize}
            onComplete={handleCompleteSession}
            onUpdateCard={(cardId, known) => updateCardDifficulty(cardId, known, currentDeckId)}
            studyMode={studyMode}
            deckId={currentDeckId}
            onResetSessionMarks={() => resetSessionMarks(currentDeckId)}
          />
        )}

        {currentView === 'study' && (
          <div className="max-w-2xl mx-auto">
            {/* Selector de deck mejorado */}
            <div className="mb-6">
              <DeckSelector
                decks={decks}
                currentDeckId={currentDeckId}
                onSelectDeck={(deckId) => {
                  setCurrentDeckId(deckId);
                  setCurrentCardIndex(0);
                }}
                onCreateDeck={handleCreateDeck}
              />
            </div>

            {/* Estadísticas del deck */}
            {currentDeck && currentDeck.cards.length > 0 && (
              <DeckStats stats={deckStats} />
            )}

            {currentDeck && currentDeck.cards.length > 0 ? (
              <div className="space-y-6">
                {/* Configuración de sesión */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant={studyMode === 'easy' ? 'default' : 'outline'}
                      onClick={() => setStudyMode('easy')}
                      size="sm"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Modo Fácil
                    </Button>
                    <Button
                      variant={studyMode === 'hard' ? 'default' : 'outline'}
                      onClick={() => setStudyMode('hard')}
                      size="sm"
                    >
                      <PenTool className="h-4 w-4 mr-2" />
                      Modo Difícil
                    </Button>
                  </div>
                  
                  <div className="flex justify-center gap-2">
                    <Button
                      variant={packSize === 10 ? 'default' : 'outline'}
                      onClick={() => setPackSize(10)}
                      size="sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Pack 10
                    </Button>
                    <Button
                      variant={packSize === 15 ? 'default' : 'outline'}
                      onClick={() => setPackSize(15)}
                      size="sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Pack 15
                    </Button>
                  </div>
                </div>

                {/* Información de tarjetas disponibles */}
                <div className="text-center mb-6">
                  <div className="mb-4">
                    {reviewCards.length > 0 ? (
                      <p className="text-lg text-blue-600 font-medium">
                        📚 {Math.min(reviewCards.length, packSize)} tarjetas listas para revisar
                      </p>
                    ) : (
                      <p className="text-lg text-green-600 font-medium">
                        ✅ No hay tarjetas pendientes de revisión
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Total en este mazo: {currentDeck.cards.length} tarjetas
                    </p>
                  </div>

                  <Button 
                    onClick={handleStartSession}
                    size="lg"
                    className="text-lg px-8 py-3"
                    disabled={currentCards.length === 0}
                  >
                    <Brain className="h-5 w-5 mr-2" />
                    Comenzar Sesión ({Math.min(currentCards.length, packSize)} tarjetas)
                  </Button>
                </div>

                {/* Modo de estudio individual (legacy) */}
                <div className="pt-8 border-t border-muted">
                  <h3 className="text-lg font-medium text-center mb-4 text-muted-foreground">
                    O estudia tarjeta por tarjeta
                  </h3>
                  
                  {/* Información de progreso */}
                  <div className="text-center mb-4">
                    <p className="text-muted-foreground mb-2">
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
              <DeckSelector
                decks={decks}
                currentDeckId={currentDeckId}
                onSelectDeck={setCurrentDeckId}
                onCreateDeck={handleCreateDeck}
              />
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
              <DeckSelector
                decks={decks}
                currentDeckId={currentDeckId}
                onSelectDeck={setCurrentDeckId}
                onCreateDeck={handleCreateDeck}
              />
            </div>
            
            <CardList 
              cards={currentDeck?.cards || []} 
              onDeleteCard={(id) => deleteCard(id, currentDeckId)} 
              onResetProgress={() => resetProgress(currentDeckId)}
              onDeleteDeck={() => {
                if (currentDeckId && decks.length > 1) {
                  deleteDeck(currentDeckId);
                  setCurrentDeckId(decks.find(d => d.id !== currentDeckId)?.id || '');
                }
              }}
              isDeletable={decks.length > 1}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
