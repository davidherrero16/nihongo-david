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
  Moon,
  PenTool
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
  currentView: 'study' | 'list' | 'numbers' | 'kana' | 'session' | 'profile' | 'stats';
  onViewChange: (view: 'study' | 'list' | 'numbers' | 'kana' | 'session' | 'profile' | 'stats') => void;
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
    <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-japanese shadow-japanese sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo y título */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-japanese-ai to-japanese-asagi rounded-lg flex items-center justify-center shadow-japanese">
                <Languages className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold font-japanese text-japanese-primary dark:text-white">
                日本語学習 (Nihongo Gakushou)
              </h1>
            </div>
          </div>

          {/* Navegación central */}
          <nav className="hidden md:flex items-center space-x-2">
            <Button
              variant={isActive('study') ? 'default' : 'ghost'}
              onClick={() => onViewChange('study')}
              size="sm"
              className={`flex items-center gap-1.5 font-japanese transition-all duration-300 ${
                isActive('study') 
                  ? 'bg-japanese-ai text-white shadow-japanese' 
                  : 'text-japanese-secondary dark:text-gray-300 hover:text-japanese-ai hover:bg-japanese-sakura/40 dark:hover:bg-gray-800'
              }`}
            >
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Estudiar</span>
            </Button>

            <Button
              variant={isActive('list') ? 'default' : 'ghost'}
              onClick={() => onViewChange('list')}
              size="sm"
              className={`flex items-center gap-1.5 font-japanese transition-all duration-300 ${
                isActive('list') 
                  ? 'bg-japanese-murasaki text-white shadow-japanese' 
                  : 'text-japanese-secondary dark:text-gray-300 hover:text-japanese-murasaki hover:bg-japanese-sakura/40 dark:hover:bg-gray-800'
              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Tarjetas</span>
            </Button>

            <Button
              variant={isActive('numbers') ? 'default' : 'ghost'}
              onClick={() => onViewChange('numbers')}
              size="sm"
              className={`flex items-center gap-1.5 font-japanese transition-all duration-300 ${
                isActive('numbers') 
                  ? 'bg-japanese-chairo text-white shadow-japanese' 
                  : 'text-japanese-secondary dark:text-gray-300 hover:text-japanese-chairo hover:bg-japanese-sakura/40 dark:hover:bg-gray-800'
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
                  : 'text-japanese-secondary dark:text-gray-300 hover:text-japanese-fujiro hover:bg-japanese-sakura/40 dark:hover:bg-gray-800'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Kana</span>
            </Button>

            <Button
              variant={isActive('stats') ? 'default' : 'ghost'}
              onClick={() => onViewChange('stats')}
              size="sm"
              className={`flex items-center gap-1.5 font-japanese transition-all duration-300 ${
                isActive('stats') 
                  ? 'bg-japanese-asagi text-white shadow-japanese' 
                  : 'text-japanese-secondary dark:text-gray-300 hover:text-japanese-asagi hover:bg-japanese-sakura/40 dark:hover:bg-gray-800'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Estadísticas</span>
            </Button>
          </nav>

          {/* Navegación móvil */}
          <div className="flex md:hidden items-center space-x-1">
            <Button
              variant={isActive('study') ? 'default' : 'ghost'}
              onClick={() => onViewChange('study')}
              size="sm"
              className={`flex items-center gap-1 text-xs whitespace-nowrap font-japanese ${
                isActive('study') 
                  ? 'bg-japanese-ai text-white' 
                  : 'text-japanese-secondary dark:text-gray-300 hover:text-japanese-ai hover:bg-japanese-sakura/40 dark:hover:bg-gray-800'
              }`}
            >
              <Brain className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Estudiar</span>
            </Button>

            <Button
              variant={isActive('list') ? 'default' : 'ghost'}
              onClick={() => onViewChange('list')}
              size="sm"
              className={`flex items-center gap-1 text-xs whitespace-nowrap font-japanese ${
                isActive('list') 
                  ? 'bg-japanese-murasaki text-white' 
                  : 'text-japanese-secondary dark:text-gray-300 hover:text-japanese-murasaki hover:bg-japanese-sakura/40 dark:hover:bg-gray-800'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Tarjetas</span>
            </Button>

            <Button
              variant={isActive('numbers') ? 'default' : 'ghost'}
              onClick={() => onViewChange('numbers')}
              size="sm"
              className={`flex items-center gap-1 text-xs whitespace-nowrap font-japanese ${
                isActive('numbers') 
                  ? 'bg-japanese-chairo text-white' 
                  : 'text-japanese-secondary dark:text-gray-300 hover:text-japanese-chairo hover:bg-japanese-sakura/40 dark:hover:bg-gray-800'
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Números</span>
            </Button>

            <Button
              variant={isActive('kana') ? 'default' : 'ghost'}
              onClick={() => onViewChange('kana')}
              size="sm"
              className={`flex items-center gap-1 text-xs whitespace-nowrap font-japanese ${
                isActive('kana') 
                  ? 'bg-japanese-fujiro text-white' 
                  : 'text-japanese-secondary dark:text-gray-300 hover:text-japanese-fujiro hover:bg-japanese-sakura/40 dark:hover:bg-gray-800'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Kana</span>
            </Button>
          </div>

          {/* Controles del usuario */}
          <div className="flex items-center space-x-2">
            {/* Toggle de tema */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-japanese-secondary dark:text-gray-300 hover:text-japanese-ai hover:bg-japanese-sakura/40 dark:hover:bg-gray-800 transition-all duration-300"
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
                  className="flex items-center gap-1.5 text-sm font-japanese bg-white/80 dark:bg-gray-800/80 border-japanese hover:bg-japanese-sakura/40 dark:hover:bg-gray-700 text-japanese-ai hover:text-japanese-ai dark:text-gray-300 transition-all duration-300"
                >
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline truncate max-w-[100px]">{displayName}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end" 
                className="w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-japanese shadow-japanese-lg font-japanese"
              >
                <DropdownMenuLabel className="text-japanese-ai dark:text-white">
                  Mi Cuenta
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-japanese/20 dark:bg-gray-600" />
                <DropdownMenuItem 
                  onClick={() => onViewChange('profile')}
                  className="flex items-center gap-2 text-japanese-secondary dark:text-gray-300 hover:text-japanese-ai hover:bg-japanese-sakura/40 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-japanese/20 dark:bg-gray-600" />
                <DropdownMenuItem 
                  onClick={onSignOut}
                  className="flex items-center gap-2 text-japanese-beni hover:text-japanese-aka hover:bg-japanese-sakura/40 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
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
