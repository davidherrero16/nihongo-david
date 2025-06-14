
import { useState, useEffect, createContext, useContext, useRef, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  resetInactivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hora en milisegundos

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  // Función para reiniciar el timer de inactividad
  const resetInactivityTimer = useCallback(() => {
    if (!user) return;

    // Limpiar el timer anterior si existe
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    // Crear un nuevo timer
    inactivityTimer.current = setTimeout(async () => {
      console.log('Sesión cerrada por inactividad');
      await supabase.auth.signOut();
    }, INACTIVITY_TIMEOUT);
  }, [user]);

  // Función para cerrar sesión manualmente
  const signOut = async () => {
    console.log('Cerrando sesión...');
    try {
      // Limpiar timer de inactividad
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = null;
      }
      
      // Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error al cerrar sesión:', error);
      } else {
        console.log('Sesión cerrada exitosamente');
        // La redirección se manejará automáticamente por el useEffect en Index.tsx
      }
    } catch (error) {
      console.error('Error inesperado al cerrar sesión:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Si hay una sesión activa, iniciar el timer de inactividad
        if (session?.user) {
          resetInactivityTimer();
        } else {
          // Si no hay sesión, limpiar el timer
          if (inactivityTimer.current) {
            clearTimeout(inactivityTimer.current);
            inactivityTimer.current = null;
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Si hay una sesión existente, iniciar el timer
      if (session?.user) {
        resetInactivityTimer();
      }
    });

    return () => {
      subscription.unsubscribe();
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [resetInactivityTimer]);

  // Detectar actividad del usuario y reiniciar el timer
  useEffect(() => {
    if (!user) return;

    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Añadir listeners para detectar actividad
    activities.forEach(activity => {
      document.addEventListener(activity, handleActivity, true);
    });

    return () => {
      // Limpiar listeners al desmontar
      activities.forEach(activity => {
        document.removeEventListener(activity, handleActivity, true);
      });
    };
  }, [user, resetInactivityTimer]);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, resetInactivityTimer }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
