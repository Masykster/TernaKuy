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

                        {/* Back Button */}
                        <div className="app-header">
                            <Link href="/" className="back-btn-circle orange" aria-label="Kembali">
                                <img
                                    src="/images/LEFT.png"
                                    alt="Kembali"
                                    className="back-btn-icon"
                                    loading="lazy"
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
                                <span className="input-group-label">MATI / AFKIR (EKOR)</span>
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
                                <span className="input-group-label">BERAT SAMPLING (G)</span>
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
                            <span className="input-group-label">KONDISI UMUM KANDANG</span>
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

                            <span className="input-group-label">CATATAN (OPSIONAL)</span>
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
