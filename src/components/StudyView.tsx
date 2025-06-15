import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Settings, Upload, TrendingUp, Target, Calendar } from "lucide-react";
import { Card, Deck } from "@/types/deck";
import DeckSelector from "@/components/DeckSelector";
import DeckStats from "@/components/DeckStats";
import FlashCard from "@/components/FlashCard";
import EmptyState from "@/components/EmptyState";
import ImportPopup from "@/components/ImportPopup";
import FSRSInfo from "@/components/FSRSInfo";
import { useFSRS } from "@/hooks/useFSRS";
import { useAuth } from "@/hooks/useAuth";
import { Card as CardComponent, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  packSize: number;
  onPackSizeChange: (size: number) => void;
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
  onImport,
  packSize,
  onPackSizeChange
}: StudyViewProps) => {
  const [customPackSize, setCustomPackSize] = useState<number>(packSize);
  const [showFSRSDetails, setShowFSRSDetails] = useState(false);
  const { user } = useAuth();
  
  // Hook FSRS para analytics y recomendaciones
  const { 
    analytics, 
    recommendations, 
    cardsForReview,
    hasCardsToReview 
  } = useFSRS(currentDeck?.cards || [], user?.id || '');

  // Sincronizar customPackSize con packSize cuando cambie externamente
  useEffect(() => {
    setCustomPackSize(packSize);
  }, [packSize]);

  // Filtrar decks que tienen tarjetas para mostrar en el selector
  const decksWithCards = decks.filter(deck => deck.cards.length > 0);

  if (!currentDeck || currentDeck.cards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Estudiar</h1>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-0 p-8">
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-8">


          {/* Deck selector card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-0 p-6">
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

          {/* SECCIÓN DE ESTUDIO - Ahora en la parte superior */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl shadow-lg border border-blue-200 dark:border-blue-700 p-8 space-y-6">
            {/* Resumen de estadísticas compacto */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-blue-100 dark:border-blue-600">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Resumen del Mazo</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    FSRS
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <div className="font-bold text-blue-600 dark:text-blue-400 text-lg">{analytics.new}</div>
                  <div className="text-gray-600 dark:text-gray-300">Nuevas</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <div className="font-bold text-red-600 dark:text-red-400 text-lg">{analytics.overdue}</div>
                  <div className="text-gray-600 dark:text-gray-300">Vencidas</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                  <div className="font-bold text-yellow-600 dark:text-yellow-400 text-lg">{analytics.young}</div>
                  <div className="text-gray-600 dark:text-gray-300">En aprendizaje</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <div className="font-bold text-green-600 dark:text-green-400 text-lg">{analytics.mature}</div>
                  <div className="text-gray-600 dark:text-gray-300">Dominadas</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Retención actual:</span>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${
                    analytics.retentionRate >= 85 ? 'text-green-600 dark:text-green-400' :
                    analytics.retentionRate >= 70 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {analytics.retentionRate.toFixed(1)}%
                  </span>
                  <div className="w-16">
                    <Progress value={analytics.retentionRate} className="h-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración de estudio */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white text-center">Configurar sesión de estudio</h3>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Tarjetas por sesión:</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={customPackSize}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 10;
                      setCustomPackSize(Math.min(Math.max(value, 1), 50));
                      onPackSizeChange(value);
                    }}
                    className="w-20 px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCustomPackSize(recommendations.recommendedDailyCards);
                      onPackSizeChange(recommendations.recommendedDailyCards);
                    }}
                    className="text-xs px-3 py-2"
                  >
                    Usar recomendación ({recommendations.recommendedDailyCards})
                  </Button>
                </div>
              </div>
            </div>

            {/* Estado de la sesión y botón de inicio */}
            <div className="text-center space-y-4 py-4 border-t border-blue-200 dark:border-blue-600">
              {hasCardsToReview && cardsForReview.length > 0 ? (
                <div className="inline-block px-6 py-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-800/50 dark:to-indigo-800/50 rounded-2xl border-2 border-blue-300 dark:border-blue-500 shadow-lg">
                  <p className="text-lg text-blue-800 dark:text-blue-200 font-medium">
                    📚 {Math.min(cardsForReview.length, customPackSize)} tarjetas optimizadas listas para revisar
                  </p>
                  {analytics.overdue > 0 && (
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      ⚠️ {analytics.overdue} tarjetas vencidas (prioridad alta)
                    </p>
                  )}
                </div>
              ) : (
                <div className="inline-block px-6 py-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-800/50 dark:to-emerald-800/50 rounded-2xl border border-green-300 dark:border-green-500 shadow-lg">
                  <p className="text-lg text-green-800 dark:text-green-200 font-medium">
                    ✅ No hay tarjetas pendientes de revisión
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Próxima sesión recomendada: {recommendations.nextStudySession}
                  </p>
                </div>
              )}

              <Button 
                onClick={onStartSession}
                size="lg"
                className="text-lg px-8 py-4 rounded-2xl min-w-[280px] bg-gradient-to-r from-japanese-ai to-japanese-asagi hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                disabled={currentCards.length === 0}
              >
                <Brain className="h-5 w-5 mr-2" />
                Comenzar sesión FSRS ({Math.min(currentCards.length, customPackSize)} tarjetas)
              </Button>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Total en este mazo: {currentDeck.cards.length} tarjetas
              </p>
            </div>
          </div>

          {/* Estudio individual */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-0 p-6 space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-4">
                O estudia tarjeta por tarjeta
              </h3>
            </div>
            
            {currentCards.length > 0 ? (
              <div className="flex justify-center">
                <FlashCard
                  card={currentCards[currentCardIndex]}
                  onAnswer={onAnswer}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No hay tarjetas disponibles para estudiar individualmente</p>
                <Button variant="outline" onClick={onAddCard}>
                  Agregar nuevas tarjetas
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar con información FSRS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-8">
            <FSRSInfo 
              cards={currentDeck.cards} 
              userId={user?.id || ''} 
              className="max-h-[80vh] overflow-y-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyView;
