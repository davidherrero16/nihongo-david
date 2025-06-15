import { List, FileText, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeckSelector from "@/components/DeckSelector";
import CardList from "@/components/CardList";
import ImportPopup from "@/components/ImportPopup";
import AddCardForm from "@/components/AddCardForm";
import { Deck } from "@/types/deck";
import { useState } from "react";

interface CardListViewProps {
  decks: Deck[];
  currentDeckId: string;
  currentDeck: Deck | undefined;
  onSelectDeck: (deckId: string) => void;
  onCreateDeck: (name: string) => Promise<void>;
  onDeleteCard: (id: string) => void;
  onResetProgress: () => void;
  onDeleteDeck: () => void;
  onImport: (name: string, cards: any[]) => Promise<void>;
  onAddCard: (word: string, reading: string, meaning: string) => Promise<void>;
}

const CardListView = ({
  decks,
  currentDeckId,
  currentDeck,
  onSelectDeck,
  onCreateDeck,
  onDeleteCard,
  onResetProgress,
  onDeleteDeck,
  onImport,
  onAddCard
}: CardListViewProps) => {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
 
      {/* Deck selector card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-0 p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Selecciona el mazo</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Elige el mazo que quieres gestionar</p>
        </div>
        <DeckSelector
          decks={decks}
          currentDeckId={currentDeckId}
          onSelectDeck={onSelectDeck}
          onCreateDeck={onCreateDeck}
        />
        
        {/* Acciones del mazo */}
        <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="w-40">
            <ImportPopup onImport={onImport} />
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant="outline"
            className="flex items-center gap-2 w-40"
          >
            <PlusCircle className="h-5 w-5" />
            {showAddForm ? 'Ocultar formulario' : 'Añadir tarjeta'}
          </Button>
        </div>
      </div>

      {/* Formulario para añadir tarjetas */}
      {showAddForm && (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-2xl shadow-lg border border-green-200 dark:border-green-700 p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Añadir nueva tarjeta</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Añade una nueva tarjeta al mazo "{currentDeck?.name || 'Selecciona un mazo'}"
            </p>
          </div>
          <AddCardForm
            onAddCard={async (word, reading, meaning) => {
              await onAddCard(word, reading, meaning);
              setShowAddForm(false);
            }}
          />
        </div>
      )}
      
      {/* Cards list */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border-0 p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              {currentDeck?.name || "Selecciona un mazo"}
            </h3>
          </div>
          {currentDeck && (
            <p className="text-gray-600 dark:text-gray-300">
              {currentDeck.cards.length} tarjeta{currentDeck.cards.length !== 1 ? 's' : ''} en este mazo
            </p>
          )}
        </div>
        
        <CardList 
          cards={currentDeck?.cards || []} 
          onDeleteCard={onDeleteCard} 
          onResetProgress={onResetProgress}
          onDeleteDeck={onDeleteDeck}
          isDeletable={decks.length > 1}
        />
      </div>
    </div>
  );
};

export default CardListView;
