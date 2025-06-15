
import { supabase } from "@/integrations/supabase/client";

export const deckService = {
  async loadDecks(userId: string) {
    const { data: decksData, error: decksError } = await supabase
      .from('decks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (decksError) {
      console.error('Error cargando decks:', decksError);
      throw decksError;
    }

    console.log(`Cargados ${decksData?.length || 0} mazos`);
    return decksData || [];
  },

  async createDeck(userId: string, name: string, isImported: boolean = false) {
    const { data, error } = await supabase
      .from('decks')
      .insert({
        user_id: userId,
        name,
        is_imported: isImported
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteDeck(deckId: string, userId: string) {
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId)
      .eq('user_id', userId);

    if (error) throw error;
  }
};
