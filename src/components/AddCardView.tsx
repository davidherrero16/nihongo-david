
import { PlusCircle } from "lucide-react";
import DeckSelector from "@/components/DeckSelector";
import AddCardForm from "@/components/AddCardForm";
import { Deck } from "@/types/deck";

interface AddCardViewProps {
  decks: Deck[];
  currentDeckId: string;
  onSelectDeck: (deckId: string) => void;
  onCreateDeck: (name: string) => Promise<void>;
  onAddCard: (word: string, reading: string, meaning: string) => Promise<void>;
}

const AddCardView = ({
  decks,
  currentDeckId,
  onSelectDeck,
  onCreateDeck,
  onAddCard
}: AddCardViewProps) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-full">
            <PlusCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Añadir tarjeta</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Crea nuevas tarjetas de estudio para expandir tu vocabulario japonés
        </p>
      </div>

      {/* Deck selector card */}
      <div className="bg-white rounded-2xl shadow-lg border-0 p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Selecciona el mazo de destino</h3>
          <p className="text-sm text-gray-600 mt-2">Elige dónde quieres añadir tu nueva tarjeta</p>
        </div>
        <DeckSelector
          decks={decks}
          currentDeckId={currentDeckId}
          onSelectDeck={onSelectDeck}
          onCreateDeck={onCreateDeck}
        />
      </div>
      
      {/* Add card form */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border-0 p-8">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Nueva tarjeta de estudio</h3>
          <p className="text-gray-600">Completa los campos para crear tu tarjeta</p>
        </div>
        <AddCardForm onAddCard={onAddCard} />
      </div>
    </div>
  );
};

export default AddCardView;
