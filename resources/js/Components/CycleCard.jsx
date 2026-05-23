import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';

export default function CycleCard({ activeCycle, currentDay }) {
    const [progress, setProgress] = useState(0);

    const cageCode = activeCycle?.coop?.coop_code || '-';
    const population = activeCycle?.doc_count ? `${activeCycle.doc_count.toLocaleString()} Ekor` : '0 Ekor';
    const targetDays = activeCycle?.target_days || 35;
    
    useEffect(() => {
        if (currentDay && targetDays) {
            const pct = Math.min(100, Math.round((currentDay / targetDays) * 100));
            const timer = setTimeout(() => setProgress(pct), 300);
            return () => clearTimeout(timer);
        }
    }, [currentDay, targetDays]);

    return (
        <div className="cycle-card">
            <div className="cycle-top">
                <div className="cycle-badge">
                    <span className="cycle-badge-dot" />
                    SIKLUS AKTIF
                </div>
                <div className="cycle-day">Hari {currentDay}</div>
            </div>

            <div className="cycle-title-row">
                <h2 className="cycle-title">Kandang {cageCode}</h2>
                <Link href={route('cycle.show', { cycle: activeCycle.id })} className="cycle-arrow" aria-label="Detail kandang" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </Link>
            </div>

            <div className="cycle-info">
                <span className="cycle-population">Populasi : {population}</span>
                <span className="cycle-target">(Target {targetDays} hari)</span>
            </div>

            <div className="cycle-progress-container">
                <div className="cycle-progress-bar">
                    <div
                        className="cycle-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="cycle-progress-label">{progress}%</div>
            </div>
        </div>
    );
}
