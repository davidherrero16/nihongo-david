
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";

interface EmptyStateProps {
  onAddCard: () => void;
}

const EmptyState = ({ onAddCard }: EmptyStateProps) => {
  return (
    <div className="text-center py-16">
      <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-muted-foreground mb-2">
        No hay tarjetas para estudiar
      </h2>
      <p className="text-muted-foreground mb-4">
        Añade tu primera tarjeta para comenzar a estudiar
      </p>
      <Button onClick={onAddCard}>
        <Plus className="h-4 w-4 mr-2" />
        Añadir Primera Tarjeta
      </Button>
    </div>
  );
};

export default EmptyState;
