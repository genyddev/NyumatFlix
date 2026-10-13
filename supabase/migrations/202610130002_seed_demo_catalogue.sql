insert into public.movies (
  slug, title, tagline, synopsis, year, duration_minutes, age_rating, genres,
  rights_status, rights_basis, rights_notes, source_type,
  internet_archive_identifier, bunny_library_id, bunny_video_id,
  publication_status, featured, published_at
)
values
  ('kryqezimi-i-henes', 'Kryqëzimi i Hënës', 'Çdo rrugë lë një dritë pas.', 'Një hartografe kthehet në qytetin e saj malor dhe zbulon një hartë nate që duket se ndryshon sa herë merret një vendim i ri.', 2026, 104, '12+', array['Dramë', 'Mister'], 'unverified', '', 'Titull dhe histori imagjinare për demonstrim.', null, null, null, null, 'draft', true, null),
  ('harta-e-heshtur', 'Harta e Heshtur', 'Disa vende gjenden vetëm kur humbet.', 'Dy motra ndjekin shënimet e papërfunduara të gjyshit dhe udhëtojnë drejt një lugine që mungon në çdo hartë zyrtare.', 2025, 96, '10+', array['Aventurë', 'Dramë'], 'unverified', '', 'Titull dhe histori imagjinare për demonstrim.', null, null, null, null, 'draft', false, null),
  ('sinjali-i-mengjesit', 'Sinjali i Mëngjesit', 'Një zë i largët. Një qytet zgjuar.', 'Një teknike radioje kap një transmetim që parashikon ngjarjet e qytetit vetëm shtatë minuta para se të ndodhin.', 2026, 111, '12+', array['Fantashkencë', 'Mister'], 'unverified', '', 'Titull dhe histori imagjinare për demonstrim.', null, null, null, null, 'draft', false, null),
  ('arkivi-i-eres', 'Arkivi i Erës', 'Kujtimet nuk rrinë gjithmonë në letër.', 'Një restauruese librash regjistron historitë e një ishulli para stuhisë së fundit dhe gjen një rrëfim që i përket familjes së saj.', 2024, 89, 'Të gjithë', array['Dramë', 'Familjar'], 'unverified', '', 'Titull dhe histori imagjinare për demonstrim.', null, null, null, null, 'draft', false, null),
  ('dritat-e-qytetit-te-humbur', 'Dritat e Qytetit të Humbur', 'Nata mban mend atë që dita harron.', 'Një fotografe nate vëren se një lagje e tërë shfaqet vetëm në negativët e saj dhe vendos ta gjejë para agimit.', 2025, 118, '14+', array['Thriller', 'Dramë'], 'unverified', '', 'Titull dhe histori imagjinare për demonstrim.', null, null, null, null, 'draft', false, null),
  ('vija-e-kalter', 'Vija e Kaltër', 'Deti ndan brigjet, jo premtimet.', 'Dy arkitektë në brigje të kundërta ndërtojnë ura të vogla për komunitetet e tyre dhe zbulojnë se planet e tyre takohen në mes.', 2023, 101, '10+', array['Romancë', 'Dramë'], 'unverified', '', 'Titull dhe histori imagjinare për demonstrim.', null, null, null, null, 'draft', false, null),
  ('bunny-stream-test', 'Bunny Stream — Test teknik', 'Provë private e riprodhuesit të sigurt.', 'Regjistrim i palistuar që përdoret vetëm për të verifikuar integrimin teknik me Bunny Stream.', 2026, 1, 'Test', array['Test teknik'], 'approved', 'Material teknik i kontrolluar nga Udhekryqi Media.', 'Mos e publiko; përdoret vetëm për testim teknik.', 'bunny_stream', null, '776547', '05458d36-de04-4453-8536-75f063f37ab1', 'draft', false, null)
on conflict (slug) do nothing;
