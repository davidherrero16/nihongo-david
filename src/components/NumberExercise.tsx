
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
    { value: 999999999, label: "1-999,999,999" }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header with stats */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-full">
            <Calculator className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Ejercicio de números</h1>
        </div>
        
        {/* Score display */}
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
            <Trophy className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-700">
              {score.correct}/{score.total}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
            <Target className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-700">
              {getScorePercentage()}% precisión
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={resetScore} className="rounded-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reiniciar
          </Button>
        </div>
      </div>

      {/* Main exercise card */}
      <Card className="animate-fade-in shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
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
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Rango:</span>
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
            <div className="inline-block p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
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
                className="text-lg text-center py-6 text-gray-700 border-2 border-gray-200 focus:border-blue-400 rounded-xl"
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
            <div className={`p-6 rounded-2xl border-2 animate-fade-in ${
              feedback.isCorrect 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {feedback.isCorrect ? (
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                ) : (
                  <div className="p-2 bg-red-100 rounded-full">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                )}
                <span className={`text-lg font-semibold ${
                  feedback.isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {feedback.isCorrect ? '¡Correcto! 🎉' : 'Incorrecto 😅'}
                </span>
              </div>
              
              {!feedback.isCorrect && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <span className="text-sm font-medium text-gray-600 block mb-2">Tu respuesta:</span>
                    <div className="inline-flex flex-wrap gap-1">
                      {feedback.comparison?.map((item, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-md text-sm font-medium ${
                            item.isCorrect 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : item.char.startsWith('_') 
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                          }`}
                        >
                          {item.char.startsWith('_') ? item.char.slice(1, -1) : item.char}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <span className="text-sm font-medium text-gray-600 block mb-2">Respuesta correcta:</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
