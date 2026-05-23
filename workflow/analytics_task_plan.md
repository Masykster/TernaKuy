# Task Plan: PiboFarm — Validasi Data & Analytics
<!--
  WHAT: Roadmap untuk sesi analisis data PiboFarm — validasi DB, insight performa, laporan.
  WHY: Analytics punya fase berbeda dari software dev: discovery data → eksplorasi → hipotesis → sintesis.
  WHEN: Gunakan file ini saat sesi analisis atau validasi data (bukan saat development fitur).
  SCOPE: Validasi integritas data Supabase, insight performa kandang, tren FCR, pola mortalitas.
-->

## Goal
Validasi integritas data PiboFarm di Supabase dan identifikasi insight performa peternak (FCR, mortalitas, pola withdrawal) untuk dijadikan dasar iterasi fitur dan komunikasi value ke stakeholder.

## Current Phase
Phase 1

## Phases

### Phase 1: Data Discovery
<!--
  WHAT: Koneksi ke Supabase, pahami schema aktual, cek kualitas data.
  WHY: Data buruk menghasilkan analisis buruk. Fase ini mencegah wasted effort.
  SUCCESS: Semua tabel ter-dokumentasi di analytics_findings.md, row count dan null rate tercatat.
-->
- [ ] Koneksi ke Supabase SQL Editor
- [ ] Cek row count tiap tabel utama (daily_records, cycles, health_records, dll)
- [ ] Identifikasi null rate di kolom kritis: fcr_current, avg_weight_g, withdrawal_end
- [ ] Cek apakah ada data duplikat di daily_records (violation UNIQUE cycle_id + record_date)
- [ ] Verifikasi withdrawal_end = record_date + withdrawal_days di semua health_records
- [ ] Dokumentasi temuan di analytics_findings.md
- **Status:** in_progress

### Phase 2: Exploratory Analysis
<!--
  WHAT: Distribusi FCR, pola mortalitas, frekuensi input user, tren harga komoditas.
  WHY: Pahami shape data sebelum buat hipotesis — hindari kesimpulan dari data yang skewed.
  SUCCESS: 5 query key ter-dokumentasi di analytics_findings.md dengan interpretasi.
-->
- [ ] Distribusi FCR final per strain ayam (Ross, Cobb, Lohmann)
- [ ] Mortalitas rata-rata per fase: brooding (H1–14) vs pertumbuhan (H15–28) vs finisher (H29+)
- [ ] Frekuensi input harian per user: median berapa kali/minggu?
- [ ] Tren harga jagung 30 hari terakhir dari commodity_prices
- [ ] Distribusi alert level cuaca per farm (berapa hari warning vs normal)
- [ ] Dokumentasi semua hasil di analytics_findings.md
- **Status:** pending

### Phase 3: Hypothesis Testing
<!--
  WHAT: Uji hipotesis formal dari fase eksplorasi.
  WHY: Dari "kelihatannya X" ke "dengan confidence Y, kita bisa katakan X".
  SUCCESS: 3 hipotesis dari Hypothesis Log di analytics_findings.md ter-uji dengan hasil terdokumentasi.
-->
- [ ] H1: Korelasi input_frequency vs FCR final (Pearson, n minimal 30 siklus)
- [ ] H2: FCR close_house vs open_house (t-test independent)
- [ ] H3: Mortalitas hari 1–14 vs hari 15–35 (paired t-test per siklus)
- [ ] Catat p-value, effect size, dan interpretasi di analytics_findings.md
- [ ] Flag hipotesis yang butuh lebih banyak data
- **Status:** pending

### Phase 4: Synthesis & Reporting
<!--
  WHAT: Ringkasan temuan, rekomendasi iterasi fitur, dan visualisasi untuk stakeholder.
  WHY: Analisis tanpa komunikasi = pekerjaan sia-sia.
  SUCCESS: Dokumen insight 1 halaman dengan 3 rekomendasi konkret untuk backlog fitur.
-->
- [ ] Rangkum 5 temuan utama dari fase 1–3
- [ ] Buat 3 rekomendasi fitur berdasarkan data (contoh: "tambahkan reminder sampling jika 7 hari tidak ada avg_weight_g")
- [ ] Identifikasi anomali data yang perlu di-fix di production
- [ ] Catat keterbatasan analisis (sample size, data quality issues)
- **Status:** pending

## Hypotheses
<!--
  Dari analytics_findings.md Hypothesis Log.
-->
1. Peternak yang input data >5x/minggu punya FCR final lebih baik (r < 0)
2. Mortalitas hari 1–14 (brooding period) > mortalitas hari 15–35
3. Kandang close_house punya FCR final lebih rendah dari open_house
4. Withdrawal violation attempt paling sering di hari 30–34 (menjelang panen)
5. Peternak yang lihat alert harga pakan tapi tidak beli grosir kehilangan ~Rp 400rb/siklus

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Filter cycle.status = 'harvested' | Hanya siklus selesai yang punya FCR final valid |
| Minimum 30 siklus untuk statistical test | Sample size kurang dari ini terlalu kecil untuk t-test reliabel |
| Gunakan % mortalitas bukan jumlah ekor | Normalisasi untuk siklus dengan DOC awal berbeda |
| Analisis harga pakai window 30 hari | Sesuai logika bulk buying alert di CommodityService |

## Errors Encountered
<!--
  EXAMPLE PiboFarm:
    | Query timeout di daily_records tanpa index | 1 | Tambahkan WHERE cycle_id = ? untuk batasi scan |
    | Null division saat hitung FCR dengan biomass 0 | 2 | Filter avg_weight_g > 0 di query |
-->
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- Update phase status: pending → in_progress → complete
- Semua query tulis ke analytics_findings.md — jangan percaya memory
- Catat hasil visual (grafik, chart) sebagai teks segera — tidak persist di context
- Kalau sample size < 30, jangan tarik kesimpulan statistik — cukup deskriptif
- Re-read goal sebelum mulai fase baru
