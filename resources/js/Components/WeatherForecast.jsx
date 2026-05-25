import { useState } from 'react';

export default function WeatherForecast({ forecast = [] }) {
    const [showForecastModal, setShowForecastModal] = useState(false);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);

    // Generate 14 days (2 weeks) forecast, and for each day, generate 8 hourly forecasts (BMKG style)
    const generateTwoWeeksForecast = () => {
        const today = new Date();
        const days = [];
        
        const weatherTypes = [
            { desc: 'Cerah', icon: '☀️', tempRange: [31, 34], humidityRange: [50, 65], windSpeed: '8 km/j', windDir: 'Timur', visibility: '> 10 km' },
            { desc: 'Cerah Berawan', icon: '🌤️', tempRange: [29, 32], humidityRange: [60, 75], windSpeed: '6 km/j', windDir: 'Barat Daya', visibility: '> 10 km' },
            { desc: 'Berawan', icon: '☁️', tempRange: [27, 29], humidityRange: [70, 80], windSpeed: '4 km/j', windDir: 'Selatan', visibility: '> 10 km' },
            { desc: 'Hujan Ringan', icon: '🌧️', tempRange: [25, 27], humidityRange: [80, 90], windSpeed: '8 km/j', windDir: 'Barat', visibility: '8 km' },
            { desc: 'Hujan Petir', icon: '⛈️', tempRange: [24, 26], humidityRange: [85, 95], windSpeed: '12 km/j', windDir: 'Barat Laut', visibility: '5 km' },
        ];

        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const monthNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];

        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const dayName = dayNames[date.getDay()];
            const dayNum = date.getDate();
            const monthName = monthNames[date.getMonth()];
            const dateLabel = `${dayName}, ${dayNum} ${monthName}`;

            // Seed a stable random weather type for the day
            const daySeed = (dayNum * 17 + i * 5) % 100;
            let dayWeather = weatherTypes[1]; // default cerah berawan
            if (daySeed < 20) {
                dayWeather = weatherTypes[0]; // Cerah
            } else if (daySeed < 50) {
                dayWeather = weatherTypes[1]; // Cerah Berawan
            } else if (daySeed < 75) {
                dayWeather = weatherTypes[2]; // Berawan
            } else if (daySeed < 90) {
                dayWeather = weatherTypes[3]; // Hujan Ringan
            } else {
                dayWeather = weatherTypes[4]; // Hujan Petir
            }

            // Generate hourly data (8 intervals: 00:00 to 21:00 every 3 hours)
            const hours = ['00.00', '03.00', '06.00', '09.00', '12.00', '15.00', '18.00', '21.00'];
            const hourlyData = hours.map((hour, hIndex) => {
                const hourNum = parseInt(hour);
                const hourSeed = (dayNum * 7 + hIndex * 13) % 100;

                // Adjust weather type based on hour (night cooler, noon hotter)
                let type = { ...dayWeather };
                if (hourNum >= 11 && hourNum <= 15) {
                    if (daySeed > 60) {
                        type = weatherTypes[4];
                    }
                    type.temp = type.tempRange[1] - (hourSeed % 2);
                    type.humidity = type.humidityRange[0] + (hourSeed % 10);
                } else if (hourNum >= 0 && hourNum <= 6) {
                    type.temp = type.tempRange[0] - (hourSeed % 2);
                    type.humidity = type.humidityRange[1] - (hourSeed % 10);
                    if (type.icon === '☀️') type.icon = '🌙';
                    if (type.icon === '🌤️') type.icon = '🌙';
                } else {
                    type.temp = Math.round((type.tempRange[0] + type.tempRange[1]) / 2) + (hourSeed % 2 - 1);
                    type.humidity = Math.round((type.humidityRange[0] + type.humidityRange[1]) / 2) + (hourSeed % 10 - 5);
                }

                const speedVal = parseInt(type.windSpeed) + (hourSeed % 4 - 2);
                type.windSpeed = `${Math.max(2, speedVal)} km/j`;

                return {
                    hour,
                    desc: type.desc,
                    icon: type.icon,
                    temp: type.temp,
                    humidity: type.humidity,
                    windSpeed: type.windSpeed,
                    windDir: type.windDir,
                    visibility: type.visibility,
                };
            });

            days.push({
                dateLabel,
                shortDay: `${dayName.slice(0, 3)}, ${dayNum}`,
                hourlyData,
                icon: dayWeather.icon,
                temp: Math.round((dayWeather.tempRange[0] + dayWeather.tempRange[1]) / 2),
            });
        }

        return days;
    };

    const twoWeeksForecast = generateTwoWeeksForecast();

    // Format the date using local device's timezone and calendar calculation for dashboard list
    const formattedForecast = forecast.map((item, index) => {
        let dayLabel = 'Hari ini';
        if (index === 0) {
            dayLabel = 'Hari ini';
        } else if (index === 1) {
            dayLabel = 'Besok';
        } else {
            const date = new Date(item.date);
            const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
            dayLabel = dayNames[date.getDay()];
        }

        return {
            day: dayLabel,
            temp: item.temp,
            desc: item.desc,
            icon: item.icon,
            humidity: item.humidity,
            active: index === 0,
            alert: item.alert,
        };
    });

    return (
        <div className="weather-section">
            <div className="weather-header">
                <h3 className="weather-title">CUACA 7 HARI KEDEPAN</h3>
                <button 
                    onClick={() => setShowForecastModal(true)} 
                    className="weather-link" 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit', padding: 0 }}
                >
                    Lihat detail
                    <img
                        src="/images/mingcute_right-fill.png"
                        alt=""
                        width={12}
                        height={12}
                        className="weather-link-icon-img"
                        loading="lazy"
                    />
                </button>
            </div>

            {/* BMKG 2-Week Hourly Weather Modal */}
            {showForecastModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 100000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                    }}
                    onClick={() => setShowForecastModal(false)}
                >
                    <div
                        style={{
                            width: '100%',
                            maxWidth: '410px',
                            backgroundColor: '#F7F3ED',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                            maxHeight: '90vh',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div
                            style={{
                                backgroundColor: '#2D6A4F',
                                color: 'white',
                                padding: '16px 20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <div>
                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', letterSpacing: '0.3px' }}>Prakiraan Cuaca BMKG</h4>
                                <span style={{ fontSize: '11px', opacity: 0.85, fontWeight: '600' }}>Sidoarjo, Jawa Timur</span>
                            </div>
                            <button
                                onClick={() => setShowForecastModal(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    color: 'white',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    fontSize: '18px',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                            }}
                        >
                            {/* Horizontal Day Tabs Scroll */}
                            <div style={{ flexShrink: 0 }}>
                                <span style={{ fontSize: '10px', fontWeight: '800', color: '#8C968C', display: 'block', marginBottom: '6px', letterSpacing: '0.3px' }}>
                                    PILIH HARI (2 MINGGU KEDEPAN)
                                </span>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '8px',
                                        overflowX: 'auto',
                                        paddingBottom: '6px',
                                        scrollbarWidth: 'none',
                                    }}
                                >
                                    {twoWeeksForecast.map((day, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedDayIndex(idx)}
                                            style={{
                                                flexShrink: 0,
                                                padding: '8px 12px',
                                                borderRadius: '12px',
                                                border: selectedDayIndex === idx ? '1.5px solid #2D6A4F' : '1.5px solid #E2E8F0',
                                                backgroundColor: selectedDayIndex === idx ? '#E8F5E9' : 'white',
                                                color: selectedDayIndex === idx ? '#2D6A4F' : '#1A2E1A',
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '2px',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            <span>{day.shortDay}</span>
                                            <span style={{ fontSize: '14px' }}>{day.icon}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* selected day label */}
                            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '12px 16px', border: '1.5px solid #E2E8F0' }}>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#8C968C' }}>HARI TERPILIH</span>
                                <h5 style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: '800', color: '#2D6A4F' }}>
                                    {twoWeeksForecast[selectedDayIndex].dateLabel}
                                </h5>
                            </div>

                            {/* BMKG Hourly Board Container */}
                            <div>
                                <span style={{ fontSize: '10px', fontWeight: '800', color: '#8C968C', display: 'block', marginBottom: '6px', letterSpacing: '0.3px' }}>
                                    PRAKIRAAN PER JAM (WIB) — GESER HORIZONTAL
                                </span>
                                
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '12px',
                                        overflowX: 'auto',
                                        padding: '4px 2px',
                                        scrollbarWidth: 'none',
                                    }}
                                >
                                    {twoWeeksForecast[selectedDayIndex].hourlyData.map((hourItem, hIdx) => (
                                        <div
                                            key={hIdx}
                                            style={{
                                                minWidth: '95px',
                                                backgroundColor: 'white',
                                                borderRadius: '16px',
                                                border: '1.5px solid #E2E8F0',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                overflow: 'hidden',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {/* Hour row */}
                                            <div style={{ backgroundColor: '#F1F5F1', padding: '6px 0', textAlign: 'center', fontSize: '11px', fontWeight: '800', color: '#2D6A4F', borderBottom: '1px solid #E2E8F0' }}>
                                                {hourItem.hour}
                                            </div>

                                            {/* Weather icon, temp, humidity */}
                                            <div style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', borderBottom: '1px dashed #E2E8F0' }}>
                                                <span style={{ fontSize: '26px', margin: '2px 0' }}>{hourItem.icon}</span>
                                                <span style={{ fontSize: '15px', fontWeight: '800', color: '#1A2E1A' }}>{hourItem.temp}°</span>
                                                <span style={{ fontSize: '10px', color: '#8C968C', fontWeight: '600' }}>
                                                    💧 {hourItem.humidity}%
                                                </span>
                                            </div>

                                            {/* Wind speed & dir */}
                                            <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', borderBottom: '1px dashed #E2E8F0', textAlign: 'center' }}>
                                                <span style={{ fontSize: '8px', fontWeight: '800', color: '#2D6A4F', letterSpacing: '0.2px' }}>ANGIN</span>
                                                <span style={{ fontSize: '10px', fontWeight: '700', color: '#1A2E1A', whiteSpace: 'nowrap' }}>{hourItem.windSpeed}</span>
                                                <span style={{ fontSize: '9px', color: '#8C968C', fontWeight: '600' }}>{hourItem.windDir}</span>
                                            </div>

                                            {/* Visibility */}
                                            <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textAlign: 'center' }}>
                                                <span style={{ fontSize: '8px', fontWeight: '800', color: '#8C968C', letterSpacing: '0.2px' }}>VISIBILITAS</span>
                                                <span style={{ fontSize: '10px', fontWeight: '700', color: '#1A2E1A' }}>{hourItem.visibility}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard 7-Day List View */}
            <div className="weather-scroll">
                {formattedForecast.map((item, index) => (
                    <div
                        key={index}
                        className={`weather-day ${item.active ? 'active' : ''} ${item.alert ? 'alert' : ''}`}
                    >
                        <div className="weather-day-label">{item.day}</div>
                        <div className="weather-icon">
                            <img
                                src={item.icon}
                                alt={item.desc}
                                width={36}
                                height={36}
                                loading="lazy"
                                className="weather-icon-img"
                            />
                        </div>
                        <div className="weather-temp">{item.temp}°C</div>
                        <div className="weather-desc">{item.desc}</div>
                        <div className="weather-humidity">
                            <img
                                src="/images/WATER.png"
                                alt="Kelembaban"
                                width={12}
                                height={12}
                                className="weather-humidity-icon-img"
                                loading="lazy"
                            />
                            {item.humidity}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
