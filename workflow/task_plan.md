# Task Plan: PiboFarm — Platform Manajemen Peternakan Ayam Broiler
<!--
  WHAT: Roadmap pengembangan PiboFarm dari awal sampai MVP siap production.
  WHY: Setelah 50+ tool calls, goal awal mudah terlupakan. File ini jadi "working memory on disk."
  WHEN: Buat PERTAMA sebelum mulai coding. Update setiap fase selesai.
  STACK: Laravel 11 (backend API) · Inertia.js + Vue/React (frontend) · Supabase (PostgreSQL + Auth)
-->

## Goal
Bangun MVP PiboFarm — aplikasi web manajemen peternakan ayam broiler yang memungkinkan peternak rakyat mencatat data harian, memantau FCR otomatis, mendapat peringatan withdrawal antibiotik, dan mengakses harga pakan real-time — dengan target 50 peternak aktif dalam 60 hari setelah launch.

## Current Phase
Phase 1

## Phases

### Phase 1: Setup Project & Auth
<!--
  WHAT: Inisialisasi project Laravel + Inertia.js, koneksi ke Supabase, setup auth.
  WHY: Fondasi yang salah akan menyebabkan masalah di semua layer di atasnya.
  SUCCESS: `php artisan serve` jalan, login/register Inertia berfungsi, koneksi Supabase verified.
-->
- [ ] `laravel new pibofarm` + install Inertia.js adapter
- [ ] Konfigurasi Supabase sebagai database (driver pgsql, env dari Supabase dashboard)
- [ ] Install & konfigurasi Laravel Sanctum untuk API auth
- [ ] Buat migration: users (dengan field province, city, fcm_token)
- [ ] Buat halaman Login dan Register via Inertia (konsisten dengan desain prototype)
- [ ] Verifikasi: register → login → redirect ke Dashboard berfungsi
- **Status:** in_progress

### Phase 2: Farm, Kandang & Siklus
<!--
  WHAT: CRUD untuk Farm, Coop (kandang), dan Cycle (siklus produksi).
  WHY: Ini adalah struktur data inti — semua fitur lain bergantung pada tiga entitas ini.
  SUCCESS: Peternak bisa setup farm, tambah kandang, dan mulai siklus baru. Timeline auto-generate setelah siklus dibuat.
-->
- [ ] Migration: farms, coops, cycles (lihat schema di findings.md)
- [ ] Model + Policy: Farm (user ownership), Coop (farm scoped), Cycle (coop scoped)
- [ ] Controller + Inertia pages: FarmController, CoopController, CycleController
- [ ] Halaman Onboarding (2-step wizard: setup farm → setup kandang pertama)
- [ ] Halaman Mulai Siklus Baru (form DOC, strain, target hari, preview estimasi panen)
- [ ] Service: TimelineService — auto-generate 14 Golden Timeline tasks saat cycle dibuat
- [ ] Verifikasi: mulai siklus → timeline ter-generate → redirect ke dashboard dengan siklus aktif
- **Status:** pending

### Phase 3: Input Harian & Kalkulasi FCR
<!--
  WHAT: Form input harian + kalkulasi FCR/mortalitas otomatis via Observer.
  WHY: Ini adalah halaman yang paling sering dibuka — harus cepat, mobile-friendly, dan auto-kalkulasi.
  SUCCESS: Input pakan + mati → FCR ter-update otomatis → alert muncul kalau FCR > 1.8 atau mati > 1%.
-->
- [ ] Migration: daily_records (cum_feed_kg, cum_mortality, fcr_current, live_population, dll)
- [ ] DailyRecordObserver: auto-kalkulasi FCR, mortality_rate, live_population setiap record saved
- [ ] CalculationService: formula FCR running, MR, IP (lihat Appendix C di requirements.md)
- [ ] Halaman Input Harian (Inertia form, angka besar mobile-friendly, preview kalkulasi real-time)
- [ ] Livewire atau Inertia partial reload untuk preview FCR saat mengetik (tanpa full page reload)
- [ ] Alert popup setelah simpan: FCR > 1.8 atau mortality > 1% populasi
- [ ] Verifikasi: input data → kalkulasi benar → duplikat hari yang sama ditolak
- **Status:** pending

### Phase 4: Withdrawal Warning & Kesehatan
<!--
  WHAT: Sistem tracking obat + countdown withdrawal + block harvest saat withdrawal aktif.
  WHY: Fitur paling kritis dari sisi keamanan pangan. Harus akurat 100%.
  SUCCESS: Input amoksisilin 10 hari → withdrawal_end_date = today+10 → tombol panen disabled sampai hari ke-10.
-->
- [ ] Migration: health_records (record_type, drug_name, withdrawal_days, withdrawal_end)
- [ ] HealthRecordObserver: auto-set withdrawal_end = record_date + withdrawal_days
- [ ] WithdrawalService: getWithdrawalStatus() → safe_harvest_date, active_withdrawals, days_left
- [ ] Migration: drugs_reference (seed 12 obat bawaan — lihat task_plan notes)
- [ ] Halaman Kesehatan Kandang (Inertia, list riwayat + withdrawal progress bar)
- [ ] Middleware EnsureWithdrawalSafe: block harvest request jika withdrawal aktif
- [ ] Halaman Withdrawal Warning detail (countdown, progress bar per obat)
- [ ] Verifikasi: panen saat withdrawal aktif → ditolak dengan pesan jelas
- **Status:** pending

### Phase 5: Dashboard & Golden Timeline
<!--
  WHAT: Dashboard utama dengan semua widget + halaman Golden Timeline interaktif.
  WHY: Ini adalah "command center" peternak — harus menampilkan semua info kritis dalam satu scroll.
  SUCCESS: Dashboard load < 3 detik, semua card punya warna status, Timeline bisa dicentang.
-->
- [ ] DashboardController: query siklus aktif, metrik hari ini, agenda, withdrawal status
- [ ] Halaman Dashboard Inertia: card FCR/Mati/Index, agenda hari ini, banner withdrawal
- [ ] Widget Cuaca (fetch dari WeatherService, cache 3 jam di Supabase)
- [ ] Widget Harga Pakan (fetch dari CommodityService, update harian)
- [ ] Widget Grafik FCR 7 hari (Chart.js via Alpine.js, data dari daily_records)
- [ ] Halaman Golden Timeline: tab Hari Ini/Minggu Ini/Semua, item bisa di-centang via Inertia
- [ ] Verifikasi: dashboard tampil benar untuk siklus aktif dan state kosong (belum ada siklus)
- **Status:** pending

### Phase 6: External API (Cuaca & Komoditas)
<!--
  WHAT: Integrasi OpenWeatherMap + Commodities API + alert logic.
  WHY: Ini differentiator utama PiboFarm vs kompetitor. Tanpa ini hanya app pencatatan biasa.
  SUCCESS: Cron job jalan, data masuk DB, alert muncul di dashboard saat threshold terlampaui.
-->
- [ ] WeatherService: fetch OpenWeatherMap per farm location, evaluateAlert() logic
- [ ] CommodityService: fetch harga jagung/kedelai, konversi USD→IDR, getBulkBuyRecommendations()
- [ ] Cron jobs via Laravel Scheduler (lihat routes/console.php):
  - `FetchWeatherJob` setiap 3 jam
  - `FetchCommodityJob` daily 08.00 WIB
- [ ] Halaman Harga Pakan dedicated (accordion grafik 30 hari per komoditas)
- [ ] Cache weather & commodity di Supabase table (bukan Redis, sesuai MVP constraint)
- [ ] Verifikasi: data cuaca dan komoditas ter-fetch, alert muncul sesuai threshold
- **Status:** pending

### Phase 7: Notifikasi FCM
<!--
  WHAT: Push notification via Firebase Cloud Messaging untuk reminder dan alert.
  WHY: Peternak harus dapat pengingat walau tidak sedang buka app.
  SUCCESS: Reminder input harian 07.00 terkirim ke device yang sudah register FCM token.
-->
- [ ] Setup kreait/laravel-firebase, konfigurasi .env FIREBASE_CREDENTIALS
- [ ] NotificationService: send(), template placeholders dengan Str::swap()
- [ ] NotificationController + endpoint PUT /notifications/:id/read
- [ ] Scheduled jobs: SendDailyReminderJob, CheckWithdrawalJob, SendVaccinationReminderJob
- [ ] Halaman Notifikasi Inertia (tab filter, list item dengan deep link)
- [ ] Verifikasi: job dispatch manual → notif masuk ke device test
- **Status:** pending

### Phase 8: Laporan PDF & Panen
<!--
  WHAT: Form panen + kalkulasi FCR final/IP + generate laporan PDF bankable.
  WHY: Laporan PDF adalah "output" yang bisa digunakan peternak untuk KUR — ini yang bikin mereka stick.
  SUCCESS: Panen berhasil → FCR final/IP dihitung → PDF ter-generate dengan semua data siklus.
-->
- [ ] HarvestRecordController: validasi withdrawal aman, simpan harvest, kalkulasi final
- [ ] CalculationService::calculateHarvest() — FCR final, IP, survival rate, revenue
- [ ] PdfReportService: DomPDF dengan template Blade (cycle-report.blade.php)
- [ ] Halaman Laporan & Panen Inertia (tab Ringkasan + tab Panen, disable panen saat withdrawal)
- [ ] Halaman ringkasan akhir setelah panen (FCR final, IP, download PDF)
- [ ] Verifikasi: PDF ter-download dengan data lengkap dan format rapi
- **Status:** pending

### Phase 9: QA, Optimasi & Deploy
<!--
  WHAT: Testing end-to-end, optimasi query, dan deploy ke production.
  WHY: Tidak ada gunanya fitur lengkap kalau ada bug kritis atau performa buruk.
  SUCCESS: Semua 15 QA checklist lolos, halaman load < 3 detik, app live di domain production.
-->
- [ ] Pest PHP: unit test CalculationService, WithdrawalService, CommodityService
- [ ] Feature test: auth flow, cycle flow, withdrawal block flow
- [ ] Manual QA checklist 15 poin (lihat requirements.md section 12.3)
- [ ] Optimasi: query N+1 via Eloquent eager loading, index Supabase
- [ ] Deploy: Railway/Render + GitHub Actions CI/CD
- [ ] Setup Sentry (error tracking) + UptimeRobot (monitoring)
- [ ] Verifikasi: semua QA checklist hijau, app accessible via HTTPS
- **Status:** pending

## Key Questions
<!--
  Pertanyaan teknis yang perlu dijawab sebelum/selama implementasi.
-->
1. Apakah Supabase Realtime dipakai untuk live update FCR di dashboard, atau cukup Inertia partial reload?
2. Inertia.js pakai Vue atau React di frontend?
3. Apakah Livewire dipakai untuk komponen interaktif (dropdown search obat, preview kalkulasi) atau murni Inertia?
4. Queue driver: database (Supabase) atau tetap pakai Redis untuk job notification?
5. Apakah FCM web push cukup, atau butuh Twilio/WA untuk peternak yang browser push-nya diblokir?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Supabase sebagai database (bukan MySQL lokal) | PostgreSQL managed, free tier cukup untuk MVP, built-in auth bisa dipakai opsional |
| Inertia.js bukan SPA murni | Server-side routing Laravel tetap dipakai, tidak perlu maintain 2 codebase terpisah |
| DomPDF bukan Puppeteer | Tidak butuh Chrome headless di server, lebih ringan untuk VPS |
| Cache weather/commodity di DB bukan Redis | Mengurangi dependency, Supabase bisa handle volume MVP |
| Eloquent Observer untuk auto-kalkulasi FCR | Logic kalkulasi ter-trigger otomatis, tidak bisa di-bypass via API |
| Soft delete di semua tabel utama | Data peternak tidak boleh hilang permanen, penting untuk audit trail laporan |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- Update phase status: pending → in_progress → complete
- Re-read goal sebelum mulai coding fase baru
- Seed drugs_reference saat migration: Amoksisilin(10), Enrofloksasin(10), Doksisiklin(7), Oksitetrasiklin(10), Tilosin(5), Kolistin(7), Neomycin(5), Vaksin ND(0), Vaksin IBD(0), Vaksin IB(0), Vitamin C(0), Vitamin AD3E(0)
- Setiap feature branch: `feat/phase-X-nama`
- Jangan pernah simpan API key di kode — selalu via .env
