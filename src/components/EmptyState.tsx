import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Plus } from "lucide-react";

interface EmptyStateProps {
  onAddCard: () => void;
}

const EmptyState = ({ onAddCard }: EmptyStateProps) => {
  return (
    <Card className="text-center py-12 bg-white dark:bg-gray-800">
      <CardContent className="space-y-6">
        <div className="mx-auto w-24 h-24 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
          <BookOpen className="h-12 w-12 text-blue-500 dark:text-blue-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            ¡Comienza tu aventura de aprendizaje!
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Este grupo no tiene tarjetas aún. Añade tu primera tarjeta para comenzar a estudiar japonés.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button onClick={onAddCard} size="lg" className="w-full sm:w-auto">
            <Plus className="h-5 w-5 mr-2" />
            Añadir primera tarjeta
          </Button>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>💡 <strong>Consejo:</strong> Puedes añadir palabras, frases o kanji</p>
          <p>🎯 Las tarjetas se revisan según tu progreso de aprendizaje</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
