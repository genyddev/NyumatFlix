# Konfigurimi një herë i Supabase për KokoMax

Kjo fazë nuk është vendosur në internet. Hapat e mëposhtëm duhen kryer një herë para se administrimi të përdoret me një projekt real Supabase.

## 1. Krijo projektin

1. Hape [Supabase Dashboard](https://supabase.com/dashboard) dhe krijo një projekt të ri.
2. Ruaje fjalëkalimin e databazës në menaxherin tënd të fjalëkalimeve. Mos e vendos në këtë repository.
3. Te **Authentication → Providers → Email**, mbaj aktiv hyrjen me email dhe fjalëkalim. Aplikacioni nuk përmban faqe regjistrimi publik.

## 2. Apliko migrimet

Mënyra e rekomanduar është Supabase CLI nga rrënja e repository-t:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Alternativisht, kopjo dhe ekzekuto në **SQL Editor** vetëm këtë migrim prodhimi:

1. `supabase/migrations/202610130001_phase1_admin_schema.sql`

Ky migrim krijon vetëm tabelat, kufizimet, funksionet, auditimin, RLS, politikat dhe dy bucket-at. Nuk shton filma, tituj imagjinarë ose regjistrimin teknik Bunny. Migrimi i mëparshëm `202610130002_seed_demo_catalogue.sql` është hequr dhe nuk duhet aplikuar në një databazë reale. Të dhënat demonstruese dhe ID-të e testit Bunny ruhen vetëm si fixtures të automatizuara nën `apps/web/test/fixtures/`.

## 3. Krijo administratorin e parë

1. Te **Authentication → Users**, zgjidh **Add user → Create new user**.
2. Shkruaj emailin dhe një fjalëkalim të fortë; shënoje përdoruesin si të konfirmuar.
3. Kopjo UUID-në e përdoruesit.
4. Në **SQL Editor**, ekzekuto komandën më poshtë duke zëvendësuar UUID-në:

```sql
insert into public.admin_users (user_id)
values ('PASTE-AUTH-USER-UUID-HERE');
```

Vetëm përdoruesit në `admin_users` mund të hapin administrimin ose të ndryshojnë katalogun. Fjalëkalimi ruhet vetëm nga Supabase Auth dhe nuk futet kurrë në tabelat e aplikacionit.

## 4. Konfiguro variablat lokale

1. Te **Project → Connect**, kopjo **Project URL** dhe **Publishable key**.
2. Krijo `apps/web/.env.local` dhe shto:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Mos përdor dhe mos shto `service_role`, database password, Bunny API key ose upload credential. Publishable key është projektuar për klientin publik dhe kufizohet nga RLS.

## 5. Verifiko Storage

Te **Storage** duhet të shfaqen:

- `catalogue-media`: publik vetëm për leximin e posterëve dhe sfondeve; shkrimi lejohet vetëm për administratorë. Kufiri është 5 MB dhe vetëm JPG, PNG, WebP ose AVIF.
- `rights-documents`: privat; leximi dhe shkrimi lejohen vetëm për administratorë. Kufiri është 10 MB dhe vetëm PDF, JPG ose PNG.

Mos e ndrysho `rights-documents` në bucket publik. Dokumentet private nuk përdoren nga asnjë faqe publike.

## 6. Nise dhe kontrollo

```bash
pnpm install
pnpm dev
```

Hape `http://localhost:3000/admin`, hyr me përdoruesin e krijuar dhe kontrollo:

1. tabela `movies` është bosh pas migrimit;
2. publikimi refuzohet derisa `rights_status` të jetë `approved`;
3. një përdorues Auth që nuk është në `admin_users` nuk hyn dot;
4. pa Supabase ose gjatë një gabimi rrjeti, faqet publike tregojnë katalog bosh dhe nuk zbulojnë draft-e.

## Referencat zyrtare

- [Supabase SSR për Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Bucket-at publikë dhe privatë](https://supabase.com/docs/guides/storage/buckets/fundamentals)
