
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Save, Settings, Mail, Calendar } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const ProfileView = () => {
  const { profile, updateProfile, loading } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");

  // Sincronizar displayName cuando se carga el perfil
  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile?.display_name]);

  const handleSave = async () => {
    try {
      await updateProfile(displayName);
      toast({
        title: "Perfil actualizado",
        description: "Tu nombre se ha actualizado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-emerald-100 rounded-full">
            <User className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Mi perfil</h1>
        </div>
      </div>

      {/* Main profile card */}
      <Card className="animate-fade-in shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
            <div className="p-2 bg-emerald-100 rounded-full">
              <Settings className="h-5 w-5 text-emerald-600" />
            </div>
            Configuración de perfil
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Profile form */}
          <div className="max-w-md mx-auto space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  Nombre para mostrar
                </Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre"
                  disabled={loading}
                  className="text-lg py-3 border-2 border-gray-200 focus:border-emerald-400 rounded-xl"
                />
              </div>

              {/* Additional profile info (read-only) */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">Correo electrónico</span>
                  </div>
                  <span className="text-gray-600">
                    {user?.email || "No disponible"}
                  </span>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Miembro desde</span>
                  </div>
                  <span className="text-gray-600">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('es-ES') : "No disponible"}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action button */}
            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleSave}
                disabled={loading || !displayName.trim()}
                size="lg"
                className="min-w-[200px] rounded-xl"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </div>

          {/* Additional features section */}
          <div className="pt-8 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
              Próximamente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 opacity-60">
                <h4 className="font-medium text-gray-700 mb-2">Estadísticas avanzadas</h4>
                <p className="text-sm text-gray-600">Seguimiento detallado de tu progreso de aprendizaje</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-japanese-momo/20 to-japanese-sora/20 rounded-xl border border-japanese-momo/30 opacity-60">
                <h4 className="font-medium text-gray-700 mb-2">Configuración de notificaciones</h4>
                <p className="text-sm text-gray-600">Personaliza tus recordatorios de estudio</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileView;
