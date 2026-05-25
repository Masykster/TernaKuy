import { useState, useEffect, useMemo } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';

export default function Health({ cycle, records = [], withdrawalStatus = {}, drugsReference = [] }) {
    const todayStr = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset } = useForm({
        record_date: todayStr,
        record_type: 'treatment', // 'treatment' | 'vaccination' | 'observation'
        drug_name: '',
        dosage: '',
        method: 'drinking_water',
        withdrawal_days: '0',
        notes: '',
    });

    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // Filter drugs reference based on type & search term
    const filteredDrugs = useMemo(() => {
        const categoryFilter = data.record_type === 'treatment' ? 'antibiotic' : 'vaccine';
        return drugsReference.filter(d => 
            d.drug_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [drugsReference, searchTerm, data.record_type]);

    // Handle selecting a drug from reference list
    const handleSelectDrug = (drug) => {
        setData(prev => ({
            ...prev,
            drug_name: drug.drug_name,
            withdrawal_days: drug.withdrawal_days.toString()
        }));
        setSearchTerm(drug.drug_name);
        setShowDropdown(false);
    };

    // Calculate dynamic safe harvest preview date in modal
    const safeHarvestPreview = useMemo(() => {
        if (data.record_type !== 'treatment') return null;
        const days = parseInt(data.withdrawal_days) || 0;
        if (!data.record_date) return null;

        const date = new Date(data.record_date);
        date.setDate(date.getDate() + days);

        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }, [data.record_date, data.withdrawal_days, data.record_type]);

    const openEntryModal = (type) => {
        reset();
        setData(prev => ({
            ...prev,
            record_type: type,
            record_date: todayStr,
            method: type === 'treatment' ? 'drinking_water' : 'eye_drop',
            withdrawal_days: type === 'treatment' ? '5' : '0'
        }));
        setSearchTerm('');
        setShowModal(true);
    };

    const handleSaveRecord = (e) => {
        e.preventDefault();
        post(route('cycles.health.store', { cycle: cycle.id }), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            }
        });
    };

    const handleDeleteRecord = (recordId) => {
        if (confirm('Apakah Anda yakin ingin menghapus catatan kesehatan ini?')) {
            router.delete(route('cycles.health.destroy', { cycle: cycle.id, record: recordId }), {
                preserveScroll: true
            });
        }
    };

    // Check if the record has active withdrawal
    const checkActiveWithdrawal = (record) => {
        if (record.record_type !== 'treatment' || !record.withdrawal_end) return false;
        const end = new Date(record.withdrawal_end);
        const today = new Date(todayStr);
        return end > today;
    };

    const getDaysLeft = (record) => {
        if (!record.withdrawal_end) return 0;
        const end = new Date(record.withdrawal_end);
        const today = new Date(todayStr);
        const diffTime = end - today;
        return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    };

    return (
        <>
            <Head title={`Catatan Kesehatan - Kandang ${cycle.coop.coop_code}`} />

            <div className="mobile-container">
                <div className="main-scroll" style={{ paddingBottom: '80px' }}>


                    <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '10px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Link href="/dashboard" className="back-btn-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                            </Link>
                            <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--color-text-green)', margin: 0 }}>Log Kesehatan</h1>
                        </div>
                    </div>

                    {/* Food Safety / Withdrawal Status Banner */}
                    <div style={{ padding: '0 16px', marginTop: '10px' }}>
                        {withdrawalStatus.has_active ? (
                            <Link href={route('cycles.withdrawal', { cycle: cycle.id })} style={{ textDecoration: 'none', display: 'block' }}>
                                <div style={{
                                    backgroundColor: 'var(--color-red-light)',
                                    border: '1.5px solid rgba(209, 96, 61, 0.3)',
                                    borderRadius: '20px',
                                    padding: '16px',
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'start'
                                }}>
                                    <span style={{ fontSize: '24px' }}>⚠️</span>
                                    <div>
                                        <div style={{ fontWeight: '700', color: 'var(--color-cherry)', fontSize: '15px' }}>Ada Withdrawal Aktif!</div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-cherry)', marginTop: '4px', lineHeight: 1.4 }}>
                                            Obat <strong>{withdrawalStatus.active_withdrawals[0]?.drug_name}</strong> sisa {withdrawalStatus.active_withdrawals[0]?.days_left} hari. Jangan dipanen dulu!
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--color-russet)', marginTop: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            LIHAT RINCIAN ➔
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div style={{
                                backgroundColor: '#E8F5E9',
                                border: '1.5px solid #CBE6CC',
                                borderRadius: '20px',
                                padding: '16px',
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'start'
                            }}>
                                <span style={{ fontSize: '24px' }}>✅</span>
                                <div>
                                    <div style={{ fontWeight: '700', color: 'var(--color-forest)', fontSize: '15px' }}>Kondisi Kandang Aman</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-green)', marginTop: '4px', lineHeight: 1.4 }}>
                                        Tidak ada withdrawal aktif. Kandang aman dan bebas residu untuk dipanen.
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '12px', padding: '16px' }}>
                        <button
                            type="button"
                            onClick={() => openEntryModal('treatment')}
                            style={{
                                flex: 1,
                                backgroundColor: 'white',
                                color: 'var(--color-cherry)',
                                border: '1.5px solid rgba(209, 96, 61, 0.3)',
                                borderRadius: '16px',
                                padding: '12px',
                                fontWeight: '700',
                                fontSize: '14px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                        >
                            <span>💊</span> Catat Obat
                        </button>
                        <button
                            type="button"
                            onClick={() => openEntryModal('vaccination')}
                            style={{
                                flex: 1,
                                backgroundColor: 'white',
                                color: 'var(--color-forest)',
                                border: '1.5px solid rgba(50, 112, 57, 0.3)',
                                borderRadius: '16px',
                                padding: '12px',
                                fontWeight: '700',
                                fontSize: '14px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                        >
                            <span>💉</span> Catat Vaksin
                        </button>
                    </div>

                    {/* History Log List */}
                    <div style={{ padding: '0 16px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>RIWAYAT KESEHATAN</h3>
                        
                        {records.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                                Belum ada catatan kesehatan obat atau vaksin.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {records.map((record) => {
                                    const isActive = checkActiveWithdrawal(record);
                                    const daysLeft = getDaysLeft(record);

                                    return (
                                        <div key={record.id} style={{
                                            backgroundColor: 'white',
                                            borderRadius: '20px',
                                            padding: '16px',
                                            border: '1px solid #F3EDE4',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.01)',
                                            display: 'flex',
                                            gap: '12px',
                                            alignItems: 'start'
                                        }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '12px',
                                                backgroundColor: record.record_type === 'treatment' ? 'var(--color-red-light)' : 'var(--color-green-light)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '20px',
                                                flexShrink: 0
                                            }}>
                                                {record.record_type === 'treatment' ? '💊' : '💉'}
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', width: '100%' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>
                                                        {new Date(record.record_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    
                                                    {cycle.status === 'active' && (
                                                        <button
                                                            onClick={() => handleDeleteRecord(record.id)}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--color-cherry)', marginLeft: 'auto' }}
                                                            aria-label="Hapus catatan"
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                </div>

                                                <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-dark)', margin: '4px 0 2px' }}>
                                                    {record.drug_name}
                                                </h4>
                                                
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {record.dosage && <span>Dosis: {record.dosage}</span>}
                                                    {record.method && <span>Metode: {record.method}</span>}
                                                </div>

                                                {record.notes && (
                                                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '6px 0 0', backgroundColor: '#FFF8EE', padding: '6px 10px', borderRadius: '8px', borderLeft: '3px solid #F5EAD6' }}>
                                                        {record.notes}
                                                    </p>
                                                )}

                                                {record.record_type === 'treatment' && (
                                                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Withdrawal: {record.withdrawal_days} hari</span>
                                                        {isActive ? (
                                                            <span style={{ backgroundColor: 'var(--color-cherry)', color: 'white', fontSize: '9px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px' }}>
                                                                AKTIF ({daysLeft} HARI SISA)
                                                            </span>
                                                        ) : (
                                                            <span style={{ backgroundColor: 'var(--color-forest)', color: 'white', fontSize: '9px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px' }}>
                                                                SELESAI
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* BOTTOM NAVIGATION */}
                <BottomNav activeTab="kesehatan" />
            </div>

            {/* Entry Form Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'end',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px 24px 0 0',
                        padding: '24px 20px',
                        maxWidth: '390px',
                        width: '100%',
                        boxShadow: '0 -4px 25px rgba(0,0,0,0.15)',
                        maxHeight: '85vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-dark)', margin: 0 }}>
                                Catat {data.record_type === 'treatment' ? 'Pemberian Obat' : 'Vaksinasi'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveRecord} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {/* Record Date */}
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>TANGGAL PEMBERIAN</label>
                                <div className="input-box-container" style={{ height: '48px', margin: 0 }}>
                                    <input
                                        type="date"
                                        className="large-number-input"
                                        style={{ fontSize: '15px', textAlign: 'left' }}
                                        value={data.record_date}
                                        onChange={(e) => setData('record_date', e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.record_date && <span style={{ color: 'red', fontSize: '11px' }}>{errors.record_date}</span>}
                            </div>

                            {/* Drug Name with Auto-Suggest Search */}
                            <div style={{ position: 'relative' }}>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>NAMA OBAT / VAKSIN</label>
                                <div className="input-box-container" style={{ height: '48px', margin: 0 }}>
                                    <input
                                        type="text"
                                        className="large-number-input"
                                        placeholder="Ketik untuk mencari atau ketik bebas..."
                                        style={{ fontSize: '15px', textAlign: 'left' }}
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setData('drug_name', e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        required
                                    />
                                </div>
                                {errors.drug_name && <span style={{ color: 'red', fontSize: '11px' }}>{errors.drug_name}</span>}

                                {showDropdown && filteredDrugs.length > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '70px', left: 0, right: 0,
                                        backgroundColor: 'white',
                                        border: '1.5px solid #F3EDE4',
                                        borderRadius: '12px',
                                        zIndex: 1000,
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                                        maxHeight: '160px',
                                        overflowY: 'auto'
                                    }}>
                                        {filteredDrugs.map(drug => (
                                            <div
                                                key={drug.id}
                                                onClick={() => handleSelectDrug(drug)}
                                                style={{
                                                    padding: '10px 14px',
                                                    fontSize: '13px',
                                                    borderBottom: '1px solid #F3EDE4',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    color: 'var(--color-text-dark)'
                                                }}
                                                onMouseDown={(e) => e.preventDefault()} // Prevents input blur before selection
                                            >
                                                {drug.drug_name} <span style={{ float: 'right', fontSize: '10px', color: 'var(--color-text-secondary)', backgroundColor: '#F1F5F9', padding: '1px 6px', borderRadius: '4px' }}>{drug.category}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Dosage */}
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>DOSIS (MISAL: 0.2 ML / EKOR)</label>
                                <div className="input-box-container" style={{ height: '48px', margin: 0 }}>
                                    <input
                                        type="text"
                                        className="large-number-input"
                                        placeholder="Opsional"
                                        style={{ fontSize: '15px', textAlign: 'left' }}
                                        value={data.dosage}
                                        onChange={(e) => setData('dosage', e.target.value)}
                                    />
                                </div>
                                {errors.dosage && <span style={{ color: 'red', fontSize: '11px' }}>{errors.dosage}</span>}
                            </div>

                            {/* Method */}
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>CARA PEMBERIAN</label>
                                <div className="input-box-container" style={{ height: '48px', margin: 0 }}>
                                    <select
                                        className="large-number-input"
                                        style={{ fontSize: '15px', textAlign: 'left', appearance: 'none', background: 'transparent' }}
                                        value={data.method}
                                        onChange={(e) => setData('method', e.target.value)}
                                        required
                                    >
                                        <option value="drinking_water">Air Minum</option>
                                        <option value="eye_drop">Tetes Mata</option>
                                        <option value="injection">Suntik / Injeksi</option>
                                        <option value="feed">Pakan</option>
                                        <option value="spray">Semprot / Spray</option>
                                    </select>
                                </div>
                                {errors.method && <span style={{ color: 'red', fontSize: '11px' }}>{errors.method}</span>}
                            </div>

                            {/* Withdrawal Days (For Treatments only) */}
                            {data.record_type === 'treatment' && (
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>WITHDRAWAL PERIOD (HARI)</label>
                                    <div className="input-box-container" style={{ height: '48px', margin: 0 }}>
                                        <input
                                            type="number"
                                            className="large-number-input"
                                            placeholder="Jumlah hari"
                                            style={{ fontSize: '15px', textAlign: 'left' }}
                                            value={data.withdrawal_days}
                                            onChange={(e) => setData('withdrawal_days', e.target.value)}
                                            required
                                        />
                                    </div>
                                    {errors.withdrawal_days && <span style={{ color: 'red', fontSize: '11px' }}>{errors.withdrawal_days}</span>}

                                    {/* Safe Harvest Preview */}
                                    {safeHarvestPreview && (
                                        <div style={{
                                            backgroundColor: '#FFF8EE',
                                            border: '1.5px dashed #F5EAD6',
                                            borderRadius: '12px',
                                            padding: '10px 12px',
                                            fontSize: '12px',
                                            color: 'var(--color-text-dark)',
                                            marginTop: '8px',
                                            textAlign: 'center'
                                        }}>
                                            📅 Aman dipanen kembali pada: <strong>{safeHarvestPreview}</strong>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>CATATAN (OPSIONAL)</label>
                                <div className="notes-textarea-container" style={{ margin: 0 }}>
                                    <textarea
                                        className="notes-textarea"
                                        placeholder="Ketik catatan di sini..."
                                        style={{ height: '50px' }}
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                    />
                                </div>
                                {errors.notes && <span style={{ color: 'red', fontSize: '11px' }}>{errors.notes}</span>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                style={{
                                    backgroundColor: data.record_type === 'treatment' ? 'var(--color-cherry)' : 'var(--color-forest)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '16px',
                                    padding: '12px',
                                    fontWeight: '700',
                                    fontSize: '15px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                    marginTop: '8px'
                                }}
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Log'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
