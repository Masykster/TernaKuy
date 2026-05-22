import { useState, useEffect } from 'react';

export default function CycleCard() {
    const [progress, setProgress] = useState(0);
    const [cageName, setCageName] = useState('K-01');
    const [population, setPopulation] = useState('2850 Ekor');

    useEffect(() => {
        const timer = setTimeout(() => setProgress(51), 300);

        const storedHasCage = localStorage.getItem('terna_kuy_has_cage');
        const storedCageData = localStorage.getItem('terna_kuy_cage_data');
        if (storedHasCage === 'true' && storedCageData) {
            try {
                const data = JSON.parse(storedCageData);
                if (data.kodeKandang) {
                    setCageName(data.kodeKandang);
                }
                if (data.jumlahBibit) {
                    setPopulation(`${data.jumlahBibit} Ekor`);
                }
            } catch (e) {
                console.error('Error parsing cage data', e);
            }
        }

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="cycle-card">
            <div className="cycle-top">
                <div className="cycle-badge">
                    <span className="cycle-badge-dot" />
                    SIKLUS AKTIF
                </div>
                <div className="cycle-day">Hari 18</div>
            </div>

            <div className="cycle-title-row">
                <h2 className="cycle-title">Kandang {cageName}</h2>
                <button className="cycle-arrow" aria-label="Detail kandang">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>

            <div className="cycle-info">
                <span className="cycle-population">Populasi : {population}</span>
                <span className="cycle-target">(Target 35 hari)</span>
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
