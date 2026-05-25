export default function AIRecommendation() {
    return (
        <div className="ai-card">
            <div className="ai-content">
                <div className="ai-label">Rekomendasi AI :</div>
                <p className="ai-text">
                    Curah hujan tinggi terdeteksi pada hari selasa.
                    Pastikan ventilasi kandang optimal.
                </p>
            </div>
            <div className="ai-mascot">
                <img
                    src="/images/image 3.png"
                    alt="AI Mascot"
                    width={64}
                    height={64}
                    loading="lazy"
                />
            </div>
        </div>
    );
}
