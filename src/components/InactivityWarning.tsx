
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface InactivityWarningProps {
  onExtendSession: () => void;
  onLogout: () => void;
  remainingTime: number;
}

const InactivityWarning = ({ onExtendSession, onLogout, remainingTime }: InactivityWarningProps) => {
  const [timeLeft, setTimeLeft] = useState(remainingTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onLogout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
          <CardTitle>Sesión por expirar</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Tu sesión se cerrará automáticamente en:
          </p>
          <div className="text-2xl font-bold text-yellow-600">
            {formatTime(timeLeft)}
          </div>
          <p className="text-sm text-muted-foreground">
            ¿Quieres mantener tu sesión activa?
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={onExtendSession} className="flex-1">
              Mantener sesión
            </Button>
            <Button onClick={onLogout} variant="outline" className="flex-1">
              Cerrar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InactivityWarning;
