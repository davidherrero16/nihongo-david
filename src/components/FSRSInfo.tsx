import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, Target, TrendingUp, Calendar, Zap } from "lucide-react";
import type { Card as CardType } from "@/types/deck";
import { useFSRS } from "@/hooks/useFSRS";

interface FSRSInfoProps {
  cards: CardType[];
  currentCard?: CardType;
  userId: string;
  className?: string;
}

export const FSRSInfo = ({ cards, currentCard, userId, className = "" }: FSRSInfoProps) => {
  const { 
    analytics, 
    recommendations, 
    getCardPerformance, 
    sessionStats,
    isSessionActive,
    currentSessionDuration 
  } = useFSRS(cards, userId);

  const currentCardPerformance = currentCard ? getCardPerformance(currentCard) : null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Información de la tarjeta actual */}
      {currentCard && currentCardPerformance && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Estado de la Tarjeta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estado:</span>
              <Badge 
                variant={currentCardPerformance.status === 'overdue' ? 'destructive' : 'secondary'}
                className={currentCardPerformance.color}
              >
                {currentCardPerformance.status === 'new' && 'Nueva'}
                {currentCardPerformance.status === 'learning' && 'Aprendiendo'}
                {currentCardPerformance.status === 'young' && 'Joven'}
                {currentCardPerformance.status === 'mature' && 'Madura'}
                {currentCardPerformance.status === 'overdue' && 'Vencida'}
                {currentCardPerformance.status === 'relearning' && 'Reaprendiendo'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Intervalo:</span>
              <span className="text-sm font-medium">
                {currentCardPerformance.interval} día{currentCardPerformance.interval !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estabilidad:</span>
              <span className="text-sm font-medium">
                {currentCardPerformance.stability.toFixed(1)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Repeticiones:</span>
              <span className="text-sm font-medium">
                {currentCardPerformance.repetitions}
              </span>
            </div>

            {currentCardPerformance.overdueDays > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Días vencida:</span>
                <span className="text-sm font-medium text-red-600">
                  {currentCardPerformance.overdueDays}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estadísticas de la sesión */}
      {isSessionActive && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Sesión Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Duración:</span>
              <span className="text-sm font-medium">
                {currentSessionDuration} min
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tarjetas:</span>
              <span className="text-sm font-medium">
                {sessionStats.cardsStudied}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Retención:</span>
              <span className={`text-sm font-medium ${
                sessionStats.retentionRate >= 85 ? 'text-green-600' :
                sessionStats.retentionRate >= 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {sessionStats.retentionRate.toFixed(0)}%
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progreso:</span>
                <span className="font-medium">
                  {sessionStats.correctAnswers}/{sessionStats.cardsStudied}
                </span>
              </div>
              <Progress 
                value={sessionStats.retentionRate} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análisis FSRS */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Análisis FSRS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">Nuevas</div>
              <div className="font-medium text-blue-600">{analytics.new}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Vencidas</div>
              <div className="font-medium text-red-600">{analytics.overdue}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Jóvenes</div>
              <div className="font-medium text-yellow-600">{analytics.young}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Maduras</div>
              <div className="font-medium text-green-600">{analytics.mature}</div>
            </div>
          </div>
          
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Retención media:</span>
              <span className="text-sm font-medium">
                {analytics.retentionRate.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Intervalo medio:</span>
              <span className="text-sm font-medium">
                {analytics.avgInterval.toFixed(1)} días
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Tarjetas diarias:</span>
              <span className="ml-2 font-medium">
                {recommendations.recommendedDailyCards}
              </span>
            </div>
            
            <div>
              <span className="text-muted-foreground">Mejor momento:</span>
              <span className="ml-2 font-medium">
                {recommendations.optimalStudyTime}
              </span>
            </div>
            
            <div>
              <span className="text-muted-foreground">Enfoque:</span>
              <span className="ml-2 font-medium">
                {recommendations.difficultyFocus}
              </span>
            </div>
            
            <div>
              <span className="text-muted-foreground">Consejo:</span>
              <span className="ml-2 font-medium text-blue-600">
                {recommendations.retentionAdvice}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predicciones */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Próximos 30 días
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Revisiones esperadas:</span>
            <span className="text-sm font-medium">
              {analytics.expectedReviews}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tiempo estimado:</span>
            <span className="text-sm font-medium">
              {analytics.expectedWorkload} min
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Retención prevista:</span>
            <span className={`text-sm font-medium ${
              analytics.retentionPrediction >= 85 ? 'text-green-600' :
              analytics.retentionPrediction >= 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {analytics.retentionPrediction.toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FSRSInfo; 