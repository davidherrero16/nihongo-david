-- Agregar campos para el sistema de repetición espaciada (SRS)
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS ease_factor DECIMAL(3,2) DEFAULT 2.5;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS srs_interval INTEGER DEFAULT 1;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS repetitions INTEGER DEFAULT 0;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS last_score INTEGER DEFAULT 0;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS interval_modifier DECIMAL(3,2) DEFAULT 1.0;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS response_time INTEGER DEFAULT NULL; -- tiempo de respuesta en milisegundos

-- Índices para mejorar el rendimiento de las consultas SRS
CREATE INDEX IF NOT EXISTS idx_cards_next_review ON public.cards(next_review, user_id);
CREATE INDEX IF NOT EXISTS idx_cards_difficulty_review ON public.cards(difficulty, next_review, user_id);
CREATE INDEX IF NOT EXISTS idx_cards_has_been_wrong ON public.cards(has_been_wrong, difficulty, user_id);

-- Función para migrar datos existentes al formato SRS
CREATE OR REPLACE FUNCTION migrate_existing_cards_to_srs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Actualizar tarjetas existentes con valores SRS apropiados basados en su dificultad actual
  UPDATE public.cards SET
    ease_factor = CASE 
      WHEN difficulty >= 8 THEN 2.8
      WHEN difficulty >= 6 THEN 2.6
      WHEN difficulty >= 4 THEN 2.4
      WHEN difficulty >= 2 THEN 2.2
      ELSE 2.0
    END,
    srs_interval = CASE
      WHEN difficulty = 0 THEN 1
      WHEN difficulty <= 2 THEN 3
      WHEN difficulty <= 4 THEN 7
      WHEN difficulty <= 6 THEN 15
      WHEN difficulty <= 8 THEN 30
      ELSE 60
    END,
    repetitions = GREATEST(review_count, CASE
      WHEN difficulty >= 8 THEN 5
      WHEN difficulty >= 6 THEN 4
      WHEN difficulty >= 4 THEN 3
      WHEN difficulty >= 2 THEN 2
      WHEN difficulty >= 1 THEN 1
      ELSE 0
    END),
    last_score = CASE
      WHEN difficulty >= 9 THEN 8
      WHEN difficulty >= 7 THEN 6
      WHEN difficulty >= 5 THEN 5
      WHEN difficulty >= 3 THEN 4
      WHEN difficulty >= 1 THEN 3
      ELSE 1
    END
  WHERE ease_factor IS NULL OR ease_factor = 2.5;
  
  RAISE NOTICE 'Migración SRS completada para % tarjetas', 
    (SELECT COUNT(*) FROM public.cards);
END;
$$;

-- Ejecutar la migración
SELECT migrate_existing_cards_to_srs();

-- Eliminar la función temporal
DROP FUNCTION migrate_existing_cards_to_srs(); 