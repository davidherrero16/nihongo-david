
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  PlusCircle, 
  List, 
  Brain, 
  Calculator, 
  Languages, 
  LogOut, 
  BarChart3
} from "lucide-react";

interface HeaderProps {
  currentView: 'study' | 'add' | 'list' | 'numbers' | 'kana' | 'session' | 'profile' | 'stats';
  onViewChange: (view: 'study' | 'add' | 'list' | 'numbers' | 'kana' | 'session' | 'profile' | 'stats') => void;
  onSignOut: () => void;
}

const Header = ({ currentView, onViewChange, onSignOut }: HeaderProps) => {
  const isActive = (view: string) => currentView === view;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              日本語学習
            </h1>
          </div>

          {/* Navegación principal centrada */}
          <nav className="hidden md:flex items-center justify-center gap-2 flex-1 mx-8">
            <Button
              variant={isActive('study') ? 'default' : 'ghost'}
              onClick={() => onViewChange('study')}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Estudiar
            </Button>
            <Button
              variant={isActive('add') ? 'default' : 'ghost'}
              onClick={() => onViewChange('add')}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Añadir
            </Button>
            <Button
              variant={isActive('list') ? 'default' : 'ghost'}
              onClick={() => onViewChange('list')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              Lista
            </Button>
            <Button
              variant={isActive('stats') ? 'default' : 'ghost'}
              onClick={() => onViewChange('stats')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Estadísticas
            </Button>
            <Button
              variant={isActive('numbers') ? 'default' : 'ghost'}
              onClick={() => onViewChange('numbers')}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              Números
            </Button>
            <Button
              variant={isActive('kana') ? 'default' : 'ghost'}
              onClick={() => onViewChange('kana')}
              className="flex items-center gap-2"
            >
              <Languages className="h-4 w-4" />
              Kana
            </Button>
          </nav>

          {/* Botón combinado de cuenta y salir */}
          <div className="flex items-center">
            <Button 
              variant="outline" 
              onClick={onSignOut}
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>

        {/* Navegación móvil */}
        <nav className="md:hidden mt-4 flex flex-wrap gap-2 justify-center">
          <Button
            variant={isActive('study') ? 'default' : 'ghost'}
            onClick={() => onViewChange('study')}
            size="sm"
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            Estudiar
          </Button>
          <Button
            variant={isActive('add') ? 'default' : 'ghost'}
            onClick={() => onViewChange('add')}
            size="sm"
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Añadir
          </Button>
          <Button
            variant={isActive('list') ? 'default' : 'ghost'}
            onClick={() => onViewChange('list')}
            size="sm"
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            Lista
          </Button>
          <Button
            variant={isActive('stats') ? 'default' : 'ghost'}
            onClick={() => onViewChange('stats')}
            size="sm"
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Stats
          </Button>
          <Button
            variant={isActive('numbers') ? 'default' : 'ghost'}
            onClick={() => onViewChange('numbers')}
            size="sm"
            className="flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Números
          </Button>
          <Button
            variant={isActive('kana') ? 'default' : 'ghost'}
            onClick={() => onViewChange('kana')}
            size="sm"
            className="flex items-center gap-2"
          >
            <Languages className="h-4 w-4" />
            Kana
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
