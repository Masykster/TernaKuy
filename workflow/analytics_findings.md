# Findings & Decisions — PiboFarm Analytics
<!--
  WHAT: Knowledge base untuk sesi analytics PiboFarm — query DB, validasi data, insight performa.
  WHY: Context window terbatas. File ini menyimpan hasil query dan temuan agar tidak hilang.
  WHEN: Update setelah SETIAP query signifikan atau setelah lihat grafik/chart (2-Action Rule).
  SCOPE: Analisis performa kandang, tren FCR, pola mortalitas, efektivitas withdrawal, harga pakan.
-->

## Data Sources
<!--
  EXAMPLE PiboFarm:
    | daily_records | Supabase prod | ~18K rows | cycle_id, record_date, fcr_current, mortality, feed_kg | 0.3% null fcr_current (hari tanpa sampling) |
    | health_records | Supabase prod | ~2.1K rows | cycle_id, drug_name, withdrawal_days, withdrawal_end | Lengkap, no nulls |
    | commodity_prices | Supabase prod | ~90 rows | commodity, price_idr, change_pct_30d, recorded_date | Update harian, complete |
-->
| Source | Location | Size | Key Fields | Quality Notes |
|--------|----------|------|------------|---------------|
| daily_records | Supabase | — | cycle_id, record_date, fcr_current, mortality, feed_kg, live_population | fcr_current nullable (hanya jika ada sampling) |
| health_records | Supabase | — | cycle_id, record_type, drug_name, withdrawal_days, withdrawal_end | — |
| harvest_records | Supabase | — | cycle_id, fcr_final, ip_score, mortality_rate, total_weight_kg | Hanya ada setelah panen |
| commodity_prices | Supabase | — | commodity, price_idr, change_pct_30d, recorded_date | Update 1x/hari |
| weather_cache | Supabase | — | farm_id, temperature_c, humidity_pct, alert_level, fetched_at | Update tiap 3 jam |
| cycles | Supabase | — | coop_id, doc_date, doc_count, strain, status, target_days | — |

## Hypothesis Log
<!--
  Hipotesis yang perlu divalidasi dari data PiboFarm.
  EXAMPLE:
    | FCR peternak tanpa sampling lebih buruk dari yang rutin sampling | Bandingkan avg FCR final per frekuensi sampling | Pending | Medium |
    | Mortalitas lebih tinggi di kandang open house saat suhu >33°C | Korelasi weather_cache.temperature vs daily_records.mortality | Pending | High |
-->
| Hypothesis | Test Method | Result | Confidence |
|------------|-------------|--------|------------|
| Peternak yang input data >5x/minggu punya FCR lebih baik | Pearson correlation: input_frequency vs fcr_final | Pending | High |
| Mortalitas hari 1–14 (brooding) > mortalitas hari 15–35 | GROUP BY day_number range, AVG(mortality) | Pending | High |
| Harga pakan turun >5% tapi peternak tidak beli grosir = kehilangan ~Rp 400rb/siklus | Hitung missed saving dari commodity_prices vs cycle feed cost | Pending | Medium |
| Kandang close_house punya FCR lebih baik dari open_house | t-test FCR final per coop_type | Pending | Medium |
| Withdrawal violation attempt terjadi paling banyak di hari 30–34 | COUNT harvest attempt WHERE withdrawal aktif, GROUP BY day_number | Pending | Medium |

## Query Results
<!--
  Catat query penting dan hasilnya — jangan tunggu nanti.
  EXAMPLE PiboFarm:
    ### FCR rata-rata per strain
    Query: SELECT strain, AVG(fcr_final), COUNT(*) FROM harvest_records hr JOIN cycles c ON hr.cycle_id = c.id GROUP BY strain
    Result: Ross 308: FCR avg 1.61 (n=34), Cobb 500: FCR avg 1.58 (n=21), Lohmann: FCR avg 1.71 (n=9)
    Interpretation: Cobb 500 punya FCR terbaik, Lohmann paling boros — perlu dicek apakah data sudah cukup
-->

## Statistical Findings
<!--
  Hasil uji statistik formal.
  EXAMPLE PiboFarm:
    | t-test FCR: close_house vs open_house | p=0.032 | Cohen's d=0.41 | Reject null: close_house signifikan lebih efisien |
    | Pearson: input_frequency ~ fcr_final | p=0.008 | r=-0.38 | Korelasi negatif moderat: makin sering input, FCR makin baik |
-->
| Test | p-value | Effect Size | Conclusion |
|------|---------|-------------|------------|
|      |         |             |            |

## Technical Decisions
<!--
  Keputusan metodologi analitik.
  EXAMPLE:
    | Gunakan median FCR bukan mean | Distribusi FCR right-skewed karena outlier peternak pemula |
    | Filter siklus < 28 hari | Siklus yang ditutup paksa merusak distribusi FCR final |
-->
| Decision | Rationale |
|----------|-----------|
| Filter cycle.status = 'harvested' untuk analisis FCR final | Siklus aktif atau closed_forced belum punya FCR final valid |
| Exclude fcr_current null dari analisis tren harian | Hari tanpa sampling tidak representatif |
| Normalisasi mortalitas ke % (bukan jumlah ekor) | Siklus berbeda ukuran DOC awal |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
|       |            |

## Resources
- Supabase SQL Editor: https://app.supabase.com → project → SQL Editor
- Query tabel PiboFarm: gunakan SQL Editor Supabase untuk analisis langsung
- Referensi formula: findings.md section "Formula Kalkulasi"
- Benchmark FCR industri: 1.4–1.5 (dengan sistem), 1.7–1.9 (manual tanpa sistem)

## Visual/Browser Findings
<!--
  CRITICAL: Update setelah melihat grafik, dashboard, atau hasil browser.
  Konten visual tidak persist — catat sebagai teks segera.
  EXAMPLE:
    - Grafik FCR 7 hari menunjukkan spike di hari 14–16 pada 3 siklus berbeda → kemungkinan terkait ganti pakan ke grower
    - Dashboard notifikasi: 80% notif yang tidak dibaca adalah kategori "harga" — perlu evaluasi relevansi alert
-->
-

---
*Update file ini setelah setiap 2 operasi view/browser/query*
*Konten visual harus dicatat sebagai teks segera*
