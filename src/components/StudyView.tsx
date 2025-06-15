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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-8">
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

          {/* Stats cards - Vista mejorada con FSRS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stats tradicionales */}
            <div className="bg-white rounded-2xl shadow-lg border-0 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas del Mazo</h3>
              <DeckStats stats={deckStats} />
            </div>

            {/* Stats FSRS */}
            <div className="bg-white rounded-2xl shadow-lg border-0 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Análisis FSRS</h3>
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Avanzado
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="text-gray-500">Nuevas</div>
                  <div className="font-semibold text-blue-600">{analytics.new}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-500">Vencidas</div>
                  <div className="font-semibold text-red-600">{analytics.overdue}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-500">Jóvenes</div>
                  <div className="font-semibold text-yellow-600">{analytics.young}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-500">Maduras</div>
                  <div className="font-semibold text-green-600">{analytics.mature}</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Retención:</span>
                  <span className={`font-semibold ${
                    analytics.retentionRate >= 85 ? 'text-green-600' :
                    analytics.retentionRate >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {analytics.retentionRate.toFixed(1)}%
                  </span>
                </div>
                <Progress value={analytics.retentionRate} className="h-2 mt-2" />
              </div>
            </div>
          </div>

          {/* Recomendaciones FSRS */}
          <CardComponent className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Recomendaciones de Estudio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tarjetas diarias recomendadas:</span>
                    <Badge variant="outline" className="font-semibold">
                      {recommendations.recommendedDailyCards}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mejor momento:</span>
                    <span className="text-sm font-medium text-blue-600">
                      {recommendations.optimalStudyTime}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Enfoque:</span>
                    <span className="text-sm font-medium">
                      {recommendations.difficultyFocus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Consejo:</span>
                    <span className="text-sm font-medium text-purple-600">
                      {recommendations.retentionAdvice}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </CardComponent>

          {/* Predicciones */}
          <CardComponent className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Predicciones (Próximos 30 días)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{analytics.expectedReviews}</div>
                  <div className="text-sm text-gray-600">Revisiones esperadas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{analytics.expectedWorkload} min</div>
                  <div className="text-sm text-gray-600">Tiempo estimado</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${
                    analytics.retentionPrediction >= 85 ? 'text-green-600' :
                    analytics.retentionPrediction >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {analytics.retentionPrediction.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Retención prevista</div>
                </div>
              </div>
            </CardContent>
          </CardComponent>

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
                    <span className="text-sm font-medium text-gray-600">Tarjetas por sesión:</span>
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
                      className="w-20 px-3 py-1 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCustomPackSize(recommendations.recommendedDailyCards);
                        onPackSizeChange(recommendations.recommendedDailyCards);
                      }}
                      className="text-xs px-3 py-1"
                    >
                      Usar recomendación FSRS ({recommendations.recommendedDailyCards})
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Session info and start button */}
            <div className="text-center space-y-6 py-6 border-t border-gray-100">
              <div className="space-y-4">
                {hasCardsToReview && cardsForReview.length > 0 ? (
                  <div className="inline-block px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                    <p className="text-lg text-blue-600 font-medium">
                      📚 {Math.min(cardsForReview.length, customPackSize)} tarjetas optimizadas por FSRS listas para revisar
                    </p>
                    {analytics.overdue > 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        ⚠️ {analytics.overdue} tarjetas vencidas (prioridad alta)
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="inline-block px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                    <p className="text-lg text-green-600 font-medium">
                      ✅ No hay tarjetas pendientes de revisión
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Próxima sesión recomendada: {recommendations.nextStudySession}
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-600">
                  Total en este mazo: {currentDeck.cards.length} tarjetas | 
                  Algoritmo: <Badge variant="outline" className="ml-1">FSRS</Badge>
                </p>
              </div>

              <Button 
                onClick={onStartSession}
                size="lg"
                className="text-lg px-8 py-4 rounded-xl min-w-[250px]"
                disabled={currentCards.length === 0}
              >
                <Brain className="h-5 w-5 mr-2" />
                Comenzar sesión FSRS ({Math.min(currentCards.length, customPackSize)} tarjetas)
              </Button>
            </div>

            {/* Individual study mode */}
            <div className="pt-8 border-t border-gray-100 space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-600 mb-4">
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
                  <p className="text-gray-500 mb-4">No hay tarjetas disponibles para estudiar individualmente</p>
                  <Button variant="outline" onClick={onAddCard}>
                    Agregar nuevas tarjetas
                  </Button>
                </div>
              )}
            </div>
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
