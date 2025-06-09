
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, BookOpen } from "lucide-react";
import type { Card as CardType } from "@/hooks/useCards";

interface CardListProps {
  cards: CardType[];
  onDeleteCard: (id: string) => void;
}

const CardList = ({ cards, onDeleteCard }: CardListProps) => {
  if (cards.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-muted-foreground mb-2">
          No hay tarjetas guardadas
        </h2>
        <p className="text-muted-foreground">
          Las tarjetas que añadas aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mis Tarjetas</h2>
        <span className="text-muted-foreground">
          {cards.length} tarjeta{cards.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{card.word}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteCard(card.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>{card.reading}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{card.meaning}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Añadida: {card.createdAt.toLocaleDateString('es-ES')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CardList;
