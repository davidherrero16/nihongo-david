
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  PlusCircle, 
  List, 
  Brain, 
  Calculator, 
  Languages, 
  LogOut, 
  BarChart3,
  User,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface HeaderProps {
  currentView: 'study' | 'add' | 'list' | 'numbers' | 'kana' | 'session' | 'profile' | 'stats';
  onViewChange: (view: 'study' | 'add' | 'list' | 'numbers' | 'kana' | 'session' | 'profile' | 'stats') => void;
  onSignOut: () => void;
}

const Header = ({ currentView, onViewChange, onSignOut }: HeaderProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const isActive = (view: string) => currentView === view;

  // Obtener nombre para mostrar
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Usuario';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-full">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              日本語学習
            </h1>
          </div>

          {/* Navegación principal centrada (solo desktop) */}
          <nav className="hidden lg:flex items-center justify-center gap-2 flex-1 mx-8">
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

          {/* Menú de usuario */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1.5 text-sm"
                >
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline max-w-24 truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="truncate">{displayName}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onViewChange('profile')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onSignOut}
                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Salir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navegación móvil mejorada */}
        <nav className="lg:hidden mt-3 sm:mt-4">
          {/* Primera fila - botones principales */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center mb-2">
            <Button
              variant={isActive('study') ? 'default' : 'ghost'}
              onClick={() => onViewChange('study')}
              size="sm"
              className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 min-w-0 flex-shrink-0"
            >
              <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="whitespace-nowrap">Estudiar</span>
            </Button>
            <Button
              variant={isActive('add') ? 'default' : 'ghost'}
              onClick={() => onViewChange('add')}
              size="sm"
              className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 min-w-0 flex-shrink-0"
            >
              <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="whitespace-nowrap">Añadir</span>
            </Button>
            <Button
              variant={isActive('list') ? 'default' : 'ghost'}
              onClick={() => onViewChange('list')}
              size="sm"
              className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 min-w-0 flex-shrink-0"
            >
              <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="whitespace-nowrap">Lista</span>
            </Button>
          </div>
          
          {/* Segunda fila - botones secundarios */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
            <Button
              variant={isActive('stats') ? 'default' : 'ghost'}
              onClick={() => onViewChange('stats')}
              size="sm"
              className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 min-w-0 flex-shrink-0"
            >
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="whitespace-nowrap">Stats</span>
            </Button>
            <Button
              variant={isActive('numbers') ? 'default' : 'ghost'}
              onClick={() => onViewChange('numbers')}
              size="sm"
              className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 min-w-0 flex-shrink-0"
            >
              <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="whitespace-nowrap">Números</span>
            </Button>
            <Button
              variant={isActive('kana') ? 'default' : 'ghost'}
              onClick={() => onViewChange('kana')}
              size="sm"
              className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 min-w-0 flex-shrink-0"
            >
              <Languages className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="whitespace-nowrap">Kana</span>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
