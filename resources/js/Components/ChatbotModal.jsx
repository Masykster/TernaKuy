import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function ChatbotModal({ isOpen, onClose }) {
    const [messages, setMessages] = useState([
        {
            role: 'model',
            text: 'Halo! 👋 Saya **Angon AI**, asisten peternakan pintarmu.\n\nSaya bisa bantu:\n🐔 Identifikasi jenis ternak\n🩺 Diagnosa penyakit dari foto\n🌾 Saran pakan & manajemen\n\nKirim foto atau tanya apa saja!',
        },
    ]);
    const [input, setInput] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSend = async () => {
        const text = input.trim();
        if (!text && !imageFile) return;

        const userMsg = {
            role: 'user',
            text: text || '(mengirim gambar)',
            image: imagePreview,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // Build history for context (last 10 messages, text only)
        const history = messages
            .filter((m) => m.text)
            .slice(-10)
            .map((m) => ({ role: m.role, text: m.text }));

        try {
            const formData = new FormData();
            formData.append('message', text || 'Tolong analisis gambar ini');
            formData.append('history', JSON.stringify(history));

            if (imageFile) {
                formData.append('image', imageFile);
            }

            const response = await axios.post(route('chatbot.chat'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setMessages((prev) => [
                ...prev,
                { role: 'model', text: response.data.reply },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'model',
                    text: 'Maaf, terjadi kesalahan. Silakan coba lagi. 🙏',
                },
            ]);
        } finally {
            setIsLoading(false);
            removeImage();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Simple markdown-like renderer for bold and newlines
    const renderText = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => (
            <span key={i}>
                {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j}>{part.slice(2, -2)}</strong>;
                    }
                    return <span key={j}>{part}</span>;
                })}
                {i < text.split('\n').length - 1 && <br />}
            </span>
        ));
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#F7F3ED',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '430px',
                margin: '0 auto',
            }}
        >
            {/* HEADER */}
            <div
                style={{
                    backgroundColor: '#2D6A4F',
                    color: 'white',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexShrink: 0,
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.15)',
                        border: 'none',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                    }}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                </button>
                <div
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        backgroundColor: 'transparent',
                        flexShrink: 0,
                    }}
                >
                    <img
                        src="/images/Group 72.png"
                        alt="Angon AI"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                </div>
                <div>
                    <h1
                        style={{
                            fontSize: '15px',
                            fontWeight: '800',
                            margin: 0,
                        }}
                    >
                        Angon AI
                    </h1>
                    <span
                        style={{
                            fontSize: '10px',
                            opacity: 0.85,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}
                    >
                        <span
                            style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#4ADE80',
                                display: 'inline-block',
                            }}
                        />
                        Online · Powered by Groq
                    </span>
                </div>
            </div>

            {/* MESSAGES */}
            <div
                ref={scrollRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                }}
            >
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            display: 'flex',
                            justifyContent:
                                msg.role === 'user' ? 'flex-end' : 'flex-start',
                        }}
                    >
                        <div
                            style={{
                                maxWidth: '85%',
                                padding: '12px 14px',
                                borderRadius:
                                    msg.role === 'user'
                                        ? '16px 16px 4px 16px'
                                        : '16px 16px 16px 4px',
                                backgroundColor:
                                    msg.role === 'user' ? '#2D6A4F' : 'white',
                                color:
                                    msg.role === 'user'
                                        ? 'white'
                                        : '#1A2E1A',
                                fontSize: '13px',
                                lineHeight: 1.5,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                wordBreak: 'break-word',
                            }}
                        >
                            {msg.image && (
                                <img
                                    src={msg.image}
                                    alt="Uploaded"
                                    style={{
                                        width: '100%',
                                        maxWidth: '200px',
                                        borderRadius: '10px',
                                        marginBottom: '8px',
                                        display: 'block',
                                    }}
                                />
                            )}
                            {renderText(msg.text)}
                        </div>
                    </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div
                            style={{
                                padding: '12px 18px',
                                borderRadius: '16px 16px 16px 4px',
                                backgroundColor: 'white',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                display: 'flex',
                                gap: '6px',
                                alignItems: 'center',
                            }}
                        >
                            {[0, 1, 2].map((i) => (
                                <span
                                    key={i}
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: '#2D6A4F',
                                        opacity: 0.4,
                                        animation: `chatBounce 1.2s ${i * 0.2}s ease-in-out infinite`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* IMAGE PREVIEW */}
            {imagePreview && (
                <div
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#F1F5F1',
                        borderTop: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}
                >
                    <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                        }}
                    />
                    <span
                        style={{
                            flex: 1,
                            fontSize: '11px',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        Gambar siap dikirim
                    </span>
                    <button
                        onClick={removeImage}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: '#EF4444',
                            fontSize: '18px',
                            fontWeight: '700',
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* INPUT BAR */}
            <div
                style={{
                    padding: '10px 12px',
                    backgroundColor: 'white',
                    borderTop: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '8px',
                    flexShrink: 0,
                }}
            >
                {/* Image Upload */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                    id="chatbot-image-input"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        border: '1.5px solid #D0D5D0',
                        backgroundColor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                    }}
                    aria-label="Upload gambar"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2D6A4F"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                </button>

                {/* Text Input */}
                <div
                    style={{
                        flex: 1,
                        border: '1.5px solid #D0D5D0',
                        borderRadius: '20px',
                        padding: '8px 14px',
                        backgroundColor: '#F7F9F7',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tanya seputar ternak..."
                        rows={1}
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            fontSize: '13px',
                            lineHeight: 1.4,
                            resize: 'none',
                            backgroundColor: 'transparent',
                            fontFamily: 'inherit',
                            maxHeight: '80px',
                            overflowY: 'auto',
                        }}
                    />
                </div>

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    disabled={isLoading || (!input.trim() && !imageFile)}
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor:
                            input.trim() || imageFile
                                ? '#2D6A4F'
                                : '#CBD5E1',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor:
                            input.trim() || imageFile
                                ? 'pointer'
                                : 'not-allowed',
                        flexShrink: 0,
                        transition: 'background-color 0.2s',
                    }}
                    aria-label="Kirim"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="white"
                    >
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                </button>
            </div>

            {/* Bounce animation */}
            <style>{`
                @keyframes chatBounce {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-6px); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
