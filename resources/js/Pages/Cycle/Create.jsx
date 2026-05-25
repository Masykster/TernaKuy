import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ coops, speciesRanges }) {
    const todayStr = new Date().toISOString().split('T')[0];

    // Find species of selected coop
    const getSpeciesForCoop = (coopId) => {
        const coop = coops.find(c => c.id === coopId);
        return coop?.farm?.species || 'broiler';
    };

    const defaultCoop = coops[0];
    const defaultSpecies = getSpeciesForCoop(defaultCoop?.id);
    const defaultRange = speciesRanges?.[defaultSpecies] || { min: 28, max: 45, default: 35 };

    const { data, setData, post, processing, errors } = useForm({
        coop_id: defaultCoop?.id || '',
        doc_date: todayStr,
        doc_count: '',
        strain: '',
        supplier_doc: '',
        price_doc: '',
        target_days: defaultRange.default,
        notes: '',
    });

    const selectedSpecies = getSpeciesForCoop(data.coop_id);
    const range = speciesRanges?.[selectedSpecies] || { min: 28, max: 45, default: 35 };

    const speciesLabels = {
        broiler: 'Ayam Broiler',
        bebek: 'Bebek',
        lele: 'Lele',
        nila: 'Nila',
    };

    // Strain options per species
    const strainOptions = {
        broiler: ['Ross', 'Cobb', 'Lohmann', 'Other'],
        bebek: ['Peking', 'Mojosari', 'Hibrida', 'Other'],
        lele: ['Sangkuriang', 'Mutiara', 'Dumbo', 'Other'],
        nila: ['GIFT', 'Nirwana', 'Larasati', 'Other'],
    };

    const currentStrains = strainOptions[selectedSpecies] || strainOptions.broiler;

    const [harvestDatePreview, setHarvestDatePreview] = useState('');

    // Update target_days when coop changes
    const handleCoopChange = (coopId) => {
        const sp = getSpeciesForCoop(coopId);
        const r = speciesRanges?.[sp] || { min: 28, max: 45, default: 35 };
        setData(prev => ({
            ...prev,
            coop_id: coopId,
            target_days: r.default,
            strain: '',
        }));
    };

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

    const isFormValid = data.coop_id && data.doc_date && data.doc_count > 0;

    return (
        <>
            <Head title="Mulai Siklus Baru" />

            <div className="mobile-container input-page-container">
                <form onSubmit={handleSubmit} className="main-scroll" style={{ paddingBottom: '40px' }}>


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
                                        onClick={() => handleCoopChange(coop.id)}
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
                                            {speciesLabels[coop.farm?.species] || 'Ayam Broiler'} · {coop.coop_type === 'open_house' ? 'Open House' : 'Close House'}
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

                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px', marginTop: '12px' }}>STRAIN / VARIETAS</label>
                        <div className="input-box-container">
                            <select
                                className="large-number-input"
                                style={{ fontSize: '18px', appearance: 'none', background: 'transparent' }}
                                value={data.strain}
                                onChange={(e) => setData('strain', e.target.value)}
                            >
                                <option value="">Pilih strain...</option>
                                {currentStrains.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
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
                                min={range.min}
                                max={range.max}
                                value={data.target_days}
                                onChange={(e) => setData('target_days', e.target.value)}
                                style={{ width: '100%', height: '6px', background: '#D0D5D0', accentColor: 'var(--color-forest)', cursor: 'pointer', borderRadius: '4px' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'between', fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                                <span>{range.min} Hari</span>
                                <span style={{ marginLeft: 'auto' }}>{range.max} Hari</span>
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
