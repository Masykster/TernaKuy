import { Head, Link } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';

export default function Index({ cycles = [] }) {
    const activeCycles = cycles.filter(c => c.status === 'active');
    const completedCycles = cycles.filter(c => c.status === 'harvested' || c.status === 'closed_forced');

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getSpeciesLabel = (species) => {
        return {
            broiler: 'Ayam Broiler',
            bebek: 'Bebek',
            lele: 'Lele',
            nila: 'Nila'
        }[species] || 'Ayam Broiler';
    };

    return (
        <>
            <Head title="Riwayat Siklus" />

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
                        <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Riwayat Siklus</h1>
                        <span style={{ fontSize: '11px', opacity: 0.85 }}>Pantau performa dan arsip peternakan</span>
                    </div>
                </div>

                <div className="main-scroll" style={{ padding: '16px' }}>
                    {/* ACTIVE CYCLES */}
                    <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-dark)', marginBottom: '12px', letterSpacing: '0.3px' }}>SIKLUS AKTIF</h2>
                        {activeCycles.length === 0 ? (
                            <div className="input-group-card" style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px', margin: 0 }}>
                                Tidak ada siklus aktif saat ini.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {activeCycles.map((cycle) => (
                                    <div key={cycle.id} className="input-group-card" style={{ margin: 0, padding: '16px', position: 'relative' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <span style={{ backgroundColor: '#E8F5E9', color: 'var(--color-forest)', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', display: 'inline-block', marginBottom: '8px' }}>
                                                    {getSpeciesLabel(cycle.coop?.farm?.species)}
                                                </span>
                                                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-dark)', margin: 0 }}>
                                                    Kandang {cycle.coop?.coop_code}
                                                </h3>
                                                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                                                    Mulai: {formatDate(cycle.doc_date)} · {cycle.doc_count.toLocaleString()} Ekor
                                                </p>
                                            </div>
                                            <Link 
                                                href={route('cycle.show', { cycle: cycle.id })}
                                                style={{
                                                    backgroundColor: 'var(--color-forest)',
                                                    color: 'white',
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                Pantau
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* COMPLETED CYCLES */}
                    <div>
                        <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-dark)', marginBottom: '12px', letterSpacing: '0.3px' }}>SIKLUS SELESAI</h2>
                        {completedCycles.length === 0 ? (
                            <div className="input-group-card" style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px', margin: 0 }}>
                                <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📦</span>
                                Belum ada riwayat siklus yang selesai.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {completedCycles.map((cycle) => (
                                    <div key={cycle.id} className="input-group-card" style={{ margin: 0, padding: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <div>
                                                <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', display: 'inline-block', marginBottom: '6px' }}>
                                                    {getSpeciesLabel(cycle.coop?.farm?.species)}
                                                </span>
                                                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-dark)', margin: 0 }}>
                                                    Kandang {cycle.coop?.coop_code}
                                                </h3>
                                            </div>
                                            <span style={{ backgroundColor: '#E2E8F0', color: '#475569', fontSize: '10px', fontWeight: '700', padding: '4px 8px', borderRadius: '6px' }}>
                                                PANEN
                                            </span>
                                        </div>
                                        
                                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '8px', marginTop: '8px' }}>
                                            <div>
                                                <div>Mulai</div>
                                                <div style={{ fontWeight: '700', color: 'var(--color-text-dark)' }}>{formatDate(cycle.doc_date)}</div>
                                            </div>
                                            <div>
                                                <div>Selesai</div>
                                                <div style={{ fontWeight: '700', color: 'var(--color-text-dark)' }}>{formatDate(cycle.closed_at)}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                            <Link 
                                                href={route('cycles.report', { cycle: cycle.id })}
                                                style={{
                                                    flex: 1,
                                                    textAlign: 'center',
                                                    border: '1.5px solid var(--color-forest)',
                                                    color: 'var(--color-forest)',
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    padding: '7px 0',
                                                    borderRadius: '10px',
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                Lihat Laporan
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <BottomNav activeTab="profil" />
            </div>
        </>
    );
}
