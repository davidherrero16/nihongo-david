
-- Crear tabla para los decks
CREATE TABLE public.decks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  is_imported BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para las tarjetas
CREATE TABLE public.cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  word TEXT NOT NULL,
  reading TEXT NOT NULL,
  meaning TEXT NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 0,
  last_reviewed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  next_review TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  review_count INTEGER NOT NULL DEFAULT 0,
  has_been_wrong BOOLEAN NOT NULL DEFAULT false,
  was_wrong_in_session BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Políticas para decks - solo el usuario puede ver/modificar sus propios decks
CREATE POLICY "Users can view their own decks" 
  ON public.decks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own decks" 
  ON public.decks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks" 
  ON public.decks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks" 
  ON public.decks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para tarjetas - solo el usuario puede ver/modificar sus propias tarjetas
CREATE POLICY "Users can view their own cards" 
  ON public.cards 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cards" 
  ON public.cards 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards" 
  ON public.cards 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards" 
  ON public.cards 
  FOR DELETE 
  USING (auth.uid() = user_id);
