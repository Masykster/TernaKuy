import AngonkuLogo from '@/Components/AngonkuLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="guest-layout">
            <div className="guest-layout-inner">
                {/* Logo */}
                <div className="guest-logo-section">
                    <Link href="/">
                        <AngonkuLogo size={48} showText={true} />
                    </Link>
                </div>

                {/* Form Card */}
                <div className="guest-card">
                    {children}
                </div>

                {/* Footer */}
                <p className="guest-footer">
                    © 2026 Angonku.id — Manajemen Peternakan Cerdas
                </p>
            </div>
        </div>
    );
}
