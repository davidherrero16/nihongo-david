import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseDecks } from "@/hooks/useSupabaseDecks";
import { useStatistics } from "@/hooks/useStatistics";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import StudyView from "@/components/StudyView";
import AddCardView from "@/components/AddCardView";
import CardListView from "@/components/CardListView";
import StudySession from "@/components/StudySession";
import NumberExercise from "@/components/NumberExercise";
import KanaExercise from "@/components/KanaExercise";
import WelcomeMessage from "@/components/WelcomeMessage";
import ProfileView from "@/components/ProfileView";
import StatsView from "@/components/StatsView";

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

  const { addStudySession } = useStatistics();

  const [currentView, setCurrentView] = useState<'study' | 'add' | 'list' | 'numbers' | 'kana' | 'session' | 'profile' | 'stats'>('study');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentDeckId, setCurrentDeckId] = useState<string>('');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });

  // Establecer el primer deck como actual cuando se carguen
  useEffect(() => {
    if (decks.length > 0 && !currentDeckId) {
      setCurrentDeckId(decks[0].id);
    }
  }, [decks, currentDeckId]);

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('Usuario no autenticado, redirigiendo a /auth');
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    console.log('Iniciando cierre de sesión...');
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Forzar redirección incluso si hay error
      navigate('/auth');
    }
  };

  const handleCreateDeck = async (name: string) => {
    const newDeckId = await createDeck(name);
    if (newDeckId) {
      setCurrentDeckId(newDeckId);
      setCurrentCardIndex(0);
    }
  };

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
      
      // Actualizar estadísticas de sesión
      setSessionStats(prev => ({
        correct: prev.correct + (known ? 1 : 0),
        total: prev.total + 1
      }));
    }
  };

  const handleStartSession = () => {
    setSessionStartTime(new Date());
    setSessionStats({ correct: 0, total: 0 });
    setCurrentView('session');
  };

  const handleCompleteSession = (finalStats: { correct: number; total: number }) => {
    // Registrar sesión en estadísticas si hay datos
    if (sessionStartTime && finalStats.total > 0) {
      const timeSpent = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60); // en minutos
      const currentDeck = decks.find(d => d.id === currentDeckId);
      
      addStudySession({
        cardsStudied: finalStats.total,
        correctAnswers: finalStats.correct,
        timeSpent: Math.max(1, timeSpent), // mínimo 1 minuto
        deckId: currentDeckId,
        deckName: currentDeck?.name || 'Desconocido'
      });
    }
    
    setCurrentView('study');
    setCurrentCardIndex(0);
    setSessionStartTime(null);
    setSessionStats({ correct: 0, total: 0 });
  };

  const handleSelectDeck = (deckId: string) => {
    setCurrentDeckId(deckId);
    setCurrentCardIndex(0);
  };

  const handleDeleteDeck = () => {
    if (currentDeckId && decks.length > 1) {
      deleteDeck(currentDeckId);
      setCurrentDeckId(decks.find(d => d.id !== currentDeckId)?.id || '');
    }
  };

  const handleImport = async (name: string, cards: any[]) => {
    const newDeckId = await importDeck(name, cards);
    if (newDeckId) {
      setCurrentDeckId(newDeckId);
      setCurrentCardIndex(0);
    }
  };

  if (authLoading || decksLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const reviewCards = getCardsForReview(currentDeckId);
  const currentDeck = decks.find(deck => deck.id === currentDeckId);
  const currentCards = reviewCards.length > 0 ? reviewCards : (currentDeck?.cards || []);
  const deckStats = getDeckStats(currentDeckId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header 
        currentView={currentView}
        onViewChange={setCurrentView}
        onSignOut={handleSignOut}
      />

      <main className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 lg:py-8 max-w-full">
        {currentView === 'study' && (
          <>
            <WelcomeMessage />
            <StudyView
              decks={decks}
              currentDeckId={currentDeckId}
              onSelectDeck={handleSelectDeck}
              onCreateDeck={handleCreateDeck}
              reviewCards={reviewCards}
              currentDeck={currentDeck}
              deckStats={deckStats}
              onStartSession={handleStartSession}
              onAddCard={() => setCurrentView('add')}
              onAnswer={handleAnswer}
              onNext={nextCard}
              onPrevious={prevCard}
              currentCards={currentCards}
              currentCardIndex={currentCardIndex}
              onImport={handleImport}
            />
          </>
        )}

        {currentView === 'session' && (
          <StudySession
            cards={currentCards}
            packSize={10}
            onComplete={handleCompleteSession}
            onUpdateCard={(cardId, known) => {
              updateCardDifficulty(cardId, known, currentDeckId);
              // Actualizar estadísticas locales de sesión
              setSessionStats(prev => ({
                correct: prev.correct + (known ? 1 : 0),
                total: prev.total + 1
              }));
            }}
            studyMode="easy"
            deckId={currentDeckId}
            onResetSessionMarks={() => resetSessionMarks(currentDeckId)}
          />
        )}

        {currentView === 'numbers' && <NumberExercise />}
        
        {currentView === 'kana' && <KanaExercise />}

        {currentView === 'profile' && <ProfileView />}

        {currentView === 'stats' && <StatsView />}

        {currentView === 'add' && (
          <AddCardView
            decks={decks}
            currentDeckId={currentDeckId}
            onSelectDeck={setCurrentDeckId}
            onCreateDeck={handleCreateDeck}
            onAddCard={(word, reading, meaning) => 
              addCard(word, reading, meaning, currentDeckId)
            }
          />
        )}

        {currentView === 'list' && (
          <CardListView
            decks={decks}
            currentDeckId={currentDeckId}
            currentDeck={currentDeck}
            onSelectDeck={handleSelectDeck}
            onCreateDeck={handleCreateDeck}
            onDeleteCard={(id) => deleteCard(id, currentDeckId)}
            onResetProgress={() => resetProgress(currentDeckId)}
            onDeleteDeck={handleDeleteDeck}
            onImport={handleImport}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
