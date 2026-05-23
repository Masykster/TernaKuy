import { Head, Link, router } from '@inertiajs/react';

export default function Show({ cycle }) {
    const coop = cycle.coop;
    const farm = coop.farm;
    const tasks = cycle.timeline_tasks || [];

    const docDateFormatted = new Date(cycle.doc_date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const toggleTask = (id) => {
        router.patch(route('timeline-tasks.toggle', { task: id }), {}, {
            preserveScroll: true
        });
    };

    const getCategoryStyles = (category) => {
        switch (category) {
            case 'vaccination':
                return { bg: '#E8F0FE', color: '#1A73E8', label: 'Vaksinasi' };
            case 'sampling':
                return { bg: '#E4F7F6', color: '#00796B', label: 'Sampling' };
            case 'feeding':
                return { bg: '#FFF3E0', color: '#E65100', label: 'Pakan' };
            case 'management':
                return { bg: '#E8F5E9', color: '#2E7D32', label: 'Manajemen' };
            default:
                return { bg: '#ECEFF1', color: '#37474F', label: 'Kustom' };
        }
    };

    return (
        <>
            <Head title={`Timeline Kandang ${coop.coop_code}`} />

            <div className="mobile-container input-page-container">
                <div className="main-scroll" style={{ paddingBottom: '60px' }}>
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
                        <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-green)', margin: 0 }}>Golden Timeline</h1>
                    </div>

                    {/* Cycle Stats Card */}
                    <div className="input-group-card" style={{ background: 'var(--color-forest)', color: 'white' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>Kandang {coop.coop_code}</h2>
                        <p style={{ fontSize: '13px', margin: '4px 0 0', opacity: 0.9 }}>{farm.name} · {cycle.strain}</p>
                        
                        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', margin: '14px 0', padding: '10px 0 0', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <div>
                                <div style={{ opacity: 0.75 }}>TANGGAL DOC</div>
                                <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '2px' }}>{docDateFormatted}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ opacity: 0.75 }}>POPULASI MASUK</div>
                                <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '2px' }}>{cycle.doc_count.toLocaleString()} Ekor</div>
                            </div>
                        </div>
                    </div>

                    {/* Golden Timeline Task List */}
                    <div style={{ padding: '0 20px', marginTop: '20px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-dark)', marginBottom: '16px', letterSpacing: '0.5px' }}>JADWAL SIKLUS PRODUKSI (35 HARI)</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                            {/* Vertical Line */}
                            <div style={{ position: 'absolute', left: '22px', top: '15px', bottom: '15px', width: '2px', background: '#E2E8F0', zIndex: 0 }} />

                            {tasks.map((task) => {
                                const styles = getCategoryStyles(task.category);
                                const taskDateStr = new Date(task.task_date).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short'
                                });

                                return (
                                    <div key={task.id} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                                        {/* Day circle */}
                                        <div style={{
                                            width: '46px',
                                            height: '46px',
                                            borderRadius: '50%',
                                            background: task.is_done ? 'var(--color-forest)' : '#F1F5F9',
                                            border: task.is_done ? 'none' : '2px solid #CBD5E1',
                                            color: task.is_done ? 'white' : '#64748B',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                        }}>
                                            <span style={{ fontSize: '10px', fontWeight: '500', lineHeight: 1 }}>HARI</span>
                                            <span style={{ fontSize: '16px', fontWeight: '700', lineHeight: 1.1 }}>{task.day_number}</span>
                                        </div>

                                        {/* Task details box */}
                                        <div
                                            onClick={() => toggleTask(task.id)}
                                            style={{
                                                flex: 1,
                                                background: 'white',
                                                border: '1px solid #F1F5F9',
                                                borderRadius: '16px',
                                                padding: '12px 14px',
                                                boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                gap: '12px',
                                                alignItems: 'start',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{
                                                        fontSize: '9px',
                                                        fontWeight: '700',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        background: styles.bg,
                                                        color: styles.color,
                                                        padding: '2px 8px',
                                                        borderRadius: '6px'
                                                    }}>
                                                        {styles.label}
                                                    </span>
                                                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{taskDateStr}</span>
                                                </div>
                                                <p style={{
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: 'var(--color-text-dark)',
                                                    margin: '6px 0 0',
                                                    textDecoration: task.is_done ? 'line-through' : 'none',
                                                    opacity: task.is_done ? 0.6 : 1
                                                }}>
                                                    {task.task_name}
                                                </p>
                                            </div>

                                            {/* Custom Interactive Checkbox */}
                                            <div className={`agenda-checkbox ${task.is_done ? 'checked' : 'unchecked'}`} style={{ marginTop: '2px', flexShrink: 0 }}>
                                                {task.is_done && (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
