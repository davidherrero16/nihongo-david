import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useSupabaseDecks } from "@/hooks/useSupabaseDecks";
import { useStatistics } from "@/hooks/useStatistics";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import StudyView from "@/components/StudyView";
import CardListView from "@/components/CardListView";
import StudySession from "@/components/StudySession";
import NumberExercise from "@/components/NumberExercise";
import KanaExercise from "@/components/KanaExercise";
import WelcomeMessage from "@/components/WelcomeMessage";
import ProfileView from "@/components/ProfileView";
import StatsView from "@/components/StatsView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen, BookMarked, User } from "lucide-react";

// Componente de Onboarding Principal  
const MainOnboarding = ({ onComplete }: { onComplete: (name: string, level: number) => void }) => {
  const [step, setStep] = useState<'name' | 'level' | 'kana-choice'>('name');
  const [userName, setUserName] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const levels = [
    { 
      id: 0, 
      title: '🌱 Principiante Total', 
      desc: 'No tengo conocimientos de japonés',
      details: 'Comenzarás aprendiendo los fundamentos: hiragana y katakana'
    },
    { 
      id: 1, 
      title: '📝 Conozco algo de Kana', 
      desc: 'Sé algunos hiragana/katakana',
      details: 'Podrás practicar y reforzar tu conocimiento de kana'
    },
    { 
      id: 2, 
      title: '📚 Tengo base de vocabulario', 
      desc: 'Conozco kana y algo de vocabulario/gramática',
      details: 'Irás directo a estudiar con tarjetas de vocabulario'
    }
  ];

  const handleLevelSelect = (level: number) => {
    setSelectedLevel(level);
    
    if (level === 0) {
      // Nivel 0: Directo a kana
      onComplete(userName, 0);
    } else if (level === 1) {
      // Nivel 1: Pregunta si quiere practicar kana
      setStep('kana-choice');
    } else {
      // Nivel 2: Directo a tarjetas
      onComplete(userName, 2);
    }
  };

  if (step === 'name') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-8">
          <div className="space-y-4">
            <div className="text-6xl mb-4">👋</div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              ¡Hola! ¿Cómo te llamas?
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Dinos tu nombre para personalizar tu experiencia
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-left">Tu nombre</Label>
              <Input
                id="username"
                type="text"
                placeholder="Escribe tu nombre..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="text-center text-lg"
                autoFocus
              />
            </div>
            
            <Button
              onClick={() => setStep('level')}
              disabled={!userName.trim()}
              className="w-full"
              size="lg"
            >
              <User className="h-4 w-4 mr-2" />
              Continuar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'kana-choice') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-8">
          <div className="space-y-4">
            <div className="text-6xl mb-4">🎌</div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              ¿Quieres practicar kana?
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Puedes reforzar tu conocimiento o ir directo a vocabulario
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button
              onClick={() => onComplete(userName, 1)}
              className="h-auto p-6 flex flex-col items-center space-y-3 bg-blue-500 hover:bg-blue-600"
              size="lg"
            >
              <BookOpen className="h-8 w-8" />
              <div className="text-lg font-medium">Sí, practicar kana</div>
              <div className="text-sm opacity-90">Reforzar hiragana y katakana</div>
            </Button>
            
            <Button
              onClick={() => onComplete(userName, 2)}
              variant="outline"
              className="h-auto p-6 flex flex-col items-center space-y-3"
              size="lg"
            >
              <BookMarked className="h-8 w-8" />
              <div className="text-lg font-medium">Ir a vocabulario</div>
              <div className="text-sm opacity-75">Estudiar tarjetas</div>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-8">
        <div className="space-y-4">
          <div className="text-6xl mb-4">🌸</div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            ¡Bienvenido a tu aventura japonesa!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Cuéntanos tu nivel actual para personalizar tu experiencia
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            ¿Cuál es tu nivel de japonés?
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            {levels.map((level) => (
              <Card
                key={level.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedLevel === level.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
                }`}
                onClick={() => handleLevelSelect(level.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                      level.id === 0 ? 'bg-green-500' :
                      level.id === 1 ? 'bg-blue-500' : 'bg-purple-500'
                    }`}>
                      {level.id === 0 ? '🌱' : level.id === 1 ? '📝' : '📚'}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {level.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        {level.desc}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {level.details}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, hasCompletedOnboarding, completeOnboarding } = useProfile();
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

  const [currentView, setCurrentView] = useState<'study' | 'list' | 'numbers' | 'kana' | 'session' | 'profile' | 'stats'>('study');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentDeckId, setCurrentDeckId] = useState<string>('');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [packSize, setPackSize] = useState<number>(10);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Verificar si es primera vez
  useEffect(() => {
    if (!authLoading && user && profile && !hasCompletedOnboarding()) {
      setShowOnboarding(true);
    } else if (profile && hasCompletedOnboarding()) {
      setShowOnboarding(false);
    }
  }, [user, authLoading, profile, hasCompletedOnboarding]);

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

  const handleCompleteOnboarding = async (name: string, level: number) => {
    try {
      await completeOnboarding(name, level);
      setShowOnboarding(false);
      
      // Redirigir según el nivel
      if (level === 0 || level === 1) {
        // Nivel 0 y 1: Ir a kana
        setCurrentView('kana');
      } else if (level === 2) {
        // Nivel 2: Quedarse en study (tarjetas)
        setCurrentView('study');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

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
      setCurrentView('study');
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

  // Mostrar onboarding si es primera vez
  if (showOnboarding) {
    return <MainOnboarding onComplete={handleCompleteOnboarding} />;
  }

  const reviewCards = getCardsForReview(currentDeckId);
  const currentDeck = decks.find(deck => deck.id === currentDeckId);
  const currentCards = reviewCards.length > 0 ? reviewCards : (currentDeck?.cards || []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
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
              onStartSession={handleStartSession}
              onAddCard={() => setCurrentView('list')}
              onAnswer={handleAnswer}
              onNext={nextCard}
              onPrevious={prevCard}
              currentCards={currentCards}
              currentCardIndex={currentCardIndex}
              onImport={handleImport}
              packSize={packSize}
              onPackSizeChange={setPackSize}
            />
          </>
        )}

        {currentView === 'session' && (
          <StudySession
            cards={currentCards}
            packSize={packSize}
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
            onAddCard={(word, reading, meaning) => 
              addCard(word, reading, meaning, currentDeckId)
            }
          />
        )}
      </main>
    </div>
  );
};

export default Index;
