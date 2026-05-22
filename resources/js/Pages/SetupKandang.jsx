import { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function SetupKandang() {
    const [step, setStep] = useState(1);
    const [isEditing, setIsEditing] = useState(false);

    // Step 1 States
    const [namaFarm, setNamaFarm] = useState('');
    const [alamat, setAlamat] = useState('');
    const [showMap, setShowMap] = useState(false);
    const [leafletLoaded, setLeafletLoaded] = useState(false);

    // Step 2 States
    const [kodeKandang, setKodeKandang] = useState('');
    const [komoditas, setKomoditas] = useState(''); // 'Ayam', 'Bebek', 'Lele', 'Nila'
    const [luasKandang, setLuasKandang] = useState('');
    const [jumlahBibit, setJumlahBibit] = useState('');

    // Leaflet map refs & instances
    const mapInstanceRef = useRef(null);
    const markerInstanceRef = useRef(null);

    // Check if in edit mode on mount and load existing cage data
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('edit') === 'true') {
            setIsEditing(true);
            const storedCageData = localStorage.getItem('terna_kuy_cage_data');
            if (storedCageData) {
                try {
                    const data = JSON.parse(storedCageData);
                    setNamaFarm(data.namaFarm || '');
                    setAlamat(data.alamat || '');
                    setKodeKandang(data.kodeKandang || '');
                    setKomoditas(data.komoditas || '');
                    setLuasKandang(data.luasKandang || '');
                    setJumlahBibit(data.jumlahBibit || '');
                } catch (e) {
                    // ignore
                }
            }
        }
    }, []);

    // Dynamic Leaflet asset injection
    useEffect(() => {
        if (window.L) {
            setLeafletLoaded(true);
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
            setLeafletLoaded(true);
        };
        document.head.appendChild(script);
    }, []);

    // Map initialization when container mounts
    useEffect(() => {
        if (showMap && leafletLoaded && !mapInstanceRef.current) {
            // Setup default lat/lng
            const defaultLat = -7.3871;
            const defaultLng = 112.7194;

            // Wait a tick for the container div #setup-map to render
            setTimeout(() => {
                const mapEl = document.getElementById('setup-map');
                if (!mapEl) return;

                const map = window.L.map('setup-map', {
                    center: [defaultLat, defaultLng],
                    zoom: 15,
                    zoomControl: true
                });

                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(map);

                const marker = window.L.marker([defaultLat, defaultLng], {
                    draggable: true
                }).addTo(map);

                // Update location on dragend
                marker.on('dragend', () => {
                    const position = marker.getLatLng();
                    const lat = position.lat.toFixed(4);
                    const lng = position.lng.toFixed(4);
                    setAlamat(`Lokasi Peta: ${lat}, ${lng}`);
                });

                // Update location on map click
                map.on('click', (e) => {
                    const { lat, lng } = e.latlng;
                    marker.setLatLng([lat, lng]);
                    setAlamat(`Lokasi Peta: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                });

                mapInstanceRef.current = map;
                markerInstanceRef.current = marker;
            }, 100);
        }
    }, [showMap, leafletLoaded]);

    // Handle map toggling and cleanup
    const toggleMap = () => {
        if (showMap) {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerInstanceRef.current = null;
            }
            setShowMap(false);
        } else {
            setShowMap(true);
        }
    };

    // Geolocation handlers
    const handleGPSClick = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const coordStr = `Lokasi Otomatis: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                    setAlamat(coordStr);

                    if (mapInstanceRef.current && markerInstanceRef.current) {
                        mapInstanceRef.current.setView([lat, lng], 15);
                        markerInstanceRef.current.setLatLng([lat, lng]);
                    }
                },
                (error) => {
                    console.warn('Geolocation failed or permission denied, using mock fallback', error);
                    const mockCoordStr = 'Lokasi Otomatis: -7.3871, 112.7194';
                    setAlamat(mockCoordStr);

                    if (mapInstanceRef.current && markerInstanceRef.current) {
                        mapInstanceRef.current.setView([-7.3871, 112.7194], 15);
                        markerInstanceRef.current.setLatLng([-7.3871, 112.7194]);
                    }
                }
            );
        } else {
            const mockCoordStr = 'Lokasi Otomatis: -7.3871, 112.7194';
            setAlamat(mockCoordStr);
            if (mapInstanceRef.current && markerInstanceRef.current) {
                mapInstanceRef.current.setView([-7.3871, 112.7194], 15);
                markerInstanceRef.current.setLatLng([-7.3871, 112.7194]);
            }
        }
    };

    // Validation checks
    const step1Valid = namaFarm.trim() !== '' && alamat.trim() !== '';
    const step2Valid =
        kodeKandang.trim() !== '' &&
        komoditas !== '' &&
        luasKandang.trim() !== '' &&
        jumlahBibit.trim() !== '';

    // Next step navigation
    const handleNextStep = () => {
        if (step1Valid) {
            setStep(2);
        }
    };

    // Save configuration and redirect
    const handleSaveSetup = () => {
        if (step2Valid) {
            localStorage.setItem('terna_kuy_has_cage', 'true');
            const cageData = {
                namaFarm,
                alamat,
                kodeKandang,
                komoditas,
                luasKandang,
                jumlahBibit
            };
            localStorage.setItem('terna_kuy_cage_data', JSON.stringify(cageData));
            router.visit(isEditing ? '/profile' : '/');
        }
    };

    // Cleanup map on component unmount
    useEffect(() => {
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    const getCapacityState = () => {
        const luas = parseFloat(luasKandang);
        const bibit = parseInt(jumlahBibit);

        if (isNaN(luas) || isNaN(bibit) || luas <= 0 || bibit <= 0) {
            return null;
        }

        const recommendedArea = Math.ceil(bibit / 10);
        const density = bibit / luas;

        if (density > 10) {
            return {
                type: 'kurang',
                title: 'KALKULASI KAPASITAS',
                desc: `Kurang luas! Rekomendasi minimal ${recommendedArea} m²`
            };
        } else if (density >= 8) {
            return {
                type: 'pas',
                title: 'KALKULASI KAPASITAS',
                desc: 'Kapasitas pas maksimal'
            };
        } else {
            return {
                type: 'ideal',
                title: 'KALKULASI KAPASITAS',
                desc: 'Luas sangat ideal'
            };
        }
    };

    const renderCapacityWarning = () => {
        const cap = getCapacityState();
        if (!cap) return null;

        return (
            <div className={`capacity-card ${cap.type}`}>
                <div className="capacity-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                </div>
                <div className="capacity-text-col">
                    <span className="capacity-title">{cap.title}</span>
                    <span className="capacity-desc">{cap.desc}</span>
                </div>
            </div>
        );
    };

    return (
        <>
            <Head title="Setup Kandang" />

            <div className="mobile-container setup-page-container">
                <div className="main-scroll" style={{ flex: 1, paddingBottom: '20px' }}>
                    {/* Status Bar */}
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

                    {/* Step Title Header */}
                    <div className="setup-header-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {step === 2 && (
                                <button
                                    onClick={() => setStep(1)}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                                    aria-label="Kembali ke Step 1"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A2E1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </button>
                            )}
                            {step === 1 && (
                                <Link
                                    href={isEditing ? "/profile" : "/"}
                                    style={{ padding: '4px', display: 'flex', alignItems: 'center' }}
                                    aria-label={isEditing ? "Kembali ke Pengaturan" : "Kembali ke Dashboard"}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A2E1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </Link>
                            )}
                            <h1 className="setup-title">{isEditing ? 'Edit Setup' : 'Setup'}</h1>
                        </div>
                        <span className="setup-step-text">STEP {step} DARI 2</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="setup-progress-outer">
                        <div
                            className="setup-progress-inner"
                            style={{ width: step === 1 ? '50%' : '100%' }}
                        />
                    </div>

                    {/* Step Content */}
                    {step === 1 ? (
                        /* Step 1: Profil Peternakan */
                        <>
                            <h2 className="setup-section-title">{isEditing ? 'Edit Profil Peternakan' : 'Profil Peternakan'}</h2>
                            <div className="setup-card">
                                <label className="setup-input-label">NAMA FARM</label>
                                <div className="setup-input-container">
                                    <input
                                        type="text"
                                        className="setup-input"
                                        placeholder="contoh: Peternakan Pak Budi"
                                        value={namaFarm}
                                        onChange={(e) => setNamaFarm(e.target.value)}
                                    />
                                </div>

                                <label className="setup-input-label">ALAMAT LENGKAP</label>
                                <div className="setup-textarea-container">
                                    <textarea
                                        className="setup-textarea"
                                        placeholder="Masukkan alamat lengkap kandang"
                                        value={alamat}
                                        onChange={(e) => setAlamat(e.target.value)}
                                    />
                                </div>

                                <div className="setup-buttons-row">
                                    <button
                                        type="button"
                                        className="setup-action-btn setup-gps-btn"
                                        onClick={handleGPSClick}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        GPS Saya
                                    </button>
                                    <button
                                        type="button"
                                        className="setup-action-btn setup-map-btn"
                                        onClick={toggleMap}
                                    >
                                        Pilih di Peta
                                    </button>
                                </div>

                                {showMap && (
                                    <>
                                        <div id="setup-map" className="setup-map-container" />
                                        <p className="setup-map-note">
                                            LOKASI INI DIGUNAKAN UNTUK FITUR PERINGATAN CUACA OTOMATIS
                                        </p>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Step 2: Setup Kandang Pertama */
                        <>
                            <h2 className="setup-section-title">{isEditing ? 'Edit Setup Kandang' : 'Setup Kandang Pertama'}</h2>
                            <div className="setup-card">
                                <label className="setup-input-label">KODE KANDANG / TAMBAK</label>
                                <div className="setup-input-container">
                                    <input
                                        type="text"
                                        className="setup-input"
                                        placeholder="CONTOH: K-01"
                                        value={kodeKandang}
                                        onChange={(e) => setKodeKandang(e.target.value)}
                                    />
                                </div>

                                <label className="setup-input-label">PILIH JENIS KOMODITAS</label>
                                <div className="setup-commodity-grid">
                                    {['Ayam', 'Bebek', 'Lele', 'Nila'].map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            className={`commodity-select-btn ${komoditas === item ? 'active' : ''}`}
                                            onClick={() => setKomoditas(item)}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>

                                <label className="setup-input-label">LUAS KANDANG (M²)</label>
                                <div className="setup-input-container">
                                    <input
                                        type="number"
                                        className="setup-input"
                                        placeholder="Misal: 100"
                                        value={luasKandang}
                                        onChange={(e) => setLuasKandang(e.target.value)}
                                    />
                                </div>

                                <label className="setup-input-label">JUMLAH BIBIT (EKOR)</label>
                                <div className="setup-input-container">
                                    <input
                                        type="number"
                                        className="setup-input"
                                        placeholder="Berapa ekor bibit?"
                                        value={jumlahBibit}
                                        onChange={(e) => setJumlahBibit(e.target.value)}
                                    />
                                </div>

                                {renderCapacityWarning()}
                            </div>
                        </>
                    )}
                </div>

                {/* Sticky bottom submit button */}
                <div className="setup-footer">
                    {step === 1 ? (
                        <button
                            type="button"
                            className={`setup-footer-btn ${step1Valid ? 'active' : 'disabled'}`}
                            disabled={!step1Valid}
                            onClick={handleNextStep}
                        >
                            LANJUT
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={`setup-footer-btn ${step2Valid ? 'active' : 'disabled'}`}
                            disabled={!step2Valid}
                            onClick={handleSaveSetup}
                        >
                            {isEditing ? 'SIMPAN PERUBAHAN' : 'MULAI GUNAKAN'}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
