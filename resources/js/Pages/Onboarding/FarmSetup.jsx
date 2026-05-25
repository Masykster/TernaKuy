import { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function FarmSetup() {
    const [step, setStep] = useState(1);
    const [showMap, setShowMap] = useState(false);
    const [leafletLoaded, setLeafletLoaded] = useState(false);

    // Leaflet map refs & instances
    const mapInstanceRef = useRef(null);
    const markerInstanceRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        farm_name: '',
        farm_address: '',
        latitude: '',
        longitude: '',
        coop_code: '',
        coop_type: 'open_house',
        capacity: '',
    });

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
        setData('farm_address', 'Memuat alamat...');
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
                setData(prev => ({
                    ...prev,
                    farm_address: addr
                }));
            } else {
                setData(prev => ({
                    ...prev,
                    farm_address: `Lokasi: ${lat}, ${lng}`
                }));
            }
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            setData(prev => ({
                ...prev,
                farm_address: `Lokasi: ${lat}, ${lng}`
            }));
        }
    };

    // Map initialization when container mounts
    useEffect(() => {
        if (showMap && leafletLoaded && !mapInstanceRef.current) {
            const defaultLat = data.latitude || -7.3871;
            const defaultLng = data.longitude || 112.7194;

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
                    setData(prev => ({
                        ...prev,
                        latitude: latVal,
                        longitude: lngVal
                    }));
                    getReverseGeocoding(latVal, lngVal);
                });

                // Update location on map click
                map.on('click', (e) => {
                    const { lat, lng } = e.latlng;
                    marker.setLatLng([lat, lng]);
                    const latVal = lat.toFixed(7);
                    const lngVal = lng.toFixed(7);
                    setData(prev => ({
                        ...prev,
                        latitude: latVal,
                        longitude: lngVal
                    }));
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
            setData(prev => ({
                ...prev,
                farm_address: 'Memuat lokasi GPS...'
            }));
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const latVal = lat.toFixed(7);
                    const lngVal = lng.toFixed(7);
                    
                    setData(prev => ({
                        ...prev,
                        latitude: latVal,
                        longitude: lngVal
                    }));
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
                    
                    setData(prev => ({
                        ...prev,
                        latitude: latVal,
                        longitude: lngVal
                    }));
                    getReverseGeocoding(latVal, lngVal);

                    if (mapInstanceRef.current && markerInstanceRef.current) {
                        mapInstanceRef.current.setView([mockLat, mockLng], 15);
                        markerInstanceRef.current.setLatLng([mockLat, mockLng]);
                    }
                }
            );
        }
    };

    // Validation checks
    const step1Valid = data.farm_name.trim() !== '';
    const step2Valid = data.coop_code.trim() !== '' && data.coop_type !== '' && data.capacity !== '';

    const handleNextStep = () => {
        if (step1Valid) {
            setStep(2);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (step2Valid) {
            post(route('onboarding.store'));
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

    return (
        <>
            <Head title="Setup Peternakan & Kandang" />

            <div className="mobile-container setup-page-container">
                <form onSubmit={handleSubmit} className="main-scroll" style={{ flex: 1, paddingBottom: '20px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>


                    {/* Step Title Header */}
                    <div className="setup-header-row" style={{ padding: '0 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {step === 2 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                                    aria-label="Kembali ke Step 1"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A2E1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </button>
                            )}
                            <h1 className="setup-title" style={{ margin: 0 }}>Onboarding</h1>
                        </div>
                        <span className="setup-step-text">STEP {step} DARI 2</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="setup-progress-outer" style={{ margin: '12px 20px 20px' }}>
                        <div
                            className="setup-progress-inner"
                            style={{ width: step === 1 ? '50%' : '100%', height: '100%', transition: 'width 0.3s ease' }}
                        />
                    </div>

                    {/* Step Content */}
                    <div style={{ flex: 1, padding: '0 20px' }}>
                        {step === 1 ? (
                            /* Step 1: Profil Peternakan */
                            <>
                                <h2 className="setup-section-title">Profil Peternakan</h2>
                                <div className="setup-card">
                                    <label className="setup-input-label">NAMA FARM</label>
                                    <div className="setup-input-container">
                                        <input
                                            type="text"
                                            className="setup-input"
                                            placeholder="contoh: Peternakan Pak Budi"
                                            value={data.farm_name}
                                            onChange={(e) => setData('farm_name', e.target.value)}
                                        />
                                    </div>
                                    {errors.farm_name && <div className="error-message" style={{ color: 'red', fontSize: '11px', marginTop: '-8px', marginBottom: '8px' }}>{errors.farm_name}</div>}

                                    <label className="setup-input-label">ALAMAT LENGKAP</label>
                                    <div className="setup-textarea-container">
                                        <textarea
                                            className="setup-textarea"
                                            placeholder="Masukkan alamat lengkap kandang"
                                            value={data.farm_address}
                                            onChange={(e) => setData('farm_address', e.target.value)}
                                        />
                                    </div>
                                    {errors.farm_address && <div className="error-message" style={{ color: 'red', fontSize: '11px', marginTop: '-8px', marginBottom: '8px' }}>{errors.farm_address}</div>}

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
                                            <div id="setup-map" className="setup-map-container" style={{ height: '180px', borderRadius: '12px', marginTop: '14px', border: '1.5px solid #F5EAD6' }} />
                                            <p className="setup-map-note" style={{ fontSize: '10px', color: '#6B7B6B', marginTop: '6px', textAlign: 'center' }}>
                                                LOKASI INI DIGUNAKAN UNTUK FITUR PERINGATAN CUACA OTOMATIS
                                            </p>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Step 2: Setup Kandang Pertama */
                            <>
                                <h2 className="setup-section-title">Setup Kandang Pertama</h2>
                                <div className="setup-card">
                                    <label className="setup-input-label">KODE KANDANG</label>
                                    <div className="setup-input-container">
                                        <input
                                            type="text"
                                            className="setup-input"
                                            placeholder="CONTOH: K-01"
                                            value={data.coop_code}
                                            onChange={(e) => setData('coop_code', e.target.value)}
                                        />
                                    </div>
                                    {errors.coop_code && <div className="error-message" style={{ color: 'red', fontSize: '11px', marginTop: '-8px', marginBottom: '8px' }}>{errors.coop_code}</div>}

                                    <label className="setup-input-label">TIPE KANDANG</label>
                                    <div className="setup-commodity-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                                        {[
                                            { value: 'open_house', label: 'Open House' },
                                            { value: 'close_house', label: 'Close House' }
                                        ].map((item) => (
                                            <button
                                                key={item.value}
                                                type="button"
                                                className={`commodity-select-btn ${data.coop_type === item.value ? 'active' : ''}`}
                                                onClick={() => setData('coop_type', item.value)}
                                                style={{ padding: '12px 8px', borderRadius: '12px', border: '1.5px solid #F5EAD6', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.coop_type && <div className="error-message" style={{ color: 'red', fontSize: '11px', marginTop: '-8px', marginBottom: '8px' }}>{errors.coop_type}</div>}

                                    <label className="setup-input-label">KAPASITAS (EKOR)</label>
                                    <div className="setup-input-container">
                                        <input
                                            type="number"
                                            className="setup-input"
                                            placeholder="Berapa ekor bibit?"
                                            value={data.capacity}
                                            onChange={(e) => setData('capacity', e.target.value)}
                                        />
                                    </div>
                                    {errors.capacity && <div className="error-message" style={{ color: 'red', fontSize: '11px', marginTop: '-8px', marginBottom: '8px' }}>{errors.capacity}</div>}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Sticky bottom submit button */}
                    <div className="setup-footer" style={{ padding: '16px 20px', background: 'var(--color-bg)' }}>
                        {step === 1 ? (
                            <button
                                type="button"
                                className={`setup-footer-btn ${step1Valid ? 'active' : 'disabled'}`}
                                disabled={!step1Valid}
                                onClick={handleNextStep}
                                style={{ width: '100%', padding: '14px', borderRadius: '20px', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer' }}
                            >
                                LANJUT
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className={`setup-footer-btn ${step2Valid && !processing ? 'active' : 'disabled'}`}
                                disabled={!step2Valid || processing}
                                style={{ width: '100%', padding: '14px', borderRadius: '20px', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer' }}
                            >
                                {processing ? 'MEMPROSES...' : 'MULAI GUNAKAN PIBOFARM'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
}
