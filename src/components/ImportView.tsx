
import ImportDeck from "@/components/ImportDeck";

interface ImportViewProps {
  onImport: (name: string, cards: any[]) => void;
}

const ImportView = ({ onImport }: ImportViewProps) => {
  return (
    <div className="max-w-lg mx-auto">
      <ImportDeck onImport={onImport} />
    </div>
  );
};

export default ImportView;
