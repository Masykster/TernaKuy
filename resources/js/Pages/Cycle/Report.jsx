import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';

export default function Report({ cycle, withdrawalStatus = {}, summary = {} }) {
    const isHarvested = cycle.status === 'harvested' || cycle.harvest_record !== null;
    const [activeTab, setActiveTab] = useState(isHarvested ? 'ringkasan' : 'panen');

    // Setup form for harvesting
    const livePopulationEst = cycle.daily_records && cycle.daily_records.length > 0
        ? cycle.daily_records[cycle.daily_records.length - 1].live_population
        : cycle.doc_count;

    const { data, setData, post, processing, errors } = useForm({
        harvest_date: new Date().toISOString().split('T')[0],
        harvest_count: livePopulationEst,
        total_weight_kg: '',
        price_per_kg: '',
        notes: '',
    });

    const handleHarvestSubmit = (e) => {
        e.preventDefault();
        post(route('cycles.harvest', { cycle: cycle.id }));
    };

    // Calculate real-time average weight preview
    const hCount = parseInt(data.harvest_count) || 0;
    const tWeight = parseFloat(data.total_weight_kg) || 0;
    const avgWeightPreview = hCount > 0 ? (tWeight / hCount).toFixed(3) : '0.000';

    // Color metrics logic
    const getFcrStyle = (fcr) => {
        if (!fcr) return { label: '-', class: 'neutral' };
        const val = parseFloat(fcr);
        if (val < 1.6) return { label: '✅ OKE', style: 'green' };
        if (val <= 1.9) return { label: '⚠️ WASPADA', style: 'yellow' };
        return { label: '🚨 KRITIS', style: 'red' };
    };

    const getMortalityStyle = (mr) => {
        if (mr === undefined || mr === null) return { label: '-', class: 'neutral' };
        const val = parseFloat(mr);
        if (val < 3.0) return { label: '✅ OKE', style: 'green' };
        if (val <= 7.0) return { label: '⚠️ WASPADA', style: 'yellow' };
        return { label: '🚨 KRITIS', style: 'red' };
    };

    const getIpStyle = (ip) => {
        if (!ip) return { label: '-', class: 'neutral' };
        const val = parseFloat(ip);
        if (val >= 350) return { label: '✅ OKE', style: 'green' };
        if (val >= 300) return { label: '⚠️ WASPADA', style: 'yellow' };
        return { label: '🚨 KRITIS', style: 'red' };
    };

    // Date formatting helper
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const fcrVal = isHarvested ? cycle.harvest_record?.fcr_final : (summary.total_feed_kg && livePopulationEst ? summary.total_feed_kg / (livePopulationEst * 1.5) : null); // Est
    const mrVal = isHarvested ? cycle.harvest_record?.mortality_rate : (summary.total_mortality / cycle.doc_count) * 100;
    const ipVal = isHarvested ? cycle.harvest_record?.ip_score : null;

    const fcrStats = getFcrStyle(fcrVal);
    const mortalityStats = getMortalityStyle(mrVal);
    const ipStats = getIpStyle(ipVal);

    return (
        <>
            <Head title={isHarvested ? "Laporan Siklus Selesai" : "Panen & Laporan Siklus"} />

            <div className="mobile-container" style={{ paddingBottom: '90px', backgroundColor: '#F7F3ED' }}>
                
                {/* HEADER */}
                <div style={{ backgroundColor: '#2D6A4F', color: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/dashboard" className="back-btn-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', width: '32px', height: '32px', borderRadius: '50%' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                    </Link>
                    <div>
                        <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                            {isHarvested ? '🎉 Siklus Selesai!' : '🌾 Menu Panen Kandang'}
                        </h1>
                        <span style={{ fontSize: '11px', opacity: 0.85 }}>Kandang {cycle.coop?.coop_code} · {cycle.coop?.coop_type === 'open_house' ? 'Open House' : 'Close House'}</span>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="main-scroll" style={{ padding: '16px' }}>

                    {/* TABS (Show only if NOT harvested yet) */}
                    {!isHarvested && (
                        <div style={{ display: 'flex', backgroundColor: 'white', borderRadius: '16px', padding: '4px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
                            <button
                                onClick={() => setActiveTab('panen')}
                                style={{
                                    flex: 1, padding: '10px 0', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '700',
                                    backgroundColor: activeTab === 'panen' ? '#2D6A4F' : 'transparent',
                                    color: activeTab === 'panen' ? 'white' : 'var(--color-text-secondary)',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                🌾 Form Panen
                            </button>
                            <button
                                onClick={() => setActiveTab('ringkasan')}
                                style={{
                                    flex: 1, padding: '10px 0', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '700',
                                    backgroundColor: activeTab === 'ringkasan' ? '#2D6A4F' : 'transparent',
                                    color: activeTab === 'ringkasan' ? 'white' : 'var(--color-text-secondary)',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                📅 Ringkasan Sementara
                            </button>
                        </div>
                    )}

                    {/* FINAL HARVESTED VIEW */}
                    {isHarvested && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            
                            {/* Final Performance Summary Dashboard */}
                            <div className="input-group-card" style={{ margin: 0, padding: '20px', textAlign: 'center', backgroundColor: '#E8F5E9', border: '1.5px solid #A5D6A7' }}>
                                <span style={{ fontSize: '48px' }}>🏆</span>
                                <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-forest)', margin: '8px 0 4px' }}>Kandang {cycle.coop?.coop_code} Sukses Dipanen!</h2>
                                <p style={{ fontSize: '12px', color: '#2E6930', margin: 0 }}>Siklus ditutup pada {formatDate(cycle.closed_at)}</p>
                            </div>

                            {/* Info Siklus Card */}
                            <div className="input-group-card" style={{ margin: 0 }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-dark)', marginBottom: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                                    📋 Detail Siklus Produksi
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>Kandang</span>
                                        <span style={{ fontWeight: '700' }}>{cycle.coop?.coop_code} ({cycle.coop?.coop_type === 'open_house' ? 'Open House' : 'Close House'})</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>Strain & DOC Awal</span>
                                        <span style={{ fontWeight: '700' }}>{cycle.strain} · {cycle.doc_count.toLocaleString()} ekor</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>Tanggal Mulai</span>
                                        <span style={{ fontWeight: '700' }}>{formatDate(cycle.doc_date)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>Tanggal Panen</span>
                                        <span style={{ fontWeight: '700' }}>{formatDate(cycle.harvest_record?.harvest_date)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>Jumlah Dipanen</span>
                                        <span style={{ fontWeight: '700' }}>{cycle.harvest_record?.harvest_count.toLocaleString()} ekor</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>Total Berat Panen</span>
                                        <span style={{ fontWeight: '700' }}>{parseFloat(cycle.harvest_record?.total_weight_kg).toFixed(1)} kg</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>Berat Rata-rata</span>
                                        <span style={{ fontWeight: '700' }}>{parseFloat(cycle.harvest_record?.avg_weight_kg).toFixed(3)} kg/ekor</span>
                                    </div>
                                    {cycle.harvest_record?.price_per_kg && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--color-text-secondary)' }}>Harga Jual / Kg</span>
                                            <span style={{ fontWeight: '700' }}>Rp {parseInt(cycle.harvest_record?.price_per_kg).toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    {cycle.harvest_record?.total_revenue && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #E2E8F0', paddingTop: '8px', marginTop: '4px' }}>
                                            <span style={{ color: 'var(--color-text-secondary)', fontWeight: '700' }}>Total Pendapatan</span>
                                            <span style={{ fontWeight: '800', color: 'var(--color-forest)', fontSize: '13px' }}>
                                                Rp {parseInt(cycle.harvest_record?.total_revenue).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Performa Kunci */}
                            <div className="input-group-card" style={{ margin: 0 }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-dark)', marginBottom: '14px' }}>
                                    🏆 Indikator Performa Kunci (KPI)
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                    {/* FCR */}
                                    <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px 4px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '9px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>FCR FINAL</div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-dark)', margin: '4px 0' }}>
                                            {parseFloat(cycle.harvest_record?.fcr_final).toFixed(3)}
                                        </div>
                                        <span style={{
                                            fontSize: '8px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px',
                                            backgroundColor: fcrStats.style === 'green' ? '#E8F5E9' : fcrStats.style === 'yellow' ? '#FFF8EE' : '#FFF0ED',
                                            color: fcrStats.style === 'green' ? 'var(--color-forest)' : fcrStats.style === 'yellow' ? '#D4A017' : 'var(--color-red)'
                                        }}>
                                            {fcrStats.label}
                                        </span>
                                    </div>

                                    {/* Mati% */}
                                    <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px 4px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '9px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>MORTALITAS</div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-dark)', margin: '4px 0' }}>
                                            {parseFloat(cycle.harvest_record?.mortality_rate).toFixed(1)}%
                                        </div>
                                        <span style={{
                                            fontSize: '8px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px',
                                            backgroundColor: mortalityStats.style === 'green' ? '#E8F5E9' : mortalityStats.style === 'yellow' ? '#FFF8EE' : '#FFF0ED',
                                            color: mortalityStats.style === 'green' ? 'var(--color-forest)' : mortalityStats.style === 'yellow' ? '#D4A017' : 'var(--color-red)'
                                        }}>
                                            {mortalityStats.label}
                                        </span>
                                    </div>

                                    {/* IP Score */}
                                    <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px 4px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '9px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>IP SCORE</div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-dark)', margin: '4px 0' }}>
                                            {parseFloat(cycle.harvest_record?.ip_score).toFixed(1)}
                                        </div>
                                        <span style={{
                                            fontSize: '8px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px',
                                            backgroundColor: ipStats.style === 'green' ? '#E8F5E9' : ipStats.style === 'yellow' ? '#FFF8EE' : '#FFF0ED',
                                            color: ipStats.style === 'green' ? 'var(--color-forest)' : ipStats.style === 'yellow' ? '#D4A017' : 'var(--color-red)'
                                        }}>
                                            {ipStats.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Download Action Buttons */}
                            <a 
                                href={route('cycles.report.download', { cycle: cycle.id })} 
                                target="_blank"
                                style={{
                                    display: 'block', backgroundColor: '#2D6A4F', color: 'white', fontWeight: '800', fontSize: '14px',
                                    textAlign: 'center', padding: '14px', borderRadius: '16px', textDecoration: 'none',
                                    boxShadow: '0 4px 10px rgba(45, 106, 79, 0.2)'
                                }}
                            >
                                📥 Download Laporan PDF (Bankable)
                            </a>

                            <Link 
                                href={route('cycle.create')} 
                                style={{
                                    display: 'block', border: '1.5px solid #2D6A4F', color: '#2D6A4F', fontWeight: '800', fontSize: '14px',
                                    textAlign: 'center', padding: '13px', borderRadius: '16px', textDecoration: 'none', backgroundColor: 'white'
                                }}
                            >
                                🔄 Mulai Siklus Baru di Kandang Ini
                            </Link>

                        </div>
                    )}

                    {/* ACTIVE CYCLE FORM/TABS VIEW */}
                    {!isHarvested && (
                        <div>
                            {/* TAB: RINGKASAN */}
                            {activeTab === 'ringkasan' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    
                                    {/* Info Siklus Card */}
                                    <div className="input-group-card" style={{ margin: 0 }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-dark)', marginBottom: '12px' }}>
                                            📋 Detail Siklus Berjalan
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--color-text-secondary)' }}>Kandang</span>
                                                <span style={{ fontWeight: '700' }}>{cycle.coop?.coop_code} ({cycle.coop?.coop_type === 'open_house' ? 'Open House' : 'Close House'})</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--color-text-secondary)' }}>Strain & DOC</span>
                                                <span style={{ fontWeight: '700' }}>{cycle.strain} · {cycle.doc_count.toLocaleString()} ekor</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--color-text-secondary)' }}>Tanggal Mulai</span>
                                                <span style={{ fontWeight: '700' }}>{formatDate(cycle.doc_date)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--color-text-secondary)' }}>Hari Ke</span>
                                                <span style={{ fontWeight: '700' }}>Hari ke-{cycle.daily_records?.length || 1}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metric cards */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                        {/* FCR */}
                                        <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px 4px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '9px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>EST. FCR</div>
                                            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-dark)', margin: '4px 0' }}>
                                                {fcrVal ? fcrVal.toFixed(3) : '-'}
                                            </div>
                                            <span style={{
                                                fontSize: '8px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px',
                                                backgroundColor: fcrStats.style === 'green' ? '#E8F5E9' : fcrStats.style === 'yellow' ? '#FFF8EE' : '#FFF0ED',
                                                color: fcrStats.style === 'green' ? 'var(--color-forest)' : fcrStats.style === 'yellow' ? '#D4A017' : 'var(--color-red)'
                                            }}>
                                                {fcrStats.label}
                                            </span>
                                        </div>

                                        {/* Mati% */}
                                        <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px 4px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '9px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>MORTALITAS</div>
                                            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-dark)', margin: '4px 0' }}>
                                                {mrVal ? mrVal.toFixed(1) : '0.0'}%
                                            </div>
                                            <span style={{
                                                fontSize: '8px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px',
                                                backgroundColor: mortalityStats.style === 'green' ? '#E8F5E9' : mortalityStats.style === 'yellow' ? '#FFF8EE' : '#FFF0ED',
                                                color: mortalityStats.style === 'green' ? 'var(--color-forest)' : mortalityStats.style === 'yellow' ? '#D4A017' : 'var(--color-red)'
                                            }}>
                                                {mortalityStats.label}
                                            </span>
                                        </div>

                                        {/* IP Score (Est) */}
                                        <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px 4px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '9px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>IP SCORE</div>
                                            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-dark)', margin: '4px 0' }}>
                                                -
                                            </div>
                                            <span style={{ fontSize: '8px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#64748B' }}>
                                                BLM PANEN
                                            </span>
                                        </div>
                                    </div>

                                    {/* Detail Feed Info */}
                                    <div className="input-group-card" style={{ margin: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                            <span style={{ color: 'var(--color-text-secondary)' }}>Total Konsumsi Pakan</span>
                                            <span style={{ fontWeight: '700' }}>{summary.total_feed_kg?.toLocaleString('id-ID')} kg</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '8px' }}>
                                            <span style={{ color: 'var(--color-text-secondary)' }}>Estimasi Berat Per Ekor</span>
                                            <span style={{ fontWeight: '700' }}>
                                                {cycle.daily_records?.length > 0 && cycle.daily_records[cycle.daily_records.length - 1].avg_weight_g 
                                                    ? `${cycle.daily_records[cycle.daily_records.length - 1].avg_weight_g} g` 
                                                    : '-'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Withdrawal Status Banner */}
                                    {withdrawalStatus.has_active ? (
                                        <div style={{ backgroundColor: '#FFF0ED', border: '1.5px solid #FFD3C4', borderRadius: '16px', padding: '12px' }}>
                                            <span style={{ fontWeight: '800', color: 'var(--color-red)', display: 'block', marginBottom: '4px' }}>
                                                ⚠️ Withdrawal Obat Aktif
                                            </span>
                                            <span style={{ fontSize: '11px', color: 'var(--color-text-dark)' }}>
                                                Siklus ini masih berada dalam masa pembatasan panen karena pemberian obat belum selesai masa withdrawal.
                                            </span>
                                        </div>
                                    ) : (
                                        <div style={{ backgroundColor: '#E8F5E9', border: '1.5px solid #A5D6A7', borderRadius: '16px', padding: '12px' }}>
                                            <span style={{ fontWeight: '800', color: 'var(--color-forest)', display: 'block', marginBottom: '4px' }}>
                                                ✅ Bebas Masa Withdrawal
                                            </span>
                                            <span style={{ fontSize: '11px', color: 'var(--color-text-dark)' }}>
                                                Tidak ada masa pembatasan obat yang aktif. Kandang ini aman diproduksi dan dipanen.
                                            </span>
                                        </div>
                                    )}

                                    {/* Download interim report */}
                                    <a 
                                        href={route('cycles.report.download', { cycle: cycle.id })} 
                                        target="_blank"
                                        style={{
                                            display: 'block', border: '1.5px solid #2D6A4F', color: '#2D6A4F', fontWeight: '800', fontSize: '13px',
                                            textAlign: 'center', padding: '12px', borderRadius: '16px', textDecoration: 'none', backgroundColor: 'white'
                                        }}
                                    >
                                        📥 Download Laporan Sementara PDF
                                    </a>

                                </div>
                            )}

                            {/* TAB: PANEN */}
                            {activeTab === 'panen' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    
                                    {/* WITHDRAWAL ACTIVE: LOCKED OUT STATE */}
                                    {withdrawalStatus.has_active ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                            <div style={{
                                                backgroundColor: '#FFF0ED', border: '1.5px solid #FFD3C4', borderRadius: '20px', padding: '18px',
                                                textAlign: 'center'
                                            }}>
                                                <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>⛔</span>
                                                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#E05A33', margin: 0 }}>Belum Aman Dipanen!</h3>
                                                <p style={{ fontSize: '11px', color: 'var(--color-text-dark)', marginTop: '6px', lineHeight: 1.4 }}>
                                                    Kandang memiliki masa withdrawal aktif dari penggunaan antibiotik/obat berikut.
                                                    Memanen sebelum masa withdrawal berakhir dapat menyebabkan residu bahan kimia pada karkas ayam.
                                                </p>
                                            </div>

                                            {/* List of active drugs */}
                                            <div className="input-group-card" style={{ margin: 0 }}>
                                                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>DAFTAR OBAT AKTIF</span>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                                    {withdrawalStatus.active_withdrawals.map((active, idx) => (
                                                        <div key={idx} style={{ fontSize: '12px', color: 'var(--color-text-dark)', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', marginBottom: '4px' }}>
                                                                <span>{active.drug_name}</span>
                                                                <span style={{ color: '#E05A33' }}>sisa {active.days_left} hari</span>
                                                            </div>
                                                            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                                                                Selesai: {formatDate(active.withdrawal_end)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Disabled Form overlay visual */}
                                            <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
                                                <div className="input-group-card" style={{ margin: 0 }}>
                                                    <div style={{ marginBottom: '12px' }}>
                                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>TANGGAL PANEN</label>
                                                        <input type="text" disabled style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '8px' }} />
                                                    </div>
                                                </div>
                                                <button style={{ width: '100%', padding: '14px', backgroundColor: '#CBD5E1', color: '#94A3B8', borderRadius: '16px', border: 'none', fontWeight: '800' }}>
                                                    🌾 KONFIRMASI PANEN (TERKUNCI)
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* WITHDRAWAL SAFE: ENABLED HARVEST FORM */
                                        <form onSubmit={handleHarvestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            
                                            <div style={{
                                                backgroundColor: '#E8F5E9', border: '1.5px solid #A5D6A7', borderRadius: '20px', padding: '16px',
                                                display: 'flex', alignItems: 'center', gap: '10px'
                                            }}>
                                                <span style={{ fontSize: '24px' }}>✅</span>
                                                <div>
                                                    <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-forest)', margin: 0 }}>Kandang Siap Dipanen!</h3>
                                                    <p style={{ fontSize: '10px', color: '#2E6930', margin: '2px 0 0', lineHeight: 1.3 }}>
                                                        Masa withdrawal aman. Silakan input bobot akhir untuk menutup siklus ini.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="input-group-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {/* Tanggal Panen */}
                                                <div>
                                                    <label htmlFor="harvest_date" style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                                                        TANGGAL PANEN
                                                    </label>
                                                    <input 
                                                        type="date" 
                                                        id="harvest_date"
                                                        value={data.harvest_date}
                                                        onChange={e => setData('harvest_date', e.target.value)}
                                                        style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '12px' }}
                                                        required
                                                    />
                                                    {errors.harvest_date && <span style={{ color: 'var(--color-red)', fontSize: '10px' }}>{errors.harvest_date}</span>}
                                                </div>

                                                {/* Jumlah Dipanen */}
                                                <div>
                                                    <label htmlFor="harvest_count" style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                                                        JUMLAH DIPANEN (EKOR)
                                                    </label>
                                                    <input 
                                                        type="number" 
                                                        id="harvest_count"
                                                        value={data.harvest_count}
                                                        onChange={e => setData('harvest_count', e.target.value)}
                                                        placeholder="Contoh: 5950"
                                                        style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '12px' }}
                                                        required
                                                    />
                                                    {errors.harvest_count && <span style={{ color: 'var(--color-red)', fontSize: '10px' }}>{errors.harvest_count}</span>}
                                                </div>

                                                {/* Total Berat */}
                                                <div>
                                                    <label htmlFor="total_weight_kg" style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                                                        TOTAL BERAT (KG)
                                                    </label>
                                                    <input 
                                                        type="number" 
                                                        step="0.01"
                                                        id="total_weight_kg"
                                                        value={data.total_weight_kg}
                                                        onChange={e => setData('total_weight_kg', e.target.value)}
                                                        placeholder="Contoh: 10450.50"
                                                        style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '12px' }}
                                                        required
                                                    />
                                                    {errors.total_weight_kg && <span style={{ color: 'var(--color-red)', fontSize: '10px' }}>{errors.total_weight_kg}</span>}
                                                </div>

                                                {/* Harga Jual per Kg */}
                                                <div>
                                                    <label htmlFor="price_per_kg" style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                                                        HARGA JUAL / KG (RUPIAH) - OPSIONAL
                                                    </label>
                                                    <input 
                                                        type="number" 
                                                        id="price_per_kg"
                                                        value={data.price_per_kg}
                                                        onChange={e => setData('price_per_kg', e.target.value)}
                                                        placeholder="Contoh: 21000"
                                                        style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '12px' }}
                                                    />
                                                    {errors.price_per_kg && <span style={{ color: 'var(--color-red)', fontSize: '10px' }}>{errors.price_per_kg}</span>}
                                                </div>

                                                {/* Catatan */}
                                                <div>
                                                    <label htmlFor="notes" style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                                                        CATATAN PANEN
                                                    </label>
                                                    <textarea 
                                                        id="notes"
                                                        value={data.notes}
                                                        onChange={e => setData('notes', e.target.value)}
                                                        placeholder="Catatan kendala / hasil panen..."
                                                        style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '12px', height: '60px', resize: 'none' }}
                                                    />
                                                    {errors.notes && <span style={{ color: 'var(--color-red)', fontSize: '10px' }}>{errors.notes}</span>}
                                                </div>
                                            </div>

                                            {/* Real-time calculated preview */}
                                            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '12px 20px', border: '1px dashed #CBD5E1', textAlign: 'center' }}>
                                                <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>ESTIMASI BERAT RATA-RATA</span>
                                                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-dark)', marginTop: '2px' }}>
                                                    {avgWeightPreview} <span style={{ fontSize: '13px', fontWeight: '600' }}>kg/ekor</span>
                                                </div>
                                            </div>

                                            {/* Submit Button */}
                                            <button 
                                                type="submit" 
                                                disabled={processing}
                                                style={{
                                                    width: '100%', padding: '14px', backgroundColor: '#2D6A4F', color: 'white',
                                                    borderRadius: '16px', border: 'none', fontWeight: '800', fontSize: '14px',
                                                    cursor: 'pointer', boxShadow: '0 4px 10px rgba(45, 106, 79, 0.2)'
                                                }}
                                            >
                                                {processing ? 'Memproses...' : '🌾 KONFIRMASI PANEN'}
                                            </button>

                                        </form>
                                    )}

                                </div>
                            )}
                        </div>
                    )}

                </div>

                <BottomNav activeTab="timeline" />
            </div>
        </>
    );
}
