import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Settings, Upload, BookOpen, LayoutPanelLeft } from "lucide-react";
import { Card, Deck } from "@/types/deck";
import DeckSelector from "@/components/DeckSelector";
import FlashCard from "@/components/FlashCard";
import EmptyState from "@/components/EmptyState";
import ImportPopup from "@/components/ImportPopup";
import { useAuth } from "@/hooks/useAuth";
import { Card as CardComponent, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StudyViewProps {
  decks: Deck[];
  currentDeckId: string;
  onSelectDeck: (deckId: string) => void;
  onCreateDeck: (name: string) => Promise<void>;
  reviewCards: Card[];
  currentDeck: Deck | undefined;
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
  const { user } = useAuth();
  
  // Sincronizar customPackSize con packSize cuando cambie externamente
  useEffect(() => {
    setCustomPackSize(packSize);
  }, [packSize]);

  // Mostrar todos los grupos, no solo los que tienen tarjetas
  const decksWithCards = decks;
  const shouldStack = decksWithCards.length > 4;

  if (!currentDeck) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <div className={`flex ${shouldStack ? 'flex-col' : 'flex-col lg:flex-row'} gap-6`}>
        {/* Selector de grupo de tarjetas */}
        <div className="flex-1 min-w-0">
          <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6 sm:p-7 lg:p-8">
            <div className="space-y-6">
              <h3 className="text-lg sm:text-xl font-semibold">Seleccionar mazo</h3>
              
              <div className="grid grid-cols-2 gap-5">
                {decksWithCards.map((deck, index) => {
                  const deckColors = [
                    { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', ring: 'ring-blue-500', icon: 'text-blue-600' },
                    { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', ring: 'ring-green-500', icon: 'text-green-600' },
                    { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', ring: 'ring-purple-500', icon: 'text-purple-600' },
                    { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', ring: 'ring-orange-500', icon: 'text-orange-600' },
                    { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', ring: 'ring-pink-500', icon: 'text-pink-600' },
                    { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', ring: 'ring-indigo-500', icon: 'text-indigo-600' },
                    { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', ring: 'ring-red-500', icon: 'text-red-600' },
                    { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', ring: 'ring-yellow-500', icon: 'text-yellow-600' },
                  ];
                  const colors = deckColors[index % deckColors.length];
                  
                  return (
                    <CardComponent 
                      key={deck.id} 
                      className={`w-full h-28 flex flex-col justify-center cursor-pointer transition-all hover:shadow-md ${colors.bg} ${colors.border} ${
                        currentDeckId === deck.id 
                          ? `ring-2 ${colors.ring} shadow-md` 
                          : `hover:ring-1 hover:${colors.ring}/50`
                      }`}
                      onClick={() => onSelectDeck(deck.id)}
                    >
                      <CardContent className="p-4 flex flex-col justify-center h-full">
                        <div className="flex items-center gap-2 mb-2">
                          <LayoutPanelLeft className={`h-4 w-4 ${colors.icon}`} />
                          <h4 className={`font-medium truncate max-w-[7.5rem] ${deck.isImported ? 'text-indigo-600' : colors.text}`}>
                            {deck.name}
                          </h4>
                        </div>
                        <div className={`text-sm ${colors.text}/70`}>
                          {deck.cards.length} tarjetas
                        </div>
                        {deck.isImported && (
                          <div className="text-xs text-indigo-600 mt-1">
                            Importado
                          </div>
                        )}
                      </CardContent>
                    </CardComponent>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Configuración de sesión de estudio */}
        <div className="flex-[1.5] min-w-0">
          <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/90 to-purple-50/90 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200/50 dark:border-blue-700/30 p-6 sm:p-7 lg:p-8 flex flex-col gap-6 justify-between h-full">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-1">
                Configurar sesión de estudio
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm">
                Personaliza tu experiencia de aprendizaje
              </p>
            </div>
            {currentDeck.cards.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-3 w-full">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Tarjetas por sesión:</span>
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
                    className="w-20 px-3 py-2 text-center border-2 border-blue-200 dark:border-blue-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white font-semibold shadow-sm ml-2"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 px-4 py-3 bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
                  <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    No hay tarjetas disponibles. Por favor, añade o importa algunas tarjetas para comenzar el estudio.
                  </span>
                </div>
              </div>
            )}
                          <div className="flex justify-center mt-6">
              <Button 
                onClick={onStartSession}
                size="lg"
                className="flex items-center justify-center gap-2 w-full max-w-xs text-base px-7 py-3 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 border border-blue-300 dark:border-indigo-700 shadow-lg hover:shadow-2xl hover:brightness-110 hover:-translate-y-0.5 transition-all duration-200 font-semibold text-white tracking-wide focus:outline-none focus:ring-4 focus:ring-blue-300/30"
                disabled={currentCards.length === 0}
              >
                <Brain className="h-5 w-5 mr-2 -ml-1 opacity-90" />
                Comenzar sesión de estudio
              </Button>
            </div>
            {currentDeck.cards.length > 0 && (
              <p className="text-xs text-gray-600 dark:text-gray-300 text-center mt-1">
                Total en este mazo: {currentDeck.cards.length} tarjetas
              </p>
            )}
          </div>
        </div>
      </div>

            {/* Estudio individual */}
      <div className="mt-6 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6 sm:p-7 lg:p-8 w-full">
       <div className="w-full min-h-[320px] flex flex-col justify-center space-y-6">
      <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-1">
              Estudio individual
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Practica tarjeta por tarjeta a tu propio ritmo
            </p>
          </div>
          {currentCards.length > 0 ? (
            <div className="flex justify-center items-center flex-1">
              <FlashCard
                card={currentCards[currentCardIndex]}
                onAnswer={onAnswer}
              />
            </div>
          ) : (
            <div className="text-center py-8 flex-1 flex flex-col justify-center">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="h-7 w-7 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-base">No hay tarjetas disponibles para estudiar individualmente</p>
              <Button 
                variant="outline" 
                onClick={onAddCard}
                className="px-6 py-2 rounded-lg border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Agregar nuevas tarjetas
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyView;
