# TernaKuy (PiboFarm) - Sistem Manajemen Peternakan Ayam Broiler Pintar

TernaKuy (sebelumnya PiboFarm) adalah platform manajemen poultry digital modern yang dirancang untuk membantu peternak ayam broiler memantau siklus hidup, mengoptimalkan pakan, menjaga keamanan pangan lewat pemantauan masa henti obat (withdrawal period), dan mengunduh laporan PDF performa keuangan bankable untuk KUR.

---

## Fitur Utama

1. **Dashboard Performa (Command Center)**: Memantau indeks FCR (Feed Conversion Ratio), IP (Indeks Performa) Score, dan Mortality Rate secara real-time.
2. **Golden Timeline**: Jadwal 14 tugas krusial pemeliharaan broiler otomatis yang dapat dicentang langsung di UI.
3. **Masa Henti Obat (Withdrawal Countdown)**: Melacak obat/vaksin yang diberikan dan memblokir tombol panen secara otomatis jika ayam masih dalam masa henti obat (keamanan pangan).
4. **Analisis Komoditas & Rekomendasi Pakan (Bulk Buy)**: Rekomendasi belanja bahan pakan (jagung, kedelai, bekatul) jika harga hari ini turun $\ge 5\%$ dibandingkan rata-rata 30 hari terakhir.
5. **Weather Alert**: Integrasi OpenWeatherMap untuk memberi peringatan otomatis kepada peternak jika kondisi cuaca ekstrim mengancam kandang.
6. **Notifikasi Firebase Cloud Messaging**: Mengirim reminder harian dan peringatan kritis langsung ke perangkat peternak.
7. **Laporan Panen Bankable PDF**: Unduh laporan performa siklus panen lengkap dengan visualisasi performa untuk pengajuan kredit usaha (KUR).

---

## Tech Stack

- **Backend**: Laravel 13 (PHP 8.3 / 8.5)
- **Frontend**: React.js (Inertia.js) & CSS Vanilla Premium
- **Database**: PostgreSQL (Supabase)
- **Testing**: Pest PHP Testing Framework (Unit & Feature)
- **Error Monitoring**: Sentry SDK
- **Integrasi Pihak Ketiga**:
  - OpenWeatherMap API (Weather Cache & Alerts)
  - Commodities API + Exchange Rate API (Bulk Buy Recommendation)
  - Firebase Cloud Messaging (Push Notifications)
  - DomPDF (Report Generator)

---

## Cara Setup Lokal (Langkah demi Langkah)

### 1. Klon Repositori dan Masuk ke Direktori
```bash
git clone <repository_url>
cd TernaKuy
```

### 2. Install Dependensi PHP & Javascript
```bash
composer install
npm install
```

### 3. Konfigurasi Environment File
Salin file `.env.example` ke `.env`:
```bash
copy .env.example .env
```
Isi variabel database dan API key di dalam file `.env` (lihat bagian [Cara Mendapatkan API Key](#cara-mendapatkan-api-key)).

### 4. Generate Application Key
```bash
php artisan key:generate
```

### 5. Jalankan Migrasi & Database Seeding
Jalankan perintah berikut untuk mengonfigurasi struktur tabel awal beserta data contoh (User, Farm, Coops, dan Commodity History):
```bash
php artisan migrate --seed
```

### 6. Jalankan Server Development lokal
Buka dua terminal terpisah:

- **Terminal 1 (Backend Server)**:
  ```bash
  php artisan serve
  ```
- **Terminal 2 (Frontend Bundle)**:
  ```bash
  npm run dev
  ```
Buka `http://localhost:8000` di browser Anda.

---

## Cara Setup Supabase

Platform ini siap dideploy menggunakan database cloud PostgreSQL dari Supabase:
1. Registrasi di [Supabase](https://supabase.com).
2. Buat proyek baru dan pilih region terdekat (misal: Singapore).
3. Setelah proyek dibuat, navigasi ke **Project Settings** > **Database**.
4. Salin **Connection String** (Transaction Pooler atau Session Pooler) dan konfigurasikan di `.env` Anda:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=aws-1-ap-south-1.pooler.supabase.com # Ganti sesuai host Anda
   DB_PORT=5432
   DB_DATABASE=postgres
   DB_USERNAME=postgres.<your_project_id>
   DB_PASSWORD=<your_db_password>
   DB_SSLMODE=require
   ```
5. Jalankan migrasi di lokal ke arah Supabase:
   ```bash
   php artisan migrate
   ```

---

## Cara Mendapatkan API Key

### 1. OpenWeatherMap API Key
- Registrasi akun gratis di [OpenWeatherMap](https://openweathermap.org).
- Dapatkan API key dari tab **API Keys**.
- Masukkan ke `.env`: `OPENWEATHER_API_KEY=your_key`

### 2. Commodities API Key
- Registrasi akun di [Commodities API](https://commodities-api.com).
- Salin token API Anda dari dashboard.
- Masukkan ke `.env`: `COMMODITIES_API_KEY=your_key`

### 3. Exchange Rate API Key
- Registrasi akun di [ExchangeRate API](https://www.exchangerate-api.com).
- Salin key akses API Anda.
- Masukkan ke `.env`: `EXCHANGERATE_API_KEY=your_key`

### 4. Firebase Cloud Messaging (FCM)
- Buat proyek di [Firebase Console](https://console.firebase.google.com).
- Navigasi ke **Project Settings** > **Service accounts**.
- Klik **Generate new private key** untuk mengunduh berkas kredensial JSON.
- Simpan file tersebut dengan aman di dalam workspace Anda (disarankan di luar folder public) dan masukkan path-nya ke `.env`:
  ```env
  FIREBASE_CREDENTIALS=storage/app/firebase/firebase_credentials.json
  ```

---

## Cara Menjalankan Scheduler di Production

Platform ini memiliki tugas terjadwal (seperti penarikan cuaca harian, sinkronisasi komoditas pakan, reminder tugas jam 07:00 pagi).

### 1. Jalankan secara lokal untuk pengujian:
```bash
php artisan schedule:work
```

### 2. Jalankan di Server Production (Linux/VPS):
Tambahkan entri Cron Job berikut ke server production Anda (melalui `crontab -e`):
```bash
* * * * * cd /path/to/your/project && php artisan schedule:run >> /dev/null 2>&1
```

---

## Menjalankan Pengujian (Testing)

Platform ini menggunakan Pest PHP untuk pengujian unit dan fitur:
```bash
# Jalankan seluruh test suite
vendor/bin/pest

# Jalankan test unit saja
vendor/bin/pest tests/Unit

# Jalankan test fitur saja
vendor/bin/pest tests/Feature
```
Semua test dipastikan lolos (0 failures).