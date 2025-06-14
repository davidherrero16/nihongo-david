
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./useAuth";

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hora
const WARNING_TIME = 5 * 60 * 1000; // 5 minutos antes de cerrar

export const useInactivityManager = () => {
  const { user, signOut, resetInactivityTimer } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [warningTimeLeft, setWarningTimeLeft] = useState(0);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const warningTimer = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
    if (warningTimer.current) {
      clearTimeout(warningTimer.current);
      warningTimer.current = null;
    }
  }, []);

  const startInactivityTimer = useCallback(() => {
    if (!user) return;

    clearTimers();

    // Timer para mostrar la advertencia
    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
      setWarningTimeLeft(WARNING_TIME / 1000);
    }, INACTIVITY_TIMEOUT - WARNING_TIME);

    // Timer para cerrar sesión automáticamente
    inactivityTimer.current = setTimeout(async () => {
      console.log('Sesión cerrada por inactividad');
      await signOut();
      setShowWarning(false);
    }, INACTIVITY_TIMEOUT);
  }, [user, signOut, clearTimers]);

  const resetTimer = useCallback(() => {
    setShowWarning(false);
    startInactivityTimer();
    resetInactivityTimer();
  }, [startInactivityTimer, resetInactivityTimer]);

  const handleExtendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const handleLogout = useCallback(async () => {
    clearTimers();
    setShowWarning(false);
    await signOut();
  }, [signOut, clearTimers]);

  // Detectar actividad del usuario
  useEffect(() => {
    if (!user) return;

    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (!showWarning) {
        resetTimer();
      }
    };

    activities.forEach(activity => {
      document.addEventListener(activity, handleActivity, true);
    });

    // Iniciar el timer al montar
    startInactivityTimer();

    return () => {
      activities.forEach(activity => {
        document.removeEventListener(activity, handleActivity, true);
      });
      clearTimers();
    };
  }, [user, showWarning, resetTimer, startInactivityTimer, clearTimers]);

  return {
    showWarning,
    warningTimeLeft,
    handleExtendSession,
    handleLogout
  };
};
