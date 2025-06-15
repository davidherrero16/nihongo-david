import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, RotateCcw, Archive, Search, X, FolderMinus } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Card as CardType } from "@/types/deck";

interface CardListProps {
  cards: CardType[];
  onDeleteCard: (id: string) => void;
  onResetProgress: () => void;
  onDeleteDeck: () => void;
  isDeletable: boolean;
}

const CardList = ({ cards, onDeleteCard, onResetProgress, onDeleteDeck, isDeletable }: CardListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCards = cards.filter(card =>
    card.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.reading.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 1) return "bg-red-100 text-red-800";
    if (difficulty <= 3) return "bg-japanese-sora/20 text-japanese-ai";
    if (difficulty <= 6) return "bg-blue-100 text-blue-800";
    return "bg-green-100 text-green-800";
  };

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 1) return "Muy Difícil";
    if (difficulty <= 3) return "Difícil";
    if (difficulty <= 6) return "Medio";
    return "Fácil";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarjetas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetear progreso
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Resetear progreso?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esto reiniciará el progreso de aprendizaje de todas las tarjetas en este grupo. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onResetProgress}>
                  Resetear progreso
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {isDeletable && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <FolderMinus className="h-4 w-4 mr-2" />
                  Eliminar grupo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar grupo completo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esto eliminará el grupo y todas sus tarjetas permanentemente. Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onDeleteDeck} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Eliminar grupo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {filteredCards.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "No se encontraron tarjetas que coincidan con tu búsqueda." : "No hay tarjetas en este grupo."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCards.map((card) => (
            <Card key={card.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{card.word}</CardTitle>
                    <p className="text-sm text-muted-foreground">{card.reading}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      Nivel {card.difficulty}
                    </Badge>
                    <Badge variant="secondary" className={getDifficultyColor(card.difficulty)}>
                      {getDifficultyText(card.difficulty)}
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar tarjeta?</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro de que quieres eliminar la tarjeta "{card.word}"? Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteCard(card.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-base">{card.meaning}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardList;
