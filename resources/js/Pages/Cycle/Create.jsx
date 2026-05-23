import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ coops }) {
    const todayStr = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors } = useForm({
        coop_id: coops[0]?.id || '',
        doc_date: todayStr,
        doc_count: '',
        strain: 'Ross',
        supplier_doc: '',
        price_doc: '',
        target_days: 35,
        notes: '',
    });

    const [harvestDatePreview, setHarvestDatePreview] = useState('');

    useEffect(() => {
        if (data.doc_date && data.target_days) {
            const date = new Date(data.doc_date);
            date.setDate(date.getDate() + parseInt(data.target_days));
            
            const formatted = date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            setHarvestDatePreview(formatted);
        }
    }, [data.doc_date, data.target_days]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('cycles.store'));
    };

    const isFormValid = data.coop_id && data.doc_date && data.doc_count > 0 && data.strain;

    return (
        <>
            <Head title="Mulai Siklus Baru" />

            <div className="mobile-container input-page-container">
                <form onSubmit={handleSubmit} className="main-scroll" style={{ paddingBottom: '40px' }}>
                    {/* Header */}
                    <div className="status-bar" style={{ padding: '8px 20px 16px' }}>
                        <span>12:30</span>
                        <div className="status-bar-icons">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1A2E1A">
                                <rect x="1" y="14" width="3" height="8" rx="1" />
                                <rect x="6" y="10" width="3" height="12" rx="1" />
                                <rect x="11" y="6" width="3" height="16" rx="1" />
                                <rect x="16" y="2" width="3" height="20" rx="1" />
                            </svg>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A2E1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                                <line x1="12" y1="20" x2="12.01" y2="20" />
                            </svg>
                            <svg width="22" height="12" viewBox="0 0 28 14" fill="none">
                                <rect x="0.5" y="0.5" width="23" height="13" rx="3" stroke="#1A2E1A" strokeWidth="1" />
                                <rect x="2" y="2" width="18" height="10" rx="2" fill="#327039" />
                                <rect x="24.5" y="4" width="2.5" height="6" rx="1" fill="#1A2E1A" />
                            </svg>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px' }}>
                        <Link href="/dashboard" className="back-btn-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12" />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                        </Link>
                        <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--color-text-green)', margin: 0 }}>Mulai Siklus Baru</h1>
                    </div>

                    {/* Coop Selection Card */}
                    <div className="input-group-card">
                        <div className="input-group-label-row">
                            <span className="input-group-label">PILIH KANDANG</span>
                        </div>
                        {coops.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '10px 0', color: 'var(--color-text-secondary)' }}>
                                Belum ada kandang. Silakan hubungi admin atau buat kandang di profil.
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '8px' }}>
                                {coops.map((coop) => (
                                    <button
                                        key={coop.id}
                                        type="button"
                                        onClick={() => setData('coop_id', coop.id)}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '16px',
                                            border: data.coop_id === coop.id ? '2px solid var(--color-forest)' : '1.5px solid #F3EDE4',
                                            background: data.coop_id === coop.id ? 'var(--color-green-light)' : 'white',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s',
                                            outline: 'none',
                                        }}
                                    >
                                        <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--color-text-dark)' }}>Kandang {coop.coop_code}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                            {coop.coop_type === 'open_house' ? 'Open House' : 'Close House'}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                                            Kapasitas: {coop.capacity.toLocaleString()} ekor
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {errors.coop_id && <div className="error-message" style={{ color: 'red', fontSize: '11px', marginTop: '6px' }}>{errors.coop_id}</div>}
                    </div>

                    {/* DOC input card */}
                    <div className="input-group-card">
                        <div className="input-group-label-row">
                            <span className="input-group-label">INFORMASI DOC (BIBIT)</span>
                        </div>

                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px', marginTop: '10px' }}>TANGGAL MASUK (DOC DATE)</label>
                        <div className="input-box-container">
                            <input
                                type="date"
                                className="large-number-input"
                                style={{ fontSize: '18px' }}
                                value={data.doc_date}
                                onChange={(e) => setData('doc_date', e.target.value)}
                            />
                        </div>
                        {errors.doc_date && <div className="error-message" style={{ color: 'red', fontSize: '11px', marginTop: '-6px', marginBottom: '10px' }}>{errors.doc_date}</div>}

                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px', marginTop: '12px' }}>JUMLAH DOC (EKOR)</label>
                        <div className="input-box-container">
                            <input
                                type="number"
                                className="large-number-input"
                                placeholder="0"
                                value={data.doc_count}
                                onChange={(e) => setData('doc_count', e.target.value)}
                            />
                        </div>
                        {errors.doc_count && <div className="error-message" style={{ color: 'red', fontSize: '11px', marginTop: '-6px', marginBottom: '10px' }}>{errors.doc_count}</div>}

                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px', marginTop: '12px' }}>STRAIN DOC</label>
                        <div className="input-box-container">
                            <select
                                className="large-number-input"
                                style={{ fontSize: '18px', appearance: 'none', background: 'transparent' }}
                                value={data.strain}
                                onChange={(e) => setData('strain', e.target.value)}
                            >
                                <option value="Ross">Ross</option>
                                <option value="Cobb">Cobb</option>
                                <option value="Lohmann">Lohmann</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        {errors.strain && <div className="error-message" style={{ color: 'red', fontSize: '11px', marginTop: '-6px', marginBottom: '10px' }}>{errors.strain}</div>}
                    </div>

                    {/* Optional Info Card */}
                    <div className="input-group-card">
                        <div className="input-group-label-row">
                            <span className="input-group-label">DETAIL LAINNYA</span>
                            <span className="input-group-badge-optional">OPSIONAL</span>
                        </div>

                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px', marginTop: '10px' }}>SUPPLIER DOC</label>
                        <div className="input-box-container">
                            <input
                                type="text"
                                className="large-number-input"
                                placeholder="Nama supplier"
                                style={{ fontSize: '16px' }}
                                value={data.supplier_doc}
                                onChange={(e) => setData('supplier_doc', e.target.value)}
                            />
                        </div>

                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px', marginTop: '12px' }}>HARGA DOC (TOTAL RP)</label>
                        <div className="input-box-container">
                            <input
                                type="number"
                                className="large-number-input"
                                placeholder="Total harga pembelian"
                                style={{ fontSize: '16px' }}
                                value={data.price_doc}
                                onChange={(e) => setData('price_doc', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Target Days Slider */}
                    <div className="input-group-card">
                        <div className="input-group-label-row">
                            <span className="input-group-label">TARGET SIKLUS HARI</span>
                            <span className="cumulative-badge" style={{ padding: '4px 10px', fontSize: '11px' }}>{data.target_days} Hari</span>
                        </div>
                        <div style={{ padding: '10px 0' }}>
                            <input
                                type="range"
                                min="28"
                                max="45"
                                value={data.target_days}
                                onChange={(e) => setData('target_days', e.target.value)}
                                style={{ width: '100%', height: '6px', background: '#D0D5D0', accentColor: 'var(--color-forest)', cursor: 'pointer', borderRadius: '4px' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'between', fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                                <span>28 Hari</span>
                                <span style={{ marginLeft: 'auto' }}>45 Hari</span>
                            </div>
                        </div>

                        {/* Harvest preview box */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            background: 'var(--color-green-light)',
                            borderRadius: '12px',
                            marginTop: '16px',
                            border: '1px solid #CBE6CC'
                        }}>
                            <span style={{ fontSize: '20px' }}>📅</span>
                            <div>
                                <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estimasi Panen</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-dark)', marginTop: '2px' }}>{harvestDatePreview}</div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="input-group-card">
                        <div className="input-group-label-row">
                            <span className="input-group-label">CATATAN SIKLUS</span>
                        </div>
                        <div className="notes-textarea-container" style={{ margin: '8px 0 0' }}>
                            <textarea
                                className="notes-textarea"
                                placeholder="Masukkan catatan awal siklus (misal kondisi DOC saat diterima)..."
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="save-btn-container" style={{ margin: '24px 16px 0' }}>
                        <button
                            type="submit"
                            className="save-btn"
                            disabled={!isFormValid || processing}
                            style={{
                                opacity: isFormValid && !processing ? 1 : 0.6,
                                cursor: isFormValid && !processing ? 'pointer' : 'not-allowed'
                            }}
                        >
                            {processing ? 'MEMULAI SIKLUS...' : 'MULAI SIKLUS'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
