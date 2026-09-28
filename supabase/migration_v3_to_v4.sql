-- Viva Mais MVP v3 -> v4
-- Preserva usuarios, agendamentos, conteudos e demais dados existentes.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hydration_channel') THEN
    CREATE TYPE public.hydration_channel AS ENUM ('app', 'email', 'both', 'off');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.hydration_preferences (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  daily_goal_ml integer NOT NULL DEFAULT 2000 CHECK (daily_goal_ml BETWEEN 500 AND 6000),
  serving_ml integer NOT NULL DEFAULT 250 CHECK (serving_ml BETWEEN 50 AND 1000),
  routine_start time NOT NULL DEFAULT '08:00',
  routine_end time NOT NULL DEFAULT '18:00',
  interval_minutes integer NOT NULL DEFAULT 120 CHECK (interval_minutes BETWEEN 30 AND 360),
  channel public.hydration_channel NOT NULL DEFAULT 'app',
  email text,
  timezone text NOT NULL DEFAULT 'America/Maceio',
  enabled boolean NOT NULL DEFAULT true,
  email_opt_in_at timestamptz,
  last_email_sent_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (routine_end > routine_start),
  CHECK (channel NOT IN ('email','both') OR email IS NOT NULL)
);

DROP TRIGGER IF EXISTS hydration_set_updated_at ON public.hydration_preferences;
CREATE TRIGGER hydration_set_updated_at
BEFORE UPDATE ON public.hydration_preferences
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.hydration_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS hydration_self_read ON public.hydration_preferences;
DROP POLICY IF EXISTS hydration_self_insert ON public.hydration_preferences;
DROP POLICY IF EXISTS hydration_self_update ON public.hydration_preferences;
DROP POLICY IF EXISTS hydration_self_delete ON public.hydration_preferences;

CREATE POLICY hydration_self_read ON public.hydration_preferences
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY hydration_self_insert ON public.hydration_preferences
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY hydration_self_update ON public.hydration_preferences
FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY hydration_self_delete ON public.hydration_preferences
FOR DELETE TO authenticated USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hydration_preferences TO authenticated;
