import { useState, useEffect, useMemo } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';

export default function Daily({ cycle, prevRecord, dayNumber, todayDate }) {
    const { flash } = usePage().props;

    const initialDoc = cycle.doc_count;
    const prevLivePop = prevRecord ? prevRecord.live_population : initialDoc;
    const prevCumFeed = prevRecord ? parseFloat(prevRecord.cum_feed_kg) : 0.0;
    const prevCumMortality = prevRecord ? prevRecord.cum_mortality : 0;

    const { data, setData, post, processing, errors, reset } = useForm({
        feed_kg: '',
        mortality: '0',
        avg_weight_g: '',
        condition: 'good',
        notes: '',
        record_date: todayDate,
    });

    const [alertModal, setAlertModal] = useState(null); // 'fcr' | 'mortality' | null

    // Perform real-time preview calculations
    const preview = useMemo(() => {
        const feedKg = parseFloat(data.feed_kg) || 0;
        const mortality = parseInt(data.mortality) || 0;
        const avgWeightG = parseFloat(data.avg_weight_g) || 0;

        const livePop = Math.max(0, prevLivePop - mortality);
        const cumFeed = prevCumFeed + feedKg;
        const cumMortality = prevCumMortality + mortality;
        const mortalityRate = initialDoc > 0 ? (cumMortality / initialDoc) * 100 : 0;

        let fcrCurrent = null;
        if (avgWeightG > 0 && livePop > 0) {
            fcrCurrent = cumFeed / ((livePop * avgWeightG) / 1000);
        }

        return {
            livePop,
            cumFeed,
            cumMortality,
            mortalityRate: mortalityRate.toFixed(2),
            fcrCurrent: fcrCurrent !== null ? fcrCurrent.toFixed(3) : '-',
        };
    }, [data.feed_kg, data.mortality, data.avg_weight_g]);

    // Handle post-save session flash checking
    useEffect(() => {
        const saved = flash?.daily_record_saved;
        if (saved) {
            const hasMortalityAlert = (parseInt(saved.mortality) / parseInt(saved.initial_doc)) * 100 > 1.0;
            const hasFcrAlert = parseFloat(saved.fcr_current) > 1.8;

            if (hasMortalityAlert) {
                const pct = ((parseInt(saved.mortality) / parseInt(saved.initial_doc)) * 100).toFixed(2);
                setAlertModal({
                    type: 'mortality',
                    title: '🚨 Mortalitas Tinggi!',
                    message: `${saved.mortality} ekor mati (${pct}%). Segera periksa kondisi kandang.`,
                    style: 'red'
                });
            } else if (hasFcrAlert) {
                setAlertModal({
                    type: 'fcr',
                    title: '⚠️ FCR Mulai Tinggi',
                    message: `FCR ${parseFloat(saved.fcr_current).toFixed(3)} melewati batas waspada 1.6. Evaluasi jadwal pemberian pakan.`,
                    style: 'warning'
                });
            } else {
                router.visit(route('dashboard'));
            }
        }
    }, [flash]);

    const handleCloseModal = () => {
        setAlertModal(null);
        router.visit(route('dashboard'));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('cycles.records.store', { cycle: cycle.id }));
    };

    return (
        <>
            <Head title={`Input Harian - Kandang ${cycle.coop.coop_code}`} />

            <div className="mobile-container" style={{ minHeight: '100vh', backgroundColor: '#F7F3ED', display: 'flex', flexDirection: 'column' }}>
                
                {/* Header hijau #2D6A4F */}
                <div style={{ backgroundColor: '#2D6A4F', color: 'white', padding: '16px 20px 24px', borderRadius: '0 0 24px 24px', position: 'relative' }}>


                    {/* Back navigation & titles */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <Link href="/dashboard" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textDecoration: 'none', color: 'white' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12" />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                        </Link>
                        <div>
                            <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Kandang {cycle.coop.coop_code} · Hari ke-{dayNumber}</h1>
                            <p style={{ fontSize: '12px', margin: '2px 0 0', opacity: 0.85 }}>{new Date(data.record_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                {/* Form fields */}
                <form onSubmit={handleSubmit} style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {errors.record_date && (
                        <div style={{ background: '#FFF0ED', border: '1.5px solid #FFD3C4', color: '#E05A33', padding: '12px', borderRadius: '16px', fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>
                            {errors.record_date}
                        </div>
                    )}

                    {/* Section PAKAN */}
                    <div className="input-group-card" style={{ margin: 0 }}>
                        <span className="input-group-label" style={{ color: '#2D6A4F' }}>PAKAN DIBERIKAN</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', margin: '14px 0 8px' }}>
                            <input
                                type="number"
                                step="0.01"
                                className="large-number-input"
                                value={data.feed_kg}
                                onChange={(e) => setData('feed_kg', e.target.value)}
                                placeholder="0"
                                style={{ width: '160px', fontSize: '48px', border: 'none', outline: 'none', textAlign: 'right', fontWeight: '700', paddingRight: '8px' }}
                                required
                            />
                            <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>kg</span>
                        </div>
                        {errors.feed_kg && <div style={{ color: '#E05A33', fontSize: '11px', textAlign: 'center', marginBottom: '8px' }}>{errors.feed_kg}</div>}
                        <div className="cumulative-badge" style={{ backgroundColor: '#E8F5E9', color: '#2D6A4F' }}>
                            Total Kumulatif : {preview.cumFeed.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} kg
                        </div>
                    </div>

                    {/* Section KEMATIAN */}
                    <div className="input-group-card" style={{ margin: 0 }}>
                        <span className="input-group-label" style={{ color: '#E05A33' }}>KEMATIAN / AFKIR</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', margin: '14px 0 8px' }}>
                            <input
                                type="number"
                                className="large-number-input"
                                value={data.mortality}
                                onChange={(e) => setData('mortality', e.target.value)}
                                placeholder="0"
                                style={{ width: '160px', fontSize: '48px', border: 'none', outline: 'none', textAlign: 'right', fontWeight: '700', paddingRight: '8px' }}
                                required
                            />
                            <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>ekor</span>
                        </div>
                        {errors.mortality && <div style={{ color: '#E05A33', fontSize: '11px', textAlign: 'center', marginBottom: '8px' }}>{errors.mortality}</div>}
                        <div className="cumulative-badge" style={{ backgroundColor: '#FFF0ED', color: '#E05A33' }}>
                            Populasi Hidup : {preview.livePop.toLocaleString('id-ID')} ekor
                        </div>
                    </div>

                    {/* Section BERAT SAMPLING */}
                    <div className="input-group-card" style={{ margin: 0 }}>
                        <div className="input-group-label-row">
                            <span className="input-group-label">BERAT SAMPLING</span>
                            <span className="input-group-badge-optional">OPSIONAL</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                            Timbang 10-20 ekor ayam, lalu masukkan nilai rata-rata.
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', margin: '10px 0 8px' }}>
                            <input
                                type="number"
                                className="large-number-input"
                                value={data.avg_weight_g}
                                onChange={(e) => setData('avg_weight_g', e.target.value)}
                                placeholder="-"
                                style={{ width: '160px', fontSize: '36px', border: 'none', outline: 'none', textAlign: 'right', fontWeight: '700', paddingRight: '8px' }}
                            />
                            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>gram</span>
                        </div>
                        {errors.avg_weight_g && <div style={{ color: '#E05A33', fontSize: '11px', textAlign: 'center' }}>{errors.avg_weight_g}</div>}
                    </div>

                    {/* Section KONDISI */}
                    <div className="input-group-card" style={{ margin: 0 }}>
                        <span className="input-group-label">KONDISI UMUM KANDANG</span>
                        <div className="condition-buttons-row" style={{ marginTop: '10px' }}>
                            <button
                                type="button"
                                className={`condition-btn baik ${data.condition === 'good' ? 'active' : ''}`}
                                onClick={() => setData('condition', 'good')}
                                style={{ flex: 1, padding: '10px 0', fontWeight: '700', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                Baik
                            </button>
                            <button
                                type="button"
                                className={`condition-btn waspada ${data.condition === 'warning' ? 'active' : ''}`}
                                onClick={() => setData('condition', 'warning')}
                                style={{ flex: 1, padding: '10px 0', fontWeight: '700', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                Waspada
                            </button>
                            <button
                                type="button"
                                className={`condition-btn kritis ${data.condition === 'critical' ? 'active' : ''}`}
                                onClick={() => setData('condition', 'critical')}
                                style={{ flex: 1, padding: '10px 0', fontWeight: '700', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                Kritis
                            </button>
                        </div>
                    </div>

                    {/* Section CATATAN */}
                    <div className="input-group-card" style={{ margin: 0 }}>
                        <div className="input-group-label-row">
                            <span className="input-group-label">CATATAN HARIAN</span>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{(data.notes || '').length}/500</span>
                        </div>
                        <div className="notes-textarea-container" style={{ margin: '8px 0 0' }}>
                            <textarea
                                className="notes-textarea"
                                maxLength="500"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Masukkan catatan khusus hari ini (misal: jenis obat, kendala cuaca)..."
                                style={{ height: '70px' }}
                            />
                        </div>
                        {errors.notes && <div style={{ color: '#E05A33', fontSize: '11px', marginTop: '4px' }}>{errors.notes}</div>}
                    </div>

                    {/* Section PREVIEW KALKULASI */}
                    <div style={{ backgroundColor: '#F1F5F9', borderRadius: '20px', padding: '16px', border: '1.5px solid #E2E8F0' }}>
                        <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748B', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px', textAlign: 'center' }}>PREVIEW KALKULASI REAL-TIME</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', divideX: '1px solid #CBD5E1', textAlign: 'center' }}>
                            <div style={{ borderRight: '1px solid #E2E8F0' }}>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-dark)' }}>{preview.fcrCurrent}</div>
                                <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '600', marginTop: '2px' }}>FCR RUNNING</div>
                            </div>
                            <div style={{ borderRight: '1px solid #E2E8F0' }}>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-dark)' }}>{preview.mortalityRate}%</div>
                                <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '600', marginTop: '2px' }}>MORTALITAS</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-dark)' }}>{preview.livePop.toLocaleString()}</div>
                                <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '600', marginTop: '2px' }}>SISA POPULASI</div>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        style={{
                            backgroundColor: '#2D6A4F',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '14px',
                            fontWeight: '700',
                            fontSize: '16px',
                            cursor: 'pointer',
                            width: '100%',
                            boxShadow: '0 4px 12px rgba(45, 106, 79, 0.3)',
                            marginTop: '10px',
                            transition: 'opacity 0.2s',
                            opacity: processing ? 0.7 : 1
                        }}
                    >
                        {processing ? 'MENYIMPAN...' : 'SIMPAN DATA HARI INI'}
                    </button>

                </form>
            </div>

            {/* Alert Modal */}
            {alertModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        padding: '24px',
                        maxWidth: '320px',
                        width: '100%',
                        textAlign: 'center',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        borderTop: alertModal.style === 'red' ? '6px solid #E05A33' : '6px solid #D4A017'
                    }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-dark)', margin: '0 0 12px' }}>
                            {alertModal.title}
                        </h2>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 20px' }}>
                            {alertModal.message}
                        </p>
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            style={{
                                backgroundColor: alertModal.style === 'red' ? '#E05A33' : 'var(--color-forest)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                padding: '10px 24px',
                                fontWeight: '700',
                                fontSize: '14px',
                                cursor: 'pointer',
                                width: '100%',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                            }}
                        >
                            TUTUP & KEMBALI
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
