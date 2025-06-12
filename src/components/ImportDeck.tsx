
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Download, ClipboardPaste } from "lucide-react";
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
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
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
        // Limpiar HTML y tags de los campos
        const cleanField = (field: string) => {
          return field
            .replace(/<[^>]*>/g, '') // Remover HTML tags
            .replace(/\[sound:[^\]]*\]/g, '') // Remover archivos de sonido
            .replace(/\[[^\]]*\]/g, '') // Remover otros brackets
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
      // Split by ' - ' (space-dash-space)
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

    try {
      let content = '';
      
      if (importMode === 'file' && file) {
        content = await file.text();
      } else {
        content = pasteText;
      }
      
      let cards: any[] = [];
      
      if (importMode === 'paste') {
        // Try dash format first
        cards = parseDashFormat(content);
        
        // If that didn't work, try tab-separated (Anki format)
        if (cards.length === 0 && content.includes('\t')) {
          cards = parseAnkiTxt(content);
        }
        
        // If still nothing, try CSV
        if (cards.length === 0) {
          cards = parseCSV(content);
        }
      } else if (file) {
        if (file.name.endsWith('.csv')) {
          cards = parseCSV(content);
        } else if (file.name.endsWith('.txt')) {
          // Detectar si es formato Anki (separado por tabs) o CSV
          if (content.includes('\t')) {
            cards = parseAnkiTxt(content);
          } else {
            // Tratar como CSV con diferentes separadores
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
      
      if (cards.length === 0) {
        toast({
          title: "Error al importar",
          description: "No se encontraron tarjetas válidas en el contenido",
          variant: "destructive"
        });
        return;
      }
      
      onImport(deckName.trim(), cards);
      toast({
        title: "¡Deck importado!",
        description: `Se importaron ${cards.length} tarjetas correctamente`,
      });
      
      setDeckName("");
      setFile(null);
      setPasteText("");
      if (document.querySelector('input[type="file"]')) {
        (document.querySelector('input[type="file"]') as HTMLInputElement).value = '';
      }
    } catch (error) {
      toast({
        title: "Error al procesar contenido",
        description: "Verifica que el formato sea correcto",
        variant: "destructive"
      });
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
          <Upload className="h-5 w-5" />
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
          />
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            variant={importMode === 'file' ? 'default' : 'outline'}
            onClick={() => setImportMode('file')}
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Archivo
          </Button>
          <Button
            variant={importMode === 'paste' ? 'default' : 'outline'}
            onClick={() => setImportMode('paste')}
            size="sm"
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
            />
          </div>
        )}
        
        <Button onClick={handleImport} className="w-full">
          {importMode === 'file' ? (
            <Upload className="h-4 w-4 mr-2" />
          ) : (
            <ClipboardPaste className="h-4 w-4 mr-2" />
          )}
          Importar Deck
        </Button>
        
        <div className="border-t pt-4">
          <Label className="text-sm text-muted-foreground">Descargar plantillas:</Label>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => downloadTemplate('csv')}
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => downloadTemplate('anki')}
            >
              <Download className="h-4 w-4 mr-1" />
              Anki TXT
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => downloadTemplate('dash')}
            >
              <Download className="h-4 w-4 mr-1" />
              Dash Format
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => downloadTemplate('json')}
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
