import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Download, ClipboardPaste, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface ImportDeckProps {
  onImport: (name: string, cards: any[]) => void;
}

const ImportDeck = ({ onImport }: ImportDeckProps) => {
  const [deckName, setDeckName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [importMode, setImportMode] = useState<'file' | 'paste'>('file');
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['application/json', 'text/csv', '.csv', 'text/plain', '.txt'];
      const isValidType = validTypes.some(type => 
        selectedFile.type === type || 
        selectedFile.name.endsWith('.csv') || 
        selectedFile.name.endsWith('.txt')
      );
      
      if (isValidType) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Tipo de archivo no válido",
          description: "Por favor selecciona un archivo CSV, TXT o JSON",
          variant: "destructive"
        });
      }
    }
  };

  const parseCSV = (content: string): any[] => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const cards = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length >= 3) {
        cards.push({
          word: values[0] || '',
          reading: values[1] || '',
          meaning: values[2] || ''
        });
      }
    }
    
    return cards;
  };

  const parseAnkiTxt = (content: string): any[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const cards = [];
    
    for (const line of lines) {
      const fields = line.split('\t');
      if (fields.length >= 3) {
        const cleanField = (field: string) => {
          return field
            .replace(/<[^>]*>/g, '')
            .replace(/\[sound:[^\]]*\]/g, '')
            .replace(/\[[^\]]*\]/g, '')
            .trim();
        };

        const word = cleanField(fields[0]);
        const reading = cleanField(fields[1]);
        const meaning = cleanField(fields[2]);
        
        if (word && reading && meaning) {
          cards.push({
            word,
            reading,
            meaning
          });
        }
      }
    }
    
    return cards;
  };

  const parseDashFormat = (content: string): any[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const cards = [];
    
    for (const line of lines) {
      const parts = line.split(' - ');
      if (parts.length >= 3) {
        const word = parts[0].trim();
        const reading = parts[1].trim();
        const meaning = parts[2].trim();
        
        if (word && reading && meaning) {
          cards.push({
            word,
            reading,
            meaning
          });
        }
      }
    }
    
    return cards;
  };

  const handleImport = async () => {
    if (!deckName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa un nombre para el deck",
        variant: "destructive"
      });
      return;
    }

    if (importMode === 'file' && !file) {
      toast({
        title: "Archivo requerido",
        description: "Por favor selecciona un archivo",
        variant: "destructive"
      });
      return;
    }

    if (importMode === 'paste' && !pasteText.trim()) {
      toast({
        title: "Texto requerido",
        description: "Por favor pega el texto con las tarjetas",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);

    try {
      let content = '';
      
      if (importMode === 'file' && file) {
        content = await file.text();
      } else {
        content = pasteText;
      }
      
      console.log('Contenido a procesar:', content.substring(0, 200) + '...');
      
      let cards: any[] = [];
      
      if (importMode === 'paste') {
        // Intentar primero formato dash
        console.log('Intentando formato dash...');
        cards = parseDashFormat(content);
        console.log('Tarjetas parseadas con dash format:', cards.length);
        
        // Si no funciona, intentar formato Anki
        if (cards.length === 0 && content.includes('\t')) {
          console.log('Intentando formato Anki...');
          cards = parseAnkiTxt(content);
          console.log('Tarjetas parseadas con Anki format:', cards.length);
        }
        
        // Si aún no funciona, intentar CSV
        if (cards.length === 0) {
          console.log('Intentando formato CSV...');
          cards = parseCSV(content);
          console.log('Tarjetas parseadas con CSV format:', cards.length);
        }
      } else if (file) {
        if (file.name.endsWith('.csv')) {
          cards = parseCSV(content);
        } else if (file.name.endsWith('.txt')) {
          if (content.includes('\t')) {
            cards = parseAnkiTxt(content);
          } else {
            cards = parseCSV(content.replace(/\t/g, ','));
          }
        } else if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(content);
          if (Array.isArray(jsonData)) {
            cards = jsonData.map(item => ({
              word: item.word || item.front || '',
              reading: item.reading || item.pronunciation || '',
              meaning: item.meaning || item.back || ''
            }));
          }
        }
      }
      
      console.log('Tarjetas procesadas inicialmente:', cards.length);
      
      if (cards.length === 0) {
        toast({
          title: "Error al importar",
          description: "No se encontraron tarjetas válidas en el contenido. Verifica que el formato sea: palabra - lectura - significado",
          variant: "destructive"
        });
        return;
      }

      // Filtrar tarjetas válidas (que tengan todos los campos)
      const validCards = cards.filter(card => {
        const isValid = card.word && card.word.trim() && 
                       card.reading && card.reading.trim() && 
                       card.meaning && card.meaning.trim();
        
        if (!isValid) {
          console.log('Tarjeta inválida:', card);
        }
        
        return isValid;
      });

      console.log(`Tarjetas válidas filtradas: ${validCards.length} de ${cards.length}`);

      if (validCards.length === 0) {
        toast({
          title: "Error al importar",
          description: "No se encontraron tarjetas válidas con todos los campos completos. Formato esperado: palabra - lectura - significado",
          variant: "destructive"
        });
        return;
      }

      console.log(`Importando ${validCards.length} tarjetas válidas:`, validCards.slice(0, 3));
      
      await onImport(deckName.trim(), validCards);
      
      // Limpiar formulario solo después de éxito
      setDeckName("");
      setFile(null);
      setPasteText("");
      if (document.querySelector('input[type="file"]')) {
        (document.querySelector('input[type="file"]') as HTMLInputElement).value = '';
      }
      
    } catch (error) {
      console.error('Error durante la importación:', error);
      toast({
        title: "Error al procesar contenido",
        description: "Verifica que el formato sea correcto: palabra - lectura - significado",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = (format: 'csv' | 'json' | 'anki' | 'dash') => {
    let content = '';
    let filename = '';
    let mimeType = '';
    
    if (format === 'csv') {
      content = 'word,reading,meaning\n"こんにちは","konnichiwa","hola"\n"ありがとう","arigatou","gracias"';
      filename = 'template.csv';
      mimeType = 'text/csv';
    } else if (format === 'anki') {
      content = 'こんにちは\tkonnichiwa\thola\nありがとう\tarigatou\tgracias';
      filename = 'template_anki.txt';
      mimeType = 'text/plain';
    } else if (format === 'dash') {
      content = 'こんにちは - konnichiwa - hola\nありがとう - arigatou - gracias';
      filename = 'template_dash.txt';
      mimeType = 'text/plain';
    } else {
      content = JSON.stringify([
        { word: "こんにちは", reading: "konnichiwa", meaning: "hola" },
        { word: "ありがとう", reading: "arigatou", meaning: "gracias" }
      ], null, 2);
      filename = 'template.json';
      mimeType = 'application/json';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Importar Deck
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="deckName">Nombre del Deck</Label>
          <Input
            id="deckName"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="Ej: Vocabulario N5"
            disabled={isImporting}
          />
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            variant={importMode === 'file' ? 'default' : 'outline'}
            onClick={() => setImportMode('file')}
            size="sm"
            disabled={isImporting}
          >
            <Upload className="h-4 w-4 mr-2" />
            Archivo
          </Button>
          <Button
            variant={importMode === 'paste' ? 'default' : 'outline'}
            onClick={() => setImportMode('paste')}
            size="sm"
            disabled={isImporting}
          >
            <ClipboardPaste className="h-4 w-4 mr-2" />
            Copiar/Pegar
          </Button>
        </div>

        {importMode === 'file' ? (
          <>
            <div>
              <Label htmlFor="file">Archivo (CSV, TXT de Anki, o JSON)</Label>
              <Input
                id="file"
                type="file"
                accept=".csv,.json,.txt"
                onChange={handleFileChange}
                disabled={isImporting}
              />
            </div>
            
            {file && (
              <div className="text-sm text-muted-foreground">
                <FileText className="h-4 w-4 inline mr-1" />
                {file.name}
              </div>
            )}
          </>
        ) : (
          <div>
            <Label htmlFor="pasteText">Texto (formato: palabra - lectura - significado)</Label>
            <Textarea
              id="pasteText"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="こんにちは - konnichiwa - hola&#10;ありがとう - arigatou - gracias"
              rows={6}
              disabled={isImporting}
            />
          </div>
        )}
        
        <Button 
          onClick={handleImport} 
          className="w-full"
          disabled={isImporting}
        >
          {isImporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              {importMode === 'file' ? (
                <Upload className="h-4 w-4 mr-2" />
              ) : (
                <ClipboardPaste className="h-4 w-4 mr-2" />
              )}
              Importar Deck
            </>
          )}
        </Button>
        
        <div className="border-t pt-4">
          <Label className="text-sm text-muted-foreground">Descargar plantillas:</Label>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => downloadTemplate('csv')}
              disabled={isImporting}
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => downloadTemplate('anki')}
              disabled={isImporting}
            >
              <Download className="h-4 w-4 mr-1" />
              Anki TXT
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => downloadTemplate('dash')}
              disabled={isImporting}
            >
              <Download className="h-4 w-4 mr-1" />
              Dash Format
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => downloadTemplate('json')}
              disabled={isImporting}
            >
              <Download className="h-4 w-4 mr-1" />
              JSON
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Formato CSV:</strong> word,reading,meaning</p>
          <p><strong>Formato Anki TXT:</strong> Los campos separados por tabulaciones (exportación de Anki)</p>
          <p><strong>Formato Dash:</strong> palabra - lectura - significado (cada línea)</p>
          <p><strong>Formato JSON:</strong> [{"{"}"word": "...", "reading": "...", "meaning": "..."{"}"}, ...]</p>
          <div className="mt-2 p-2 bg-muted rounded text-xs">
            <strong>💡 Para exportar desde Anki:</strong><br/>
            1. File → Export<br/>
            2. Selecciona "Notes in Plain Text (.txt)"<br/>
            3. Asegúrate de incluir los campos: palabra, lectura, significado
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportDeck;
