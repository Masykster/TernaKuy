export default function MetricsSection() {
    const metrics = [
        {
            label: 'FCR',
            value: '1.72',
            status: 'warning',
            statusText: 'WASPADA',
            icon: '/images/typcn_warning-outline.png',
        },
        {
            label: 'MATI',
            value: '5.0%',
            status: 'safe',
            statusText: 'AMAN',
            icon: '/images/iconamoon_shield-yes.png',
        },
        {
            label: 'INDEX',
            value: '312',
            status: 'warning',
            statusText: 'WASPADA',
            icon: '/images/typcn_warning-outline.png',
        },
    ];

    return (
        <div className="metrics-section">
            {metrics.map((metric, index) => (
                <div key={index} className="metric-card">
                    <div className="metric-label">{metric.label}</div>
                    <div className="metric-value">{metric.value}</div>
                    <span className={`metric-status ${metric.status}`}>
                        <img
                            src={metric.icon}
                            alt=""
                            className="metric-status-icon-img"
                        />
                        {metric.statusText}
                    </span>
                </div>
            ))}
        </div>
    );
}
