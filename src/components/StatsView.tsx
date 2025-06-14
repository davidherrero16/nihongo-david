
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Calendar,
  Trophy,
  Flame,
  BookOpen,
  BarChart3,
  Activity,
  Award
} from "lucide-react";
import { useStatistics } from "@/hooks/useStatistics";
import StatsHeatmap from "@/components/StatsHeatmap";

const StatsView = () => {
  const {
    getDailyStats,
    getWeeklyStats,
    getMonthlyStats,
    getOverallStats,
    getHeatmapData,
    getDeckAnalysis,
    loading
  } = useStatistics();

  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const overallStats = getOverallStats();
  const dailyStats = getDailyStats(30);
  const weeklyStats = getWeeklyStats(12);
  const monthlyStats = getMonthlyStats(6);
  const heatmapData = getHeatmapData(selectedYear);
  const deckAnalysis = getDeckAnalysis();

  const getCurrentData = () => {
    switch (selectedPeriod) {
      case 'weekly':
        return weeklyStats.map(stat => ({
          ...stat,
          period: stat.week
        }));
      case 'monthly':
        return monthlyStats.map(stat => ({
          ...stat,
          period: stat.month
        }));
      default:
        return dailyStats.slice(-14).map(stat => ({
          ...stat,
          period: new Date(stat.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
        }));
    }
  };

  const chartData = getCurrentData();

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  const pieData = [
    { name: 'Aprendidas', value: overallStats.cardsLearned, color: '#22c55e' },
    { name: 'En progreso', value: overallStats.cardsInProgress, color: '#3b82f6' },
    { name: 'Nuevas', value: overallStats.cardsNew, color: '#f59e0b' }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-full">
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Estadísticas</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Analiza tu progreso y rendimiento en el estudio del japonés
        </p>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Total de Tarjetas
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {overallStats.totalCards.toLocaleString()}
            </div>
            <p className="text-xs text-blue-700 mt-1">
              {overallStats.cardsLearned} aprendidas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Precisión Promedio
            </CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {overallStats.averageAccuracy.toFixed(1)}%
            </div>
            <p className="text-xs text-green-700 mt-1">
              En todas las sesiones
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">
              Tiempo Total
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {Math.round(overallStats.totalTimeSpent / 60)}h
            </div>
            <p className="text-xs text-orange-700 mt-1">
              {overallStats.totalTimeSpent} minutos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">
              Racha Actual
            </CardTitle>
            <Flame className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {overallStats.currentStreak}
            </div>
            <p className="text-xs text-red-700 mt-1">
              Máximo: {overallStats.longestStreak} días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress">Progreso</TabsTrigger>
          <TabsTrigger value="heatmap">Actividad</TabsTrigger>
          <TabsTrigger value="analysis">Análisis</TabsTrigger>
          <TabsTrigger value="decks">Mazos</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progreso de Estudio
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={selectedPeriod === 'daily' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('daily')}
                  >
                    Diario
                  </Button>
                  <Button
                    variant={selectedPeriod === 'weekly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('weekly')}
                  >
                    Semanal
                  </Button>
                  <Button
                    variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod('monthly')}
                  >
                    Mensual
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="cardsStudied"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      name="Tarjetas estudiadas"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Precisión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#22c55e"
                        strokeWidth={2}
                        name="Precisión (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tiempo de Estudio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="timeSpent"
                        fill="#f59e0b"
                        name="Tiempo (min)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="heatmap">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Heatmap de Actividad {selectedYear}
                </CardTitle>
                <div className="flex gap-2">
                  {[2023, 2024, 2025].map(year => (
                    <Button
                      key={year}
                      variant={selectedYear === year ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedYear(year)}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StatsHeatmap data={heatmapData} year={selectedYear} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Distribución de Tarjetas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Logros y Métricas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Sesiones totales</span>
                  <Badge variant="secondary">{overallStats.totalSessions}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Racha más larga</span>
                  <Badge variant="secondary">{overallStats.longestStreak} días</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Progreso general</span>
                  <Badge variant="secondary">
                    {overallStats.totalCards > 0 
                      ? ((overallStats.cardsLearned / overallStats.totalCards) * 100).toFixed(1)
                      : 0}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tiempo promedio/día</span>
                  <Badge variant="secondary">
                    {overallStats.totalSessions > 0
                      ? Math.round(overallStats.totalTimeSpent / overallStats.totalSessions)
                      : 0} min
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="decks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Análisis por Mazos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deckAnalysis.map((deck) => (
                  <div key={deck.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{deck.name}</h3>
                      <Badge variant="outline">
                        {deck.progress.toFixed(1)}% completado
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <div className="font-medium">{deck.totalCards} tarjetas</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Aprendidas:</span>
                        <div className="font-medium">{deck.cardsLearned}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tiempo:</span>
                        <div className="font-medium">{deck.totalTimeSpent} min</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Precisión:</span>
                        <div className="font-medium">{deck.accuracy.toFixed(1)}%</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${deck.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsView;
