import { Head, Link } from '@inertiajs/react';

export default function Withdrawal({ cycle, withdrawalStatus }) {
    const coop = cycle.coop;
    const farm = coop.farm;
    const { has_active, safe_harvest_date, active_withdrawals = [], all_withdrawals = [] } = withdrawalStatus;

    const safeDateFormatted = safe_harvest_date ? new Date(safe_harvest_date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }) : null;

    return (
        <>
            <Head title={`Withdrawal Status - Kandang ${coop.coop_code}`} />

            <div className="mobile-container input-page-container">
                <div className="main-scroll" style={{ paddingBottom: '60px' }}>


                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px' }}>
                        <Link href={route('cycles.health.index', { cycle: cycle.id })} className="back-btn-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12" />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                        </Link>
                        <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-green)', margin: 0 }}>Detail Withdrawal</h1>
                    </div>

                    {/* Status Panel */}
                    <div style={{ padding: '16px' }}>
                        {has_active ? (
                            <div style={{
                                backgroundColor: '#E05A33',
                                color: 'white',
                                borderRadius: '24px',
                                padding: '28px 20px',
                                textContent: 'center',
                                textAlign: 'center',
                                boxShadow: '0 8px 20px rgba(224, 90, 51, 0.25)'
                            }}>
                                <span style={{ fontSize: '40px' }}>⚠️</span>
                                <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '12px 0 6px' }}>BELUM AMAN DIPANEN</h2>
                                <p style={{ fontSize: '13px', margin: 0, opacity: 0.9, lineHeight: 1.4 }}>
                                    Antibiotik masih aktif dalam tubuh ayam. Perkiraan aman panen kembali pada tanggal:
                                </p>
                                <div style={{ fontSize: '18px', fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', marginTop: '14px', display: 'inline-block' }}>
                                    {safeDateFormatted}
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                backgroundColor: 'var(--color-forest)',
                                color: 'white',
                                borderRadius: '24px',
                                padding: '28px 20px',
                                textAlign: 'center',
                                boxShadow: '0 8px 20px rgba(50, 112, 57, 0.25)'
                            }}>
                                <span style={{ fontSize: '40px' }}>✅</span>
                                <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '12px 0 6px' }}>AMAN DIPANEN</h2>
                                <p style={{ fontSize: '13px', margin: 0, opacity: 0.9, lineHeight: 1.4 }}>
                                    Tidak ada residu obat antibiotik aktif. Ayam aman untuk dikonsumsi publik dan dipanen.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Warning disclaimer */}
                    <div style={{ padding: '0 16px' }}>
                        <div style={{
                            backgroundColor: '#FFF8EE',
                            border: '1.5px solid #F5EAD6',
                            borderRadius: '20px',
                            padding: '16px',
                            fontSize: '12px',
                            color: 'var(--color-text-dark)',
                            lineHeight: 1.5
                        }}>
                            <strong>💡 PENTING:</strong> Memanen ayam sebelum masa tenggang obat (withdrawal period) berakhir berisiko tinggi menyebabkan <strong>residu antibiotik</strong> tertinggal pada daging ayam, yang dapat membahayakan konsumen dan memicu resistensi antibiotik pada manusia.
                        </div>
                    </div>

                    {/* Active Drug List */}
                    {has_active && (
                        <div style={{ padding: '20px 16px 0' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}> countdown obat aktif</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {active_withdrawals.map((item, idx) => (
                                    <div key={idx} style={{
                                        backgroundColor: 'white',
                                        borderRadius: '20px',
                                        padding: '16px',
                                        border: '1.5px solid #F3EDE4'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div>
                                                <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-dark)', margin: 0 }}>
                                                    {item.drug_name}
                                                </h4>
                                                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                                    Diberikan: {new Date(item.given_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontSize: '18px', fontWeight: '700', color: '#E05A33' }}>{item.days_left}</span>
                                                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginLeft: '3px' }}>hari lagi</span>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div style={{ marginTop: '14px' }}>
                                            <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%',
                                                    background: '#E05A33',
                                                    width: `${item.progress_pct}%`,
                                                    transition: 'width 0.5s ease'
                                                }} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                                                <span>Awal Pengobatan</span>
                                                <span>Selesai: {new Date(item.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
