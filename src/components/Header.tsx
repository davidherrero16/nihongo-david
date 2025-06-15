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
  ChevronDown,
  Sun,
  Moon
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
import { useState } from "react";

interface HeaderProps {
  currentView: 'study' | 'add' | 'list' | 'numbers' | 'kana' | 'session' | 'profile' | 'stats';
  onViewChange: (view: 'study' | 'add' | 'list' | 'numbers' | 'kana' | 'session' | 'profile' | 'stats') => void;
  onSignOut: () => void;
}

const Header = ({ currentView, onViewChange, onSignOut }: HeaderProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const isActive = (view: string) => currentView === view;
  
  // Theme toggle functionality
  const [isDark, setIsDark] = useState(false);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  // Obtener nombre para mostrar
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Usuario';

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-japanese shadow-japanese sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-japanese-ai to-japanese-asagi rounded-lg flex items-center justify-center shadow-japanese">
                <Languages className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold font-japanese text-japanese-primary">
                Nihongo Study
              </h1>
            </div>
          </div>

          {/* Navegación central */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Button
              variant={isActive('study') ? 'default' : 'ghost'}
              onClick={() => onViewChange('study')}
              size="sm"
              className={`flex items-center gap-1.5 font-japanese transition-all duration-300 ${
                isActive('study') 
                  ? 'bg-japanese-ai text-white shadow-japanese' 
                  : 'text-japanese-secondary hover:text-japanese-primary hover:bg-japanese-sakura/30'
              }`}
            >
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Estudiar</span>
            </Button>

            <Button
              variant={isActive('add') ? 'default' : 'ghost'}
              onClick={() => onViewChange('add')}
              size="sm"
              className={`flex items-center gap-1.5 font-japanese transition-all duration-300 ${
                isActive('add') 
                  ? 'bg-japanese-midori text-white shadow-japanese' 
                  : 'text-japanese-secondary hover:text-japanese-primary hover:bg-japanese-sakura/30'
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Añadir</span>
            </Button>

            <Button
              variant={isActive('list') ? 'default' : 'ghost'}
              onClick={() => onViewChange('list')}
              size="sm"
              className={`flex items-center gap-1.5 font-japanese transition-all duration-300 ${
                isActive('list') 
                  ? 'bg-japanese-murasaki text-white shadow-japanese' 
                  : 'text-japanese-secondary hover:text-japanese-primary hover:bg-japanese-sakura/30'
              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Tarjetas</span>
            </Button>

            <Button
              variant={isActive('stats') ? 'default' : 'ghost'}
              onClick={() => onViewChange('stats')}
              size="sm"
              className={`flex items-center gap-1.5 font-japanese transition-all duration-300 ${
                isActive('stats') 
                  ? 'bg-japanese-asagi text-white shadow-japanese' 
                  : 'text-japanese-secondary hover:text-japanese-primary hover:bg-japanese-sakura/30'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Estadísticas</span>
            </Button>

            <Button
              variant={isActive('numbers') ? 'default' : 'ghost'}
              onClick={() => onViewChange('numbers')}
              size="sm"
              className={`flex items-center gap-1.5 font-japanese transition-all duration-300 ${
                isActive('numbers') 
                  ? 'bg-japanese-chairo text-white shadow-japanese' 
                  : 'text-japanese-secondary hover:text-japanese-primary hover:bg-japanese-sakura/30'
              }`}
            >
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Números</span>
            </Button>

            <Button
              variant={isActive('kana') ? 'default' : 'ghost'}
              onClick={() => onViewChange('kana')}
              size="sm"
              className={`flex items-center gap-1.5 font-japanese transition-all duration-300 ${
                isActive('kana') 
                  ? 'bg-japanese-fujiro text-white shadow-japanese' 
                  : 'text-japanese-secondary hover:text-japanese-primary hover:bg-japanese-sakura/30'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Kana</span>
            </Button>
          </nav>

          {/* Navegación móvil */}
          <div className="flex lg:hidden items-center space-x-1 overflow-x-auto scrollbar-hide">
            <Button
              variant={isActive('study') ? 'default' : 'ghost'}
              onClick={() => onViewChange('study')}
              size="sm"
              className={`flex items-center gap-1 text-xs whitespace-nowrap font-japanese ${
                isActive('study') 
                  ? 'bg-japanese-ai text-white' 
                  : 'text-japanese-secondary hover:text-japanese-primary'
              }`}
            >
              <Brain className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Estudiar</span>
            </Button>

            <Button
              variant={isActive('add') ? 'default' : 'ghost'}
              onClick={() => onViewChange('add')}
              size="sm"
              className={`flex items-center gap-1 text-xs whitespace-nowrap font-japanese ${
                isActive('add') 
                  ? 'bg-japanese-midori text-white' 
                  : 'text-japanese-secondary hover:text-japanese-primary'
              }`}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Añadir</span>
            </Button>

            <Button
              variant={isActive('list') ? 'default' : 'ghost'}
              onClick={() => onViewChange('list')}
              size="sm"
              className={`flex items-center gap-1 text-xs whitespace-nowrap font-japanese ${
                isActive('list') 
                  ? 'bg-japanese-murasaki text-white' 
                  : 'text-japanese-secondary hover:text-japanese-primary'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Lista</span>
            </Button>
          </div>

          {/* Controles del usuario */}
          <div className="flex items-center space-x-2">
            {/* Toggle de tema */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-japanese-secondary hover:text-japanese-primary hover:bg-japanese-sakura/30 transition-all duration-300"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            
            {/* Menú de usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1.5 text-sm font-japanese bg-white/80 border-japanese hover:bg-japanese-sakura/30 text-japanese-primary hover:text-japanese-ai transition-all duration-300"
                >
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline max-w-24 truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-white/95 backdrop-blur-sm border-japanese shadow-japanese-lg font-japanese"
              >
                <DropdownMenuLabel className="text-japanese-primary">
                  Mi Cuenta
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-japanese/20" />
                <DropdownMenuItem 
                  onClick={() => onViewChange('profile')}
                  className="flex items-center gap-2 text-japanese-secondary hover:text-japanese-primary hover:bg-japanese-sakura/30 transition-colors cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-japanese/20" />
                <DropdownMenuItem 
                  onClick={onSignOut}
                  className="flex items-center gap-2 text-japanese-beni hover:text-japanese-aka hover:bg-japanese-sakura/30 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Salir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
