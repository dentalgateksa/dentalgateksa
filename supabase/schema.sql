-- DENTALGATE — Supabase schema.
-- Run once in: Supabase dashboard → SQL Editor → New query → paste → Run.

-- ---------- Tables ----------
create table if not exists public.staff (
    id          uuid primary key references auth.users (id) on delete cascade,
    name        text not null check (char_length(name) between 1 and 120),
    email       text not null,
    role        text not null default 'CAD/CAM Designer',
    is_admin    boolean not null default false,
    created_at  timestamptz not null default now()
);

create table if not exists public.cases (
    id          uuid primary key default gen_random_uuid(),
    case_no     bigint generated always as identity unique,
    doctor      text not null check (char_length(doctor)  between 1 and 120),
    clinic      text not null check (char_length(clinic)  between 1 and 120),
    patient     text not null check (char_length(patient) between 1 and 120),
    shade       text not null check (char_length(shade)   between 1 and 40),
    notes       text not null default '' check (char_length(notes) <= 2000),
    files       jsonb not null default '[]'::jsonb check (jsonb_typeof(files) = 'array'),
    status      text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
    created_at  timestamptz not null default now()
);

-- ---------- Helpers ----------
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
    select exists (select 1 from public.staff where id = auth.uid());
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
    select exists (select 1 from public.staff where id = auth.uid() and is_admin);
$$;

-- ---------- Row Level Security ----------
alter table public.staff enable row level security;
alter table public.cases enable row level security;

-- Anyone (doctors, no login) may submit a new case, but only as "pending".
drop policy if exists "anyone can submit a case" on public.cases;
create policy "anyone can submit a case" on public.cases
    for insert to anon, authenticated
    with check (status = 'pending');

drop policy if exists "staff can read cases" on public.cases;
create policy "staff can read cases" on public.cases
    for select to authenticated using (public.is_staff());

drop policy if exists "staff can update cases" on public.cases;
create policy "staff can update cases" on public.cases
    for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "admins can delete cases" on public.cases;
create policy "admins can delete cases" on public.cases
    for delete to authenticated using (public.is_admin());

-- Staff list is readable by staff. Creating/deleting staff goes through the
-- manage-staff Edge Function (service role), so no write policies here.
drop policy if exists "staff can read staff" on public.staff;
create policy "staff can read staff" on public.staff
    for select to authenticated using (public.is_staff());

-- Visitors can only insert cases: no read/update/delete for anon.
revoke update, delete on public.cases from anon;

-- ---------- Storage (private bucket for scan files, 50 MB per file) ----------
insert into storage.buckets (id, name, public, file_size_limit)
values ('case-files', 'case-files', false, 52428800)
on conflict (id) do nothing;

drop policy if exists "anyone can upload case files" on storage.objects;
create policy "anyone can upload case files" on storage.objects
    for insert to anon, authenticated
    with check (bucket_id = 'case-files');

drop policy if exists "staff can read case files" on storage.objects;
create policy "staff can read case files" on storage.objects
    for select to authenticated
    using (bucket_id = 'case-files' and public.is_staff());

drop policy if exists "admins can delete case files" on storage.objects;
create policy "admins can delete case files" on storage.objects
    for delete to authenticated
    using (bucket_id = 'case-files' and public.is_admin());

-- ---------- First admin ----------
-- 1) Supabase dashboard → Authentication → Users → Add user (email + password, auto-confirm).
-- 2) Then run (replace the email):
--
-- insert into public.staff (id, name, email, role, is_admin)
-- select id, 'Admin', email, 'Admin', true from auth.users where email = 'you@example.com';
