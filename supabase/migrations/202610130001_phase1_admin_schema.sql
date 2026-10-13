create extension if not exists pgcrypto;

create type public.rights_status as enum ('unverified', 'approved', 'rejected');
create type public.source_type as enum ('internet_archive', 'bunny_stream');
create type public.publication_status as enum ('draft', 'published');

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  added_by uuid references auth.users(id) on delete set null
);

create table public.movies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text not null,
  synopsis text not null,
  year integer not null,
  duration_minutes integer not null,
  age_rating text not null,
  genres text[] not null,
  poster_path text,
  backdrop_path text,
  rights_status public.rights_status not null default 'unverified',
  rights_basis text not null default '',
  rights_notes text not null default '',
  rights_document_path text,
  source_type public.source_type,
  internet_archive_identifier text,
  bunny_library_id text,
  bunny_video_id uuid,
  publication_status public.publication_status not null default 'draft',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint movies_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint movies_title_length check (char_length(title) between 1 and 180),
  constraint movies_tagline_length check (char_length(tagline) between 1 and 240),
  constraint movies_synopsis_length check (char_length(synopsis) between 1 and 5000),
  constraint movies_year_range check (year between 1888 and 2200),
  constraint movies_duration_range check (duration_minutes between 1 and 1440),
  constraint movies_genres_present check (cardinality(genres) > 0),
  constraint movies_approved_rights_basis check (rights_status <> 'approved' or char_length(trim(rights_basis)) > 0),
  constraint movies_poster_path_format check (poster_path is null or poster_path ~ '^posters/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|avif)$'),
  constraint movies_backdrop_path_format check (backdrop_path is null or backdrop_path ~ '^backdrops/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|avif)$'),
  constraint movies_rights_document_path_format check (rights_document_path is null or rights_document_path ~ '^documents/[0-9a-f-]{36}/[0-9a-f-]{36}\.(pdf|jpg|png)$'),
  constraint movies_publication_rights check (publication_status = 'draft' or rights_status = 'approved'),
  constraint movies_published_at_consistent check (
    (publication_status = 'draft' and published_at is null)
    or (publication_status = 'published' and published_at is not null)
  ),
  constraint movies_source_combination check (
    (source_type is null and internet_archive_identifier is null and bunny_library_id is null and bunny_video_id is null)
    or (
      source_type = 'internet_archive'
      and internet_archive_identifier ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$'
      and bunny_library_id is null
      and bunny_video_id is null
    )
    or (
      source_type = 'bunny_stream'
      and internet_archive_identifier is null
      and bunny_library_id ~ '^[1-9][0-9]{0,17}$'
      and bunny_video_id is not null
    )
  )
);

create table public.admin_audit_log (
  id bigint generated always as identity primary key,
  admin_user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('insert', 'update', 'delete')),
  movie_id uuid,
  old_record jsonb,
  new_record jsonb,
  created_at timestamptz not null default now()
);

create index movies_public_catalogue_idx on public.movies (publication_status, rights_status, featured, published_at desc);
create index admin_audit_log_admin_user_idx on public.admin_audit_log (admin_user_id, created_at desc);
create index admin_audit_log_movie_idx on public.admin_audit_log (movie_id, created_at desc);

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select check_user_id is not null and exists (
    select 1 from public.admin_users where user_id = check_user_id
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger movies_set_updated_at before update on public.movies
for each row execute function public.set_updated_at();

create or replace function public.audit_movie_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.admin_audit_log (admin_user_id, action, movie_id, old_record, new_record)
  values (
    auth.uid(),
    lower(tg_op),
    coalesce(new.id, old.id),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger movies_audit after insert or update or delete on public.movies
for each row execute function public.audit_movie_change();

alter table public.admin_users enable row level security;
alter table public.movies enable row level security;
alter table public.admin_audit_log enable row level security;

revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.movies from anon, authenticated;
revoke all on table public.admin_audit_log from anon, authenticated;

grant select on table public.movies to anon, authenticated;
grant insert, update, delete on table public.movies to authenticated;
grant select on table public.admin_users to authenticated;
grant select on table public.admin_audit_log to authenticated;
grant usage, select on sequence public.admin_audit_log_id_seq to authenticated;

create policy "public reads approved published movies"
on public.movies for select to anon, authenticated
using (rights_status = 'approved' and publication_status = 'published');

create policy "admins read all movies"
on public.movies for select to authenticated
using ((select public.is_admin()));

create policy "admins insert movies"
on public.movies for insert to authenticated
with check ((select public.is_admin()));

create policy "admins update movies"
on public.movies for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "admins delete movies"
on public.movies for delete to authenticated
using ((select public.is_admin()));

create policy "admins read membership"
on public.admin_users for select to authenticated
using ((select public.is_admin()));

create policy "admins read audit log"
on public.admin_audit_log for select to authenticated
using ((select public.is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('catalogue-media', 'catalogue-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('rights-documents', 'rights-documents', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "admins list catalogue media"
on storage.objects for select to authenticated
using (bucket_id = 'catalogue-media' and (select public.is_admin()));

create policy "admins upload catalogue media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'catalogue-media'
  and (storage.foldername(name))[1] in ('posters', 'backdrops')
  and (select public.is_admin())
);

create policy "admins update catalogue media"
on storage.objects for update to authenticated
using (bucket_id = 'catalogue-media' and (select public.is_admin()))
with check (bucket_id = 'catalogue-media' and (select public.is_admin()));

create policy "admins delete catalogue media"
on storage.objects for delete to authenticated
using (bucket_id = 'catalogue-media' and (select public.is_admin()));

create policy "admins read private rights documents"
on storage.objects for select to authenticated
using (bucket_id = 'rights-documents' and (select public.is_admin()));

create policy "admins upload private rights documents"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'rights-documents'
  and (storage.foldername(name))[1] = 'documents'
  and (select public.is_admin())
);

create policy "admins update private rights documents"
on storage.objects for update to authenticated
using (bucket_id = 'rights-documents' and (select public.is_admin()))
with check (bucket_id = 'rights-documents' and (select public.is_admin()));

create policy "admins delete private rights documents"
on storage.objects for delete to authenticated
using (bucket_id = 'rights-documents' and (select public.is_admin()));
