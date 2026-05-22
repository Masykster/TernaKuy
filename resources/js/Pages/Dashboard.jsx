import { Head } from '@inertiajs/react';
import CycleCard from '@/Components/CycleCard';
import MetricsSection from '@/Components/MetricsSection';
import WeatherForecast from '@/Components/WeatherForecast';
import AIRecommendation from '@/Components/AIRecommendation';
import AgendaSection from '@/Components/AgendaSection';
import BottomNav from '@/Components/BottomNav';

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />

            <div className="mobile-container">
                <div className="main-scroll">
                    {/* Hero Section - full background */}
                    <div className="hero-section">
                        {/* Background farm illustration */}
                        <img
                            src="/images/Rectangle 3.png"
                            alt=""
                            className="hero-bg"
                            loading="eager"
                        />

                        {/* Status Bar */}
                        <div className="status-bar">
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

                        {/* App Header */}
                        <div className="app-header">
                            <div className="app-logo">
                                <img
                                    src="/images/PRIMARY LOGO 2.png"
                                    alt="Angonku.id"
                                    className="app-logo-img"
                                />
                            </div>
                            <div className="header-actions">
                                <button className="header-icon-btn" aria-label="Riwayat">
                                    <img
                                        src="/images/material-symbols_history-rounded.png"
                                        alt="Riwayat"
                                        className="header-icon-img"
                                    />
                                </button>
                                <button className="header-icon-btn" aria-label="Notifikasi">
                                    <img
                                        src="/images/mingcute_notification-fill.png"
                                        alt="Notifikasi"
                                        className="header-icon-img"
                                    />
                                    <span className="notification-badge">3</span>
                                </button>
                            </div>
                        </div>

                        {/* Greeting Text */}
                        <div className="greeting-section">
                            <p className="greeting-text">Selamat pagi,</p>
                            <h1 className="greeting-name">Pak Budi!</h1>
                        </div>

                        {/* Chicken mascot */}
                        <div className="greeting-chicken">
                            <img
                                src="/images/image 3.png"
                                alt="Chicken mascot"
                                loading="eager"
                            />
                        </div>
                    </div>

                    {/* Active Cycle Card */}
                    <div className="animate-in animate-delay-1">
                        <CycleCard />
                    </div>

                    {/* Metrics */}
                    <div className="animate-in animate-delay-2">
                        <MetricsSection />
                    </div>

                    {/* Weather Forecast */}
                    <div className="animate-in animate-delay-3">
                        <WeatherForecast />
                    </div>

                    {/* AI Recommendation */}
                    <div className="animate-in animate-delay-4">
                        <AIRecommendation />
                    </div>

                    {/* Agenda */}
                    <div className="animate-in animate-delay-5">
                        <AgendaSection />
                    </div>
                </div>

                {/* Floating AI Chat Button */}
                <button className="chat-mascot" aria-label="AI Assistant">
                    <img
                        src="/images/Group 72.png"
                        alt="AI Assistant"
                        loading="lazy"
                    />
                </button>

                {/* Bottom Navigation */}
                <BottomNav activeTab="home" />
            </div>
        </>
    );
}
