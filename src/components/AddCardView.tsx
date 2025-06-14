
import DeckSelector from "@/components/DeckSelector";
import AddCardForm from "@/components/AddCardForm";
import { Deck } from "@/hooks/useSupabaseDecks";

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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <DeckSelector
          decks={decks}
          currentDeckId={currentDeckId}
          onSelectDeck={onSelectDeck}
          onCreateDeck={onCreateDeck}
        />
      </div>
      
      <AddCardForm onAddCard={onAddCard} />
    </div>
  );
};

export default AddCardView;
