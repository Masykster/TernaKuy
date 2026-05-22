import { useState } from 'react';

export default function AgendaSection() {
    const [items, setItems] = useState([
        { id: 1, text: 'Input data hari ini', checked: false, pending: true },
        { id: 2, text: 'Vaksinasi HD Booster', checked: true, pending: false },
        { id: 3, text: 'Bersih kandang', checked: true, pending: false },
    ]);

    const toggleItem = (id) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, checked: !item.checked, pending: !item.checked ? false : item.pending }
                    : item
            )
        );
    };

    return (
        <div className="agenda-section">
            <div className="agenda-header">
                <span className="agenda-icon">📋</span>
                <h3 className="agenda-title">AGENDA HARI INI</h3>
            </div>
            <div className="agenda-list">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="agenda-item"
                        onClick={() => toggleItem(item.id)}
                    >
                        <div className={`agenda-checkbox ${item.checked ? 'checked' : 'unchecked'}`}>
                            {item.checked && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </div>
                        <span
                            className={`agenda-item-text ${
                                item.pending ? 'pending' : item.checked ? 'done' : ''
                            }`}
                        >
                            {item.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
