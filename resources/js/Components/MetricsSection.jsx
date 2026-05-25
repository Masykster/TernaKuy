export default function MetricsSection({ latestRecord, ipScore }) {
    const fcrVal = latestRecord?.fcr_current;
    let fcrValueText = '-';
    let fcrStatus = 'neutral';
    let fcrStatusText = '-';
    let fcrIcon = '';

    if (fcrVal !== undefined && fcrVal !== null) {
        const val = parseFloat(fcrVal);
        fcrValueText = val.toFixed(2);
        if (val < 1.6) {
            fcrStatus = 'safe';
            fcrStatusText = 'AMAN';
            fcrIcon = '/images/iconamoon_shield-yes.png';
        } else {
            fcrStatus = 'warning';
            fcrStatusText = 'WASPADA';
            fcrIcon = '/images/typcn_warning-outline.png';
        }
    }

    const mrVal = latestRecord?.mortality_rate;
    let mrValueText = '-';
    let mrStatus = 'neutral';
    let mrStatusText = '-';
    let mrIcon = '';

    if (mrVal !== undefined && mrVal !== null) {
        const val = parseFloat(mrVal);
        mrValueText = `${val.toFixed(1)}%`;
        if (val <= 5.0) {
            mrStatus = 'safe';
            mrStatusText = 'AMAN';
            mrIcon = '/images/iconamoon_shield-yes.png';
        } else {
            mrStatus = 'warning';
            mrStatusText = 'WASPADA';
            mrIcon = '/images/typcn_warning-outline.png';
        }
    }

    let ipValueText = '-';
    let ipStatus = 'neutral';
    let ipStatusText = '-';
    let ipIcon = '';

    if (ipScore !== undefined && ipScore !== null) {
        const val = parseFloat(ipScore);
        ipValueText = Math.round(val).toString();
        if (val >= 325) {
            ipStatus = 'safe';
            ipStatusText = 'AMAN';
            ipIcon = '/images/iconamoon_shield-yes.png';
        } else {
            ipStatus = 'warning';
            ipStatusText = 'WASPADA';
            ipIcon = '/images/typcn_warning-outline.png';
        }
    }

    const metrics = [
        {
            label: 'FCR',
            value: fcrValueText,
            status: fcrStatus,
            statusText: fcrStatusText,
            icon: fcrIcon,
        },
        {
            label: 'MATI',
            value: mrValueText,
            status: mrStatus,
            statusText: mrStatusText,
            icon: mrIcon,
        },
        {
            label: 'INDEX',
            value: ipValueText,
            status: ipStatus,
            statusText: ipStatusText,
            icon: ipIcon,
        },
    ];

    return (
        <div className="metrics-section">
            {metrics.map((metric, index) => (
                <div key={index} className="metric-card">
                    <div className="metric-label">{metric.label}</div>
                    <div className="metric-value">{metric.value}</div>
                    <span 
                        className={`metric-status ${metric.status}`}
                        style={metric.status === 'neutral' ? { borderColor: '#CBD5E1', color: '#64748B' } : {}}
                    >
                        {metric.icon && (
                            <img
                                src={metric.icon}
                                alt=""
                                width={14}
                                height={14}
                                className="metric-status-icon-img"
                                loading="lazy"
                            />
                        )}
                        {metric.statusText}
                    </span>
                </div>
            ))}
        </div>
    );
}

