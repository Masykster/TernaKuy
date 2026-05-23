# Findings & Decisions — PiboFarm
<!--
  WHAT: Knowledge base untuk session development PiboFarm. Semua yang ditemukan dan diputuskan ada di sini.
  WHY: Context window terbatas. File ini adalah "external memory" — persistent dan tidak hilang.
  WHEN: Update setelah SETIAP discovery, terutama setelah 2 operasi view/browser/search (2-Action Rule).
  STACK: Laravel 11 · Inertia.js · Supabase (PostgreSQL)
-->

## Requirements
<!--
  Apa yang harus dibangun — berdasarkan seluruh diskusi dan requirements.md.
-->
- Platform web manajemen peternakan ayam broiler untuk peternak rakyat skala 2.000–10.000 ekor
- Auth: register/login dengan Sanctum, field tambahan: province, city, fcm_token
- Farm management: CRUD farm + kandang (coop), satu user bisa punya banyak farm
- Cycle management: mulai siklus baru, auto-generate Golden Timeline 14 tasks, track hari ke-
- Input harian: pakan (kg), mati (ekor), berat sampling (gram), kondisi kandang
- Auto-kalkulasi: FCR running, mortality rate, live_population — via Eloquent Observer
- Health records: catat vaksinasi + pengobatan, auto-set withdrawal_end_date
- Withdrawal system: countdown, block tombol panen saat aktif, safe_harvest_date
- Dashboard: card FCR/Mati/Index, agenda hari ini, banner withdrawal, widget cuaca + harga pakan + grafik FCR
- Golden Timeline: jadwal 35 hari, tab Hari Ini/Minggu Ini/Semua, bisa dicentang, bisa tambah custom
- Weather API: OpenWeatherMap, fetch per farm location, alert >33°C / kelembaban >80%
- Commodity API: harga jagung/kedelai harian, bulk buying alert saat turun >5% vs avg 30 hari
- FCM push notification: reminder harian, alert FCR/mortalitas, withdrawal countdown
- Laporan PDF: generate via DomPDF, semua data siklus, bisa download
- Panen: form harvest, kalkulasi FCR final + IP + survival rate, laporan akhir
- Mobile-first UI: lebar ~390px, Bahasa Indonesia penuh, angka metrik besar

## Research Findings
<!--
  Key discoveries dari riset, jurnal, dan analisis kompetitor.
-->
- Biaya pakan = 60–70% total biaya operasional peternakan broiler (Jurnal JUMIA 2025)
- Mortality rate pemula 10–15% vs standar industri <5% (Jurnal Peternakan Borneo 2024)
- Residu antibiotik masih ditemukan di daging ayam karena withdrawal period tidak dipantau (Jurnal Kajian Veteriner Undana 2024)
- Peternak unbankable karena tidak punya rekam jejak digital — laporan PDF PiboFarm solusinya (OJK-ILO 2025)
- Chickin (kompetitor lokal) butuh hardware IoT — PiboFarm pure software, lebih accessible
- Farmbrite (global) punya withdrawal tracking tapi tidak ada integrasi harga pakan lokal Indonesia
- FCR target dengan sistem pendampingan: 1.4–1.5 vs rata-rata manual 1.7–1.9

## Technical Decisions
<!--
  Keputusan arsitektur dan implementasi dengan alasan.
-->
| Decision | Rationale |
|----------|-----------|
| Supabase (PostgreSQL) bukan MySQL lokal | Managed DB, free tier cukup MVP, tidak perlu setup server DB sendiri |
| Inertia.js (bukan SPA/API terpisah) | Tetap pakai Laravel routing, DX lebih sederhana, tidak perlu maintain 2 repo |
| Eloquent Observer untuk kalkulasi FCR | Auto-trigger saat record saved, tidak bisa di-bypass, logic tersentralisasi |
| DomPDF (bukan Puppeteer) | Lebih ringan, tidak butuh Chrome di server, cukup untuk laporan teks+tabel |
| kreait/laravel-firebase untuk FCM | Package resmi Firebase untuk Laravel, dokumentasi lengkap |
| Queue driver: database (bukan Redis) | Mengurangi dependency, Supabase bisa handle volume MVP, ganti Redis saat scale-up |
| Soft delete (SoftDeletes trait) | Data peternak tidak pernah hilang permanen — critical untuk audit laporan KUR |
| Cache weather/commodity di tabel DB | Tidak perlu Redis, query DB lebih dari cukup untuk update 3 jam sekali |
| Policy-based authorization | FarmPolicy, CyclePolicy — pastikan user hanya akses data miliknya sendiri |
| Spatie/laravel-permission | Role management: farmer, supervisor — persiapan Phase 2 multi-role |

## Database Schema — Key Tables
<!--
  Referensi cepat schema Supabase. Full schema ada di requirements.md section 6.
-->

### users
```
id, name, phone (unique), email (unique), password_hash, role,
province, city, avatar_url, fcm_token, is_active,
failed_login, locked_until, created_at, updated_at
```

### farms
```
id, user_id (FK), name, address, latitude, longitude,
species (default: broiler), is_active, created_at
```

### coops (kandang)
```
id, farm_id (FK), coop_code (unique per farm), coop_type (open_house|close_house),
capacity, area_m2, is_active, created_at
UNIQUE: (farm_id, coop_code)
```

### cycles (siklus)
```
id, coop_id (FK), doc_date, doc_count, strain (Ross|Cobb|Lohmann|Other),
supplier_doc, price_doc, target_days (default 35),
status (active|harvested|closed_forced), notes, created_at, closed_at
```

### daily_records
```
id, cycle_id (FK), record_date (DATE), day_number,
feed_kg, mortality, avg_weight_g (nullable),
live_population, cum_feed_kg, cum_mortality,
fcr_current (nullable), mortality_rate,
condition (good|warning|critical), notes, created_at, updated_at
UNIQUE: (cycle_id, record_date)
INDEX: (cycle_id, record_date)
```

### health_records
```
id, cycle_id (FK), record_date, record_type (vaccination|treatment|observation),
drug_name, dosage, method, withdrawal_days (default 0),
withdrawal_end (DATE, auto-calc), notes, created_at
```

### harvest_records
```
id, cycle_id (FK, unique), harvest_date, harvest_count, total_weight_kg,
avg_weight_kg (auto-calc), price_per_kg, total_revenue (auto-calc),
fcr_final (auto-calc), ip_score (auto-calc),
mortality_rate (auto-calc), notes, created_at
```

### timeline_tasks
```
id, cycle_id (FK), task_date, day_number, task_name,
category (vaccination|sampling|feeding|management|custom),
is_system (bool), is_done (bool), done_at, notify (bool), created_at
```

### drugs_reference (seed data)
```
id, drug_name, category (antibiotic|vaccine|vitamin|other),
withdrawal_days, description, is_active
```

### commodity_prices
```
id, commodity (CORN|SOYBEAN|RICEBRAN), price_usd, price_idr,
change_pct_30d, recorded_date, source
UNIQUE: (commodity, recorded_date)
```

### weather_cache
```
id, farm_id (FK), temperature_c, humidity_pct, weather_desc,
wind_speed, alert_level (normal|warning|critical),
alert_message, fetched_at
```

### notifications
```
id, user_id (FK), category (fcr_alert|mortality_alert|weather|commodity|withdrawal|timeline|system),
title, body, action_url, is_read (bool), sent_at
INDEX: (user_id, is_read, sent_at)
```

## Formula Kalkulasi
<!--
  Referensi formula CalculationService.php — jangan ubah tanpa update tests.
-->

### FCR Running (daily)
```php
$estimatedBiomass = ($livePop * $avgWeightG) / 1000;  // kg
$fcrCurrent = $cumFeedKg / $estimatedBiomass;
// Hanya dihitung jika avg_weight_g diisi
```

### FCR Final (panen)
```php
$fcrFinal = $cumFeedKg / $totalHarvestWeightKg;
```

### Index Performance
```php
$ipScore = (($survivalRate / 100) * $avgWeightKg) / ($fcrFinal * $harvestAgeDays) * 100;
```

### Mortality Rate
```php
$mortalityRate = ($cumMortality / $initialDoc) * 100;
```

### Bulk Buying Trigger
```php
$avg30d = CommodityPrice::avg30d($symbol);  // avg last 30 days
$dropPct = (($avg30d - $todayPrice) / $avg30d) * 100;
// Trigger jika $dropPct >= 5
```

## Alert Thresholds
<!--
  Batas nilai untuk trigger warna status dan notifikasi.
-->
| Metrik | Baik ✅ | Waspada ⚠️ | Kritis 🚨 |
|--------|---------|-----------|----------|
| FCR | < 1.6 | 1.6 – 1.9 | > 1.9 |
| Mortality Rate | < 3% | 3 – 7% | > 7% |
| Index Performance | > 350 | 300 – 350 | < 300 |
| Suhu kandang | 18 – 32°C | 33 – 35°C | > 36°C |
| Kelembaban | < 80% | 80 – 85% | > 85% |
| FCR alert notif | — | > 1.8 | > 2.0 |
| Mortality harian notif | — | > 0.5% populasi | > 1% populasi |
| Harga pakan drop | — | > 5% | > 10% (STRONG BUY) |

## Golden Timeline Template (Broiler Standard)
<!--
  14 tasks yang di-insert ke timeline_tasks saat cycle dibuat.
  day_number → task_name → category
-->
```
1  → DOC masuk · Cek kondisi DOC · Set suhu brooder 33°C → management
2  → Pantau konsumsi air · Cek nafsu makan → management
3  → Observasi perilaku · Catat mortalitas awal → management
4  → Vaksinasi Newcastle Disease (ND) — tetes mata → vaccination
7  → Sampling berat pertama · Evaluasi minggu ke-1 → sampling
10 → Vaksinasi Gumboro (IBD) — air minum → vaccination
14 → Evaluasi FCR minggu ke-2 · Kurangi suhu ke 29°C → management
18 → Vaksinasi ND booster → vaccination
21 → Sampling berat · Kalkulasi FCR running → sampling
24 → Evaluasi kondisi kandang · Densitas populasi → management
28 → Sampling berat · Evaluasi target panen → sampling
29 → Ganti pakan ke finisher → feeding
32 → Sampling berat · Estimasi berat panen → sampling
35 → Target panen · Cek withdrawal period semua obat → management
```

## API Endpoints — Referensi Cepat
<!--
  Semua route ada di routes/api.php dan routes/web.php.
  Full list ada di requirements.md section 7.
-->

### Auth (api.php)
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

### Web (web.php via Inertia)
```
GET  /dashboard
GET  /farm/setup
GET  /farm/{id}/coops
GET  /cycle/new
GET  /cycle/{id}
GET  /cycle/{id}/daily
GET  /cycle/{id}/health
GET  /cycle/{id}/timeline
GET  /cycle/{id}/withdrawal
GET  /cycle/{id}/report
GET  /cycle/{id}/harvest
GET  /commodity
GET  /notifications
GET  /settings
```

## Issues Encountered
| Issue | Resolution |
|-------|------------|
|       |            |

## Resources
- Requirements lengkap: requirements.md (di repo)
- Prototype screenshot: 5 halaman (Home, Timeline, Kesehatan, Notif, Pengaturan) sudah jadi referensi
- OpenWeatherMap docs: https://openweathermap.org/api/one-call-3
- Commodities API docs: https://commodities-api.com/documentation
- kreait/laravel-firebase: https://github.com/kreait/laravel-firebase
- barryvdh/laravel-dompdf: https://github.com/barryvdh/laravel-dompdf
- Inertia.js Laravel: https://inertiajs.com/server-side-setup
- Supabase Laravel: https://supabase.com/docs/guides/integrations/laravel

## Visual/Browser Findings
<!--
  Hasil analisis screenshot prototype yang sudah ada:
-->
- Home/Dashboard: sudah ada card FCR/Mati/Index, agenda hari ini (checkbox), banner withdrawal merah, FAB +, bottom nav 5 tab
- Golden Timeline: tab Hari Ini/Minggu Ini/Semua, item dengan hari + kategori ikon + centang, FAB +
- Kesehatan Kandang: banner merah besar "Ada Withdrawal Aktif", tombol +Obat +Vaksin, riwayat list card
- Notifikasi: tab filter 3 (Semua/Belum Dibaca/Peringatan), 4 tipe notif dengan warna beda (merah/biru/oranye/hijau)
- Pengaturan: profil user, list Farm & Kandang, toggle notifikasi per kategori
- Yang BELUM ada: widget cuaca, widget harga pakan, grafik FCR, halaman login/register, onboarding, input harian, mulai siklus, laporan & panen
- Warna dominan: hijau gelap #2D6A4F header, card putih, badge warna per status

---
*Update file ini setelah setiap 2 operasi view/browser/search*
*Informasi visual harus langsung dicatat sebagai teks*
