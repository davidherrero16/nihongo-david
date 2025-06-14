import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "@/hooks/useSupabaseDecks";
import { Trash2, RefreshCw, Search, ArrowUpDown, FileX } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CardListProps {
  cards: Card[];
  onDeleteCard: (id: string) => void;
  onResetProgress: () => void;
  onDeleteDeck?: () => void;
  isDeletable?: boolean;
}

const CardList = ({ cards, onDeleteCard, onResetProgress, onDeleteDeck, isDeletable = false }: CardListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<keyof Card>("word");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  const handleSort = (key: keyof Card) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (deletingCardId) return; // Prevent multiple concurrent deletions
    
    console.log(`Attempting to delete card: ${cardId}`);
    setDeletingCardId(cardId);
    
    try {
      await onDeleteCard(cardId);
      console.log(`Card ${cardId} deleted successfully`);
    } catch (error) {
      console.error('Error during card deletion:', error);
    } finally {
      // Reset the deleting state after a short delay to prevent UI flicker
      setTimeout(() => {
        setDeletingCardId(null);
      }, 500);
    }
  };

  const filteredCards = cards.filter(
    (card) =>
      card.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.reading.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCards = [...filteredCards].sort((a, b) => {
    let valueA: any = a[sortKey];
    let valueB: any = b[sortKey];

    // Handle dates
    if (valueA instanceof Date && valueB instanceof Date) {
      valueA = valueA.getTime();
      valueB = valueB.getTime();
    }

    // Handle strings
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = [
      "bg-red-100 text-red-800",       // 0
      "bg-orange-100 text-orange-800", // 1
      "bg-yellow-100 text-yellow-800", // 2
      "bg-lime-100 text-lime-800",     // 3
      "bg-green-100 text-green-800",   // 4
      "bg-emerald-100 text-emerald-800", // 5
    ];
    return colors[difficulty] || colors[0];
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Input
            placeholder="Buscar tarjetas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                <RefreshCw className="h-4 w-4 mr-2" />
                Resetear Progreso
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Resetear progreso de estudio</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción reseteará todo el progreso de estudio para todas las tarjetas. 
                  El nivel de dificultad volverá a 0 y se reiniciarán las fechas de revisión.
                  ¿Estás seguro de que quieres continuar?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onResetProgress}>Resetear</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {isDeletable && onDeleteDeck && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  <FileX className="h-4 w-4 mr-2" />
                  Eliminar Deck
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminar deck</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará todo el deck y todas sus tarjetas.
                    Esta acción no se puede deshacer. ¿Estás seguro?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onDeleteDeck} className="bg-red-600">
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px] cursor-pointer" onClick={() => handleSort("word")}>
                <div className="flex items-center">
                  Palabra
                  {sortKey === "word" && (
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("reading")}>
                <div className="flex items-center">
                  Lectura
                  {sortKey === "reading" && (
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("meaning")}>
                <div className="flex items-center">
                  Significado
                  {sortKey === "meaning" && (
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell cursor-pointer" onClick={() => handleSort("difficulty")}>
                <div className="flex items-center">
                  Nivel
                  {sortKey === "difficulty" && (
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell cursor-pointer" onClick={() => handleSort("nextReview")}>
                <div className="flex items-center">
                  Próxima revisión
                  {sortKey === "nextReview" && (
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCards.length > 0 ? (
              sortedCards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="font-medium">{card.word}</TableCell>
                  <TableCell>{card.reading}</TableCell>
                  <TableCell>{card.meaning}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(card.difficulty)}`}>
                      {card.difficulty}/5
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{formatDate(card.nextReview)}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                          disabled={deletingCardId === card.id}
                        >
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
                          <AlertDialogAction
                            onClick={() => handleDeleteCard(card.id)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deletingCardId === card.id}
                          >
                            {deletingCardId === card.id ? "Eliminando..." : "Eliminar"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No se encontraron tarjetas que coincidan con la búsqueda
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-muted-foreground text-center">
        {filteredCards.length} {filteredCards.length === 1 ? "tarjeta" : "tarjetas"} en total
      </div>
    </div>
  );
};

export default CardList;
