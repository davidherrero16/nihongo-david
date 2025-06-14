
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FolderPlus, LayoutPanelLeft } from "lucide-react";
import type { Deck } from "@/hooks/useDecks";

interface DeckSelectorProps {
  decks: Deck[];
  currentDeckId: string;
  onSelectDeck: (deckId: string) => void;
  onCreateDeck: (name: string) => void;
}

const DeckSelector = ({ decks, currentDeckId, onSelectDeck, onCreateDeck }: DeckSelectorProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");

  // Array de colores para los diferentes grupos
  const deckColors = [
    { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', ring: 'ring-blue-500', icon: 'text-blue-600' },
    { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', ring: 'ring-green-500', icon: 'text-green-600' },
    { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', ring: 'ring-purple-500', icon: 'text-purple-600' },
    { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', ring: 'ring-orange-500', icon: 'text-orange-600' },
    { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', ring: 'ring-pink-500', icon: 'text-pink-600' },
    { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', ring: 'ring-indigo-500', icon: 'text-indigo-600' },
    { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', ring: 'ring-red-500', icon: 'text-red-600' },
    { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', ring: 'ring-yellow-500', icon: 'text-yellow-600' },
  ];

  const getColorForDeck = (index: number) => {
    return deckColors[index % deckColors.length];
  };

  const handleCreateDeck = () => {
    if (newDeckName.trim()) {
      onCreateDeck(newDeckName.trim());
      setNewDeckName("");
      setIsCreateDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Seleccionar Grupo de Tarjetas</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <FolderPlus className="h-4 w-4" />
              Nuevo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Grupo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="deck-name">Nombre del grupo</Label>
                <Input
                  id="deck-name"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="Ej: JLPT N5, Verbos, Kanji básico..."
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateDeck()}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateDeck} disabled={!newDeckName.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Grupo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        {decks.map((deck, index) => {
          const colors = getColorForDeck(index);
          return (
            <Card 
              key={deck.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${colors.bg} ${colors.border} ${
                currentDeckId === deck.id 
                  ? `ring-2 ${colors.ring} shadow-md` 
                  : `hover:ring-1 hover:${colors.ring}/50`
              }`}
              onClick={() => onSelectDeck(deck.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <LayoutPanelLeft className={`h-4 w-4 ${colors.icon}`} />
                  <h4 className={`font-medium ${deck.isImported ? 'text-indigo-600' : colors.text}`}>
                    {deck.name}
                  </h4>
                </div>
                <div className={`text-sm ${colors.text}/70`}>
                  {deck.cards.length} tarjetas
                </div>
                {deck.isImported && (
                  <div className="text-xs text-indigo-600 mt-1">
                    Importado
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DeckSelector;
