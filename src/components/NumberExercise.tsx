import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, RotateCcw, CheckCircle, XCircle, Settings, Target, Trophy } from "lucide-react";
import { convertNumberToHiragana, generateRandomNumber } from "@/utils/numberConverter";

const NumberExercise = () => {
  const [currentNumber, setCurrentNumber] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [mode, setMode] = useState<'toJapanese' | 'toNumber'>('toJapanese');
  const [maxNumber, setMaxNumber] = useState<number>(10000000);
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
    { value: 999999999, label: "1-999,999,999" }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header with stats */}
      <div className="text-center space-y-4">
        
        {/* Score display */}
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 rounded-full border border-green-200 dark:border-green-700">
            <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-700 dark:text-green-300">
              {score.correct}/{score.total}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-700">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-blue-700 dark:text-blue-300">
              {getScorePercentage()}% precisión
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={resetScore} className="rounded-full">
            <RotateCcw className="h-5 w-5 mr-2" />
            Reiniciar
          </Button>
        </div>
      </div>

      {/* Main exercise card */}
      <Card className="animate-fade-in shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <CardHeader className="pb-4">
          {/* Mode selector */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={mode === 'toJapanese' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('toJapanese')}
                className="min-w-[140px]"
              >
                Número → japonés
              </Button>
              <Button
                variant={mode === 'toNumber' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('toNumber')}
                className="min-w-[140px]"
              >
                Japonés → número
              </Button>
            </div>
          </div>
          
          {/* Range selector */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Rango:</span>
            </div>
            <Select value={maxNumber.toString()} onValueChange={(value) => setMaxNumber(parseInt(value))}>
              <SelectTrigger className="w-48">
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

        <CardContent className="space-y-8">
          {/* Question */}
          <div className="text-center">
            <div className="inline-block p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl border border-blue-100 dark:border-blue-700 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {getQuestion()}
              </h3>
            </div>

            {/* Answer input */}
            <div className="max-w-md mx-auto space-y-6">
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                placeholder={mode === 'toJapanese' ? 'Escribe en japonés...' : 'Escribe el número...'}
                className="text-lg text-center py-6 text-gray-700 dark:text-white border-2 border-gray-200 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-500 rounded-xl bg-white dark:bg-gray-800"
                disabled={feedback.show && feedback.isCorrect}
              />
              
              {/* Action buttons */}
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={checkAnswer} 
                  disabled={!userAnswer.trim() || (feedback.show && feedback.isCorrect)}
                  size="lg"
                  className="min-w-[120px] rounded-xl"
                >
                  Comprobar
                </Button>
                {feedback.show && !feedback.isCorrect && (
                  <Button 
                    variant="outline" 
                    onClick={generateNewQuestion}
                    size="lg"
                    className="min-w-[120px] rounded-xl"
                  >
                    Siguiente
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Feedback */}
          {feedback.show && (
            <div className={`p-4 rounded-xl border-2 animate-fade-in ${
              feedback.isCorrect 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-600' 
                : 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border-red-200 dark:border-red-600'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {feedback.isCorrect ? (
                  <div className="p-1.5 bg-green-100 dark:bg-green-800 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="p-1.5 bg-red-100 dark:bg-red-800 rounded-full">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                )}
                <span className={`text-base font-semibold ${
                  feedback.isCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                }`}>
                  {feedback.isCorrect ? '¡Correcto! 🎉' : 'Incorrecto 😅'}
                </span>
              </div>
              
              {!feedback.isCorrect && (
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">Tu respuesta:</span>
                    <div className="inline-flex flex-wrap gap-1">
                      {feedback.comparison?.map((item, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-md text-sm font-medium ${
                            item.isCorrect 
                              ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-600' 
                              : item.char.startsWith('_') 
                                ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-600' 
                                : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-600'
                          }`}
                        >
                          {item.char.startsWith('_') ? item.char.slice(1, -1) : item.char}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">Respuesta correcta:</span>
                    <span className="text-lg font-bold bg-red-500 bg-clip-text text-transparent">
                      {feedback.correctAnswer}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NumberExercise;
