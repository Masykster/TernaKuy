import { useState } from 'react';
import { Head, Link, usePage, router, useForm } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import MetricsSection from '@/Components/MetricsSection';
import WeatherForecast from '@/Components/WeatherForecast';
import AIRecommendation from '@/Components/AIRecommendation';
import ChatbotModal from '@/Components/ChatbotModal';

export default function Dashboard({ activeCycles = [], weather, weather_forecast = [], commodity = [], unread_notifications = 0, notifications = [] }) {
    const { auth } = usePage().props;
    const userName = auth?.user?.name === 'Test User' ? 'Pak Budi' : (auth?.user?.name || 'Pak Budi');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showChatbot, setShowChatbot] = useState(false);
    const [currentCycleIndex, setCurrentCycleIndex] = useState(0);

    const handleMarkAsRead = (notifId) => {
        router.patch(route('notifications.read', { id: notifId }), {}, {
            preserveScroll: true
        });
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return 'Selamat pagi,';
        if (hour >= 11 && hour < 15) return 'Selamat siang,';
        if (hour >= 15 && hour < 19) return 'Selamat sore,';
        return 'Selamat malam,';
    };

    // Default mock data matching the screenshot if no cycles exist in DB
    const activeCycle = activeCycles[currentCycleIndex] || (activeCycles[0] || {
        id: null,
        coop: { coop_code: 'K-01' },
        day_number: 18,
        doc_count: 2850,
        target_days: 35,
        latest_record: { 
            live_population: 2850,
            fcr_current: 1.72,
            mortality_rate: 5.0,
        },
        ip_score: 312,
        today_tasks: [],
    });

    const currentDay = activeCycle.day_number;
    const targetDays = activeCycle.target_days;
    const population = activeCycle.latest_record ? activeCycle.latest_record.live_population : activeCycle.doc_count;
    const progress = Math.min(100, Math.round((currentDay / targetDays) * 100));

    // Real today_tasks from backend
    const todayTasks = activeCycle.today_tasks || [];

    // Toggle task via backend
    const handleToggleTask = (task) => {
        if (!activeCycle.id) return;
        router.patch(route('timeline-tasks.toggle', { cycle: activeCycle.id, task: task.id }), {}, {
            preserveScroll: true,
        });
    };

    // Delete task
    const handleDeleteTask = (task) => {
        if (!activeCycle.id) return;
        router.delete(route('timeline-tasks.destroy', { cycle: activeCycle.id, task: task.id }), {
            preserveScroll: true,
        });
    };

    // Add task modal
    const [showAddTask, setShowAddTask] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        task_name: '',
        task_date: new Date().toISOString().split('T')[0],
        category: 'custom',
    });

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!activeCycle.id || !data.task_name.trim()) return;
        post(route('timeline-tasks.store', { cycle: activeCycle.id }), {
            preserveScroll: true,
            onSuccess: () => { reset(); setShowAddTask(false); },
        });
    };

    return (
        <>
            <Head title="Dashboard">
                <meta name="description" content="Dashboard monitoring peternakan ayam broiler — pantau siklus aktif, FCR, mortalitas, cuaca, dan agenda harian." />
            </Head>

            <div className="mobile-container" style={{ paddingBottom: '100px', backgroundColor: 'var(--color-bg)' }}>
                
                {/* HERO SECTION / ILLUSTRATION HEADER */}
                <div className="hero-section" style={{ minHeight: '220px', position: 'relative', overflow: 'hidden' }}>
                    <img
                        src="/images/Rectangle 3.png"
                        alt="Farm Scene"
                        className="hero-bg"
                        loading="eager"
                        width={430}
                        height={220}
                        style={{ height: '100%', width: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
                    />
                    
                    {/* Brand Logo & Circular Actions Header */}
                    <div className="app-header" style={{ paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                        <div className="app-logo" style={{ display: 'flex', alignItems: 'center' }}>
                            <img
                                src="/images/PRIMARY LOGO 2.png"
                                alt="Angonku.id"
                                width={100}
                                height={28}
                                style={{ height: '28px', objectFit: 'contain' }}
                            />
                        </div>
                        
                        <div className="header-actions" style={{ display: 'flex', gap: '8px' }}>
                            <Link href={route('cycles.index')} className="header-icon-btn" aria-label="Riwayat" style={{ backgroundColor: 'var(--color-forest)', width: '38px', height: '38px', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img
                                    src="/images/material-symbols_history-rounded.png"
                                    alt="History"
                                    width={20}
                                    height={20}
                                    style={{ width: '20px', height: '20px', filter: 'brightness(0) invert(1)' }}
                                />
                            </Link>
                            <button onClick={() => setShowNotifications(true)} className="header-icon-btn" aria-label="Notifikasi" style={{ backgroundColor: 'var(--color-forest)', width: '38px', height: '38px', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <img
                                    src="/images/mingcute_notification-fill.png"
                                    alt="Notification"
                                    width={20}
                                    height={20}
                                    style={{ width: '20px', height: '20px', filter: 'brightness(0) invert(1)' }}
                                />
                                {unread_notifications > 0 && (
                                    <span className="notification-badge" style={{ position: 'absolute', top: '-2px', right: '-2px', backgroundColor: 'var(--color-cherry)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {unread_notifications}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Greeting Text */}
                    <div className="greeting-section" style={{ padding: '16px 20px 24px', position: 'relative', zIndex: 10 }}>
                        <div className="greeting-text" style={{ fontSize: '15px', color: 'var(--color-text-dark)', fontWeight: '500' }}>{getGreeting()}</div>
                        <div className="greeting-name" style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-text-dark)', marginTop: '2px' }}>{userName}!</div>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div style={{ padding: '0 16px', marginTop: '-12px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 20 }}>
                    
                    {/* SIKLUS AKTIF CARD */}
                    <div style={{ position: 'relative' }}>
                        {activeCycles.length > 1 && (
                            <>
                                {/* Left Arrow */}
                                <button
                                    onClick={() => setCurrentCycleIndex((prev) => (prev > 0 ? prev - 1 : activeCycles.length - 1))}
                                    style={{
                                        position: 'absolute',
                                        left: '-12px',
                                        top: '75%',
                                        transform: 'translateY(-50%)',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: 'white',
                                        border: '1.5px solid var(--color-forest)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--color-forest)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        cursor: 'pointer',
                                        zIndex: 30,
                                    }}
                                    aria-label="Kandang sebelumnya"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </button>

                                {/* Right Arrow */}
                                <button
                                    onClick={() => setCurrentCycleIndex((prev) => (prev < activeCycles.length - 1 ? prev + 1 : 0))}
                                    style={{
                                        position: 'absolute',
                                        right: '-12px',
                                        top: '75%',
                                        transform: 'translateY(-50%)',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: 'white',
                                        border: '1.5px solid var(--color-forest)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--color-forest)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        cursor: 'pointer',
                                        zIndex: 30,
                                    }}
                                    aria-label="Kandang berikutnya"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </>
                        )}

                        <div className="cycle-card" style={{ margin: 0, padding: '18px 20px', backgroundColor: 'var(--color-forest)', borderRadius: '20px', color: 'white', boxShadow: '0 4px 15px rgba(50, 112, 57, 0.25)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div className="cycle-badge" style={{ backgroundColor: 'white', color: 'var(--color-forest)', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-forest)', display: 'inline-block' }} />
                                    SIKLUS AKTIF
                                </div>
                                <span style={{ backgroundColor: 'var(--color-wheat)', color: 'var(--color-text-dark)', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '10px' }}>
                                    Hari {currentDay}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Kandang {activeCycle.coop.coop_code}</h2>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (activeCycle.id) {
                                            router.visit(route('cycle.show', { cycle: activeCycle.id }));
                                        }
                                    }}
                                    className="cycle-arrow"
                                    style={{
                                        position: 'relative',
                                        zIndex: 99,
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        border: 'none',
                                        cursor: activeCycle.id ? 'pointer' : 'default',
                                    }}
                                    aria-label="Detail Kandang"
                                >
                                    <img
                                        src="/images/mingcute_right-fill.png"
                                        alt="Detail"
                                        width={18}
                                        height={18}
                                        style={{ width: '18px', height: '18px', filter: 'brightness(0) invert(1)' }}
                                    />
                                </button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', opacity: 0.9, marginBottom: '14px' }}>
                                <span>Populasi : {population.toLocaleString()} Ekor</span>
                                <span>(Target {targetDays} hari)</span>
                            </div>

                            {/* Progress Bar & Percentage Row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ flex: 1, height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', backgroundColor: 'var(--color-cherry)', width: `${progress}%`, borderRadius: '4px' }} />
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: '700', minWidth: '32px', textAlign: 'right' }}>{progress}%</span>
                            </div>
                        </div>
                    </div>

                    {/* METRICS ROW (FCR, MATI, INDEX) */}
                    <div style={{ margin: 0 }}>
                        <MetricsSection latestRecord={activeCycle.latest_record} ipScore={activeCycle.ip_score} />
                    </div>

                    {/* CUACA 7 HARI KEDEPAN */}
                    <div style={{ margin: 0 }}>
                        <WeatherForecast forecast={weather_forecast} />
                    </div>

                    {/* AI RECOMMENDATION CARD */}
                    <div style={{ margin: 0 }}>
                        <AIRecommendation />
                    </div>

                    {/* AGENDA HARI INI */}
                    <div className="input-group-card" style={{ margin: 0, padding: '18px 20px', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '18px' }}>📅</span>
                                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-dark)', margin: 0, letterSpacing: '0.3px' }}>AGENDA HARI INI</h3>
                            </div>
                            {activeCycle.id && (
                                <button
                                    onClick={() => setShowAddTask(!showAddTask)}
                                    style={{
                                        width: '28px', height: '28px', borderRadius: '8px',
                                        background: 'var(--color-forest)', color: 'white', border: 'none',
                                        fontSize: '16px', cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                        transition: 'transform 0.2s',
                                        transform: showAddTask ? 'rotate(45deg)' : 'rotate(0deg)',
                                    }}
                                    aria-label="Tambah agenda"
                                >+</button>
                            )}
                        </div>

                        {/* Add Task Inline Form */}
                        {showAddTask && (
                            <form onSubmit={handleAddTask} style={{
                                display: 'flex', gap: '8px', marginBottom: '14px',
                                padding: '12px', background: '#F7F9F7', borderRadius: '12px',
                            }}>
                                <input
                                    type="text"
                                    value={data.task_name}
                                    onChange={e => setData('task_name', e.target.value)}
                                    placeholder="Tambah agenda baru..."
                                    style={{
                                        flex: 1, border: '1.5px solid #D0D5D0', borderRadius: '10px',
                                        padding: '10px 12px', fontSize: '13px', outline: 'none',
                                        background: 'white', fontFamily: 'inherit',
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!data.task_name.trim() || processing}
                                    style={{
                                        padding: '10px 16px', borderRadius: '10px', border: 'none',
                                        background: data.task_name.trim() ? 'var(--color-forest)' : '#C8CFC8',
                                        color: 'white', fontWeight: '700', fontSize: '12px',
                                        cursor: data.task_name.trim() ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.2s', whiteSpace: 'nowrap',
                                    }}
                                >{processing ? '...' : 'Simpan'}</button>
                            </form>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '8px' }}>
                            {todayTasks.length === 0 && !showAddTask ? (
                                <div style={{ padding: '12px 0', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                                    Tidak ada agenda hari ini.
                                </div>
                            ) : (
                                todayTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                                    >
                                        <div
                                            onClick={() => handleToggleTask(task)}
                                            className={`agenda-checkbox ${task.is_done ? 'checked' : 'unchecked'}`}
                                            style={{ width: '22px', height: '22px', border: '2px solid #D0D5D0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                                        >
                                            {task.is_done && (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </div>
                                        <span
                                            onClick={() => handleToggleTask(task)}
                                            style={{
                                                flex: 1, fontSize: '14px', cursor: 'pointer',
                                                textDecoration: task.is_done ? 'line-through' : 'none',
                                                color: task.is_done ? '#8C968C' : '#1A2E1A',
                                                fontWeight: task.is_done ? '400' : '600',
                                            }}
                                        >
                                            {task.task_name}
                                        </span>
                                        {!task.is_system && (
                                            <button
                                                onClick={() => handleDeleteTask(task)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', opacity: 0.4 }}
                                                aria-label="Hapus"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

                {/* NOTIFICATION MODAL */}
                {showNotifications && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center'
                    }} onClick={() => setShowNotifications(false)}>
                        <div style={{
                            width: '100%',
                            maxWidth: '430px',
                            backgroundColor: 'white',
                            borderTopLeftRadius: '24px',
                            borderTopRightRadius: '24px',
                            maxHeight: '80%',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '24px 20px',
                            boxShadow: '0 -10px 25px rgba(0,0,0,0.15)',
                        }} onClick={(e) => e.stopPropagation()}>
                            {/* Drawer Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '18px' }}>🔔</span>
                                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-dark)', margin: 0 }}>Notifikasi</h3>
                                </div>
                                <button 
                                    onClick={() => setShowNotifications(false)}
                                    style={{ background: 'none', border: 'none', fontSize: '14px', color: '#94A3B8', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    Tutup
                                </button>
                            </div>

                            {/* List Container */}
                            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '10px' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px', padding: '30px 0' }}>
                                        Belum ada notifikasi baru.
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div 
                                            key={notif.id} 
                                            style={{
                                                backgroundColor: notif.is_read ? '#FFFFFF' : 'var(--color-red-light)',
                                                border: '1.5px solid',
                                                borderColor: notif.is_read ? '#E2E8F0' : 'rgba(209, 96, 61, 0.3)',
                                                borderRadius: '16px',
                                                padding: '14px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '6px',
                                                position: 'relative',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-dark)', margin: 0, paddingRight: '24px' }}>
                                                    {notif.title}
                                                </h4>
                                                {!notif.is_read && (
                                                    <button 
                                                        onClick={() => handleMarkAsRead(notif.id)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: 'var(--color-cherry)',
                                                            fontSize: '10px',
                                                            fontWeight: '800',
                                                            cursor: 'pointer',
                                                            padding: 0
                                                        }}
                                                    >
                                                        Tandai dibaca
                                                    </button>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                                                {notif.body}
                                            </p>
                                            <span style={{ fontSize: '9px', color: '#94A3B8', alignSelf: 'flex-end', marginTop: '2px' }}>
                                                {new Date(notif.created_at).toLocaleDateString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* CHATBOT MODAL */}
                <ChatbotModal isOpen={showChatbot} onClose={() => setShowChatbot(false)} />

                {/* FLOATING CHATBOT FAB — fixed position, always visible */}
                {!showChatbot && (
                    <button
                        onClick={() => setShowChatbot(true)}
                        style={{
                            position: 'fixed',
                            bottom: '90px',
                            right: '16px',
                            zIndex: 1000,
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))',
                            transition: 'transform 0.2s ease',
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        aria-label="Buka AI Chatbot"
                    >
                        <img
                            src="/images/Group 72.png"
                            alt="AI Chatbot"
                            width={56}
                            height={56}
                            loading="lazy"
                            style={{ width: '56px', height: '56px', borderRadius: '50%' }}
                        />
                    </button>
                )}

                {/* BOTTOM NAVIGATION */}
                <BottomNav activeTab="home" />
            </div>
        </>
    );
}

