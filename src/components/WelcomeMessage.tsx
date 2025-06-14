
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Sparkles } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const WelcomeMessage = () => {
  const { profile } = useProfile();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "¡Buenos días!";
    if (hour < 18) return "¡Buenas tardes!";
    return "¡Buenas noches!";
  };

  const getUserName = () => {
    if (profile?.display_name) {
      return profile.display_name;
    }
    return "";
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-blue-900">
              {getGreeting()}
            </h2>
            <p className="text-sm sm:text-base text-blue-700">
              Bienvenido{getUserName() ? ` ${getUserName()}` : ""} a tu app de estudio de japonés
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-blue-600">
          ¡Vamos a aprender juntos! がんばって！(¡Esfuérzate!)
        </p>
      </CardContent>
    </Card>
  );
};

export default WelcomeMessage;
