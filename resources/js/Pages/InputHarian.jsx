import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function InputHarian() {
    // Form states
    const [pakan, setPakan] = useState('55');
    const [mati, setMati] = useState('6');
    const [berat, setBerat] = useState('899');
    const [kondisi, setKondisi] = useState('Baik');
    const [catatan, setCatatan] = useState('');
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    // Save handler
    const handleSave = (e) => {
        e.preventDefault();
        
        // Show success feedback
        setShowSuccessToast(true);
        
        // Redirect back to dashboard after showing toast briefly
        setTimeout(() => {
            setShowSuccessToast(false);
            router.get('/');
        }, 1500);
    };

    return (
        <>
            <Head title="Input Harian" />

            <div className="mobile-container input-page-container">
                {/* Success Toast */}
                {showSuccessToast && (
                    <div className="toast-alert">
                        Data berhasil disimpan!
                    </div>
                )}

                <div className="main-scroll">
                    {/* Header Image & Navigation */}
                    <div className="input-page-header">
                        <img
                            src="/images/Rectangle 3.png"
                            alt="Farm Scene"
                            className="hero-bg"
                            loading="eager"
                        />

                        {/* Status Bar */}
                        <div className="status-bar">
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

                        {/* Back Button */}
                        <div className="app-header">
                            <Link href="/" className="back-btn-circle" aria-label="Kembali">
                                <img
                                    src="/images/LEFT.png"
                                    alt="Kembali"
                                    className="back-btn-icon"
                                />
                            </Link>
                        </div>

                        {/* Chicken Mascot (flipped to look right) */}
                        <div className="input-chicken">
                            <img
                                src="/images/image 3.png"
                                alt="Chicken Mascot"
                                loading="eager"
                            />
                        </div>
                    </div>

                    {/* Page Title */}
                    <h1 className="input-page-title">Input Harian</h1>

                    {/* Cage Card (Kandang K-01) */}
                    <div className="input-cage-card">
                        <div className="input-cage-left">
                            <h2 className="input-cage-title">Kandang K-01</h2>
                            <p className="input-cage-date">Senin, 18 mei 2026</p>
                        </div>
                        <div className="input-cage-right">
                            <span className="input-cage-badge">Hari 18</span>
                            <button type="button" className="input-cage-arrow" aria-label="Detail Kandang">
                                <img
                                    src="/images/mingcute_right-fill.png"
                                    alt="Chevron"
                                    className="input-cage-arrow-icon"
                                />
                            </button>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <form onSubmit={handleSave}>
                        {/* Pakan Diberikan */}
                        <div className="input-group-card">
                            <div className="input-group-label-row">
                                <span className="input-group-label">PAKAN DIBERIKAN (KG)</span>
                            </div>
                            <div className="input-box-container">
                                <input
                                    type="number"
                                    value={pakan}
                                    onChange={(e) => setPakan(e.target.value)}
                                    className="large-number-input"
                                    placeholder="0"
                                />
                            </div>
                            <div className="cumulative-badge">
                                Total Kumulatif : 4.125 kg
                            </div>
                        </div>

                        {/* Mati / Afkir */}
                        <div className="input-group-card">
                            <div className="input-group-label-row">
                                <span className="input-group-label">Mati / Afkir (ekor)</span>
                            </div>
                            <div className="input-box-container">
                                <input
                                    type="number"
                                    value={mati}
                                    onChange={(e) => setMati(e.target.value)}
                                    className="large-number-input"
                                    placeholder="0"
                                />
                            </div>
                            <div className="cumulative-badge">
                                Total Kumulatif : 4.125 kg
                            </div>
                        </div>

                        {/* Berat Sampling */}
                        <div className="input-group-card">
                            <div className="input-group-label-row">
                                <span className="input-group-label">Berat Sampling (G)</span>
                                <span className="input-group-badge-optional">OPSIONAL</span>
                            </div>
                            <div className="input-group-sublabel">
                                Timbang 10 - 20 ekor. rata-rata
                            </div>
                            <div className="input-box-container">
                                <input
                                    type="number"
                                    value={berat}
                                    onChange={(e) => setBerat(e.target.value)}
                                    className="large-number-input"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Kondisi Umum Kandang */}
                        <div className="input-group-card">
                            <span className="input-group-label">Kondisi Umum Kandang</span>
                            <div className="condition-buttons-row">
                                <button
                                    type="button"
                                    className={`condition-btn baik ${kondisi === 'Baik' ? 'active' : ''}`}
                                    onClick={() => setKondisi('Baik')}
                                >
                                    Baik
                                </button>
                                <button
                                    type="button"
                                    className={`condition-btn waspada ${kondisi === 'Waspada' ? 'active' : ''}`}
                                    onClick={() => setKondisi('Waspada')}
                                >
                                    Waspada
                                </button>
                                <button
                                    type="button"
                                    className={`condition-btn kritis ${kondisi === 'Kritis' ? 'active' : ''}`}
                                    onClick={() => setKondisi('Kritis')}
                                >
                                    Kritis
                                </button>
                            </div>

                            <span className="input-group-label">Catatan (Opsional)</span>
                            <div className="notes-textarea-container">
                                <textarea
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                    className="notes-textarea"
                                    placeholder="Tulis catatan jika ada..."
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="save-btn-container">
                            <button type="submit" className="save-btn">
                                Simpan Data
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
