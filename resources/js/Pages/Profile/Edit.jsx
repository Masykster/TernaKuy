import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import BottomNav from '@/Components/BottomNav';

export default function Edit({ auth }) {
    // Falls back to mock data if user is not authenticated (public preview)
    const user = auth?.user || {
        name: 'Cesya Aulia',
        email: 'cesyaaulia12@gmail.com',
    };

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

                    {/* Page Title */}
                    <h1 className="settings-title">Pengaturan</h1>

                    {/* User Card */}
                    <div className="settings-user-card">
                        <div className="settings-user-left">
                            <div className="settings-avatar-circle">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <div className="settings-user-info">
                                <span className="settings-user-name">{user.name}</span>
                                <span className="settings-user-email">{user.email}</span>
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
                            <div className="settings-farm-header">
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
                </div>

                {/* Bottom Navigation */}
                <BottomNav activeTab="profil" />
            </div>
        </>
    );
}
