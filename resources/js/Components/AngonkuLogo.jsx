export default function AngonkuLogo({ size = 28, showText = true, className = '' }) {
    return (
        <div className={`app-logo ${className}`}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="app-logo-icon"
            >
                {/* House shape */}
                <path
                    d="M50 8L10 40V90C10 93.3 12.7 96 16 96H84C87.3 96 90 93.3 90 90V40L50 8Z"
                    fill="#E8663B"
                />
                {/* Roof peak */}
                <path
                    d="M50 8L10 40H90L50 8Z"
                    fill="#E8663B"
                />
                {/* Chimney */}
                <rect x="70" y="16" width="10" height="20" rx="2" fill="#C45430" />
                {/* Chicken silhouette */}
                <path
                    d="M30 96V65C30 65 32 55 40 52C40 52 35 48 35 42C35 36 40 32 45 32C45 32 43 28 46 25C49 22 54 24 54 24C54 24 55 20 60 20C65 20 66 25 66 25C66 25 72 26 72 33C72 38 68 42 68 42L65 50C65 50 55 48 48 55C42 62 42 70 42 70V96"
                    fill="white"
                    opacity="0.95"
                />
                {/* Chicken eye */}
                <circle cx="55" cy="30" r="2.5" fill="#E8663B" />
                {/* Chicken beak */}
                <path d="M62 35L68 33L62 38Z" fill="#F8A03D" />
                {/* Chicken comb */}
                <path
                    d="M48 22C48 22 50 16 54 18C54 18 56 14 60 16C60 16 62 12 66 16"
                    stroke="#E8663B"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                />
            </svg>
            {showText && (
                <span className="app-logo-text">Angonku.id</span>
            )}
        </div>
    );
}
