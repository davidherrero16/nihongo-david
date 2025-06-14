
import { Book, Plus, List, Calculator, Upload, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  currentView: 'study' | 'add' | 'list' | 'numbers' | 'import' | 'kana' | 'session' | 'profile';
  onViewChange: (view: 'study' | 'add' | 'list' | 'numbers' | 'import' | 'kana' | 'session' | 'profile') => void;
  onSignOut: () => void;
}

const Header = ({ currentView, onViewChange, onSignOut }: HeaderProps) => {
  const navigationItems = [
    { view: 'study' as const, icon: Book, label: 'Estudiar' },
    { view: 'add' as const, icon: Plus, label: 'Añadir' },
    { view: 'list' as const, icon: List, label: 'Lista' },
    { view: 'numbers' as const, icon: Calculator, label: 'Números' },
    { view: 'kana' as const, icon: Book, label: 'Kana' },
    { view: 'import' as const, icon: Upload, label: 'Importar' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-2 sm:px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onViewChange('study')}
            className="text-xl sm:text-2xl font-bold text-gray-800 truncate hover:text-blue-600 transition-colors cursor-pointer"
          >
            日本語学習 (Nihongo Gakushū)
          </button>
          
          <div className="flex items-center gap-2">
            {/* Navigation buttons for larger screens */}
            <div className="hidden md:flex items-center gap-2">
              {navigationItems.map(({ view, icon: Icon, label }) => (
                <Button
                  key={view}
                  variant={currentView === view ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange(view)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{label}</span>
                </Button>
              ))}
            </div>

            {/* Dropdown menu for smaller screens */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <List className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {navigationItems.map(({ view, icon: Icon, label }) => (
                    <DropdownMenuItem
                      key={view}
                      onClick={() => onViewChange(view)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => onViewChange('profile')}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onSignOut}
                  className="flex items-center gap-2 text-red-600"
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
