import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, RefreshCw, Settings, Shuffle, PenTool, Languages, Trophy, Target, RotateCcw } from "lucide-react";

// Datos de hiragana y katakana
const hiraganaChars = {
  basic: {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'を': 'wo', 'ん': 'n'
  },
  dakuten: {
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po'
  }
};

const katakanaChars = {
  basic: {
    'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
    'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
    'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
    'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
    'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
    'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
    'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
    'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
    'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
    'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n'
  },
  dakuten: {
    'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
    'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
    'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
    'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
    'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po'
  }
};

const phrases = [
  { k: "こんにちは", r: "konnichiwa" },
  { k: "ありがとう", r: "arigatou" },
  { k: "さようなら", r: "sayounara" },
  { k: "おはよう", r: "ohayou" },
  { k: "すみません", r: "sumimasen" },
  { k: "はじめまして", r: "hajimemashite" },
  { k: "おやすみなさい", r: "oyasuminasai" },
  { k: "いただきます", r: "itadakimasu" }
];

type KanaType = 'hiragana' | 'katakana';
type CharSetType = 'basic' | 'dakuten' | 'all';
type ExerciseMode = 'kana-to-romaji' | 'romaji-to-kana' | 'phrase' | 'writing';

const KanaExercise = () => {
  const [kanaType, setKanaType] = useState<KanaType>('hiragana');
  const [charSet, setCharSet] = useState<CharSetType>('basic');
  const [mode, setMode] = useState<ExerciseMode>('kana-to-romaji');
  const [currentChar, setCurrentChar] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // Generar nuevo carácter cuando cambien las configuraciones
  useEffect(() => {
    generateNewChar();
    setUserAnswer("");
    setShowResult(false);
  }, [kanaType, charSet, mode]);

  function generateNewChar() {
    const chars = kanaType === 'hiragana' 
      ? (charSet === 'basic' ? hiraganaChars.basic : 
         charSet === 'dakuten' ? hiraganaChars.dakuten : 
         {...hiraganaChars.basic, ...hiraganaChars.dakuten})
      : (charSet === 'basic' ? katakanaChars.basic : 
         charSet === 'dakuten' ? katakanaChars.dakuten : 
         {...katakanaChars.basic, ...katakanaChars.dakuten});
    
    if (mode === 'phrase') {
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      setCurrentChar(randomPhrase.k);
      setCurrentAnswer(randomPhrase.r);
      return;
    }
    
    const keys = Object.keys(chars);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    
    if (mode === 'kana-to-romaji' || mode === 'writing') {
      setCurrentChar(randomKey);
      setCurrentAnswer(chars[randomKey]);
    } else {
      setCurrentChar(chars[randomKey]);
      setCurrentAnswer(randomKey);
    }
  }

  const handleSubmit = () => {
    const isAnswerCorrect = userAnswer.trim().toLowerCase() === currentAnswer.toLowerCase();
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    setScore({
      correct: score.correct + (isAnswerCorrect ? 1 : 0),
      total: score.total + 1
    });
  };

  const handleNext = () => {
    setUserAnswer("");
    setShowResult(false);
    generateNewChar();
  };

  const resetScore = () => {
    setScore({ correct: 0, total: 0 });
  };

  const getScorePercentage = () => {
    if (score.total === 0) return 0;
    return Math.round((score.correct / score.total) * 100);
  };

  const getQuestion = () => {
    if (mode === 'kana-to-romaji' || mode === 'writing') {
      return `¿Cómo se lee "${currentChar}" en romaji?`;
    } else if (mode === 'romaji-to-kana') {
      return `¿Cómo se escribe "${currentChar}" en ${kanaType}?`;
    } else {
      return `¿Cómo se lee esta frase en romaji?`;
    }
  };

  const handleKanaTypeChange = (newType: KanaType) => {
    setKanaType(newType);
  };

  const handleCharSetChange = (newCharSet: CharSetType) => {
    setCharSet(newCharSet);
  };

  const handleModeChange = (newMode: ExerciseMode) => {
    setMode(newMode);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header with stats */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-full">
            <Languages className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Ejercicio de kana</h1>
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
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Tipo:</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={kanaType === 'hiragana' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setKanaType('hiragana')}
                  className="min-w-[100px]"
                >
                  ひらがな
                </Button>
                <Button
                  variant={kanaType === 'katakana' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setKanaType('katakana')}
                  className="min-w-[100px]"
                >
                  カタカナ
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Conjunto:</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={charSet === 'basic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCharSet('basic')}
                  className="min-w-[80px]"
                >
                  Básico
                </Button>
                <Button
                  variant={charSet === 'dakuten' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCharSet('dakuten')}
                  className="min-w-[80px]"
                >
                  Dakuten
                </Button>
                <Button
                  variant={charSet === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCharSet('all')}
                  className="min-w-[80px]"
                >
                  Todos
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Modo:</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={mode === 'kana-to-romaji' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('kana-to-romaji')}
                  className="text-xs"
                >
                  Kana → romaji
                </Button>
                <Button
                  variant={mode === 'romaji-to-kana' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('romaji-to-kana')}
                  className="text-xs"
                >
                  Romaji → kana
                </Button>
                <Button
                  variant={mode === 'phrase' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('phrase')}
                  className="text-xs"
                >
                  Frases
                </Button>
                <Button
                  variant={mode === 'writing' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('writing')}
                  className="text-xs"
                >
                  <PenTool className="h-3 w-3 mr-1" />
                  Escritura
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Question */}
          <div className="text-center">
            <div className="inline-block p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {getQuestion()}
              </h3>
              {mode === 'writing' ? (
                <div className="space-y-4 mt-6">
                  <div className="text-lg font-medium text-muted-foreground">
                    Escribe en romaji: {currentAnswer}
                  </div>
                  <div className="border-2 border-dashed border-muted-foreground rounded-lg h-32 flex items-center justify-center bg-muted/20">
                    <div className="text-center">
                      <PenTool className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Área de escritura</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        (Funcionalidad de dibujo próximamente)
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Por ahora, escribe la respuesta abajo:
                  </p>
                </div>
              ) : (
                <div className="text-6xl font-bold text-primary mt-4">
                  {currentChar}
                </div>
              )}
            </div>

            {/* Answer input */}
            <div className="max-w-md mx-auto space-y-6">
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !showResult && userAnswer.trim()) {
                    handleSubmit();
                  }
                }}
                placeholder={mode === 'romaji-to-kana' ? 'Escribe en kana...' : 'Escribe en romaji...'}
                className="text-lg text-center py-6 text-gray-700 border-2 border-gray-200 focus:border-purple-400 rounded-xl"
                disabled={showResult}
              />
              
              {/* Action buttons */}
              <div className="flex gap-3 justify-center">
                {!showResult ? (
                  <>
                    <Button 
                      onClick={handleSubmit}
                      disabled={!userAnswer.trim()}
                      size="lg"
                      className="min-w-[120px] rounded-xl"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Comprobar
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleNext}
                      size="lg"
                      className="min-w-[120px] rounded-xl"
                    >
                      <Shuffle className="h-4 w-4 mr-2" />
                      Siguiente
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleNext}
                    size="lg"
                    className="min-w-[120px] rounded-xl"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Continuar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Feedback */}
          {showResult && (
            <div className={`p-6 rounded-2xl border-2 animate-fade-in ${
              isCorrect 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {isCorrect ? (
                  <div className="p-2 bg-green-100 rounded-full">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                ) : (
                  <div className="p-2 bg-red-100 rounded-full">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                )}
                <span className={`text-lg font-semibold ${
                  isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {isCorrect ? '¡Correcto! 🎉' : 'Incorrecto 😅'}
                </span>
              </div>
              
              {!isCorrect && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <span className="text-sm font-medium text-gray-600 block mb-2">Tu respuesta:</span>
                    <span className="text-lg font-medium text-red-600">
                      {userAnswer || "(vacío)"}
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <span className="text-sm font-medium text-gray-600 block mb-2">Respuesta correcta:</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {currentAnswer}
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

export default KanaExercise;
