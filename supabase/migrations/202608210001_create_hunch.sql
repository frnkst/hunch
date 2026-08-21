create extension if not exists "pgcrypto";

create type public.membership_status as enum ('pending', 'approved');
create type public.question_type as enum (
  'boolean',
  'multiple_choice',
  'number',
  'date',
  'datetime'
);
create type public.prediction_visibility as enum (
  'always',
  'after_submission',
  'after_deadline',
  'after_resolution'
);
create type public.question_status as enum ('open', 'resolved', 'cancelled');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  github_user_id text not null unique,
  username text not null,
  avatar_url text,
  status public.membership_status not null default 'pending',
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(user_id) on delete cascade,
  text text not null check (char_length(text) between 3 and 300),
  type public.question_type not null,
  options jsonb,
  deadline timestamptz not null,
  visibility public.prediction_visibility not null default 'after_deadline',
  status public.question_status not null default 'open',
  correct_answer jsonb,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint question_options_check check (
    (type = 'multiple_choice' and jsonb_typeof(options) = 'array' and jsonb_array_length(options) between 2 and 10)
    or (type <> 'multiple_choice' and options is null)
  ),
  constraint question_resolution_check check (
    (status = 'resolved' and correct_answer is not null and resolved_at is not null)
    or (status <> 'resolved' and correct_answer is null and resolved_at is null)
  )
);

create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  answer jsonb not null,
  points numeric(5, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (question_id, user_id)
);

create index questions_status_deadline_idx
  on public.questions (status, deadline desc);
create index predictions_question_idx on public.predictions (question_id);
create index predictions_user_points_idx on public.predictions (user_id, points);

create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger questions_set_updated_at before update on public.questions
for each row execute function public.set_updated_at();
create trigger predictions_set_updated_at before update on public.predictions
for each row execute function public.set_updated_at();

create function public.is_approved()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where user_id = (select auth.uid()) and status = 'approved'
  );
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where user_id = (select auth.uid())
      and status = 'approved'
      and is_admin
  );
$$;

create function public.can_view_prediction(
  target_question_id uuid,
  prediction_owner_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    prediction_owner_id = (select auth.uid())
    or public.is_admin()
    or (
      public.is_approved()
      and exists (
        select 1
        from public.questions q
        where q.id = target_question_id
          and (
            q.visibility = 'always'
            or (q.visibility = 'after_deadline' and now() >= q.deadline)
            or (q.visibility = 'after_resolution' and q.status = 'resolved')
            or (
              q.visibility = 'after_submission'
              and exists (
                select 1 from public.predictions mine
                where mine.question_id = q.id
                  and mine.user_id = (select auth.uid())
              )
            )
          )
      )
    );
$$;

alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.predictions enable row level security;

grant select on public.profiles to authenticated;
grant select on public.questions to authenticated;
grant select on public.predictions to authenticated;

create policy "Members can view profiles"
on public.profiles for select to authenticated
using (user_id = (select auth.uid()) or public.is_approved());

create policy "Approved members can view questions"
on public.questions for select to authenticated
using (public.is_approved());

create policy "Members can view permitted predictions"
on public.predictions for select to authenticated
using (public.can_view_prediction(question_id, user_id));

revoke insert, update, delete on public.profiles from authenticated;
revoke insert, update, delete on public.questions from authenticated;
revoke insert, update, delete on public.predictions from authenticated;
