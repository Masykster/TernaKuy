import { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function SetupKandang({ dbFarm, dbCoop, farmId }) {
    const [step, setStep] = useState(1);
    const [isEditing, setIsEditing] = useState(false);

    // Step 1 States
    const [namaFarm, setNamaFarm] = useState('');
    const [alamat, setAlamat] = useState('');
    const [latitude, setLatitude] = useState(dbFarm?.latitude || '');
    const [longitude, setLongitude] = useState(dbFarm?.longitude || '');
    const [showMap, setShowMap] = useState(false);
    const [leafletLoaded, setLeafletLoaded] = useState(false);

    // Step 2 States
    const [kodeKandang, setKodeKandang] = useState('');
    const [komoditas, setKomoditas] = useState('Ayam'); // Default Ayam
    const [luasKandang, setLuasKandang] = useState('');
    const [jumlahBibit, setJumlahBibit] = useState('');
    const [targetDays, setTargetDays] = useState('35');

    useEffect(() => {
        if (!isEditing) {
            const recommended = { Ayam: '35', Bebek: '45', Lele: '90', Nila: '120' };
            setTargetDays(recommended[komoditas] || '35');
        }
    }, [komoditas, isEditing]);

    // Leaflet map refs & instances
    const mapInstanceRef = useRef(null);
    const markerInstanceRef = useRef(null);

    // Check if in edit mode on mount and load existing cage data
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('edit') === 'true') {
            setIsEditing(true);
            if (dbFarm) {
                setNamaFarm(dbFarm.name || '');
                setAlamat(dbFarm.address || '');
                setLatitude(dbFarm.latitude || '');
                setLongitude(dbFarm.longitude || '');
                const speciesMap = { broiler: 'Ayam', bebek: 'Bebek', lele: 'Lele', nila: 'Nila' };
                setKomoditas(speciesMap[dbFarm.species] || 'Ayam');
                if (dbCoop) {
                    setKodeKandang(dbCoop.coop_code || '');
                    setLuasKandang(dbCoop.area_m2 ? String(dbCoop.area_m2) : '');
                    setJumlahBibit(dbCoop.capacity ? String(dbCoop.capacity) : '');
                    setTargetDays(dbCoop.active_cycle_target_days ? String(dbCoop.active_cycle_target_days) : '35');
                }
            } else {
                const storedCageData = localStorage.getItem('terna_kuy_cage_data');
                if (storedCageData) {
                    try {
                        const data = JSON.parse(storedCageData);
                        setNamaFarm(data.namaFarm || '');
                        setAlamat(data.alamat || '');
                        setKodeKandang(data.kodeKandang || '');
                        setKomoditas(data.komoditas || 'Ayam');
                        setLuasKandang(data.luasKandang || '');
                        setJumlahBibit(data.jumlahBibit || '');
                        setTargetDays(data.targetDays || '35');
                    } catch (e) {
                        // ignore
                    }
                }
            }
        }
    }, [dbFarm, dbCoop]);

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

    // Helper for reverse geocoding using Nominatim API
    const getReverseGeocoding = async (lat, lng) => {
        setAlamat('Memuat alamat...');
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
                headers: {
                    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
                }
            });
            const geoData = await res.json();
            if (geoData && geoData.display_name) {
                let addr = geoData.display_name;
                addr = addr.replace(/, Indonesia$/, ''); // Clean up trailing country
                setAlamat(addr);
            } else {
                setAlamat(`Lokasi: ${lat}, ${lng}`);
            }
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            setAlamat(`Lokasi: ${lat}, ${lng}`);
        }
    };

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
                    const latVal = position.lat.toFixed(7);
                    const lngVal = position.lng.toFixed(7);
                    setLatitude(latVal);
                    setLongitude(lngVal);
                    getReverseGeocoding(latVal, lngVal);
                });

                // Update location on map click
                map.on('click', (e) => {
                    const { lat, lng } = e.latlng;
                    marker.setLatLng([lat, lng]);
                    const latVal = lat.toFixed(7);
                    const lngVal = lng.toFixed(7);
                    setLatitude(latVal);
                    setLongitude(lngVal);
                    getReverseGeocoding(latVal, lngVal);
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
            setAlamat('Memuat lokasi GPS...');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const latVal = lat.toFixed(7);
                    const lngVal = lng.toFixed(7);
                    setLatitude(latVal);
                    setLongitude(lngVal);
                    getReverseGeocoding(latVal, lngVal);

                    if (mapInstanceRef.current && markerInstanceRef.current) {
                        mapInstanceRef.current.setView([lat, lng], 15);
                        markerInstanceRef.current.setLatLng([lat, lng]);
                    }
                },
                (error) => {
                    console.warn('Geolocation failed or permission denied, using mock fallback', error);
                    const mockLat = -7.3871;
                    const mockLng = 112.7194;
                    const latVal = mockLat.toFixed(7);
                    const lngVal = mockLng.toFixed(7);
                    setLatitude(latVal);
                    setLongitude(lngVal);
                    getReverseGeocoding(latVal, lngVal);

                    if (mapInstanceRef.current && markerInstanceRef.current) {
                        mapInstanceRef.current.setView([mockLat, mockLng], 15);
                        markerInstanceRef.current.setLatLng([mockLat, mockLng]);
                    }
                }
            );
        } else {
            const mockLat = -7.3871;
            const mockLng = 112.7194;
            const latVal = mockLat.toFixed(7);
            const lngVal = mockLng.toFixed(7);
            setLatitude(latVal);
            setLongitude(lngVal);
            getReverseGeocoding(latVal, lngVal);
            if (mapInstanceRef.current && markerInstanceRef.current) {
                mapInstanceRef.current.setView([mockLat, mockLng], 15);
                markerInstanceRef.current.setLatLng([mockLat, mockLng]);
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
            // Local fallback
            localStorage.setItem('terna_kuy_has_cage', 'true');
            const cageData = {
                namaFarm,
                alamat,
                kodeKandang,
                komoditas,
                luasKandang,
                jumlahBibit,
                targetDays
            };
            localStorage.setItem('terna_kuy_cage_data', JSON.stringify(cageData));
            
            // Database update/save
            router.post(route('setup-kandang.save'), {
                namaFarm,
                alamat,
                latitude,
                longitude,
                kodeKandang,
                luasKandang,
                jumlahBibit,
                komoditas,
                is_editing: isEditing,
                target_days: targetDays,
                farm_id: farmId || new URLSearchParams(window.location.search).get('farm_id')
            });
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

                                <label className="setup-input-label">TARGET SIKLUS (HARI)</label>
                                <div className="setup-input-container">
                                    <input
                                        type="number"
                                        className="setup-input"
                                        placeholder="Misal: 35"
                                        value={targetDays}
                                        onChange={(e) => setTargetDays(e.target.value)}
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
