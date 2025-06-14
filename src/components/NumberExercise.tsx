import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, RotateCcw, CheckCircle, XCircle, Settings } from "lucide-react";
import { convertNumberToHiragana, generateRandomNumber } from "@/utils/numberConverter";

const NumberExercise = () => {
  const [currentNumber, setCurrentNumber] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [mode, setMode] = useState<'toJapanese' | 'toNumber'>('toJapanese');
  const [maxNumber, setMaxNumber] = useState<number>(9999);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [feedback, setFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    correctAnswer: string;
    userAnswer: string;
    comparison?: Array<{ char: string; isCorrect: boolean }>;
  }>({ show: false, isCorrect: false, correctAnswer: "", userAnswer: "" });

  // Función para formatear números con separadores de miles
  const formatNumberWithCommas = (num: number): string => {
    return num.toLocaleString('es-ES');
  };

  const generateNewQuestion = () => {
    setCurrentNumber(generateRandomNumber(1, maxNumber));
    setUserAnswer("");
    setFeedback({ show: false, isCorrect: false, correctAnswer: "", userAnswer: "" });
  };

  useEffect(() => {
    generateNewQuestion();
  }, [mode, maxNumber]);

  const compareStrings = (userInput: string, correct: string) => {
    const comparison: Array<{ char: string; isCorrect: boolean }> = [];
    const maxLength = Math.max(userInput.length, correct.length);
    
    for (let i = 0; i < maxLength; i++) {
      const userChar = userInput[i] || '';
      const correctChar = correct[i] || '';
      
      if (userChar && correctChar) {
        comparison.push({
          char: userChar,
          isCorrect: userChar === correctChar
        });
      } else if (userChar && !correctChar) {
        comparison.push({
          char: userChar,
          isCorrect: false
        });
      } else if (!userChar && correctChar) {
        comparison.push({
          char: `_${correctChar}_`,
          isCorrect: false
        });
      }
    }
    
    return comparison;
  };

  // Función simple para convertir hiragana de vuelta a número (para el modo japonés → número)
  const hiraganaToNumber = (hiragana: string): number => {
    // Esta es una implementación básica - en una app real necesitarías una implementación más completa
    const numberMap: { [key: string]: number } = {
      'ぜろ': 0,
      'いち': 1,
      'に': 2,
      'さん': 3,
      'よん': 4,
      'ご': 5,
      'ろく': 6,
      'なな': 7,
      'はち': 8,
      'きゅう': 9,
      'じゅう': 10
    };
    
    return numberMap[hiragana] || -1;
  };

  const checkAnswer = () => {
    const userInput = userAnswer.trim();
    let correctAnswer: string;
    let isCorrect: boolean;

    if (mode === 'toJapanese') {
      correctAnswer = convertNumberToHiragana(currentNumber);
      isCorrect = userInput === correctAnswer;
    } else {
      correctAnswer = currentNumber.toString();
      const parsedAnswer = parseInt(userInput);
      isCorrect = parsedAnswer === currentNumber;
    }

    const comparison = isCorrect ? undefined : compareStrings(userInput, correctAnswer);

    setFeedback({
      show: true,
      isCorrect,
      correctAnswer,
      userAnswer: userInput,
      comparison
    });

    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    if (isCorrect) {
      setTimeout(() => {
        generateNewQuestion();
      }, 1500);
    }
  };

  const resetScore = () => {
    setScore({ correct: 0, total: 0 });
    generateNewQuestion();
  };

  const getQuestion = () => {
    if (mode === 'toJapanese') {
      return `¿Cómo se escribe ${formatNumberWithCommas(currentNumber)} en japonés?`;
    } else {
      return `¿Qué número representa ${convertNumberToHiragana(currentNumber)}?`;
    }
  };

  const getScorePercentage = () => {
    if (score.total === 0) return 0;
    return Math.round((score.correct / score.total) * 100);
  };

  const numberRanges = [
    { value: 100, label: "1-100" },
    { value: 1000, label: "1-1,000" },
    { value: 10000, label: "1-10,000" },
    { value: 100000, label: "1-100,000" },
    { value: 1000000, label: "1-1,000,000" },
    { value: 10000000, label: "1-10,000,000" },
    { value: 50000000, label: "1-50,000,000" },
    { value: 99999999, label: "1-99,999,999" }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Ejercicio de Números
          </CardTitle>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-2">
              <Button
                variant={mode === 'toJapanese' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('toJapanese')}
              >
                Número → Japonés
              </Button>
              <Button
                variant={mode === 'toNumber' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('toNumber')}
              >
                Japonés → Número
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {score.correct}/{score.total} ({getScorePercentage()}%)
              </Badge>
              <Button variant="outline" size="sm" onClick={resetScore}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Selector de rango de números */}
          <div className="flex items-center gap-2 pt-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Rango:</span>
            <Select value={maxNumber.toString()} onValueChange={(value) => setMaxNumber(parseInt(value))}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {numberRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value.toString()}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">{getQuestion()}</h3>
            <div className="space-y-4">
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                placeholder={mode === 'toJapanese' ? 'Escribe en japonés...' : 'Escribe el número...'}
                className="text-lg text-center"
                disabled={feedback.show && feedback.isCorrect}
              />
              
              {feedback.show && (
                <div className={`p-4 rounded-lg border ${
                  feedback.isCorrect 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {feedback.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-semibold ${
                      feedback.isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {feedback.isCorrect ? '¡Correcto!' : 'Incorrecto'}
                    </span>
                  </div>
                  
                  {!feedback.isCorrect && (
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Tu respuesta: </span>
                        <div className="inline-flex">
                          {feedback.comparison?.map((item, index) => (
                            <span
                              key={index}
                              className={`px-1 ${
                                item.isCorrect 
                                  ? 'bg-green-100 text-green-800' 
                                  : item.char.startsWith('_') 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {item.char.startsWith('_') ? item.char.slice(1, -1) : item.char}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Respuesta correcta: </span>
                        <span className="text-lg font-semibold bg-gray-100 px-3 py-1 rounded-md border text-gray-900">
                          {feedback.correctAnswer}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={checkAnswer} 
                  disabled={!userAnswer.trim() || (feedback.show && feedback.isCorrect)}
                >
                  Comprobar
                </Button>
                {feedback.show && !feedback.isCorrect && (
                  <Button variant="outline" onClick={generateNewQuestion}>
                    Siguiente
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NumberExercise;
