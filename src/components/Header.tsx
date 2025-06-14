
import { Button } from "@/components/ui/button";
import { BookOpen, List, Brain, PenTool, Calculator, FileDown, LogOut, Plus } from "lucide-react";

interface HeaderProps {
  currentView: 'study' | 'add' | 'list' | 'numbers' | 'import' | 'kana' | 'session';
  onViewChange: (view: 'study' | 'add' | 'list' | 'numbers' | 'import' | 'kana' | 'session') => void;
  onSignOut: () => void;
}

const Header = ({ currentView, onViewChange, onSignOut }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Tarjetas Japonés
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={currentView === 'study' ? 'default' : 'outline'}
                onClick={() => onViewChange('study')}
                size="sm"
                className="flex items-center gap-1"
              >
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Estudiar</span>
              </Button>
              <Button
                variant={currentView === 'numbers' ? 'default' : 'outline'}
                onClick={() => onViewChange('numbers')}
                size="sm"
                className="flex items-center gap-1"
              >
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Números</span>
              </Button>
              <Button
                variant={currentView === 'kana' ? 'default' : 'outline'}
                onClick={() => onViewChange('kana')}
                size="sm"
                className="flex items-center gap-1"
              >
                <span className="text-sm">あ</span>
                <span className="hidden sm:inline">Kana</span>
              </Button>
              <Button
                variant={currentView === 'add' ? 'default' : 'outline'}
                onClick={() => onViewChange('add')}
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Añadir</span>
              </Button>
              <Button
                variant={currentView === 'import' ? 'default' : 'outline'}
                onClick={() => onViewChange('import')}
                size="sm"
                className="flex items-center gap-1"
              >
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline">Importar</span>
              </Button>
              <Button
                variant={currentView === 'list' ? 'default' : 'outline'}
                onClick={() => onViewChange('list')}
                size="sm"
                className="flex items-center gap-1"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Lista</span>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
