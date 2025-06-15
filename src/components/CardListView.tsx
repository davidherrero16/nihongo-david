
import { List, FileText } from "lucide-react";
import DeckSelector from "@/components/DeckSelector";
import CardList from "@/components/CardList";
import ImportPopup from "@/components/ImportPopup";
import { Deck } from "@/hooks/useSupabaseDecks";

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
  onImport
}: CardListViewProps) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-full">
            <List className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Lista de tarjetas</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Gestiona y revisa todas tus tarjetas de estudio
        </p>
      </div>

      {/* Deck selector card */}
      <div className="bg-white rounded-2xl shadow-lg border-0 p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Selecciona el mazo</h3>
          <p className="text-sm text-gray-600 mt-2">Elige el mazo que quieres gestionar</p>
        </div>
        <DeckSelector
          decks={decks}
          currentDeckId={currentDeckId}
          onSelectDeck={onSelectDeck}
          onCreateDeck={onCreateDeck}
        />
        
        {/* Import button moved here, below deck selector */}
        <div className="flex justify-center mt-6 pt-4 border-t border-gray-100">
          <ImportPopup onImport={onImport} />
        </div>
      </div>
      
      {/* Cards list */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border-0 p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-6 w-6 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-800">
              {currentDeck?.name || "Selecciona un mazo"}
            </h3>
          </div>
          {currentDeck && (
            <p className="text-gray-600">
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
