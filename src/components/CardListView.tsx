
import DeckSelector from "@/components/DeckSelector";
import CardList from "@/components/CardList";
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
}

const CardListView = ({
  decks,
  currentDeckId,
  currentDeck,
  onSelectDeck,
  onCreateDeck,
  onDeleteCard,
  onResetProgress,
  onDeleteDeck
}: CardListViewProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <DeckSelector
          decks={decks}
          currentDeckId={currentDeckId}
          onSelectDeck={onSelectDeck}
          onCreateDeck={onCreateDeck}
        />
      </div>
      
      <CardList 
        cards={currentDeck?.cards || []} 
        onDeleteCard={onDeleteCard} 
        onResetProgress={onResetProgress}
        onDeleteDeck={onDeleteDeck}
        isDeletable={decks.length > 1}
      />
    </div>
  );
};

export default CardListView;
