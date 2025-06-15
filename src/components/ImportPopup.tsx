import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import ImportDeck from "@/components/ImportDeck";

interface ImportPopupProps {
  onImport: (name: string, cards: any[]) => void;
  trigger?: React.ReactNode;
}

const ImportPopup = ({ onImport, trigger }: ImportPopupProps) => {
  const [open, setOpen] = useState(false);

  const handleImport = async (name: string, cards: any[]) => {
    await onImport(name, cards);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Importar deck
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar deck</DialogTitle>
        </DialogHeader>
        <ImportDeck onImport={handleImport} />
      </DialogContent>
    </Dialog>
  );
};

export default ImportPopup;
