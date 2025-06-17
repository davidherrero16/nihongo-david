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

  const getGreetingWithName = () => {
    const greeting = getGreeting();
    if (profile?.display_name) {
      return `${greeting.slice(0, -1)}, ${profile.display_name}!`;
    }
    return greeting;
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 mb-4 sm:mb-6 w-full max-w-4xl mx-auto">
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-blue-900 leading-tight text-center">
              {getGreetingWithName()}
            </h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-blue-600 leading-relaxed text-center">
          ¡Vamos a aprender juntos! がんばって！(¡Esfuérzate!)
        </p>
      </CardContent>
    </Card>
  );
};

export default WelcomeMessage;
