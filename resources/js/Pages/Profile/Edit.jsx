import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import BottomNav from '@/Components/BottomNav';

export default function Edit({ auth }) {
    // Stateful profile data loading from local storage
    const [profile, setProfile] = useState(() => {
        const stored = localStorage.getItem('terna_kuy_user_profile');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                // ignore
            }
        }
        return {
            name: auth?.user?.name || 'Cesya Aulia',
            email: auth?.user?.email || 'cesyaaulia12@gmail.com',
            password: ''
        };
    });

    // Profile editing states
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [nameInput, setNameInput] = useState(profile.name);
    const [emailInput, setEmailInput] = useState(profile.email);
    const [passwordInput, setPasswordInput] = useState(profile.password || '');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Sync input states when profile updates or editing toggles
    useEffect(() => {
        setNameInput(profile.name);
        setEmailInput(profile.email);
        setPasswordInput(profile.password || '');
    }, [profile, isEditingProfile]);

    // Stateful list of cages. Starts with one cage like Image 1.
    // Can be deleted (leads to empty state like Image 3) and added back.
    const [cages, setCages] = useState([]);

    useEffect(() => {
        const storedHasCage = localStorage.getItem('terna_kuy_has_cage');
        const storedCageData = localStorage.getItem('terna_kuy_cage_data');
        if (storedHasCage === 'true') {
            if (storedCageData) {
                try {
                    const data = JSON.parse(storedCageData);
                    setCages([
                        { 
                            id: data.kodeKandang || 'K-01', 
                            status: 'AKTIF', 
                            population: `${data.jumlahBibit || '2850'} EKOR`,
                            farmName: data.namaFarm || 'peternakan gokil'
                        }
                    ]);
                } catch (e) {
                    setCages([{ id: 'K-01', status: 'AKTIF', population: '2850 EKOR', farmName: 'peternakan gokil' }]);
                }
            } else {
                setCages([{ id: 'K-01', status: 'AKTIF', population: '2850 EKOR', farmName: 'peternakan gokil' }]);
            }
        } else {
            setCages([]);
        }
    }, []);

    // Stateful notification settings
    const [notifications, setNotifications] = useState({
        pagi: true,
        sore: false,
        vaksin: true,
        fcr: true,
        cuaca: true,
        harga: true,
        withdrawal: true,
    });

    // Add new cage handler (switches view to populated farm card)
    const addCage = () => {
        router.visit('/setup-kandang');
    };

    // Remove cage handler (leaves empty state when length is 0)
    const deleteCage = (indexToDelete) => {
        const newCages = cages.filter((_, index) => index !== indexToDelete);
        setCages(newCages);
        if (newCages.length === 0) {
            localStorage.setItem('terna_kuy_has_cage', 'false');
            localStorage.removeItem('terna_kuy_cage_data');
        }
    };

    // Toggle notification handler
    const toggleNotif = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleConfirmProfileChange = () => {
        const updated = {
            name: nameInput,
            email: emailInput,
            password: passwordInput
        };
        setProfile(updated);
        localStorage.setItem('terna_kuy_user_profile', JSON.stringify(updated));
        setShowConfirmModal(false);
        setIsEditingProfile(false);
    };

    return (
        <>
            <Head title="Pengaturan" />

            <div className="mobile-container profile-page-container">
                <div className="main-scroll">
                    {/* Status Bar */}
                    <div className="status-bar" style={{ padding: '0 20px 8px' }}>
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

                    {isEditingProfile ? (
                        /* Edit Profile View */
                        <>
                            {/* Title Header */}
                            <div className="edit-profile-title-row">
                                <button
                                    onClick={() => setIsEditingProfile(false)}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                                    aria-label="Kembali ke Pengaturan"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A2E1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </button>
                                <h1 className="edit-profile-title">Edit Profil</h1>
                            </div>

                            <div className="setup-card" style={{ marginTop: '12px' }}>
                                <label className="setup-input-label">NAMA</label>
                                <div className="setup-input-container">
                                    <input
                                        type="text"
                                        className="setup-input"
                                        placeholder="Nama lengkap"
                                        value={nameInput}
                                        onChange={(e) => setNameInput(e.target.value)}
                                        style={{ fontSize: '16px', fontWeight: '600' }}
                                    />
                                </div>

                                <label className="setup-input-label">EMAIL</label>
                                <div className="setup-input-container">
                                    <input
                                        type="email"
                                        className="setup-input"
                                        placeholder="Alamat email"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        style={{ fontSize: '16px', fontWeight: '600' }}
                                    />
                                </div>

                                <label className="setup-input-label">PASSWORD</label>
                                <div className="setup-input-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="setup-input"
                                        placeholder="Masukkan password baru"
                                        value={passwordInput}
                                        onChange={(e) => setPasswordInput(e.target.value)}
                                        style={{ flex: 1, fontSize: '16px', fontWeight: '600' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                                        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                    >
                                        {showPassword ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8C968C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8C968C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                    <button
                                        type="button"
                                        className="setup-action-btn"
                                        style={{ background: '#FFFFFF', border: '1.5px solid #F5EAD6', color: 'var(--color-text-dark)' }}
                                        onClick={() => setIsEditingProfile(false)}
                                    >
                                        BATAL
                                    </button>
                                    <button
                                        type="button"
                                        className="setup-action-btn"
                                        style={{ background: 'var(--color-forest)', border: 'none', color: '#FFFFFF' }}
                                        onClick={() => {
                                            if (nameInput.trim() && emailInput.trim()) {
                                                setShowConfirmModal(true);
                                            }
                                        }}
                                        disabled={!nameInput.trim() || !emailInput.trim()}
                                    >
                                        SIMPAN
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Default Settings View */
                        <>
                            {/* Page Title */}
                            <h1 className="settings-title">Pengaturan</h1>

                            {/* User Card */}
                            <div 
                                className="settings-user-card"
                                onClick={() => setIsEditingProfile(true)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="settings-user-left">
                                    <div className="settings-avatar-circle">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </div>
                                    <div className="settings-user-info">
                                        <span className="settings-user-name">{profile.name}</span>
                                        <span className="settings-user-email">{profile.email}</span>
                                    </div>
                                </div>
                                <img 
                                    src="/images/mingcute_right-fill.png" 
                                    alt="Chevron" 
                                    className="settings-chevron-right" 
                                />
                            </div>

                            {/* Section: Farm & Kandang */}
                            <h2 className="settings-section-title">Farm & Kandang</h2>

                            {cages.length > 0 ? (
                                /* Populated State (Image 1) */
                                <div className="settings-farm-card">
                                    <div 
                                        className="settings-farm-header"
                                        onClick={() => router.visit('/setup-kandang?edit=true')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="settings-farm-header-left">
                                            <div className="settings-farm-icon-container">
                                                <img 
                                                    src="/images/ooui_home.png" 
                                                    alt="Farm Icon" 
                                                    className="settings-farm-icon" 
                                                />
                                            </div>
                                            <div className="settings-user-info">
                                                <span className="settings-farm-name">{cages[0]?.farmName || 'peternakan gokil'}</span>
                                                <span className="settings-farm-subtext">LOKASI TERDAFTAR</span>
                                            </div>
                                        </div>
                                        <img 
                                            src="/images/mingcute_right-fill.png" 
                                            alt="Chevron" 
                                            className="settings-chevron-right" 
                                        />
                                    </div>

                                    <div className="settings-card-divider" />

                                    <div className="settings-cage-list">
                                        {cages.map((cage, index) => (
                                            <div key={index} className="settings-cage-item">
                                                <div className="settings-cage-item-left">
                                                    <span className="settings-cage-id">{cage.id}</span>
                                                    <span className="settings-cage-badge">{cage.status}</span>
                                                </div>
                                                <div className="settings-cage-item-right">
                                                    <span className="settings-cage-population">{cage.population}</span>
                                                    <button 
                                                        type="button" 
                                                        className="settings-cage-delete"
                                                        onClick={() => deleteCage(index)}
                                                        aria-label="Hapus Kandang"
                                                    >
                                                        <svg className="settings-cage-delete-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="3 6 5 6 21 6"></polyline>
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                            <line x1="10" y1="11" x2="10" y2="17"></line>
                                                            <line x1="14" y1="11" x2="14" y2="17"></line>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button 
                                        type="button" 
                                        className="settings-add-cage-btn"
                                        onClick={addCage}
                                    >
                                        <img 
                                            src="/images/fe_plus.png" 
                                            alt="Plus" 
                                            style={{ width: '12px', height: '12px', filter: 'invert(36%) sepia(21%) saturate(1142%) hue-rotate(78deg) brightness(97%) contrast(90%)' }} 
                                        />
                                        Tambah Kandang
                                    </button>
                                </div>
                            ) : (
                                /* Empty State (Image 3) */
                                <div className="settings-farm-card">
                                    <div className="settings-empty-state-container">
                                        <p className="settings-empty-state-text">Belum ada kandang terdaftar</p>
                                        <button 
                                            type="button" 
                                            className="settings-add-cage-btn"
                                            onClick={addCage}
                                        >
                                            <img 
                                                src="/images/fe_plus.png" 
                                                alt="Plus" 
                                                style={{ width: '12px', height: '12px', filter: 'invert(36%) sepia(21%) saturate(1142%) hue-rotate(78deg) brightness(97%) contrast(90%)' }} 
                                            />
                                            Setup Kandang Baru
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Section: Pengaturan Notifikasi */}
                            <h2 className="settings-section-title">Pengaturan Notifikasi</h2>

                            <div className="settings-notif-card">
                                {/* Notif 1 */}
                                <div className="settings-notif-item">
                                    <div className="settings-notif-left">
                                        <span className="settings-notif-icon-emoji">🔔</span>
                                        <span className="settings-notif-label">Input Harian (Pagi)</span>
                                    </div>
                                    <label className="ios-switch" aria-label="Input Harian (Pagi) Toggle">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.pagi}
                                            onChange={() => toggleNotif('pagi')}
                                        />
                                        <span className="ios-slider" />
                                    </label>
                                </div>

                                {/* Notif 2 */}
                                <div className="settings-notif-item">
                                    <div className="settings-notif-left">
                                        <span className="settings-notif-icon-emoji">🔔</span>
                                        <span className="settings-notif-label">Reminder ke-2 (Sore)</span>
                                    </div>
                                    <label className="ios-switch" aria-label="Reminder ke-2 (Sore) Toggle">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.sore}
                                            onChange={() => toggleNotif('sore')}
                                        />
                                        <span className="ios-slider" />
                                    </label>
                                </div>

                                {/* Notif 3 */}
                                <div className="settings-notif-item">
                                    <div className="settings-notif-left">
                                        <span className="settings-notif-icon-emoji">💉</span>
                                        <span className="settings-notif-label">Jadwal Vaksinasi</span>
                                    </div>
                                    <label className="ios-switch" aria-label="Jadwal Vaksinasi Toggle">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.vaksin}
                                            onChange={() => toggleNotif('vaksin')}
                                        />
                                        <span className="ios-slider" />
                                    </label>
                                </div>

                                {/* Notif 4 */}
                                <div className="settings-notif-item">
                                    <div className="settings-notif-left">
                                        <span className="settings-notif-icon-emoji">⚠️</span>
                                        <span className="settings-notif-label">Peringatan FCR & Mortalitas</span>
                                    </div>
                                    <label className="ios-switch" aria-label="Peringatan FCR & Mortalitas Toggle">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.fcr}
                                            onChange={() => toggleNotif('fcr')}
                                        />
                                        <span className="ios-slider" />
                                    </label>
                                </div>

                                {/* Notif 5 */}
                                <div className="settings-notif-item">
                                    <div className="settings-notif-left">
                                        <span className="settings-notif-icon-emoji">⚡</span>
                                        <span className="settings-notif-label">Peringatan Cuaca Ekstrem</span>
                                    </div>
                                    <label className="ios-switch" aria-label="Peringatan Cuaca Ekstrem Toggle">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.cuaca}
                                            onChange={() => toggleNotif('cuaca')}
                                        />
                                        <span className="ios-slider" />
                                    </label>
                                </div>

                                {/* Notif 6 */}
                                <div className="settings-notif-item">
                                    <div className="settings-notif-left">
                                        <span className="settings-notif-icon-emoji">💰</span>
                                        <span className="settings-notif-label">Rekomendasi Harga Pakan</span>
                                    </div>
                                    <label className="ios-switch" aria-label="Rekomendasi Harga Pakan Toggle">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.harga}
                                            onChange={() => toggleNotif('harga')}
                                        />
                                        <span className="ios-slider" />
                                    </label>
                                </div>

                                {/* Notif 7 */}
                                <div className="settings-notif-item">
                                    <div className="settings-notif-left">
                                        <span className="settings-notif-icon-emoji">⏰</span>
                                        <span className="settings-notif-label">Countdown Withdrawal Obat</span>
                                    </div>
                                    <label className="ios-switch" aria-label="Countdown Withdrawal Obat Toggle">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.withdrawal}
                                            onChange={() => toggleNotif('withdrawal')}
                                        />
                                        <span className="ios-slider" />
                                    </label>
                                </div>
                            </div>

                            {/* Keluar Dari Akun Button */}
                            <Link 
                                href="/logout" 
                                method="post" 
                                as="button" 
                                className="logout-btn"
                            >
                                <svg className="logout-btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                Keluar Dari Akun
                            </Link>
                        </>
                    )}
                </div>

                {/* Custom Confirmation Modal */}
                {showConfirmModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2 className="modal-title">Konfirmasi Perubahan</h2>
                            <p className="modal-text">Apakah anda yakin ingin melakukan perubahan?</p>
                            <div className="modal-buttons">
                                <button 
                                    type="button" 
                                    className="modal-btn cancel" 
                                    onClick={() => setShowConfirmModal(false)}
                                >
                                    Tidak
                                </button>
                                <button 
                                    type="button" 
                                    className="modal-btn confirm" 
                                    onClick={handleConfirmProfileChange}
                                >
                                    Iya
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Navigation */}
                <BottomNav activeTab="profil" />
            </div>
        </>
    );
}
