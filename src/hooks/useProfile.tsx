
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile exists, create one
          await createProfile();
        } else {
          throw error;
        }
      } else {
        // Limpiar el display_name si es un JSON string malformado
        let displayName = data.display_name;
        if (displayName && (displayName.startsWith('{') || displayName.includes('"display_name"'))) {
          try {
            // Si parece JSON, intentar parsearlo
            if (displayName.startsWith('{')) {
              const parsed = JSON.parse(displayName);
              displayName = parsed.display_name || displayName;
            } else {
              // Si contiene "display_name" pero no es JSON válido, extraer el valor
              const match = displayName.match(/"display_name":"([^"]+)"/);
              if (match) {
                displayName = match[1];
              }
            }
          } catch (e) {
            console.log('Display name no es JSON válido, usando como está');
            // Si falla el parseo, usar el email como fallback
            displayName = user.email?.split('@')[0] || 'Usuario';
          }
        }
        
        setProfile({
          ...data,
          display_name: displayName
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      const defaultName = user.email?.split('@')[0] || 'Usuario';
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          display_name: defaultName
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error creating profile:', error);
    }
  };

  const updateProfile = async (display_name: string) => {
    if (!user || !profile) return false;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          display_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      toast({
        title: "Perfil actualizado",
        description: "Tu nombre se ha actualizado correctamente",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    profile,
    loading,
    updateProfile
  };
};
