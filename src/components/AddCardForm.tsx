
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddCardFormProps {
  onAddCard: (word: string, reading: string, meaning: string) => Promise<void>;
}

const AddCardForm = ({ onAddCard }: AddCardFormProps) => {
  const [word, setWord] = useState("");
  const [reading, setReading] = useState("");
  const [meaning, setMeaning] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!word || !reading || !meaning) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddCard(word.trim(), reading.trim(), meaning.trim());
      setWord("");
      setReading("");
      setMeaning("");
      toast({
        title: "Éxito",
        description: "Tarjeta añadida correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo añadir la tarjeta",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Añadir nueva tarjeta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="word">Palabra japonesa</Label>
            <Input
              id="word"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="ej: こんにちは"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reading">Lectura (hiragana/katakana)</Label>
            <Input
              id="reading"
              value={reading}
              onChange={(e) => setReading(e.target.value)}
              placeholder="ej: こんにちは"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="meaning">Significado en español</Label>
            <Input
              id="meaning"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="ej: hola"
              disabled={isSubmitting}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Plus className="h-4 w-4 mr-2" />
            {isSubmitting ? "Añadiendo..." : "Añadir tarjeta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddCardForm;
