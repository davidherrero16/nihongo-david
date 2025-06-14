
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StatsHeatmapProps {
  data: { [date: string]: number };
  year: number;
}

const StatsHeatmap = ({ data, year }: StatsHeatmapProps) => {
  // Generar todas las fechas del año
  const generateYearDates = (year: number) => {
    const dates = [];
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const yearDates = generateYearDates(year);
  
  // Organizar fechas por semanas
  const weekData = [];
  for (let i = 0; i < yearDates.length; i += 7) {
    weekData.push(yearDates.slice(i, i + 7));
  }

  // Función para obtener el color basado en la intensidad
  const getColor = (count: number) => {
    if (count === 0) return "bg-gray-100";
    if (count <= 5) return "bg-green-200";
    if (count <= 10) return "bg-green-300";
    if (count <= 20) return "bg-green-400";
    return "bg-green-500";
  };

  // Función para obtener el texto del tooltip
  const getTooltipText = (date: string, count: number) => {
    const dateObj = new Date(date);
    const formatted = dateObj.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    if (count === 0) {
      return `${formatted}: Sin actividad`;
    }
    
    return `${formatted}: ${count} tarjeta${count !== 1 ? 's' : ''} estudiada${count !== 1 ? 's' : ''}`;
  };

  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <TooltipProvider>
      <Card className="p-6">
        <div className="space-y-4">
          {/* Encabezado con meses */}
          <div className="grid grid-cols-12 gap-1 text-xs text-gray-500 mb-2">
            {months.map((month, index) => (
              <div key={index} className="text-center">
                {month}
              </div>
            ))}
          </div>

          {/* Grid de días */}
          <div className="space-y-1">
            {weekdays.map((day, dayIndex) => (
              <div key={day} className="flex items-center gap-1">
                <div className="w-8 text-xs text-gray-500 text-right">
                  {dayIndex % 2 === 1 ? day : ''}
                </div>
                <div className="flex gap-1 flex-1">
                  {weekData.map((week, weekIndex) => {
                    const date = week[dayIndex];
                    if (!date) return <div key={weekIndex} className="w-3 h-3" />;
                    
                    const count = data[date] || 0;
                    const color = getColor(count);
                    
                    return (
                      <Tooltip key={date}>
                        <TooltipTrigger>
                          <div
                            className={`w-3 h-3 rounded-sm ${color} hover:ring-2 hover:ring-gray-400 transition-all cursor-pointer`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getTooltipText(date, count)}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Leyenda */}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
            <span>Menos</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            </div>
            <span>Más</span>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default StatsHeatmap;
