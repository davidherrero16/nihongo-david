import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, RefreshCw, Settings, Shuffle, Languages, Trophy, Target, RotateCcw, Grid3X3, BookOpen, Gamepad2, Map, ArrowLeft, ArrowRight, Eye, Brain, Zap, GraduationCap, Star, BookMarked } from "lucide-react";

// Datos organizados por filas para hiragana y katakana
const hiraganaRows = {
  a: { 'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o' },
  ka: { 'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko' },
  sa: { 'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so' },
  ta: { 'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to' },
  na: { 'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no' },
  ha: { 'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho' },
  ma: { 'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo' },
  ya: { 'や': 'ya', 'ゆ': 'yu', 'よ': 'yo' },
  ra: { 'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro' },
  wa: { 'わ': 'wa', 'を': 'wo', 'ん': 'n' }
};

const hiraganaRowsDakuten = {
  ga: { 'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go' },
  za: { 'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo' },
  da: { 'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do' },
  ba: { 'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo' },
  pa: { 'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po' }
};

const katakanaRows = {
  a: { 'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o' },
  ka: { 'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko' },
  sa: { 'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so' },
  ta: { 'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to' },
  na: { 'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no' },
  ha: { 'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho' },
  ma: { 'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo' },
  ya: { 'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo' },
  ra: { 'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro' },
  wa: { 'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n' }
};

const katakanaRowsDakuten = {
  ga: { 'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go' },
  za: { 'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo' },
  da: { 'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do' },
  ba: { 'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo' },
  pa: { 'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po' }
};

// Para compatibilidad con el código existente
const hiraganaChars = {
  basic: Object.assign({}, ...Object.values(hiraganaRows)),
  dakuten: Object.assign({}, ...Object.values(hiraganaRowsDakuten))
};

const katakanaChars = {
  basic: Object.assign({}, ...Object.values(katakanaRows)),
  dakuten: Object.assign({}, ...Object.values(katakanaRowsDakuten))
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
type ExerciseMode = 'kana-to-romaji' | 'romaji-to-kana' | 'phrase';
type KanaRow = 'all' | 'a' | 'ka' | 'sa' | 'ta' | 'na' | 'ha' | 'ma' | 'ya' | 'ra' | 'wa' | 'ga' | 'za' | 'da' | 'ba' | 'pa';
type StudyMode = 'study' | 'exercise';

// Función para mezclar array (Fisher-Yates shuffle)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Componente de Mapa de Progreso
const LearningPath = ({ 
  kanaType, 
  onSelectRow, 
  progress = {} 
}: { 
  kanaType: KanaType;
  onSelectRow: (row: string) => void;
  progress?: Record<string, number>;
}) => {
  const rowData = kanaType === 'hiragana' ? hiraganaRows : katakanaRows;
  const rowNames = Object.keys(rowData);

  const getRowLabel = (row: string) => {
    const labels: Record<string, string> = {
      a: 'あ行 (a, i, u, e, o)',
      ka: 'か行 (ka, ki, ku, ke, ko)', 
      sa: 'さ行 (sa, shi, su, se, so)',
      ta: 'た行 (ta, chi, tsu, te, to)',
      na: 'な行 (na, ni, nu, ne, no)',
      ha: 'は行 (ha, hi, fu, he, ho)',
      ma: 'ま行 (ma, mi, mu, me, mo)',
      ya: 'や行 (ya, yu, yo)',
      ra: 'ら行 (ra, ri, ru, re, ro)',
      wa: 'わ行 (wa, wo, n)'
    };
    return labels[row] || row;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          🗾 Tu camino de aprendizaje
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Domina cada fila paso a paso para desbloquear la siguiente
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rowNames.map((row, index) => {
          const rowProgress = progress[row] || 0;
          const isUnlocked = index === 0 || (progress[rowNames[index - 1]] || 0) >= 80;
          const isCompleted = rowProgress >= 100;
          
          return (
            <Card 
              key={row}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                isUnlocked ? 'shadow-lg' : 'opacity-50 cursor-not-allowed'
              } ${isCompleted ? 'ring-2 ring-green-400' : ''}`}
              onClick={() => isUnlocked && onSelectRow(row)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      isCompleted ? 'bg-green-500' : 
                      isUnlocked ? 'bg-blue-500' : 'bg-gray-400'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {getRowLabel(row)}
                      </h3>
                      <div className="flex space-x-2 mt-1">
                        {Object.keys(rowData[row as keyof typeof rowData]).map(char => (
                          <span key={char} className="text-2xl">{char}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {isUnlocked && (
                    <Badge variant={isCompleted ? "default" : "secondary"}>
                      {rowProgress}%
                    </Badge>
                  )}
                </div>

                {isUnlocked && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${rowProgress}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Componente de Ejercicios (código actual)
const ExerciseMode = () => {
  const [kanaType, setKanaType] = useState<KanaType>('hiragana');
  const [charSet, setCharSet] = useState<CharSetType>('basic');
  const [selectedRows, setSelectedRows] = useState<KanaRow[]>(['all']);
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
  }, [kanaType, charSet, mode, selectedRows]);

  function getSelectedChars() {
    const baseRows = kanaType === 'hiragana' ? hiraganaRows : katakanaRows;
    const dakutenRows = kanaType === 'hiragana' ? hiraganaRowsDakuten : katakanaRowsDakuten;
    
    let chars = {};
    
    if (selectedRows.includes('all')) {
      return kanaType === 'hiragana' 
        ? (charSet === 'basic' ? hiraganaChars.basic : 
           charSet === 'dakuten' ? hiraganaChars.dakuten : 
           {...hiraganaChars.basic, ...hiraganaChars.dakuten})
        : (charSet === 'basic' ? katakanaChars.basic : 
           charSet === 'dakuten' ? katakanaChars.dakuten : 
           {...katakanaChars.basic, ...katakanaChars.dakuten});
    }
    
    selectedRows.forEach(row => {
      if (row !== 'all') {
        if (['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa'].includes(row)) {
          if (charSet === 'basic' || charSet === 'all') {
            chars = { ...chars, ...baseRows[row as keyof typeof baseRows] };
          }
        } else if (['ga', 'za', 'da', 'ba', 'pa'].includes(row)) {
          if (charSet === 'dakuten' || charSet === 'all') {
            chars = { ...chars, ...dakutenRows[row as keyof typeof dakutenRows] };
          }
        }
      }
    });
    
    return chars;
  }

  function generateNewChar() {
    const chars = getSelectedChars();
    
    if (mode === 'phrase') {
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      setCurrentChar(randomPhrase.k);
      setCurrentAnswer(randomPhrase.r);
      return;
    }
    
    const keys = Object.keys(chars);
    if (keys.length === 0) return;
    
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    
    if (mode === 'kana-to-romaji') {
      setCurrentChar(randomKey);
      setCurrentAnswer(chars[randomKey as keyof typeof chars]);
    } else {
      setCurrentChar(chars[randomKey as keyof typeof chars]);
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
    if (mode === 'kana-to-romaji') {
      return `¿Cómo se lee "${currentChar}" en romaji?`;
    } else if (mode === 'romaji-to-kana') {
      return `¿Cómo se escribe "${currentChar}" en ${kanaType}?`;
    } else {
      return `¿Cómo se lee esta frase en romaji?`;
    }
  };

  const toggleRow = (row: KanaRow) => {
    if (row === 'all') {
      setSelectedRows(['all']);
    } else {
      setSelectedRows(prev => {
        const filtered = prev.filter(r => r !== 'all');
        if (filtered.includes(row)) {
          const newRows = filtered.filter(r => r !== row);
          return newRows.length === 0 ? ['all'] : newRows;
        } else {
          return [...filtered, row];
        }
      });
    }
  };

  const getRowLabel = (row: KanaRow) => {
    const labels = {
      all: 'Todos',
      a: 'あ行 (a)',
      ka: 'か行 (ka)',
      sa: 'さ行 (sa)', 
      ta: 'た行 (ta)',
      na: 'な行 (na)',
      ha: 'は行 (ha)',
      ma: 'ま行 (ma)',
      ya: 'や行 (ya)',
      ra: 'ら行 (ra)',
      wa: 'わ行 (wa)',
      ga: 'が行 (ga)',
      za: 'ざ行 (za)',
      da: 'だ行 (da)',
      ba: 'ば行 (ba)',
      pa: 'ぱ行 (pa)'
    };
    return labels[row];
  };

  const basicRows: KanaRow[] = ['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa'];
  const dakutenRows: KanaRow[] = ['ga', 'za', 'da', 'ba', 'pa'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header with stats */}
      <div className="text-center space-y-4">
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
            <RotateCcw className="h-4 w-4 mr-2" />
            Reiniciar
          </Button>
        </div>
      </div>

      {/* Main exercise card */}
      <Card className="animate-fade-in shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <CardHeader className="pb-4">
          {/* Controls */}
          <div className="space-y-6">
            {/* Tipo y Conjunto en una fila */}
            <div className="flex flex-col lg:flex-row gap-6 justify-center">
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Tipo:</span>
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
                  <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Conjunto:</span>
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
            </div>

            {/* Selector de filas */}
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-center gap-2">
                <Grid3X3 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Seleccionar filas de estudio:</span>
              </div>
              
              <div className="flex justify-center mb-3">
                <Button
                  variant={selectedRows.includes('all') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleRow('all')}
                  className="px-4"
                >
                  Todos
                </Button>
              </div>

              {(charSet === 'basic' || charSet === 'all') && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center">Básicos</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {basicRows.map(row => (
                      <Button
                        key={row}
                        variant={selectedRows.includes(row) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleRow(row)}
                        className="text-xs px-3 py-1"
                      >
                        {getRowLabel(row)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {(charSet === 'dakuten' || charSet === 'all') && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center">Dakuten</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {dakutenRows.map(row => (
                      <Button
                        key={row}
                        variant={selectedRows.includes(row) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleRow(row)}
                        className="text-xs px-3 py-1"
                      >
                        {getRowLabel(row)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Modo */}
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Modo:</span>
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
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Question */}
          <div className="text-center">
            <div className="inline-block p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl border border-purple-100 dark:border-purple-700 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {getQuestion()}
              </h3>
              <div className="text-6xl font-bold text-primary mt-4">
                {currentChar}
              </div>
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
                className="text-lg text-center py-6 text-gray-700 dark:text-white border-2 border-gray-200 dark:border-gray-600 focus:border-purple-400 dark:focus:border-purple-500 rounded-xl bg-white dark:bg-gray-800"
                disabled={showResult}
              />
              
              {/* Action buttons */}
              <div className="flex gap-3 justify-center mt-6">
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

// Componente de Sesión de Estudio (modificado para quiz aleatorio)
const StudySession = ({ 
  row, 
  kanaType, 
  onComplete,
  onBack 
}: { 
  row: string;
  kanaType: KanaType;
  onComplete: (score: number) => void;
  onBack: () => void;
}) => {
  const [phase, setPhase] = useState<'learning' | 'quiz'>('learning');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{char: string, answer: string, correct: boolean}[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{show: boolean, correct: boolean}>({show: false, correct: false});
  const [shuffledQuizChars, setShuffledQuizChars] = useState<[string, string][]>([]);

  // Obtener los caracteres de la fila
  const rowData = kanaType === 'hiragana' ? hiraganaRows : katakanaRows;
  const characters = Object.entries(rowData[row as keyof typeof rowData] || {});
  
  const getRowLabel = (row: string) => {
    const labels: Record<string, string> = {
      a: 'あ行', ka: 'か行', sa: 'さ行', ta: 'た行', na: 'な行',
      ha: 'は行', ma: 'ま行', ya: 'や行', ra: 'ら行', wa: 'わ行'
    };
    return labels[row] || row;
  };

  // Para la fase de aprendizaje, usar el carácter actual en orden
  const currentChar = phase === 'learning' ? characters[currentIndex] : shuffledQuizChars[currentIndex];
  const progress = Math.round(((currentIndex + 1) / characters.length) * 100);

  // Inicializar caracteres mezclados para el quiz
  useEffect(() => {
    if (phase === 'quiz' && shuffledQuizChars.length === 0) {
      setShuffledQuizChars(shuffleArray(characters));
    }
  }, [phase, characters]);

  const handleNext = () => {
    if (currentIndex < characters.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      // Pasar al quiz - mezclar caracteres
      setPhase('quiz');
      setCurrentIndex(0);
      setShuffledQuizChars(shuffleArray(characters));
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleQuizSubmit = () => {
    const isCorrect = userAnswer.trim().toLowerCase() === currentChar[1].toLowerCase();
    setFeedback({show: true, correct: isCorrect});
    
    setQuizAnswers(prev => [...prev, {
      char: currentChar[0],
      answer: userAnswer.trim(),
      correct: isCorrect
    }]);

    setTimeout(() => {
      if (currentIndex < characters.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setUserAnswer('');
        setFeedback({show: false, correct: false});
      } else {
        // Quiz completado
        const score = Math.round((quizAnswers.filter(a => a.correct).length + (isCorrect ? 1 : 0)) / characters.length * 100);
        onComplete(score);
      }
    }, 1500);
  };

  const skipToQuiz = () => {
    setPhase('quiz');
    setCurrentIndex(0);
    setShuffledQuizChars(shuffleArray(characters));
  };

  if (phase === 'learning') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al mapa
          </Button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              📚 Aprendiendo {getRowLabel(row)}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Carácter {currentIndex + 1} de {characters.length}
            </p>
          </div>
          <Button onClick={skipToQuiz} variant="outline" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Ir al quiz
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
            <span>Progreso de aprendizaje</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main flashcard */}
        <Card className="mb-8 shadow-xl border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
          <CardContent className="p-12 text-center">
            <div className="space-y-8">
              {/* Character display */}
              <div className="space-y-4">
                <div className="text-8xl font-bold text-blue-600 dark:text-blue-400">
                  {currentChar[0]}
                </div>
                <div className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
                  Toca para ver la lectura
                </div>
              </div>

              {/* Answer reveal */}
              <div className="min-h-[100px] flex items-center justify-center">
                {!showAnswer ? (
                  <Button 
                    onClick={() => setShowAnswer(true)}
                    size="lg"
                    className="px-8 py-4 text-lg rounded-xl"
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    Mostrar lectura
                  </Button>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <div className="text-6xl font-bold text-green-600 dark:text-green-400">
                      {currentChar[1]}
                    </div>
                    <div className="text-lg text-gray-600 dark:text-gray-300">
                      "{currentChar[0]}" se lee "{currentChar[1]}"
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex gap-2">
            {characters.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-blue-500 scale-125' :
                  index < currentIndex ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button 
            onClick={handleNext}
            disabled={!showAnswer}
            className="flex items-center gap-2"
          >
            {currentIndex === characters.length - 1 ? (
              <>
                <Brain className="h-4 w-4" />
                ¡Al quiz!
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Quiz phase
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          🧠 Quiz: {getRowLabel(row)} <span className="text-sm text-gray-500">(orden aleatorio)</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Pregunta {currentIndex + 1} de {characters.length}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-purple-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / characters.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Quiz card */}
      <Card className="mb-8 shadow-xl border-0 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20">
        <CardContent className="p-12 text-center">
          {!feedback.show ? (
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  ¿Cómo se lee este carácter?
                </h3>
                <div className="text-8xl font-bold text-purple-600 dark:text-purple-400">
                  {currentChar[0]}
                </div>
              </div>

              <div className="max-w-md mx-auto space-y-6">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && userAnswer.trim()) {
                      handleQuizSubmit();
                    }
                  }}
                  placeholder="Escribe en romaji..."
                  className="text-xl text-center py-6 rounded-xl"
                  autoFocus
                />
                <Button 
                  onClick={handleQuizSubmit}
                  disabled={!userAnswer.trim()}
                  size="lg"
                  className="w-full rounded-xl"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Comprobar
                </Button>
              </div>
            </div>
          ) : (
            <div className={`space-y-6 animate-fade-in ${
              feedback.correct ? 'text-green-600' : 'text-red-600'
            }`}>
              <div className="text-6xl">
                {feedback.correct ? '🎉' : '😅'}
              </div>
              <div className="text-2xl font-bold">
                {feedback.correct ? '¡Correcto!' : 'Incorrecto'}
              </div>
              <div className="text-lg">
                <span className="text-gray-600 dark:text-gray-300">
                  {currentChar[0]} se lee: 
                </span>
                <span className="font-bold text-purple-600 dark:text-purple-400 ml-2">
                  {currentChar[1]}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Componente principal (sin onboarding)
const KanaExercise = () => {
  const [studyMode, setStudyMode] = useState<StudyMode>('study');
  const [kanaType, setKanaType] = useState<KanaType>('hiragana');
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [currentStudyRow, setCurrentStudyRow] = useState<string | null>(null);

  // Cargar progreso guardado
  useEffect(() => {
    const savedProgress = localStorage.getItem(`kana-progress-${kanaType}`);
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, [kanaType]);

  const handleSelectRow = (row: string) => {
    setCurrentStudyRow(row);
  };

  const handleCompleteStudySession = (score: number) => {
    if (currentStudyRow) {
      const newProgress = { ...progress, [currentStudyRow]: score };
      setProgress(newProgress);
      localStorage.setItem(`kana-progress-${kanaType}`, JSON.stringify(newProgress));
    }
    setCurrentStudyRow(null);
  };

  const handleBackToMap = () => {
    setCurrentStudyRow(null);
  };

  // Si estamos en una sesión de estudio
  if (currentStudyRow) {
    return (
      <StudySession 
        row={currentStudyRow}
        kanaType={kanaType}
        onComplete={handleCompleteStudySession}
        onBack={handleBackToMap}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header con selector de modo */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              🌸 Aprendizaje de Kana
            </h1>
            
            <div className="flex gap-2">
              <Button
                variant={studyMode === 'study' ? 'default' : 'outline'}
                onClick={() => setStudyMode('study')}
                className="flex items-center gap-2"
              >
                <Map className="h-4 w-4" />
                Estudio
              </Button>
              <Button
                variant={studyMode === 'exercise' ? 'default' : 'outline'}
                onClick={() => setStudyMode('exercise')}
                className="flex items-center gap-2"
              >
                <Gamepad2 className="h-4 w-4" />
                Ejercicios
              </Button>
            </div>
          </div>

          {studyMode === 'study' && (
            <div className="flex gap-2 mt-4">
              <Button
                variant={kanaType === 'hiragana' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setKanaType('hiragana')}
              >
                ひらがな
              </Button>
              <Button
                variant={kanaType === 'katakana' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setKanaType('katakana')}
              >
                カタカナ
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Contenido */}
      {studyMode === 'study' ? (
        <LearningPath 
          kanaType={kanaType}
          onSelectRow={handleSelectRow}
          progress={progress}
        />
      ) : (
        <ExerciseMode />
      )}
    </div>
  );
};

export default KanaExercise;
