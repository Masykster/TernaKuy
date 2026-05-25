import { Link, usePage } from '@inertiajs/react';

export default function BottomNav({ activeTab = 'home' }) {
    const { active_cycle_id } = usePage().props;
    const fabHref = active_cycle_id 
        ? route('cycles.records.create', { cycle: active_cycle_id }) 
        : route('cycle.create');

    const tabs = [
        { id: 'home', label: 'Home', icon: HomeIcon, href: '/' },
        { id: 'timeline', label: 'Timeline', icon: TimelineIcon, href: active_cycle_id ? route('cycle.show', { cycle: active_cycle_id }) : null },
        { id: 'spacer', label: '', icon: null },
        { id: 'kesehatan', label: 'Kesehatan', icon: KesehatanIcon, href: active_cycle_id ? route('cycles.health.index', { cycle: active_cycle_id }) : null },
        { id: 'profil', label: 'Profil', icon: ProfilIcon, href: '/profile' },
    ];

    return (
        <>
            {/* FAB Button */}
            <Link href={fabHref} className="fab-button" aria-label="Tambah">
                <img
                    src="/images/fe_plus.png"
                    alt="Tambah"
                    width={24}
                    height={24}
                    className="fab-icon-img"
                    loading="lazy"
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
            width={24}
            height={24}
            className={`nav-icon-img ${active ? 'active' : ''}`}
            loading="lazy"
        />
    );
}

function TimelineIcon({ active }) {
    return (
        <img
            src="/images/ri_time-fill.png"
            alt="Timeline"
            width={24}
            height={24}
            className={`nav-icon-img ${active ? 'active' : ''}`}
            loading="lazy"
        />
    );
}

function KesehatanIcon({ active }) {
    return (
        <img
            src="/images/ix_health-filled.png"
            alt="Kesehatan"
            width={24}
            height={24}
            className={`nav-icon-img ${active ? 'active' : ''}`}
            loading="lazy"
        />
    );
}

function ProfilIcon({ active }) {
    return (
        <img
            src="/images/iconamoon_profile-fill.png"
            alt="Profil"
            width={24}
            height={24}
            className={`nav-icon-img ${active ? 'active' : ''}`}
            loading="lazy"
        />
    );
}
