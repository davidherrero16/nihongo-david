
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, RefreshCw, Settings } from "lucide-react";
import { convertNumberToHiragana, generateRandomNumber } from "@/utils/numberConverter";

type ExerciseMode = 'number-to-hiragana' | 'hiragana-to-number';

const NumberExercise = () => {
  const [mode, setMode] = useState<ExerciseMode>('number-to-hiragana');
  const [currentNumber, setCurrentNumber] = useState(generateRandomNumber());
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [maxNumber, setMaxNumber] = useState(9999999);

  const currentHiragana = convertNumberToHiragana(currentNumber);

  const handleSubmit = () => {
    let correct = false;
    
    if (mode === 'number-to-hiragana') {
      correct = userAnswer.trim() === currentHiragana;
    } else {
      const userNumber = parseInt(userAnswer.trim());
      correct = !isNaN(userNumber) && userNumber === currentNumber;
    }
    
    setIsCorrect(correct);
    setShowResult(true);
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const handleNext = () => {
    setCurrentNumber(generateRandomNumber(1, maxNumber));
    setUserAnswer("");
    setShowResult(false);
    setIsCorrect(null);
  };

  const resetScore = () => {
    setScore({ correct: 0, total: 0 });
  };

  const getScorePercentage = () => {
    if (score.total === 0) return 0;
    return Math.round((score.correct / score.total) * 100);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Ejercicio de Números</h2>
        <div className="flex justify-center gap-2 mb-4">
          <Button
            variant={mode === 'number-to-hiragana' ? 'default' : 'outline'}
            onClick={() => setMode('number-to-hiragana')}
            size="sm"
          >
            Número → Hiragana
          </Button>
          <Button
            variant={mode === 'hiragana-to-number' ? 'default' : 'outline'}
            onClick={() => setMode('hiragana-to-number')}
            size="sm"
          >
            Hiragana → Número
          </Button>
        </div>
      </div>

      {/* Score */}
      <div className="text-center">
        <div className="text-sm text-muted-foreground mb-2">
          Puntuación: {score.correct}/{score.total} ({getScorePercentage()}%)
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${getScorePercentage()}%` }}
          />
        </div>
      </div>

      {/* Settings */}
      <div className="flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <label htmlFor="maxNumber">Máximo:</label>
          <Input
            id="maxNumber"
            type="number"
            value={maxNumber}
            onChange={(e) => setMaxNumber(parseInt(e.target.value) || 9999999)}
            className="w-24 h-8"
            min="1"
            max="9999999"
          />
        </div>
      </div>

      {/* Exercise Card */}
      <Card className="min-h-[300px] shadow-lg">
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="space-y-6 w-full max-w-md">
            {mode === 'number-to-hiragana' ? (
              <>
                <div className="text-4xl font-bold text-primary mb-4">
                  {currentNumber.toLocaleString()}
                </div>
                <div className="text-lg text-muted-foreground mb-6">
                  Escribe este número en hiragana:
                </div>
              </>
            ) : (
              <>
                <div className="text-4xl font-bold text-primary mb-4">
                  {currentHiragana}
                </div>
                <div className="text-lg text-muted-foreground mb-6">
                  ¿Qué número es este?
                </div>
              </>
            )}

            <div className="space-y-4">
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={mode === 'number-to-hiragana' ? "ej: きゅうじゅうご" : "ej: 95"}
                className="text-lg text-center"
                disabled={showResult}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !showResult && userAnswer.trim()) {
                    handleSubmit();
                  }
                }}
              />

              {!showResult ? (
                <Button 
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                  className="w-full"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Comprobar
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className={`text-lg font-semibold mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                    </div>
                    {!isCorrect && (
                      <div className="text-sm mb-2 text-red-600">
                        <span className="font-medium">Tu respuesta:</span> {userAnswer || "(vacío)"}
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="font-medium">Respuesta correcta:</span>{' '}
                      {mode === 'number-to-hiragana' ? currentHiragana : currentNumber.toLocaleString()}
                    </div>
                  </div>

                  <Button 
                    onClick={handleNext}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Siguiente Número
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-2">
        <Button 
          variant="outline" 
          onClick={handleNext}
          disabled={showResult}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Nuevo Número
        </Button>
        <Button 
          variant="outline" 
          onClick={resetScore}
          className="text-orange-600 border-orange-200 hover:bg-orange-50"
        >
          <X className="h-4 w-4 mr-2" />
          Resetear Puntuación
        </Button>
      </div>
    </div>
  );
};

export default NumberExercise;
