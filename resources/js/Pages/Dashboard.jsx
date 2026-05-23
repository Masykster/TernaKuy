import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';

export default function Dashboard({ activeCycles = [], weather, commodity = [], unread_notifications = 0 }) {
    const hasActiveCycle = activeCycles.length > 0;

    const handleToggleTask = (cycleId, taskId, isDone) => {
        router.patch(route('timeline-tasks.toggle', { cycle: cycleId, task: taskId }), {
            is_done: !isDone
        }, {
            preserveScroll: true
        });
    };

    // Helper to determine metric badge statuses
    const getFcrStatus = (fcr) => {
        if (fcr === null || fcr === undefined || fcr === '-') return { label: '-', style: 'neutral' };
        const val = parseFloat(fcr);
        if (val < 1.6) return { label: '✅ OKE', style: 'green' };
        if (val <= 1.9) return { label: '⚠️ WASPADA', style: 'yellow' };
        return { label: '🚨 KRITIS', style: 'red' };
    };

    const getMortalityStatus = (mr) => {
        if (mr === null || mr === undefined || mr === '-') return { label: '-', style: 'neutral' };
        const val = parseFloat(mr);
        if (val < 3.0) return { label: '✅ OKE', style: 'green' };
        if (val <= 7.0) return { label: '⚠️ WASPADA', style: 'yellow' };
        return { label: '🚨 KRITIS', style: 'red' };
    };

    const getIpStatus = (ip) => {
        if (ip === null || ip === undefined || ip === '-') return { label: '-', style: 'neutral' };
        const val = parseFloat(ip);
        if (val > 350) return { label: '✅ OKE', style: 'green' };
        if (val >= 300) return { label: '⚠️ WASPADA', style: 'yellow' };
        return { label: '🚨 KRITIS', style: 'red' };
    };

    // Render SVG Line Chart for 7 Days FCR
    const renderFcrChart = (history) => {
        if (!history || history.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                    Belum ada data FCR untuk digrafikkan.
                </div>
            );
        }

        const width = 320;
        const height = 150;
        const paddingLeft = 30;
        const paddingRight = 10;
        const paddingTop = 15;
        const paddingBottom = 20;

        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;

        // FCR limits for graph scaling
        const minFcr = 1.0;
        const maxFcr = 2.2;

        const getX = (index) => paddingLeft + (index / (history.length - 1 || 1)) * chartWidth;
        const getY = (fcr) => {
            const val = parseFloat(fcr);
            const ratio = (val - minFcr) / (maxFcr - minFcr);
            return height - paddingBottom - ratio * chartHeight;
        };

        const points = history.map((rec, idx) => ({
            x: getX(idx),
            y: getY(rec.fcr_current),
            val: parseFloat(rec.fcr_current).toFixed(3),
            label: `H-${rec.day_number}`
        }));

        const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

        // y-coordinate of warning line (1.6)
        const warningY = getY(1.6);

        return (
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible', marginTop: '10px' }}>
                {/* Horizontal reference grids */}
                <line x1={paddingLeft} y1={getY(1.2)} x2={width - paddingRight} y2={getY(1.2)} stroke="#F1F5F9" strokeWidth="1" />
                <line x1={paddingLeft} y1={getY(1.6)} x2={width - paddingRight} y2={getY(1.6)} stroke="#FFD3C4" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1={paddingLeft} y1={getY(2.0)} x2={width - paddingRight} y2={getY(2.0)} stroke="#F1F5F9" strokeWidth="1" />
                
                {/* Left axes labels */}
                <text x="5" y={getY(1.2) + 4} fontSize="9" fill="#94A3B8" fontWeight="600">1.2</text>
                <text x="5" y={getY(1.6) + 4} fontSize="9" fill="#E05A33" fontWeight="700">1.6</text>
                <text x="5" y={getY(2.0) + 4} fontSize="9" fill="#94A3B8" fontWeight="600">2.0</text>
                
                {/* Warning line label */}
                <text x={width - 80} y={warningY - 4} fontSize="8" fill="#E05A33" fontWeight="700">Batas Waspada</text>

                {/* Line path */}
                <path d={linePath} fill="none" stroke="var(--color-forest)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data points */}
                {points.map((p, idx) => {
                    const fVal = parseFloat(p.val);
                    let color = 'var(--color-green-safe)';
                    if (fVal >= 1.9) color = 'var(--color-red)';
                    else if (fVal >= 1.6) color = '#D4A017';

                    return (
                        <g key={idx}>
                            <circle cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2" />
                            {/* Value label */}
                            <text x={p.x} y={p.y - 8} fontSize="8" fill="var(--color-text-dark)" fontWeight="700" textAnchor="middle">{p.val}</text>
                            {/* Day number label */}
                            <text x={p.x} y={height - 5} fontSize="9" fill="#64748B" fontWeight="600" textAnchor="middle">{p.label}</text>
                        </g>
                    );
                })}
            </svg>
        );
    };

    return (
        <>
            <Head title="Dashboard Command Center" />

            <div className="mobile-container" style={{ paddingBottom: '90px', backgroundColor: '#F7F3ED' }}>
                
                {/* HEADER */}
                <div style={{ backgroundColor: '#2D6A4F', color: 'white', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '0.5px' }}>🌿 PiboFarm</span>
                    
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Notifikasi">
                        <span style={{ fontSize: '20px' }}>🔔</span>
                        {unread_notifications > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-4px', right: '-4px',
                                background: '#E05A33', color: 'white',
                                borderRadius: '50%', width: '16px', height: '16px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '9px', fontWeight: '700'
                            }}>
                                {unread_notifications}
                            </span>
                        )}
                    </button>
                </div>

                {/* Main Scroll Content */}
                <div className="main-scroll" style={{ padding: '16px' }}>

                    {/* SIKLUS AKTIF LOOP */}
                    {hasActiveCycle ? (
                        activeCycles.map((cycle) => {
                            const fcrStats = getFcrStatus(cycle.latest_record?.fcr_current);
                            const mortalityStats = getMortalityStatus(cycle.latest_record?.mortality_rate);
                            const ipStats = getIpStatus(cycle.ip_score);

                            const progress = Math.min(100, Math.round((cycle.day_number / cycle.target_days) * 100));

                            return (
                                <div key={cycle.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                                    
                                    {/* SECTION A: SIKLUS AKTIF CARD */}
                                    <div className="input-group-card" style={{ margin: 0, padding: '18px 20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-forest)', letterSpacing: '0.8px' }}>SIKLUS AKTIF</span>
                                            <span style={{ backgroundColor: 'var(--color-wheat)', color: 'var(--color-text-dark)', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '10px' }}>
                                                Hari ke-{cycle.day_number}
                                            </span>
                                        </div>

                                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-text-dark)', margin: 0 }}>Kandang {cycle.coop.coop_code}</h2>
                                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 14px' }}>
                                            Tipe: {cycle.coop.coop_type === 'open_house' ? 'Open House' : 'Close House'} · Populasi Hidup: {cycle.latest_record ? cycle.latest_record.live_population.toLocaleString() : cycle.doc_count.toLocaleString()} ekor
                                        </p>

                                        {/* Progress bar */}
                                        <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                                            <div style={{ height: '100%', backgroundColor: 'var(--color-forest)', width: `${progress}%`, borderRadius: '4px', transition: 'width 0.5s' }} />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: '700' }}>
                                            <span>Progress : {progress}%</span>
                                            <span>Target: {cycle.target_days} hari</span>
                                        </div>

                                        {/* Three metric cards */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '16px' }}>
                                            {/* FCR */}
                                            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px 4px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>FCR</div>
                                                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-dark)', margin: '4px 0' }}>
                                                    {cycle.latest_record?.fcr_current ? parseFloat(cycle.latest_record.fcr_current).toFixed(2) : '-'}
                                                </div>
                                                <span style={{
                                                    fontSize: '8px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px',
                                                    backgroundColor: fcrStats.style === 'green' ? '#E8F5E9' : fcrStats.style === 'yellow' ? '#FFF8EE' : fcrStats.style === 'red' ? '#FFF0ED' : '#F1F5F9',
                                                    color: fcrStats.style === 'green' ? 'var(--color-forest)' : fcrStats.style === 'yellow' ? '#D4A017' : fcrStats.style === 'red' ? 'var(--color-red)' : '#64748B'
                                                }}>
                                                    {fcrStats.label}
                                                </span>
                                            </div>

                                            {/* MATI% */}
                                            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px 4px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>MATI%</div>
                                                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-dark)', margin: '4px 0' }}>
                                                    {cycle.latest_record?.mortality_rate ? parseFloat(cycle.latest_record.mortality_rate).toFixed(1) : '0.0'}%
                                                </div>
                                                <span style={{
                                                    fontSize: '8px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px',
                                                    backgroundColor: mortalityStats.style === 'green' ? '#E8F5E9' : mortalityStats.style === 'yellow' ? '#FFF8EE' : mortalityStats.style === 'red' ? '#FFF0ED' : '#F1F5F9',
                                                    color: mortalityStats.style === 'green' ? 'var(--color-forest)' : mortalityStats.style === 'yellow' ? '#D4A017' : mortalityStats.style === 'red' ? 'var(--color-red)' : '#64748B'
                                                }}>
                                                    {mortalityStats.label}
                                                </span>
                                            </div>

                                            {/* INDEX */}
                                            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px 4px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>INDEX</div>
                                                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-dark)', margin: '4px 0' }}>
                                                    {cycle.ip_score ? cycle.ip_score : '-'}
                                                </div>
                                                <span style={{
                                                    fontSize: '8px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px',
                                                    backgroundColor: ipStats.style === 'green' ? '#E8F5E9' : ipStats.style === 'yellow' ? '#FFF8EE' : ipStats.style === 'red' ? '#FFF0ED' : '#F1F5F9',
                                                    color: ipStats.style === 'green' ? 'var(--color-forest)' : ipStats.style === 'yellow' ? '#D4A017' : ipStats.style === 'red' ? 'var(--color-red)' : '#64748B'
                                                }}>
                                                    {ipStats.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION B: AGENDA HARI INI */}
                                    <div className="input-group-card" style={{ margin: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                            <span style={{ fontSize: '18px' }}>📅</span>
                                            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-dark)', margin: 0, letterSpacing: '0.3px' }}>AGENDA HARI INI</h3>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                                            {cycle.today_tasks.length === 0 ? (
                                                <div style={{ padding: '10px 0', color: 'var(--color-text-secondary)', fontSize: '12px', textAlign: 'center' }}>
                                                    Tidak ada agenda perawatan khusus hari ini.
                                                </div>
                                            ) : (
                                                cycle.today_tasks.map((task) => (
                                                    <div
                                                        key={task.id}
                                                        onClick={() => handleToggleTask(cycle.id, task.id, task.is_done)}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0', cursor: 'pointer' }}
                                                    >
                                                        <div className={`agenda-checkbox ${task.is_done ? 'checked' : 'unchecked'}`}>
                                                            {task.is_done && (
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="20 6 9 17 4 12" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <span className={`agenda-item-text ${task.is_done ? 'done' : ''}`} style={{ fontSize: '13px' }}>
                                                            {task.task_name}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <Link href={route('cycles.records.create', { cycle: cycle.id })} style={{
                                            display: 'block', backgroundColor: '#2D6A4F', color: 'white', fontWeight: '700', fontSize: '14px',
                                            textAlign: 'center', padding: '12px', borderRadius: '16px', textDecoration: 'none', boxShadow: '0 4px 10px rgba(45, 106, 79, 0.2)'
                                        }}>
                                            Isi Data Sekarang
                                        </Link>
                                    </div>

                                    {/* SECTION C: BANNER WITHDRAWAL */}
                                    {cycle.withdrawal_status?.has_active && (
                                        <div style={{
                                            backgroundColor: '#FFF0ED', border: '1.5px solid #FFD3C4', borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '18px' }}>⚠️</span>
                                                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#E05A33', margin: 0 }}>WITHDRAWAL AKTIF</h3>
                                            </div>

                                            {cycle.withdrawal_status.active_withdrawals.map((active, idx) => (
                                                <div key={idx} style={{ fontSize: '12px', color: 'var(--color-text-dark)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', marginBottom: '4px' }}>
                                                        <span>{active.drug_name}</span>
                                                        <span style={{ color: '#E05A33' }}>sisa {active.days_left} hari</span>
                                                    </div>
                                                    {/* progress bar */}
                                                    <div style={{ height: '6px', backgroundColor: 'white', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', backgroundColor: '#E05A33', width: `${active.progress_pct}%` }} />
                                                    </div>
                                                </div>
                                            ))}

                                            <Link href={route('cycles.withdrawal', { cycle: cycle.id })} style={{ fontSize: '11px', color: '#B03A1A', fontWeight: '700', textDecoration: 'none', marginTop: '6px' }}>
                                                Lihat Detail ➔
                                            </Link>
                                        </div>
                                    )}

                                    {/* SECTION F: GRAFIK FCR 7 HARI */}
                                    <div className="input-group-card" style={{ margin: 0 }}>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-dark)', marginBottom: '6px' }}>📊 FCR 7 Hari Terakhir</div>
                                        {renderFcrChart(cycle.fcr_history)}
                                    </div>

                                </div>
                            );
                        })
                    ) : (
                        /* EMPTY STATE */
                        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '24px', border: '1.5px dashed #D5DCD5', marginTop: '40px' }}>
                            <span style={{ fontSize: '56px', display: 'block', marginBottom: '16px' }}>🐣</span>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-dark)', margin: '0 0 8px' }}>Belum ada siklus aktif</h2>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 24px', lineHeight: 1.5 }}>
                                Silakan mulai siklus pemeliharaan baru untuk memantau data kandang, perkembangan FCR, dan agenda harian.
                            </p>
                            <Link href={route('cycle.create')} style={{
                                display: 'inline-block', backgroundColor: '#2D6A4F', color: 'white', fontWeight: '700', fontSize: '14px',
                                padding: '12px 28px', borderRadius: '16px', textDecoration: 'none', boxShadow: '0 4px 10px rgba(45, 106, 79, 0.2)'
                            }}>
                                🐣 Mulai Siklus Pertama
                            </Link>
                        </div>
                    )}

                    {/* SECTION D: WIDGET CUACA */}
                    {weather && (
                        <div className="input-group-card" style={{
                            margin: '0 0 16px 0',
                            backgroundColor: weather.alert_level === 'critical' ? '#FFF0ED' : weather.alert_level === 'warning' ? '#FFF8EE' : 'white',
                            border: weather.alert_level === 'critical' ? '1.5px solid #FFD3C4' : weather.alert_level === 'warning' ? '1.5px solid #F5EAD6' : '1px solid #F3EDE4'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>WIDGET CUACA</div>
                                    <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-text-dark)', marginTop: '4px' }}>
                                        {parseFloat(weather.temperature_c).toFixed(1)}°C
                                    </div>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-dark)', marginTop: '2px' }}>{weather.weather_desc}</div>
                                </div>
                                <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                    <div>💧 Kelembaban: {weather.humidity_pct}%</div>
                                    <div>💨 Angin: {parseFloat(weather.wind_speed).toFixed(1)} m/s</div>
                                </div>
                            </div>
                            
                            {weather.alert_level !== 'normal' && (
                                <div style={{
                                    marginTop: '10px', fontSize: '11px', fontWeight: '700',
                                    color: weather.alert_level === 'critical' ? '#E05A33' : '#D4A017'
                                }}>
                                    ⚠️ ALERT: {weather.alert_message}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION E: WIDGET HARGA PAKAN */}
                    {commodity.length > 0 && (
                        <div className="input-group-card" style={{ margin: '0 0 16px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-dark)', margin: 0 }}>💰 Harga Pakan</h3>
                                <span style={{ fontSize: '9px', color: 'var(--color-text-secondary)' }}>Diperbarui 08.00 WIB</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {commodity.map((comm) => {
                                    const change = parseFloat(comm.change_pct_30d) || 0;
                                    const isDown = change < 0;
                                    const isStrongDrop = change <= -5.0;

                                    let label = 'JAGUNG';
                                    if (comm.commodity === 'SOYBEAN') label = 'KEDELAI';
                                    else if (comm.commodity === 'RICEBRAN') label = 'DEDAK PADI';

                                    return (
                                        <div key={comm.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-dark)' }}>{label}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-dark)' }}>
                                                        Rp {parseInt(comm.price_idr).toLocaleString('id-ID')}/kg
                                                    </span>
                                                    <span style={{ fontSize: '11px', fontWeight: '700', color: isDown ? 'var(--color-forest)' : 'var(--color-red)' }}>
                                                        {isDown ? '↓' : '↑'} {Math.abs(change).toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>

                                            {isStrongDrop && (
                                                <div style={{ display: 'inline-block', backgroundColor: '#E8F5E9', color: 'var(--color-forest)', fontSize: '9px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', width: 'fit-content', marginTop: '2px' }}>
                                                    💡 Rekomendasi Beli Grosir
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <Link href={route('commodity.index')} style={{ display: 'inline-block', fontSize: '11px', color: 'var(--color-forest)', fontWeight: '700', textDecoration: 'none', marginTop: '12px' }}>
                                Lihat Detail ➔
                            </Link>
                        </div>
                    )}

                </div>

                <BottomNav activeTab="home" />
            </div>
        </>
    );
}
