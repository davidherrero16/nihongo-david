
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImportDeckProps {
  onImport: (name: string, cards: any[]) => void;
}

const ImportDeck = ({ onImport }: ImportDeckProps) => {
  const [deckName, setDeckName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['application/json', 'text/csv', '.csv'];
      const isValidType = validTypes.some(type => 
        selectedFile.type === type || selectedFile.name.endsWith('.csv')
      );
      
      if (isValidType) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Tipo de archivo no válido",
          description: "Por favor selecciona un archivo CSV o JSON",
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

  const handleImport = async () => {
    if (!file || !deckName.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor ingresa un nombre para el deck y selecciona un archivo",
        variant: "destructive"
      });
      return;
    }

    try {
      const content = await file.text();
      let cards: any[] = [];
      
      if (file.name.endsWith('.csv')) {
        cards = parseCSV(content);
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
      
      if (cards.length === 0) {
        toast({
          title: "Error al importar",
          description: "No se encontraron tarjetas válidas en el archivo",
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
      if (document.querySelector('input[type="file"]')) {
        (document.querySelector('input[type="file"]') as HTMLInputElement).value = '';
      }
    } catch (error) {
      toast({
        title: "Error al procesar archivo",
        description: "Verifica que el formato del archivo sea correcto",
        variant: "destructive"
      });
    }
  };

  const downloadTemplate = (format: 'csv' | 'json') => {
    let content = '';
    let filename = '';
    let mimeType = '';
    
    if (format === 'csv') {
      content = 'word,reading,meaning\n"こんにちは","konnichiwa","hola"\n"ありがとう","arigatou","gracias"';
      filename = 'template.csv';
      mimeType = 'text/csv';
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
        
        <div>
          <Label htmlFor="file">Archivo (CSV o JSON)</Label>
          <Input
            id="file"
            type="file"
            accept=".csv,.json"
            onChange={handleFileChange}
          />
        </div>
        
        {file && (
          <div className="text-sm text-muted-foreground">
            <FileText className="h-4 w-4 inline mr-1" />
            {file.name}
          </div>
        )}
        
        <Button onClick={handleImport} className="w-full">
          <Upload className="h-4 w-4 mr-2" />
          Importar Deck
        </Button>
        
        <div className="border-t pt-4">
          <Label className="text-sm text-muted-foreground">Descargar plantillas:</Label>
          <div className="flex gap-2 mt-2">
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
              onClick={() => downloadTemplate('json')}
            >
              <Download className="h-4 w-4 mr-1" />
              JSON
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p><strong>Formato CSV:</strong> word,reading,meaning</p>
          <p><strong>Formato JSON:</strong> [{"{"}"word": "...", "reading": "...", "meaning": "..."{"}"}, ...]</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportDeck;
