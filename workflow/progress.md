# Progress Log — PiboFarm
<!--
  WHAT: Session log — catatan kronologis apa yang dikerjakan, kapan, dan hasilnya.
  WHY: Menjawab "Apa yang sudah saya lakukan?" saat resume setelah break atau context reset.
  WHEN: Update setelah tiap fase selesai atau saat ada error. Lebih detail dari task_plan.md.
  STACK: Laravel 11 · Inertia.js · Supabase (PostgreSQL)
-->

## Session: [ISI TANGGAL — contoh: 2026-05-22]

### Phase 1: Setup Project & Auth
- **Status:** in_progress
- **Started:** [isi timestamp]
- Actions taken:
  - [ ] `laravel new pibofarm --git`
  - [ ] `composer require inertiajs/inertia-laravel`
  - [ ] Setup Supabase project, copy DB credentials ke .env
  - [ ] `php artisan make:auth` atau manual Sanctum setup
  - [ ] Buat migration users dengan field tambahan (province, city, fcm_token)
  - [ ] `php artisan migrate` ke Supabase
  - [ ] Buat halaman Login + Register (Inertia component)
  - [ ] Test: register → login → session aktif → redirect dashboard
- Files created/modified:
  - `database/migrations/xxxx_create_users_table.php`
  - `app/Http/Controllers/Auth/RegisterController.php`
  - `app/Http/Controllers/Auth/LoginController.php`
  - `resources/js/Pages/Auth/Login.jsx` atau `Login.vue`
  - `resources/js/Pages/Auth/Register.jsx` atau `Register.vue`
  - `.env` (DB_CONNECTION=pgsql, Supabase credentials)

### Phase 2: Farm, Kandang & Siklus
- **Status:** pending
- Actions taken:
  -
- Files created/modified:
  -

### Phase 3: Input Harian & Kalkulasi FCR
- **Status:** pending
- Actions taken:
  -
- Files created/modified:
  -

### Phase 4: Withdrawal Warning & Kesehatan
- **Status:** pending
- Actions taken:
  -
- Files created/modified:
  -

### Phase 5: Dashboard & Golden Timeline
- **Status:** pending
- Actions taken:
  -
- Files created/modified:
  -

### Phase 6: External API (Cuaca & Komoditas)
- **Status:** pending
- Actions taken:
  -
- Files created/modified:
  -

### Phase 7: Notifikasi FCM
- **Status:** pending
- Actions taken:
  -
- Files created/modified:
  -

### Phase 8: Laporan PDF & Panen
- **Status:** pending
- Actions taken:
  -
- Files created/modified:
  -

### Phase 9: QA, Optimasi & Deploy
- **Status:** pending
- Actions taken:
  -
- Files created/modified:
  -

## Test Results
<!--
  EXAMPLE:
    | Login valid | POST /api/auth/login {phone, password} | Token + user data | Token returned, redirect dashboard | ✓ |
    | Panen saat withdrawal aktif | POST /cycle/1/harvest | 422 + pesan withdrawal | Request ditolak dengan pesan jelas | ✓ |
    | FCR auto-kalkulasi | POST /cycle/1/records {feed_kg: 85, mortality: 3, avg_weight_g: 820} | fcr_current terhitung | fcr_current = 1.72 di response | ✓ |
-->
| Test | Input | Expected | Actual | Status |
|------|-------|----------|--------|--------|
| Register akun baru | POST /api/auth/register | Token + user data | | |
| Login dengan phone | POST /api/auth/login | Token + redirect | | |
| Setup farm pertama | POST /api/farms | Farm terbuat, redirect onboarding step 2 | | |
| Mulai siklus | POST /api/cycles | Siklus aktif + 14 timeline tasks ter-generate | | |
| Input harian duplikat | POST /cycle/{id}/records hari yang sama 2x | 422 Unprocessable | | |
| FCR auto-kalkulasi | Input dengan avg_weight_g | fcr_current dihitung benar | | |
| Panen saat withdrawal aktif | POST /cycle/{id}/harvest | Ditolak 422 + pesan jelas | | |
| Withdrawal auto-set | POST health record (treatment, 10 hari) | withdrawal_end = today+10 | | |
| Bulk buy alert | Commodity price turun >5% | Alert muncul di dashboard | | |
| Generate PDF | GET /cycle/{id}/report | File PDF ter-download | | |

## Error Log
<!--
  EXAMPLE PiboFarm:
    | 2026-05-22 10:00 | SQLSTATE pgsql: column tidak ada | 1 | Jalankan migration ulang, cek nama kolom |
    | 2026-05-22 10:15 | Inertia page not found | 2 | Path component salah, perbaiki case-sensitive |
    | 2026-05-22 11:00 | OpenWeatherMap 401 | 1 | API key belum di-set di .env |
-->
| Timestamp | Error | Attempt | Resolution |
|-----------|-------|---------|------------|
|           |       | 1       |            |

## 5-Question Reboot Check
<!--
  Jawab 5 pertanyaan ini setelah resume dari break atau context reset.
  Kalau bisa menjawab semua, kamu siap lanjut tanpa baca ulang semua.
-->
| Question | Answer |
|----------|--------|
| Dimana saya sekarang? | Phase 1 — Setup Project & Auth |
| Mau kemana selanjutnya? | Phase 2: Farm, Kandang & Siklus |
| Apa goal-nya? | MVP PiboFarm — manajemen peternakan broiler dengan FCR tracking, withdrawal warning, dan harga pakan real-time |
| Apa yang sudah dipelajari? | Lihat findings.md |
| Apa yang sudah dikerjakan? | Lihat log di atas |

## Checklist QA Manual (Phase 9)
<!--
  15 poin dari requirements.md section 12.3 — centang saat QA:
-->
- [ ] Registrasi dengan data valid → sukses, redirect onboarding
- [ ] Registrasi dengan email/HP duplikat → error message jelas
- [ ] Login salah password 5x → akun terkunci 15 menit
- [ ] Input harian 2x di hari yang sama → ditolak dengan pesan jelas
- [ ] Jumlah mati > populasi hidup → validasi error
- [ ] Panen saat withdrawal aktif → tombol disabled + warning
- [ ] PDF laporan ter-generate dengan data lengkap
- [ ] Push notification masuk saat FCR melewati threshold
- [ ] Harga komoditas tampil di dashboard
- [ ] Weather alert muncul saat suhu simulasi > 33°C
- [ ] Golden Timeline auto-generate 14 tasks saat siklus dibuat
- [ ] Timeline task bisa dicentang dan status tersimpan
- [ ] Tampilan normal di mobile Chrome Android (390px)
- [ ] Tampilan normal di desktop Chrome (1280px)
- [ ] Semua teks Bahasa Indonesia, tidak ada campuran Inggris di UI

---
*Update setelah tiap fase selesai atau saat ada error*
*Sertakan timestamp untuk semua error*
