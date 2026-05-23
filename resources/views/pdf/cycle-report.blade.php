<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Produksi Siklus</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #1a2e1a;
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #2d6a4f;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 18px;
            font-weight: bold;
            color: #2d6a4f;
            margin: 0 0 4px 0;
            text-transform: uppercase;
        }
        .header h2 {
            font-size: 13px;
            font-weight: normal;
            color: #64748b;
            margin: 0;
        }
        .section-title {
            font-size: 11px;
            font-weight: bold;
            color: white;
            background-color: #2d6a4f;
            padding: 4px 8px;
            margin-top: 20px;
            margin-bottom: 8px;
            text-transform: uppercase;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        table.info-table td {
            padding: 4px 6px;
            vertical-align: top;
        }
        table.info-table td.label {
            font-weight: bold;
            width: 30%;
            color: #6b7b6b;
        }
        table.info-table td.value {
            width: 70%;
        }
        table.data-table {
            border: 1px solid #cbd5e1;
        }
        table.data-table th {
            background-color: #f1f5f9;
            color: #1a2e1a;
            font-weight: bold;
            text-align: center;
            border: 1px solid #cbd5e1;
            padding: 6px;
            font-size: 10px;
        }
        table.data-table td {
            border: 1px solid #cbd5e1;
            padding: 5px;
            text-align: center;
            font-size: 10px;
        }
        .metric-box {
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 8px;
            text-align: center;
            background-color: #f8fafc;
        }
        .metric-title {
            font-size: 9px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
        }
        .metric-value {
            font-size: 16px;
            font-weight: bold;
            margin-top: 4px;
        }
        .status-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 9px;
        }
        .status-badge.green {
            background-color: #e8f5e9;
            color: #2e8b3d;
        }
        .status-badge.yellow {
            background-color: #fff8ee;
            color: #d4a017;
        }
        .status-badge.red {
            background-color: #fff0ed;
            color: #e05a33;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 9px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>Laporan Produksi Peternakan Ayam Broiler</h1>
        <h2>{{ $cycle->coop->farm->name }} · Kelompok Peternak: {{ $cycle->coop->farm->user->name }}</h2>
    </div>

    <table style="width: 100%; border: none;">
        <tr>
            <td style="width: 50%; vertical-align: top; padding: 0 10px 0 0;">
                <div class="section-title">Informasi Farm</div>
                <table class="info-table">
                    <tr>
                        <td class="label">Nama Peternak</td>
                        <td class="value">{{ $cycle->coop->farm->user->name }}</td>
                    </tr>
                    <tr>
                        <td class="label">Nama Farm</td>
                        <td class="value">{{ $cycle->coop->farm->name }}</td>
                    </tr>
                    <tr>
                        <td class="label">Alamat Farm</td>
                        <td class="value">{{ $cycle->coop->farm->address ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="label">Kode Kandang</td>
                        <td class="value">{{ $cycle->coop->coop_code }}</td>
                    </tr>
                    <tr>
                        <td class="label">Tipe Kandang</td>
                        <td class="value">{{ $cycle->coop->coop_type === 'open_house' ? 'Open House' : 'Close House' }}</td>
                    </tr>
                </table>
            </td>
            <td style="width: 50%; vertical-align: top; padding: 0 0 0 10px;">
                <div class="section-title">Informasi Siklus</div>
                <table class="info-table">
                    <tr>
                        <td class="label">Strain DOC</td>
                        <td class="value">{{ $cycle->strain }}</td>
                    </tr>
                    <tr>
                        <td class="label">DOC Awal</td>
                        <td class="value">{{ number_format($cycle->doc_count) }} Ekor</td>
                    </tr>
                    <tr>
                        <td class="label">Tanggal Masuk</td>
                        <td class="value">{{ \Carbon\Carbon::parse($cycle->doc_date)->format('d M Y') }}</td>
                    </tr>
                    <tr>
                        <td class="label">Tanggal Panen</td>
                        <td class="value">{{ $cycle->harvestRecord ? \Carbon\Carbon::parse($cycle->harvestRecord->harvest_date)->format('d M Y') : 'Belum Dipanen' }}</td>
                    </tr>
                    <tr>
                        <td class="label">Supplier DOC</td>
                        <td class="value">{{ $cycle->supplier_doc ?? '-' }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <div class="section-title">Ringkasan & Performa Produksi</div>
    @if($cycle->harvestRecord)
        <table style="width: 100%; margin-bottom: 20px;">
            <tr>
                <td style="width: 25%; padding: 4px;">
                    <div class="metric-box">
                        <div class="metric-title">Jumlah Panen</div>
                        <div class="metric-value">{{ number_format($cycle->harvestRecord->harvest_count) }} ekor</div>
                    </div>
                </td>
                <td style="width: 25%; padding: 4px;">
                    <div class="metric-box">
                        <div class="metric-title">Total Berat</div>
                        <div class="metric-value">{{ number_format($cycle->harvestRecord->total_weight_kg, 1) }} kg</div>
                    </div>
                </td>
                <td style="width: 25%; padding: 4px;">
                    <div class="metric-box">
                        <div class="metric-title">FCR Final</div>
                        <div class="metric-value">{{ number_format($cycle->harvestRecord->fcr_final, 3) }}</div>
                    </div>
                </td>
                <td style="width: 25%; padding: 4px;">
                    <div class="metric-box">
                        <div class="metric-title">IP Score</div>
                        <div class="metric-value">
                            {{ number_format($cycle->harvestRecord->ip_score, 1) }}
                            <div style="margin-top: 4px;">
                                @if($cycle->harvestRecord->ip_score >= 350)
                                    <span class="status-badge green">OKE</span>
                                @elseif($cycle->harvestRecord->ip_score >= 300)
                                    <span class="status-badge yellow">WASPADA</span>
                                @else
                                    <span class="status-badge red">KRITIS</span>
                                @endif
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
        <table class="info-table">
            <tr>
                <td class="label" style="width: 20%;">Berat Rata-rata</td>
                <td class="value" style="width: 30%;">{{ number_format($cycle->harvestRecord->avg_weight_kg, 3) }} kg/ekor</td>
                <td class="label" style="width: 20%;">Mortalitas Akhir</td>
                <td class="value" style="width: 30%;">{{ number_format($cycle->harvestRecord->mortality_rate, 2) }}% ({{ number_format($cycle->doc_count - $cycle->harvestRecord->harvest_count) }} ekor)</td>
            </tr>
            <tr>
                <td class="label">Total Pakan</td>
                <td class="value">{{ number_format($total_feed_kg, 1) }} kg</td>
                <td class="label">Total Pendapatan</td>
                <td class="value">{{ $cycle->harvestRecord->total_revenue ? 'Rp ' . number_format($cycle->harvestRecord->total_revenue, 0, ',', '.') : '-' }}</td>
            </tr>
            @if($cycle->harvestRecord->notes)
                <tr>
                    <td class="label">Catatan Panen</td>
                    <td class="value" colspan="3">{{ $cycle->harvestRecord->notes }}</td>
                </tr>
            @endif
        </table>
    @else
        <div style="text-align: center; padding: 20px; border: 1px dashed #cbd5e1; background-color: #f8fafc; border-radius: 4px;">
            Siklus belum diselesaikan (belum ada data panen final).
        </div>
    @endif

    <div class="section-title">Riwayat Kesehatan & Obat-obatan</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 15%;">Tanggal</th>
                <th style="width: 15%;">Tipe</th>
                <th style="width: 25%;">Nama Obat/Vaksin</th>
                <th style="width: 15%;">Dosis</th>
                <th style="width: 15%;">Withdrawal</th>
                <th style="width: 15%;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($cycle->healthRecords as $record)
                <tr>
                    <td>{{ $record->record_date->format('d M Y') }}</td>
                    <td>{{ ucfirst($record->record_type) }}</td>
                    <td>{{ $record->drug_name }}</td>
                    <td>{{ $record->dosage ?? '-' }}</td>
                    <td>{{ $record->withdrawal_days }} hari</td>
                    <td>
                        @if($record->record_type === 'treatment')
                            @if($cycle->harvestRecord && $record->withdrawal_end->isBefore($cycle->harvestRecord->harvest_date))
                                <span class="status-badge green">AMAN</span>
                            @else
                                <span class="status-badge red">TIDAK AMAN</span>
                            @endif
                        @else
                            -
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="6">Tidak ada catatan kesehatan pada siklus ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="page-break"></div>

    <div class="header">
        <h1>Laporan Harian Produksi (Harian)</h1>
        <h2>{{ $cycle->coop->farm->name }} · Kandang {{ $cycle->coop->coop_code }}</h2>
    </div>

    <div class="section-title">Log Data Harian Kandang</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>Hari (Umur)</th>
                <th>Tanggal</th>
                <th>Pakan Harian (kg)</th>
                <th>Kematian (ekor)</th>
                <th>Populasi Hidup (ekor)</th>
                <th>Berat Sampling (g)</th>
                <th>FCR Berjalan</th>
                <th>Mortalitas Berjalan (%)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($cycle->dailyRecords as $record)
                <tr>
                    <td>{{ $record->day_number }}</td>
                    <td>{{ $record->record_date->format('d/m/Y') }}</td>
                    <td>{{ number_format($record->feed_kg, 1) }}</td>
                    <td>{{ $record->mortality }}</td>
                    <td>{{ number_format($record->live_population) }}</td>
                    <td>{{ $record->avg_weight_g ? number_format($record->avg_weight_g) . ' g' : '-' }}</td>
                    <td>{{ $record->fcr_current ? number_format($record->fcr_current, 3) : '-' }}</td>
                    <td>{{ number_format($record->mortality_rate, 2) }}%</td>
                </tr>
            @empty
                <tr>
                    <td colspan="8">Belum ada catatan harian.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Laporan digenerate otomatis oleh PiboFarm pada {{ now()->timezone('Asia/Jakarta')->format('d M Y H:i') }} WIB
    </div>

</body>
</html>
