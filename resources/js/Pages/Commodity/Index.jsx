import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';

export default function Index({ latestPrices = [], recommendations = [], history = [], remainingFeedKg = 1000, lastUpdated }) {
    const [openCharts, setOpenCharts] = useState({
        CORN: true, // Default open corn chart to show off the visual
        SOYBEAN: false,
        RICEBRAN: false
    });

    const toggleChart = (commodity) => {
        setOpenCharts(prev => ({
            ...prev,
            [commodity]: !prev[commodity]
        }));
    };

    const getCommInfo = (comm) => {
        switch (comm) {
            case 'CORN':
                return { name: 'Jagung', emoji: '🌽', desc: 'Sumber energi utama dalam ransum ayam' };
            case 'SOYBEAN':
                return { name: 'Bungkil Kedelai', emoji: '🫘', desc: 'Sumber protein nabati dengan asam amino lengkap' };
            case 'RICEBRAN':
                return { name: 'Dedak Padi', emoji: '🌾', desc: 'Serat kasar & energi penunjang pencernaan' };
            default:
                return { name: comm, emoji: '💰', desc: 'Komoditas pakan ternak' };
        }
    };

    const hasData = latestPrices.length > 0;

    // Helper to render SVG Chart for a given commodity's 30-day history
    const renderHistoryChart = (commName) => {
        const commHistory = history[commName] || [];
        if (commHistory.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                    Belum ada data grafik historis untuk {getCommInfo(commName).name}.
                </div>
            );
        }

        const width = 340;
        const height = 160;
        const paddingLeft = 40;
        const paddingRight = 15;
        const paddingTop = 15;
        const paddingBottom = 25;

        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;

        const prices = commHistory.map(h => parseFloat(h.price_idr));
        const minPrice = Math.min(...prices) * 0.98;
        const maxPrice = Math.max(...prices) * 1.02;
        const range = maxPrice - minPrice || 1;

        // Calculate average
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

        const getX = (index) => paddingLeft + (index / (commHistory.length - 1 || 1)) * chartWidth;
        const getY = (price) => height - paddingBottom - ((price - minPrice) / range) * chartHeight;

        const points = commHistory.map((h, idx) => ({
            x: getX(idx),
            y: getY(parseFloat(h.price_idr)),
            price: parseFloat(h.price_idr),
            date: h.recorded_date
        }));

        const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

        // Y coordinate of average line
        const avgY = getY(avg);

        // Highlight today (last point)
        const todayPoint = points[points.length - 1];

        // Format dates for X axis (start, middle, end)
        const formatDateLabel = (dateStr) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        };

        return (
            <div style={{ marginTop: '12px', backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-secondary)', marginBottom: '8px', fontWeight: '700' }}>
                    <span>Grafik 30 Hari Terakhir</span>
                    <span>Rata-rata: Rp {Math.round(avg).toLocaleString('id-ID')}/kg</span>
                </div>

                <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                    {/* Shaded "Zona Beli Bagus" (Region below average line) */}
                    <rect 
                        x={paddingLeft} 
                        y={avgY} 
                        width={chartWidth} 
                        height={height - paddingBottom - avgY} 
                        fill="rgba(46, 139, 87, 0.06)" 
                    />
                    
                    {/* Average reference line */}
                    <line 
                        x1={paddingLeft} 
                        y1={avgY} 
                        x2={width - paddingRight} 
                        y2={avgY} 
                        stroke="#2E8B3D" 
                        strokeWidth="1.5" 
                        strokeDasharray="4 4" 
                    />
                    <text x={paddingLeft + 4} y={avgY - 4} fontSize="8" fill="#2E8B3D" fontWeight="700">Zona Beli Bagus (&lt; Rata-rata)</text>

                    {/* Price trend line */}
                    <path 
                        d={linePath} 
                        fill="none" 
                        stroke="#64748B" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                    />

                    {/* Y-axis labels */}
                    <text x={paddingLeft - 5} y={getY(minPrice) + 3} fontSize="8" fill="#94A3B8" fontWeight="600" textAnchor="end">
                        {Math.round(minPrice).toLocaleString('id-ID')}
                    </text>
                    <text x={paddingLeft - 5} y={getY(maxPrice) + 3} fontSize="8" fill="#94A3B8" fontWeight="600" textAnchor="end">
                        {Math.round(maxPrice).toLocaleString('id-ID')}
                    </text>

                    {/* X-axis date labels */}
                    {points.length > 0 && (
                        <>
                            <text x={paddingLeft} y={height - 8} fontSize="8" fill="#94A3B8" fontWeight="600" textAnchor="start">
                                {formatDateLabel(points[0].date)}
                            </text>
                            <text x={paddingLeft + chartWidth / 2} y={height - 8} fontSize="8" fill="#94A3B8" fontWeight="600" textAnchor="middle">
                                {formatDateLabel(points[Math.floor(points.length / 2)].date)}
                            </text>
                            <text x={width - paddingRight} y={height - 8} fontSize="8" fill="#94A3B8" fontWeight="600" textAnchor="end">
                                {formatDateLabel(points[points.length - 1].date)}
                            </text>
                        </>
                    )}

                    {/* Red dot highlight for today's price */}
                    {todayPoint && (
                        <g>
                            <circle cx={todayPoint.x} cy={todayPoint.y} r="5" fill="#E05A33" stroke="white" strokeWidth="1.5" />
                            <rect 
                                x={todayPoint.x - 30} 
                                y={todayPoint.y - 20} 
                                width="60" 
                                height="14" 
                                rx="3" 
                                fill="#1A2E1A" 
                            />
                            <text 
                                x={todayPoint.x} 
                                y={todayPoint.y - 10} 
                                fontSize="8" 
                                fill="white" 
                                fontWeight="700" 
                                textAnchor="middle"
                            >
                                Rp {Math.round(todayPoint.price).toLocaleString('id-ID')}
                            </text>
                        </g>
                    )}
                </svg>
            </div>
        );
    };

    return (
        <>
            <Head title="Harga Pakan Ternak" />

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
                        <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>💰 Harga Pakan</h1>
                        {lastUpdated && (
                            <span style={{ fontSize: '10px', opacity: 0.85 }}>Diperbarui: {lastUpdated} WIB</span>
                        )}
                    </div>
                </div>

                {/* MAIN SCROLL */}
                <div className="main-scroll" style={{ padding: '16px' }}>

                    {/* EMPTY STATE */}
                    {!hasData ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '24px', border: '1.5px dashed #D5DCD5', marginTop: '20px' }}>
                            <span style={{ fontSize: '56px', display: 'block', marginBottom: '16px' }}>📉</span>
                            <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-dark)', margin: '0 0 8px' }}>Data harga belum tersedia</h2>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>
                                Kami sedang mengunduh data pasar terbaru dari Commodities API. Silakan coba lagi besok.
                            </p>
                            <Link href="/dashboard" style={{
                                display: 'inline-block', backgroundColor: '#2D6A4F', color: 'white', fontWeight: '700', fontSize: '13px',
                                padding: '10px 24px', borderRadius: '14px', textDecoration: 'none'
                            }}>
                                Kembali ke Dashboard
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            {/* REKOMENDASI BELI GROSIR BANNER */}
                            {recommendations.recommendations && recommendations.recommendations.length > 0 && (
                                <div style={{
                                    backgroundColor: '#E8F5E9', border: '1.5px solid #A5D6A7', borderRadius: '20px', padding: '16px',
                                    boxShadow: '0 4px 12px rgba(46, 139, 87, 0.08)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '20px' }}>💡</span>
                                        <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-forest)', margin: 0 }}>Rekomendasi Beli Grosir</h3>
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#2E6930', margin: '0 0 12px', lineHeight: 1.4 }}>
                                        Harga komoditas pakan berikut sedang turun signifikan dibanding rata-rata 30 hari. Disarankan melakukan pembelian stok untuk sisa kebutuhan siklus!
                                    </p>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {recommendations.recommendations.map((rec, idx) => {
                                            const info = getCommInfo(rec.commodity);
                                            return (
                                                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '10px 12px', border: '1px solid #C8E6C9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-dark)' }}>
                                                            {info.emoji} {info.name}
                                                        </span>
                                                        <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                                            Hemat Rp {Math.round(rec.savings_per_kg).toLocaleString('id-ID')}/kg
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-forest)', backgroundColor: '#E8F5E9', padding: '2px 8px', borderRadius: '6px' }}>
                                                            Hemat Rp {Math.round(rec.total_savings).toLocaleString('id-ID')}
                                                        </span>
                                                        <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                                            Est. Kebutuhan: {Math.round(remainingFeedKg)} kg
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* COMMODITY CARDS */}
                            {latestPrices.map((comm) => {
                                const info = getCommInfo(comm.commodity);
                                const isChartOpen = openCharts[comm.commodity];
                                
                                // Find if this has a recommendation drop
                                const recommendation = recommendations.recommendations?.find(r => r.commodity === comm.commodity);
                                const noRec = recommendations.no_recommendations?.find(r => r.commodity === comm.commodity);
                                
                                const changePct = recommendation ? -recommendation.drop_pct : (noRec ? noRec.change_pct : parseFloat(comm.change_pct_30d) || 0);
                                const isDown = changePct < 0;

                                // Query 30d average
                                const avg30d = recommendation ? recommendation.avg_30d : (noRec ? noRec.avg_30d : parseFloat(comm.price_idr));

                                return (
                                    <div key={comm.id} className="input-group-card" style={{ margin: 0, padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ fontSize: '20px' }}>{info.emoji}</span>
                                                    <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-dark)', margin: 0 }}>{info.name}</h2>
                                                </div>
                                                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '4px 0 0', lineHeight: 1.3 }}>{info.desc}</p>
                                            </div>
                                            
                                            <span style={{
                                                fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px',
                                                backgroundColor: isDown ? '#E8F5E9' : '#FFF0ED',
                                                color: isDown ? 'var(--color-forest)' : 'var(--color-red)'
                                            }}>
                                                {isDown ? '↓' : '↑'} {Math.abs(changePct).toFixed(1)}%
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '16px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                                            <div>
                                                <div style={{ fontSize: '9px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>HARGA HARI INI</div>
                                                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-dark)', marginTop: '2px' }}>
                                                    Rp {Math.round(comm.price_idr).toLocaleString('id-ID')}<span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>/kg</span>
                                                </div>
                                            </div>
                                            
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '9px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>RATA-RATA 30 HARI</div>
                                                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-dark)', marginTop: '4px' }}>
                                                    Rp {Math.round(avg30d).toLocaleString('id-ID')}/kg
                                                </div>
                                            </div>
                                        </div>

                                        {/* Accordion toggle button */}
                                        <button 
                                            onClick={() => toggleChart(comm.commodity)}
                                            style={{
                                                display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', gap: '6px',
                                                marginTop: '12px', padding: '8px 0 0', backgroundColor: 'transparent', border: 'none',
                                                borderTop: '1px solid #F1F5F9', cursor: 'pointer', fontSize: '11px', fontWeight: '800',
                                                color: 'var(--color-forest)'
                                            }}
                                        >
                                            {isChartOpen ? 'Sembunyikan Grafik 30 Hari' : 'Lihat Grafik 30 Hari'}
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isChartOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </button>

                                        {/* Chart panel */}
                                        {isChartOpen && renderHistoryChart(comm.commodity)}
                                    </div>
                                );
                            })}

                            <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--color-text-secondary)', padding: '8px 0', lineHeight: 1.4 }}>
                                Data bersumber dari Commodities API &amp; ExchangeRate API.<br />
                                Diperbarui otomatis setiap hari pukul 08:00 WIB.
                            </div>

                        </div>
                    )}

                </div>

                <BottomNav activeTab="home" />
            </div>
        </>
    );
}
