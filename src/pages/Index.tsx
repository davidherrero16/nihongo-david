
import { useState } from "react";
import AddCardForm from "@/components/AddCardForm";
import FlashCard from "@/components/FlashCard";
import CardList from "@/components/CardList";
import { useCards } from "@/hooks/useCards";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, List } from "lucide-react";

const Index = () => {
  const { cards, addCard, deleteCard } = useCards();
  const [currentView, setCurrentView] = useState<'study' | 'add' | 'list'>('study');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const nextCard = () => {
    if (cards.length > 0) {
      setCurrentCardIndex((prev) => (prev + 1) % cards.length);
    }
  };

  const prevCard = () => {
    if (cards.length > 0) {
      setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Tarjetas Japonés
            </h1>
            <div className="flex gap-2">
              <Button
                variant={currentView === 'study' ? 'default' : 'outline'}
                onClick={() => setCurrentView('study')}
                size="sm"
              >
                Estudiar
              </Button>
              <Button
                variant={currentView === 'add' ? 'default' : 'outline'}
                onClick={() => setCurrentView('add')}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Añadir
              </Button>
              <Button
                variant={currentView === 'list' ? 'default' : 'outline'}
                onClick={() => setCurrentView('list')}
                size="sm"
              >
                <List className="h-4 w-4 mr-1" />
                Lista
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'study' && (
          <div className="max-w-2xl mx-auto">
            {cards.length > 0 ? (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">
                    Tarjeta {currentCardIndex + 1} de {cards.length}
                  </p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
                    />
                  </div>
                </div>
                <FlashCard 
                  card={cards[currentCardIndex]} 
                  onNext={nextCard}
                  onPrevious={prevCard}
                  showNavigation={cards.length > 1}
                />
              </div>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-muted-foreground mb-2">
                  No hay tarjetas para estudiar
                </h2>
                <p className="text-muted-foreground mb-4">
                  Añade tu primera tarjeta para comenzar a estudiar
                </p>
                <Button onClick={() => setCurrentView('add')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Primera Tarjeta
                </Button>
              </div>
            )}
          </div>
        )}

        {currentView === 'add' && (
          <div className="max-w-lg mx-auto">
            <AddCardForm onAddCard={addCard} />
          </div>
        )}

        {currentView === 'list' && (
          <div className="max-w-4xl mx-auto">
            <CardList cards={cards} onDeleteCard={deleteCard} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
