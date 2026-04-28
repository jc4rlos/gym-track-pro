-- ============================================================
-- GymTrack Pro v2 — Schema completo
-- Ejecutar en orden en el SQL Editor de Supabase
-- ============================================================

-- ── TIPOS ENUM ──────────────────────────────────────────────
CREATE TYPE gender_type       AS ENUM ('male', 'female', 'other');
CREATE TYPE body_side_type    AS ENUM ('front', 'back', 'both');
CREATE TYPE difficulty_type   AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE audit_op_type     AS ENUM ('INSERT', 'UPDATE', 'DELETE');
CREATE TYPE goal_type         AS ENUM ('lose_weight', 'gain_muscle', 'maintain');
CREATE TYPE activity_type     AS ENUM ('sedentary', 'light', 'moderate', 'active', 'very_active');


-- ── PROFILES ────────────────────────────────────────────────
CREATE TABLE profiles (
  id                uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username          text        UNIQUE NOT NULL,
  full_name         text        NOT NULL DEFAULT '',
  gender            gender_type NOT NULL DEFAULT 'other',
  avatar_url        text,
  birth_date        date,
  height_cm         numeric(5,1),
  weight_kg         numeric(5,2),
  goal              goal_type,
  activity_level    activity_type DEFAULT 'moderate',
  gym_days_per_week int         DEFAULT 3 CHECK (gym_days_per_week BETWEEN 1 AND 7),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

 --ALTER TABLE profiles ALTER COLUMN goal DROP DEFAULT;  



-- ── MUSCLE GROUPS (catálogo) ─────────────────────────────────
CREATE TABLE muscle_groups (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text        UNIQUE NOT NULL,
  name_es        text        NOT NULL,
  name_en        text        NOT NULL,
  body_side      body_side_type NOT NULL DEFAULT 'front',
  svg_path_id    text        NOT NULL,
  display_order  int         NOT NULL DEFAULT 0
);

INSERT INTO muscle_groups (slug, name_es, name_en, body_side, svg_path_id, display_order) VALUES
  ('chest',       'Pecho',          'Chest',        'front', 'chest',        1),
  ('biceps',      'Bíceps',         'Biceps',       'front', 'biceps',       2),
  ('abs',         'Abdomen',        'Abs',          'front', 'abs',          3),
  ('obliques',    'Oblicuos',       'Obliques',     'front', 'obliques',     4),
  ('quadriceps',  'Cuádriceps',     'Quadriceps',   'front', 'quadriceps',   5),
  ('shoulders',   'Hombros',        'Shoulders',    'both',  'front-deltoids',6),
  ('forearms',    'Antebrazos',     'Forearms',     'both',  'forearm',      7),
  ('back',        'Espalda',        'Back',         'back',  'upper-back',   8),
  ('traps',       'Trapecios',      'Trapezius',    'back',  'trapezius',    9),
  ('lats',        'Dorsales',       'Lats',         'back',  'upper-back',   10),
  ('triceps',     'Tríceps',        'Triceps',      'back',  'triceps',      11),
  ('glutes',      'Glúteos',        'Glutes',       'back',  'gluteal',      12),
  ('hamstrings',  'Isquiotibiales', 'Hamstrings',   'back',  'hamstring',    13),
  ('calves',      'Pantorrillas',   'Calves',       'back',  'calves',       14);


-- ── BODY MEASUREMENTS ───────────────────────────────────────
CREATE TABLE body_measurements (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  measured_at date        NOT NULL DEFAULT CURRENT_DATE,
  weight_kg   numeric(5,2),
  height_cm   numeric(5,1),
  bmi         numeric(4,1),
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, measured_at)
);

CREATE INDEX idx_measurements_user_date ON body_measurements(user_id, measured_at DESC);


-- ── EXERCISES ───────────────────────────────────────────────
CREATE TABLE exercises (
  id                 uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  exercisedb_id      text            UNIQUE,
  name               text            NOT NULL,
  name_es            text,
  muscle_group_id    uuid            REFERENCES muscle_groups(id),
  body_part          text,
  target_muscle      text,
  secondary_muscles  text[]          DEFAULT '{}',
  equipment          text,
  gif_url            text,
  instructions       text[]          DEFAULT '{}',
  difficulty         difficulty_type DEFAULT 'beginner',
  is_custom          boolean         NOT NULL DEFAULT false,
  created_by         uuid            REFERENCES profiles(id) ON DELETE SET NULL,
  created_at         timestamptz     NOT NULL DEFAULT now()
);

CREATE INDEX idx_exercises_muscle    ON exercises(muscle_group_id);
CREATE INDEX idx_exercises_body_part ON exercises(body_part);
CREATE INDEX idx_exercises_name      ON exercises USING gin(to_tsvector('english', name));


ALTER TABLE exercises
  ADD COLUMN image_url text,
  ADD COLUMN starting_position     text,
  ADD COLUMN execution             text;


-- ── ROUTINES ────────────────────────────────────────────────
CREATE TABLE routines (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  description text,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ── ROUTINE EXERCISES ───────────────────────────────────────
CREATE TABLE routine_exercises (
  id           uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id   uuid    NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  exercise_id  uuid    NOT NULL REFERENCES exercises(id),
  sets         int     NOT NULL DEFAULT 3,
  reps         text    NOT NULL DEFAULT '10-12',
  rest_seconds int     DEFAULT 60,
  order_index  int     NOT NULL DEFAULT 0,
  notes        text,
  UNIQUE (routine_id, order_index)
);

-- ── WEEKLY PLANS ────────────────────────────────────────────
CREATE TABLE weekly_plans (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_number    int         NOT NULL CHECK (week_number BETWEEN 1 AND 53),
  year           int         NOT NULL,
  name           text,
  is_template    boolean     NOT NULL DEFAULT false,
  copied_from_id uuid        REFERENCES weekly_plans(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_number, year)
);

-- ── WEEKLY PLAN DAYS ────────────────────────────────────────
CREATE TABLE weekly_plan_days (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_plan_id uuid    NOT NULL REFERENCES weekly_plans(id) ON DELETE CASCADE,
  day_of_week    int     NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_rest_day    boolean NOT NULL DEFAULT false,
  routine_id     uuid    REFERENCES routines(id) ON DELETE SET NULL,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (weekly_plan_id, day_of_week)
);

-- ── WEEKLY PLAN DAY MUSCLES ─────────────────────────────────
CREATE TABLE weekly_plan_day_muscles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_day_id      uuid NOT NULL REFERENCES weekly_plan_days(id) ON DELETE CASCADE,
  muscle_group_id  uuid NOT NULL REFERENCES muscle_groups(id),
  UNIQUE (plan_day_id, muscle_group_id)
);

-- ── WORKOUT SESSIONS ────────────────────────────────────────
CREATE TABLE workout_sessions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_date  date        NOT NULL DEFAULT CURRENT_DATE,
  started_at    timestamptz NOT NULL DEFAULT now(),
  finished_at   timestamptz,
  notes         text,
  week_number   int         NOT NULL DEFAULT EXTRACT(WEEK FROM CURRENT_DATE)::int,
  year          int         NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::int,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, session_date)
);

CREATE INDEX idx_sessions_user_week ON workout_sessions(user_id, week_number, year);
CREATE INDEX idx_sessions_user_date ON workout_sessions(user_id, session_date DESC);


ALTER TABLE workout_sessions
    ADD COLUMN IF NOT EXISTS intensity text DEFAULT 'moderate'                                                                                                        
      CHECK (intensity IN ('low', 'moderate', 'high', 'very_high')),                                                                                                  
    ADD COLUMN IF NOT EXISTS calories_burned int;  

-- ── SESSION MUSCLE GROUPS ───────────────────────────────────
CREATE TABLE session_muscle_groups (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       uuid        NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  muscle_group_id  uuid        NOT NULL REFERENCES muscle_groups(id),
  is_completed     boolean     NOT NULL DEFAULT false,
  completed_at     timestamptz,
  sets_count       int,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, muscle_group_id)
);

CREATE INDEX idx_smg_session ON session_muscle_groups(session_id);

-- ── AUDIT LOG ───────────────────────────────────────────────
CREATE TABLE audit_log (
  id          bigserial       PRIMARY KEY,
  table_name  text            NOT NULL,
  operation   audit_op_type   NOT NULL,
  row_id      uuid,
  user_id     uuid,
  old_data    jsonb,
  new_data    jsonb,
  changed_at  timestamptz     NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_user       ON audit_log(user_id);
CREATE INDEX idx_audit_table      ON audit_log(table_name);
CREATE INDEX idx_audit_changed_at ON audit_log(changed_at DESC);



 CREATE TABLE weekly_plan_day_routines (                                                                                                                             
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_day_id uuid NOT NULL REFERENCES weekly_plan_days(id) ON DELETE CASCADE,                                                                                      
    routine_id uuid NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),                                                                                                                             
    UNIQUE(plan_day_id, routine_id)                                                                                                                                   
  );


  CREATE TABLE session_plan_exercises (                                                                                                                               
    session_id uuid NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,                                                                                       
    routine_exercise_id uuid NOT NULL,                                                                                                                                
    completed_at timestamptz NOT NULL DEFAULT now(),                                                                                                                  
    PRIMARY KEY (session_id, routine_exercise_id)           
  );  



-- ── updated_at automático ───────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_sessions
  BEFORE UPDATE ON workout_sessions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_routines
  BEFORE UPDATE ON routines FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_weekly_plans
  BEFORE UPDATE ON weekly_plans FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ── Crear perfil al registrarse ─────────────────────────────
 CREATE OR REPLACE FUNCTION handle_new_user()                                                                                                                        
  RETURNS TRIGGER AS $$                                                                                                                                               
  BEGIN                                                                                                                                                               
    INSERT INTO public.profiles (id, username, full_name, gender)                                                                                                     
    VALUES (                                                                                                                                                          
      NEW.id,
      split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 4),                                                                                             
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),                                                                                                             
      COALESCE(NEW.raw_user_meta_data->>'gender', 'other')::public.gender_type
    );                                                                                                                                                                
    RETURN NEW;                                             
  END;                                                                                                                                                                
  $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Auto-completar completed_at al marcar músculo ───────────
CREATE OR REPLACE FUNCTION set_muscle_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true AND OLD.is_completed = false THEN
    NEW.completed_at = NOW();
  ELSIF NEW.is_completed = false THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_muscle_completed
  BEFORE UPDATE ON session_muscle_groups
  FOR EACH ROW EXECUTE FUNCTION set_muscle_completed_at();

-- ── Actualizar peso en profiles cuando se inserta medición ──
CREATE OR REPLACE FUNCTION sync_weight_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    weight_kg  = NEW.weight_kg,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_measurement_insert
  AFTER INSERT ON body_measurements
  FOR EACH ROW EXECUTE FUNCTION sync_weight_to_profile();

-- ── Calcular BMI automáticamente al insertar medición ───────
CREATE OR REPLACE FUNCTION calculate_bmi()
RETURNS TRIGGER AS $$
DECLARE
  v_height numeric;
BEGIN
  -- Usar altura del perfil si no se provee en la medición
  IF NEW.height_cm IS NULL THEN
    SELECT height_cm INTO v_height FROM profiles WHERE id = NEW.user_id;
    NEW.height_cm = v_height;
  END IF;

  IF NEW.weight_kg IS NOT NULL AND NEW.height_cm IS NOT NULL AND NEW.height_cm > 0 THEN
    NEW.bmi = ROUND(
      NEW.weight_kg / POWER(NEW.height_cm / 100.0, 2),
      1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_measurement_calculate_bmi
  BEFORE INSERT ON body_measurements
  FOR EACH ROW EXECUTE FUNCTION calculate_bmi();

-- ── Auditoría ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE v_user_id uuid;
BEGIN
  BEGIN v_user_id := auth.uid(); EXCEPTION WHEN OTHERS THEN v_user_id := NULL; END;

  /*IF    TG_OP = 'INSERT' THEN
    INSERT INTO audit_log(table_name, operation, row_id, user_id, new_data)
    VALUES (TG_TABLE_NAME, 'INSERT', NEW.id, v_user_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log(table_name, operation, row_id, user_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, 'UPDATE', NEW.id, v_user_id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log(table_name, operation, row_id, user_id, old_data)
    VALUES (TG_TABLE_NAME, 'DELETE', OLD.id, v_user_id, to_jsonb(OLD));
    RETURN OLD;
  END IF;*/
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_workout_sessions
  AFTER INSERT OR UPDATE OR DELETE ON workout_sessions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_body_measurements
  AFTER INSERT OR UPDATE OR DELETE ON body_measurements
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_session_muscle_groups
  AFTER INSERT OR UPDATE OR DELETE ON session_muscle_groups
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

  ----

CREATE OR REPLACE FUNCTION auto_finish_old_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today date := (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date;
BEGIN
  UPDATE workout_sessions
  SET finished_at = NOW()
  WHERE finished_at IS NULL
    AND session_date < today;
END;
$$;
      


----CRON

SELECT cron.schedule(
  'finish-old-sessions-daily',   -- nombre del job
  '0 0 * * *',                   -- cada día a medianoche UTC
  $$SELECT auto_finish_old_sessions()$$
);

----
---
  -- 1. Planes reutilizables
  create table plans (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    created_at timestamptz not null default now()
  );
  alter table plans enable row level security;
  create policy "users own plans" on plans
    for all using (auth.uid() = user_id);

  -- 2. Días de cada plan (L-D)
  create table plan_days (
    id uuid primary key default gen_random_uuid(),
    plan_id uuid not null references plans(id) on delete cascade,
    day_of_week int not null check (day_of_week between 0 and 6),
    is_rest_day boolean not null default false
  );
  alter table plan_days enable row level security;
  create policy "users own plan_days" on plan_days
    for all using (
      exists (select 1 from plans where plans.id = plan_days.plan_id and plans.user_id = auth.uid())
    );

  -- 3. Rutinas asignadas a cada día del plan
  create table plan_day_routines (
    id uuid primary key default gen_random_uuid(),
    plan_day_id uuid not null references plan_days(id) on delete cascade,
    routine_id uuid not null references routines(id) on delete cascade
  );
  alter table plan_day_routines enable row level security;
  create policy "users own plan_day_routines" on plan_day_routines
    for all using (
      exists (
        select 1 from plan_days pd
        join plans p on p.id = pd.plan_id
        where pd.id = plan_day_routines.plan_day_id and p.user_id = auth.uid()
      )
    );

  -- 4. Asignación de plan a semana ISO
  create table plan_week_assignments (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    plan_id uuid not null references plans(id) on delete cascade,
    week_number int not null,
    year int not null,
    unique (user_id, week_number, year)
  );
  alter table plan_week_assignments enable row level security;
  create policy "users own plan_week_assignments" on plan_week_assignments
    for all using (auth.uid() = user_id);



ALTER TABLE profiles ADD COLUMN daily_steps_goal int NOT NULL DEFAULT 12000;                                                                                        
                                                                                                                                                                      
  CREATE TABLE daily_steps (                                                                                                                                          
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),                                                                                                    
    user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    step_date   date        NOT NULL DEFAULT CURRENT_DATE,                                                                                                            
    steps       int         NOT NULL DEFAULT 0 CHECK (steps >= 0),
    created_at  timestamptz NOT NULL DEFAULT now(),                                                                                                                   
    updated_at  timestamptz NOT NULL DEFAULT now(),                                                                                                                   
    UNIQUE (user_id, step_date)
  );                                                                                                                                                                  
                                                            
  CREATE INDEX idx_daily_steps_user_date ON daily_steps(user_id, step_date DESC);

  ALTER TABLE daily_steps ENABLE ROW LEVEL SECURITY;                                                                                                                  
  CREATE POLICY "users own steps" ON daily_steps
    FOR ALL USING (auth.uid() = user_id);                                                                                                                             
                                                            
  CREATE TRIGGER set_updated_at_daily_steps
    BEFORE UPDATE ON daily_steps
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();



    -- 1. Columnas nuevas en profiles                                                                                                                                   
  ALTER TABLE profiles                                                                                                                                                
    ADD COLUMN IF NOT EXISTS role text DEFAULT 'user'                                                                                                                 
      CHECK (role IN ('admin', 'user')),
    ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;       


    ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS must_change_password boolean DEFAULT false;      

    ALTER TABLE profiles ALTER COLUMN is_active SET DEFAULT false;      
      

  CREATE OR REPLACE FUNCTION get_admin_users(                                                                                                                         
    search_query text DEFAULT '',                                                                                                                                     
    page_offset  int  DEFAULT 0,                                                                                                                                      
    page_limit   int  DEFAULT 20                                                                                                                                      
  )                                                         
  RETURNS TABLE(
    id         uuid,
    email      text,
    full_name  text,
    role       text,
    is_active  boolean,                                                                                                                                               
    created_at timestamptz,
    total      bigint                                                                                                                                                 
  )                                                         
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'                                                                                                      
    ) THEN
      RAISE EXCEPTION 'Admin only';                                                                                                                                   
    END IF;                                                 

    RETURN QUERY
    SELECT
      p.id,
      u.email::text,
      p.full_name::text,                                                                                                                                              
      p.role::text,
      p.is_active,                                                                                                                                                    
      p.created_at,                                         
      COUNT(*) OVER()::bigint
    FROM profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE (                                                                                                                                                           
      search_query = ''
      OR u.email ILIKE '%' || search_query || '%'                                                                                                                     
      OR p.full_name ILIKE '%' || search_query || '%'       
    )
    ORDER BY p.created_at DESC
    LIMIT page_limit                                                                                                                                                  
    OFFSET page_offset;
  END;                                                                                                                                                                
  $$;                                                       

  GRANT EXECUTE ON FUNCTION get_admin_users(text, int, int) TO authenticated;


  

  ---npx supabase functions deploy admin-invite-user --no-verify-jwt --project-ref pvzkqsetoktbfxcncgca
  --npx supabase functions deploy admin-create-user --no-verify-jwt --project-ref pvzkqsetoktbfxcncgca

-----

SELECT * FROM cron.job;

SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;

  select * from exercises

  delete from session_plan_exercises

  delete from workout_sessions

  delete from audit_log

  alter database postgres
set timezone to 'America/Lima';


select *
from pg_timezone_names()
where name ilike '%Lima%';

update profiles set goal= null where id='299a5907-0ea3-4384-a012-10d8cc5a5f01'

select * from profiles

select * from  body_measurements

select * from exercises

select * from routines

select * from routine_exercises

select * from weekly_plans


select * from weekly_plan_days

select * from weekly_plan_day_muscles----no se usa

select * from workout_sessions

select * from session_muscle_groups

select * from weekly_plan_day_routines

select * from session_plan_exercises

--4a4367c5-6352-43ea-b63f-e1522ea6c2d3
--37f15a2e-adee-45e2-8972-3e243543cdcc

select * from muscle_groups where id in('4a4367c5-6352-43ea-b63f-e1522ea6c2d3')

---

delete  from  body_measurements;

--delete  from exercises;

delete  from routines;

delete  from routine_exercises;

delete  from weekly_plans;


delete  from weekly_plan_days;

delete  from weekly_plan_day_muscles; ----no se usa

delete  from workout_sessions;

delete  from session_muscle_groups;

delete  from weekly_plan_day_routines;

delete  from session_plan_exercises;


delete  from plans
delete  from plan_days
delete  from plan_day_routines
delete  from plan_week_assignments




 SELECT pg_get_functiondef(oid)                                                                                                                                      
  FROM pg_proc                                              
  WHERE proname = 'auto_finish_old_sessions';



  SELECT
    tgname AS trigger_name,
    pg_get_triggerdef(oid) AS definition
  FROM pg_trigger
  WHERE tgrelid = 'workout_sessions'::regclass
    AND NOT tgisinternal;

    DROP TRIGGER auto_finish_sessions_on_create ON public.workout_sessions;

