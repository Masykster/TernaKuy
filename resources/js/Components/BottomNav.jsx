import { Link } from '@inertiajs/react';

export default function BottomNav({ activeTab = 'home' }) {
    const tabs = [
        { id: 'home', label: 'Home', icon: HomeIcon, href: '/' },
        { id: 'timeline', label: 'Timeline', icon: TimelineIcon, href: null },
        { id: 'spacer', label: '', icon: null },
        { id: 'kesehatan', label: 'Kesehatan', icon: KesehatanIcon, href: null },
        { id: 'profil', label: 'Profil', icon: ProfilIcon, href: '/profile' },
    ];

    return (
        <>
            {/* FAB Button */}
            <Link href="/input-harian" className="fab-button" aria-label="Tambah">
                <img
                    src="/images/fe_plus.png"
                    alt="Tambah"
                    className="fab-icon-img"
                />
            </Link>

            {/* Bottom Nav */}
            <nav className="bottom-nav">
                {tabs.map((tab) => {
                    if (tab.id === 'spacer') {
                        return <div key="spacer" className="nav-spacer" />;
                    }
                    const Icon = tab.icon;
                    
                    if (tab.href) {
                        return (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            >
                                <span className="nav-icon">
                                    <Icon active={activeTab === tab.id} />
                                </span>
                                <span className="nav-label">{tab.label}</span>
                            </Link>
                        );
                    }

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            style={{ opacity: 0.6 }}
                        >
                            <span className="nav-icon">
                                <Icon active={activeTab === tab.id} />
                            </span>
                            <span className="nav-label">{tab.label}</span>
                        </button>
                    );
                })}
            </nav>
        </>
    );
}

function HomeIcon({ active }) {
    return (
        <img
            src="/images/ooui_home.png"
            alt="Home"
            className={`nav-icon-img ${active ? 'active' : ''}`}
        />
    );
}

function TimelineIcon({ active }) {
    return (
        <img
            src="/images/ri_time-fill.png"
            alt="Timeline"
            className={`nav-icon-img ${active ? 'active' : ''}`}
        />
    );
}

function KesehatanIcon({ active }) {
    return (
        <img
            src="/images/ix_health-filled.png"
            alt="Kesehatan"
            className={`nav-icon-img ${active ? 'active' : ''}`}
        />
    );
}

function ProfilIcon({ active }) {
    return (
        <img
            src="/images/iconamoon_profile-fill.png"
            alt="Profil"
            className={`nav-icon-img ${active ? 'active' : ''}`}
        />
    );
}
