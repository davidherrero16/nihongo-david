
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, RefreshCw, Settings, Shuffle } from "lucide-react";

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

  // Inicializar con un carácter aleatorio
  useState(() => {
    generateNewChar();
  });

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
    
    if (mode === 'kana-to-romaji') {
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Práctica de Kana</h2>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <Button
            variant={kanaType === 'hiragana' ? 'default' : 'outline'}
            onClick={() => setKanaType('hiragana')}
            size="sm"
          >
            Hiragana
          </Button>
          <Button
            variant={kanaType === 'katakana' ? 'default' : 'outline'}
            onClick={() => setKanaType('katakana')}
            size="sm"
          >
            Katakana
          </Button>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <Button
            variant={charSet === 'basic' ? 'default' : 'outline'}
            onClick={() => setCharSet('basic')}
            size="sm"
          >
            Básico
          </Button>
          <Button
            variant={charSet === 'dakuten' ? 'default' : 'outline'}
            onClick={() => setCharSet('dakuten')}
            size="sm"
          >
            Dakuten
          </Button>
          <Button
            variant={charSet === 'all' ? 'default' : 'outline'}
            onClick={() => setCharSet('all')}
            size="sm"
          >
            Todos
          </Button>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <Button
            variant={mode === 'kana-to-romaji' ? 'default' : 'outline'}
            onClick={() => {
              setMode('kana-to-romaji');
              setUserAnswer("");
              setShowResult(false);
              generateNewChar();
            }}
            size="sm"
          >
            Kana → Romaji
          </Button>
          <Button
            variant={mode === 'romaji-to-kana' ? 'default' : 'outline'}
            onClick={() => {
              setMode('romaji-to-kana');
              setUserAnswer("");
              setShowResult(false);
              generateNewChar();
            }}
            size="sm"
          >
            Romaji → Kana
          </Button>
          <Button
            variant={mode === 'phrase' ? 'default' : 'outline'}
            onClick={() => {
              setMode('phrase');
              setUserAnswer("");
              setShowResult(false);
              generateNewChar();
            }}
            size="sm"
          >
            Frases
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

      {/* Exercise Card */}
      <Card className="min-h-[300px] shadow-lg">
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="space-y-6 w-full max-w-md">
            <div className="text-5xl font-bold text-primary mb-4">
              {currentChar}
            </div>

            <div className="space-y-4">
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Escribe tu respuesta..."
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
                      <span className="font-medium">Respuesta correcta:</span> {currentAnswer}
                    </div>
                  </div>

                  <Button 
                    onClick={handleNext}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Siguiente
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
          <Shuffle className="h-4 w-4 mr-2" />
          Nuevo Carácter
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

export default KanaExercise;
