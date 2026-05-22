export default function WeatherForecast() {
    const weatherData = [
        { day: 'Hari ini', temp: 27, desc: 'Cerah', icon: '/images/CUACA - CERAH BERAWAN.png', humidity: 60, active: true, alert: false },
        { day: 'Besok', temp: 26, desc: 'Hujan Ringan', icon: '/images/HUJAN RINGAN.png', humidity: 75, active: false, alert: false },
        { day: 'Sab', temp: 29, desc: 'Berawan', icon: '/images/BERAWAN.png', humidity: 70, active: false, alert: false },
        { day: 'Min', temp: 31, desc: 'Cerah', icon: '/images/CUACA - CERAH BERAWAN.png', humidity: 60, active: false, alert: false },
        { day: 'Sen', temp: 33, desc: 'Hujan Ringan', icon: '/images/HUJAN RINGAN.png', humidity: 55, active: false, alert: false },
        { day: 'Sel', temp: 28, desc: 'Hujan Lebat', icon: '/images/HUJAN LEBAT.png', humidity: 85, active: false, alert: true },
        { day: 'Rab', temp: 30, desc: 'Berawan', icon: '/images/BERAWAN.png', humidity: 45, active: false, alert: false },
    ];

    return (
        <div className="weather-section">
            <div className="weather-header">
                <h3 className="weather-title">CUACA 7 HARI KEDEPAN</h3>
                <a className="weather-link" href="#">
                    Lihat detail
                    <img
                        src="/images/mingcute_right-fill.png"
                        alt=""
                        className="weather-link-icon-img"
                    />
                </a>
            </div>
            <div className="weather-scroll">
                {weatherData.map((item, index) => (
                    <div
                        key={index}
                        className={`weather-day ${item.active ? 'active' : ''} ${item.alert ? 'alert' : ''}`}
                    >
                        <div className="weather-day-label">{item.day}</div>
                        <div className="weather-icon">
                            <img
                                src={item.icon}
                                alt={item.desc}
                                className="weather-icon-img"
                            />
                        </div>
                        <div className="weather-temp">{item.temp}°C</div>
                        <div className="weather-desc">{item.desc}</div>
                        <div className="weather-humidity">
                            <img
                                src="/images/WATER.png"
                                alt="Kelembaban"
                                className="weather-humidity-icon-img"
                            />
                            {item.humidity}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
