
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
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-col gap-3">
          {/* Logo y título */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-2xl font-bold text-primary flex items-center gap-2">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="hidden xs:inline">Tarjetas Japonés</span>
              <span className="xs:hidden">Japonés</span>
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="flex items-center gap-1 text-xs sm:text-sm hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>

          {/* Navegación */}
          <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
            <Button
              variant={currentView === 'study' ? 'default' : 'outline'}
              onClick={() => onViewChange('study')}
              size="sm"
              className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Estudiar</span>
            </Button>
            <Button
              variant={currentView === 'numbers' ? 'default' : 'outline'}
              onClick={() => onViewChange('numbers')}
              size="sm"
              className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Calculator className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Números</span>
            </Button>
            <Button
              variant={currentView === 'kana' ? 'default' : 'outline'}
              onClick={() => onViewChange('kana')}
              size="sm"
              className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3"
            >
              <span className="text-xs sm:text-sm">あ</span>
              <span>Kana</span>
            </Button>
            <Button
              variant={currentView === 'add' ? 'default' : 'outline'}
              onClick={() => onViewChange('add')}
              size="sm"
              className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Añadir</span>
            </Button>
            <Button
              variant={currentView === 'import' ? 'default' : 'outline'}
              onClick={() => onViewChange('import')}
              size="sm"
              className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3"
            >
              <FileDown className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Importar</span>
            </Button>
            <Button
              variant={currentView === 'list' ? 'default' : 'outline'}
              onClick={() => onViewChange('list')}
              size="sm"
              className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3"
            >
              <List className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Lista</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
