
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, RotateCcw, CheckCircle, Clock } from "lucide-react";

interface DeckStatsProps {
  stats: {
    nuevas: number;
    revisar: number;
    aprendidas: number;
    porAprender: number;
  };
}

const DeckStats = ({ stats }: DeckStatsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-2 sm:p-4 text-center">
          <div className="flex items-center justify-center mb-1 sm:mb-2">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.nuevas}</div>
          <div className="text-xs sm:text-sm text-blue-700">Nuevas</div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-2 sm:p-4 text-center">
          <div className="flex items-center justify-center mb-1 sm:mb-2">
            <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-orange-600">{stats.revisar}</div>
          <div className="text-xs sm:text-sm text-orange-700">Revisar</div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-2 sm:p-4 text-center">
          <div className="flex items-center justify-center mb-1 sm:mb-2">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.aprendidas}</div>
          <div className="text-xs sm:text-sm text-green-700">Aprendidas</div>
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-2 sm:p-4 text-center">
          <div className="flex items-center justify-center mb-1 sm:mb-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-600">{stats.porAprender}</div>
          <div className="text-xs sm:text-sm text-gray-700">Por aprender</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeckStats;
