-- =============================================================================
-- FINOVA · Esquema de base de datos para Supabase (Postgres)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run.
-- Incluye tablas, RLS, funciones seguras (RPC) y datos de demostración.
-- Las recompensas (monedas, XP, puntos del periodo), los límites de partidas y
-- el reclamo de premios SOLO se hacen desde estas funciones (security definer),
-- nunca escribiendo directamente desde el navegador.
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------- Catálogo de meses (estático) ----------
create table if not exists public.month_catalog (
  month_number int primary key check (month_number between 1 and 12),
  name text not null,
  title text not null,
  icon text not null,
  reward_coins int not null,
  reward_xp int not null
);
grant select on public.month_catalog to anon, authenticated;
grant all on public.month_catalog to service_role;
alter table public.month_catalog enable row level security;
create policy "month_catalog readable" on public.month_catalog for select to anon, authenticated using (true);

-- ---------- Perfiles (rol estudiante / docente) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student','teacher')),
  full_name text not null default '',
  created_at timestamptz not null default now()
);
grant select on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

-- ---------- Cursos ----------
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  grade text not null,
  section text not null,
  name text not null,
  code text not null unique,
  teacher_id uuid references public.profiles(id) on delete set null,
  period int not null default 1 check (period between 1 and 4),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.courses to authenticated;
grant all on public.courses to service_role;
alter table public.courses enable row level security;

-- ---------- Estudiantes ----------
create table if not exists public.students (
  id uuid primary key references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  name text not null,
  full_name text not null,
  avatar_style text not null default 'valeria',
  coins int not null default 15000 check (coins >= 0),
  xp int not null default 100 check (xp >= 0),
  period_points int not null default 0 check (period_points >= 0),
  best_speed_time numeric(6,1) not null default 25.0,
  high_score_arcade int not null default 0,
  market_best int not null default 0,
  created_at timestamptz not null default now()
);
grant select, update on public.students to authenticated;
grant all on public.students to service_role;
alter table public.students enable row level security;

-- ---------- Meses habilitados por curso ----------
create table if not exists public.months (
  course_id uuid not null references public.courses(id) on delete cascade,
  month_number int not null references public.month_catalog(month_number),
  unlocked boolean not null default false,
  primary key (course_id, month_number)
);
grant select, insert, update, delete on public.months to authenticated;
grant all on public.months to service_role;
alter table public.months enable row level security;

-- ---------- Preguntas por mes y curso ----------
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade, -- null = banco general
  month_number int not null references public.month_catalog(month_number),
  question text not null,
  options text[] not null check (array_length(options, 1) between 2 and 4),
  correct_index int not null default 0,
  explanation text not null default '¡Excelente decisión financiera!',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.questions to authenticated;
grant all on public.questions to service_role;
alter table public.questions enable row level security;

-- ---------- Progreso ----------
create table if not exists public.month_completions (
  student_id uuid not null references public.students(id) on delete cascade,
  month_number int not null references public.month_catalog(month_number),
  completed_at timestamptz not null default now(),
  primary key (student_id, month_number)
);
grant select on public.month_completions to authenticated;
grant all on public.month_completions to service_role;
alter table public.month_completions enable row level security;

create table if not exists public.minicourse_completions (
  student_id uuid not null references public.students(id) on delete cascade,
  course_key text not null check (course_key in ('mc1','mc2','mc3')),
  completed_at timestamptz not null default now(),
  primary key (student_id, course_key)
);
grant select on public.minicourse_completions to authenticated;
grant all on public.minicourse_completions to service_role;
alter table public.minicourse_completions enable row level security;

create table if not exists public.game_plays (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  game text not null check (game in ('arcade','market')),
  month_number int not null,
  rewarded boolean not null default false,
  played_at timestamptz not null default now()
);
create index if not exists game_plays_lookup on public.game_plays (student_id, game, month_number);
grant select on public.game_plays to authenticated;
grant all on public.game_plays to service_role;
alter table public.game_plays enable row level security;

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  title text not null,
  amount int not null default 0,
  type text not null check (type in ('in','save','prize')),
  created_at timestamptz not null default now()
);
grant select on public.transactions to authenticated;
grant all on public.transactions to service_role;
alter table public.transactions enable row level security;

-- ---------- Premios y podio ----------
create table if not exists public.prizes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  period int not null check (period between 1 and 4),
  name text not null,
  cost int not null check (cost >= 0),
  slots int not null default 10 check (slots >= 0)
);
grant select, insert, update, delete on public.prizes to authenticated;
grant all on public.prizes to service_role;
alter table public.prizes enable row level security;

create table if not exists public.prize_claims (
  id uuid primary key default gen_random_uuid(),
  prize_id uuid not null references public.prizes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  period int not null,
  claimed_at timestamptz not null default now(),
  unique (prize_id, student_id)
);
grant select on public.prize_claims to authenticated;
grant all on public.prize_claims to service_role;
alter table public.prize_claims enable row level security;

create table if not exists public.podiums (
  course_id uuid not null references public.courses(id) on delete cascade,
  period int not null check (period between 1 and 4),
  position int not null check (position between 1 and 3),
  student_id uuid references public.students(id) on delete set null,
  student_name text not null,
  archived boolean not null default false,
  primary key (course_id, period, position)
);
grant select, insert, update, delete on public.podiums to authenticated;
grant all on public.podiums to service_role;
alter table public.podiums enable row level security;

-- =============================================================================
-- Funciones auxiliares (security definer para evitar recursión en RLS)
-- =============================================================================
create or replace function public.is_teacher() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
$$;

create or replace function public.teaches_course(_course uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from courses where id = _course and teacher_id = auth.uid())
$$;

create or replace function public.my_course_id() returns uuid
language sql stable security definer set search_path = public as $$
  select course_id from students where id = auth.uid()
$$;

create or replace function public.teaches_student(_student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from students s join courses c on c.id = s.course_id
                 where s.id = _student and c.teacher_id = auth.uid())
$$;

-- Mes activo = el mes más alto habilitado por la docente
create or replace function public.active_month(_course uuid) returns int
language sql stable security definer set search_path = public as $$
  select coalesce(max(month_number), 1) from months where course_id = _course and unlocked
$$;

-- =============================================================================
-- Políticas RLS: la estudiante solo ve lo suyo; la docente administra su curso
-- =============================================================================
create policy "own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.teaches_student(id));

create policy "course visible to members" on public.courses for select to authenticated using (teacher_id = auth.uid() or id = public.my_course_id());
create policy "teacher creates course" on public.courses for insert to authenticated with check (public.is_teacher() and teacher_id = auth.uid());
create policy "teacher updates course" on public.courses for update to authenticated using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "teacher deletes course" on public.courses for delete to authenticated using (teacher_id = auth.uid());

create policy "student sees self" on public.students for select to authenticated using (id = auth.uid() or public.teaches_course(course_id));
create policy "teacher edits student" on public.students for update to authenticated using (public.teaches_course(course_id)) with check (public.teaches_course(course_id));

create policy "months visible" on public.months for select to authenticated using (course_id = public.my_course_id() or public.teaches_course(course_id));
create policy "teacher manages months" on public.months for all to authenticated using (public.teaches_course(course_id)) with check (public.teaches_course(course_id));

create policy "questions visible" on public.questions for select to authenticated using (course_id is null or course_id = public.my_course_id() or public.teaches_course(course_id));
create policy "teacher manages questions" on public.questions for all to authenticated using (public.teaches_course(course_id)) with check (public.teaches_course(course_id));

create policy "own month completions" on public.month_completions for select to authenticated using (student_id = auth.uid() or public.teaches_student(student_id));
create policy "own minicourses" on public.minicourse_completions for select to authenticated using (student_id = auth.uid() or public.teaches_student(student_id));
create policy "own plays" on public.game_plays for select to authenticated using (student_id = auth.uid() or public.teaches_student(student_id));
create policy "own transactions" on public.transactions for select to authenticated using (student_id = auth.uid() or public.teaches_student(student_id));

create policy "prizes visible" on public.prizes for select to authenticated using (course_id = public.my_course_id() or public.teaches_course(course_id));
create policy "teacher manages prizes" on public.prizes for all to authenticated using (public.teaches_course(course_id)) with check (public.teaches_course(course_id));

create policy "claims visible" on public.prize_claims for select to authenticated using (student_id = auth.uid() or public.teaches_course(course_id));

-- Las estudiantes solo ven el podio publicado de su curso (top 3)
create policy "podium visible" on public.podiums for select to authenticated using (course_id = public.my_course_id() or public.teaches_course(course_id));
create policy "teacher manages podium" on public.podiums for all to authenticated using (public.teaches_course(course_id)) with check (public.teaches_course(course_id));

-- =============================================================================
-- Funciones seguras (RPC)
-- =============================================================================
create or replace function public._award(_student uuid, _coins int, _xp int, _label text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update students
     set coins = coins + _coins, xp = xp + _xp, period_points = period_points + _xp
   where id = _student;
  if _label is not null then
    insert into transactions (student_id, title, amount, type) values (_student, _label, _coins, 'in');
  end if;
end $$;
revoke all on function public._award(uuid, int, int, text) from public, anon, authenticated;

-- Cada inicio de partida cuenta como intento. Máximo 2 por juego y por mes activo.
create or replace function public.register_game_play(p_game text)
returns int language plpgsql security definer set search_path = public as $$
declare _course uuid; _m int; _used int;
begin
  select course_id into _course from students where id = auth.uid() for update;
  if _course is null then raise exception 'not a student'; end if;
  if p_game not in ('arcade','market') then raise exception 'invalid game'; end if;
  _m := active_month(_course);
  select count(*) into _used from game_plays where student_id = auth.uid() and game = p_game and month_number = _m;
  if _used >= 2 then raise exception 'monthly limit reached'; end if;
  insert into game_plays (student_id, game, month_number) values (auth.uid(), p_game, _m);
  return 2 - (_used + 1);
end $$;

-- Recompensa de una partida ya iniciada (una sola vez por partida, con topes).
create or replace function public.award_game_reward(p_game text, p_coins int, p_xp int, p_label text)
returns void language plpgsql security definer set search_path = public as $$
declare _play uuid; _maxc int; _maxx int;
begin
  _maxc := case p_game when 'arcade' then 150000 when 'market' then 6000 else 0 end;
  _maxx := case p_game when 'arcade' then 1500 when 'market' then 160 else 0 end;
  select id into _play from game_plays
   where student_id = auth.uid() and game = p_game and not rewarded
   order by played_at desc limit 1 for update;
  if _play is null then raise exception 'no pending play'; end if;
  update game_plays set rewarded = true where id = _play;
  perform _award(auth.uid(), least(greatest(p_coins, 0), _maxc), least(greatest(p_xp, 0), _maxx), left(p_label, 80));
  if p_game = 'arcade' then
    update students set high_score_arcade = greatest(high_score_arcade, least(p_coins, _maxc)) where id = auth.uid();
  end if;
end $$;

-- Misión del mes: premio completo la primera vez; repaso = +800 y +25 XP.
create or replace function public.complete_month(p_month int, p_correct int, p_elapsed numeric)
returns void language plpgsql security definer set search_path = public as $$
declare _course uuid; _cat month_catalog%rowtype;
begin
  select course_id into _course from students where id = auth.uid() for update;
  if _course is null then raise exception 'not a student'; end if;
  if not exists (select 1 from months where course_id = _course and month_number = p_month and unlocked) then
    raise exception 'month locked';
  end if;
  if p_correct < 2 then raise exception 'not enough correct answers'; end if;
  select * into _cat from month_catalog where month_number = p_month;
  update students set best_speed_time = least(best_speed_time, p_elapsed) where id = auth.uid() and p_elapsed > 0;
  if exists (select 1 from month_completions where student_id = auth.uid() and month_number = p_month) then
    perform _award(auth.uid(), 800, 25, format('Repaso Mes %s (%s)', p_month, _cat.name));
  else
    insert into month_completions (student_id, month_number) values (auth.uid(), p_month);
    perform _award(auth.uid(), _cat.reward_coins, _cat.reward_xp, format('Mes %s (%s) Completado', p_month, _cat.name));
  end if;
end $$;

-- Minicursos: pagan monedas y XP una sola vez por estudiante.
create or replace function public.complete_minicourse(p_course text)
returns boolean language plpgsql security definer set search_path = public as $$
declare _coins int; _xp int; _title text;
begin
  if not exists (select 1 from students where id = auth.uid()) then raise exception 'not a student'; end if;
  select c, x, t into _coins, _xp, _title from (values
    ('mc1', 2500, 65, 'Une las Parejas del Dinero'),
    ('mc2', 2500, 65, 'Detective de Gastos'),
    ('mc3', 3000, 80, 'Los 3 Frascos de la Mesada')) v(k, c, x, t) where k = p_course;
  if _coins is null then raise exception 'invalid minicourse'; end if;
  insert into minicourse_completions (student_id, course_key) values (auth.uid(), p_course) on conflict do nothing;
  if not found then return false; end if;
  perform _award(auth.uid(), _coins, _xp, 'Minicurso: ' || _title);
  return true;
end $$;

-- Reclamo ATÓMICO de premio: bloquea la fila del premio para que dos estudiantes
-- no tomen el último cupo. Requisitos: misión del mes, 3 minicursos, 2 partidas
-- de cada juego en el mes activo y monedas suficientes (no se descuentan).
create or replace function public.claim_prize(p_prize uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare _st students%rowtype; _pr prizes%rowtype; _period int; _m int; _taken int; _id uuid;
begin
  select * into _st from students where id = auth.uid();
  if _st.id is null then raise exception 'not a student'; end if;
  select * into _pr from prizes where id = p_prize for update;
  if _pr.id is null or _pr.course_id <> _st.course_id then raise exception 'prize not found'; end if;
  select period into _period from courses where id = _st.course_id;
  if _pr.period <> _period then raise exception 'prize not in current period'; end if;
  _m := active_month(_st.course_id);
  if not exists (select 1 from month_completions where student_id = _st.id and month_number = _m) then raise exception 'month mission incomplete'; end if;
  if (select count(*) from minicourse_completions where student_id = _st.id) < 3 then raise exception 'minicourses incomplete'; end if;
  if (select count(*) from game_plays where student_id = _st.id and game = 'arcade' and month_number = _m) < 2 then raise exception 'arcade plays incomplete'; end if;
  if (select count(*) from game_plays where student_id = _st.id and game = 'market' and month_number = _m) < 2 then raise exception 'market plays incomplete'; end if;
  if _st.coins < _pr.cost then raise exception 'not enough coins'; end if;
  select count(*) into _taken from prize_claims where prize_id = _pr.id;
  if _taken >= _pr.slots then raise exception 'no slots left'; end if;
  insert into prize_claims (prize_id, student_id, course_id, period) values (_pr.id, _st.id, _st.course_id, _period) returning id into _id;
  insert into transactions (student_id, title, amount, type) values (_st.id, 'Premio reclamado: ' || _pr.name, 0, 'prize');
  return _id;
end $$;

-- Cupos restantes visibles para las estudiantes del curso
create or replace function public.prize_status()
returns table (prize_id uuid, slots_left int, claimed_by_me boolean)
language sql stable security definer set search_path = public as $$
  select p.id, greatest(0, p.slots - count(c.id))::int, bool_or(c.student_id = auth.uid()) is true
    from prizes p left join prize_claims c on c.prize_id = p.id
   where p.course_id = my_course_id() or teaches_course(p.course_id)
   group by p.id, p.slots
$$;

-- Cierre de periodo: archiva el podio y reinicia period_points (nivel y XP se conservan).
create or replace function public.close_period(p_course uuid)
returns void language plpgsql security definer set search_path = public as $$
declare _period int;
begin
  if not teaches_course(p_course) then raise exception 'not allowed'; end if;
  select period into _period from courses where id = p_course for update;
  update podiums set archived = true where course_id = p_course and period = _period;
  update students set period_points = 0 where course_id = p_course;
  if _period < 4 then
    update courses set period = _period + 1 where id = p_course;
    insert into prizes (course_id, period, name, cost, slots)
      select course_id, _period + 1, name, cost, slots from prizes where course_id = p_course and period = _period;
  end if;
end $$;

grant execute on function public.register_game_play(text), public.award_game_reward(text, int, int, text),
  public.complete_month(int, int, numeric), public.complete_minicourse(text), public.claim_prize(uuid),
  public.prize_status(), public.close_period(uuid), public.active_month(uuid) to authenticated;

-- =============================================================================
-- Datos de demostración (los mismos del prototipo HTML)
-- Las cuentas (docente y estudiantes) se crean con Supabase Auth; después se
-- asocian con: insert into profiles / students (ver README).
-- =============================================================================
insert into public.month_catalog (month_number, name, title, icon, reward_coins, reward_xp) values
 (1,'Enero','El Primer Paso del Ahorro','🌟',3000,80),
 (2,'Febrero','Necesidades vs. Deseos','🧭',3200,85),
 (3,'Marzo','La Alcancía Inteligente','🐷',3500,90),
 (4,'Abril','Cazadores de Gastos Hormiga','🐜',3500,95),
 (5,'Mayo','El Poder de Compartir y ODS','🌍',4000,100),
 (6,'Junio','Presupuesto Familiar 50/30/20','📊',4000,105),
 (7,'Julio','Comparando Precios como Pro','🏷️',4200,110),
 (8,'Agosto','Emprendimiento Escolar','🚀',4500,120),
 (9,'Septiembre','El Interés y la Paciencia','🌱',4500,120),
 (10,'Octubre','Seguridad Digital y Dinero','🛡️',4800,130),
 (11,'Noviembre','Fondo de Emergencia','🛟',5000,140),
 (12,'Diciembre','Gran Feria Financiera FINOVA','🏆',6000,180)
on conflict (month_number) do nothing;

insert into public.courses (id, grade, section, name, code, period) values
 ('00000000-0000-0000-0000-0000000004a1','4°','A','4° A','FIN4A',1),
 ('00000000-0000-0000-0000-0000000004b1','4°','B','4° B','FIN4B',1),
 ('00000000-0000-0000-0000-0000000005a1','5°','A','5° A','FIN5A',1)
on conflict (code) do nothing;

insert into public.months (course_id, month_number, unlocked)
select c.id, m.month_number,
  m.month_number <= case c.code when 'FIN4A' then 3 when 'FIN4B' then 2 else 4 end
from public.courses c cross join public.month_catalog m
where c.code in ('FIN4A','FIN4B','FIN5A')
on conflict do nothing;

insert into public.questions (course_id, month_number, question, options, correct_index, explanation) values
 (null,1,'Valeria recibe $10.000 de mesada esta semana y quiere comprar una bicicleta en 3 meses. ¿Cuál es la decisión más inteligente?',
  array['Guardar primero $4.000 en su alcancía y planear el resto','Gastar todo en dulces hoy y esperar tener suerte después','Prestar todo su dinero sin anotar a quién se lo dio'],0,
  '¡Exacto! "Pagarte a ti misma primero" guardando una parte apenas recibes dinero asegura que alcances tu meta.'),
 (null,1,'¿Qué es un "Gasto Hormiga"?',
  array['Comprar un cuaderno para estudiar matemáticas','Pequeños gastos diarios en antojos que parecen poco pero suman mucho','Guardar monedas de $500 en un frasco transparente'],1,
  '¡Muy bien! Un dulce o bebida todos los días puede parecer barato, pero al final del mes suma miles de pesos.'),
 (null,1,'Si tienes una meta de ahorro de $20.000 y ya tienes $15.000, ¿qué porcentaje te falta?',
  array['Me falta $5.000 (el 25% de la meta)','Ya me pasé de la meta por $5.000','Me falta la mitad exacta ($10.000)'],0,
  '¡Excelente cálculo! $20.000 - $15.000 = $5.000, que equivale a un cuarto (25%) del total.'),
 (null,2,'Entre unas zapatillas para educación física porque las actuales se rompieron y un juguete de moda, ¿cuál es una NECESIDAD?',
  array['El juguete de moda porque todos lo tienen','Las zapatillas para educación física','Ninguno de los dos es importante'],1,
  '¡Correcto! Las necesidades son indispensables para tu bienestar, salud y estudio.'),
 (null,2,'Antes de comprar algo que viste en un anuncio llamativo, ¿qué regla recomienda el Club FINOVA?',
  array['Esperar 24 horas y preguntar: ¿De verdad lo necesito?','Comprarlo inmediatamente antes de pensarlo','Romper la alcancía completa sin mirar el precio'],0,
  '¡Genial! La regla de las 24 horas evita compras impulsivas y protege tus metas.'),
 (null,3,'En la regla del presupuesto 50 / 30 / 20, ¿a qué corresponde el 20%?',
  array['Ahorro y metas futuras','Solo videojuegos y golosinas','Pérdidas y descuidos'],0,
  '¡Súper! 50% necesidades, 30% gustos sanos y 20% ahorro constante.');

insert into public.prizes (course_id, period, name, cost, slots)
select c.id, 1, p.name, p.cost, 10
from public.courses c cross join (values
  ('Gaseosa con 50% de descuento',26000),('Lápiz gratis',22000),
  ('Caja de colores gratis',34000),('Borrador y sacapuntas',20000)) p(name, cost)
where c.code in ('FIN4A','FIN4B','FIN5A');
