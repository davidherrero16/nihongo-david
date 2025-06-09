
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface AddCardFormProps {
  onAddCard: (word: string, reading: string, meaning: string) => void;
}

const AddCardForm = ({ onAddCard }: AddCardFormProps) => {
  const [word, setWord] = useState("");
  const [reading, setReading] = useState("");
  const [meaning, setMeaning] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (word.trim() && reading.trim() && meaning.trim()) {
      onAddCard(word.trim(), reading.trim(), meaning.trim());
      setWord("");
      setReading("");
      setMeaning("");
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Añadir Nueva Tarjeta
        </CardTitle>
        <CardDescription>
          Crea una nueva tarjeta de estudio con la palabra japonesa, su lectura y significado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="word">Palabra Japonesa</Label>
            <Input
              id="word"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="例: 本"
              className="text-lg"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reading">Lectura (Hiragana/Katakana)</Label>
            <Input
              id="reading"
              value={reading}
              onChange={(e) => setReading(e.target.value)}
              placeholder="例: ほん"
              className="text-lg"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="meaning">Significado en Español</Label>
            <Textarea
              id="meaning"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="例: libro"
              className="min-h-[80px]"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={!word.trim() || !reading.trim() || !meaning.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir Tarjeta
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddCardForm;
