
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, BookOpen, RotateCcw } from "lucide-react";
import type { Card as CardType } from "@/hooks/useCards";

interface CardListProps {
  cards: CardType[];
  onDeleteCard: (id: string) => void;
  onResetProgress: () => void;
}

const CardList = ({ cards, onDeleteCard, onResetProgress }: CardListProps) => {
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 1) return "text-red-600 bg-red-50";
    if (difficulty <= 2) return "text-orange-600 bg-orange-50";
    if (difficulty <= 3) return "text-yellow-600 bg-yellow-50";
    if (difficulty <= 4) return "text-blue-600 bg-blue-50";
    return "text-green-600 bg-green-50";
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 1) return "Muy Difícil";
    if (difficulty <= 2) return "Difícil";
    if (difficulty <= 3) return "Medio";
    if (difficulty <= 4) return "Fácil";
    return "Muy Fácil";
  };

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
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            {cards.length} tarjeta{cards.length !== 1 ? 's' : ''}
          </span>
          <Button
            variant="outline"
            onClick={onResetProgress}
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetear Progreso
          </Button>
        </div>
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
              <p className="text-sm mb-3">{card.meaning}</p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Añadida: {card.createdAt.toLocaleDateString('es-ES')}</span>
                <span>Revisiones: {card.reviewCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Próxima revisión: {card.nextReview.toLocaleDateString('es-ES')}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(card.difficulty)}`}>
                  Nivel {card.difficulty} - {getDifficultyLabel(card.difficulty)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CardList;
