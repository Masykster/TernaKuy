import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';

export default function Show({ cycle, filter }) {
    const coop = cycle.coop;
    const farm = coop.farm;
    const allTasks = cycle.timeline_tasks || [];

    const [activeFilter, setActiveFilter] = useState(filter || 'all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const docDateFormatted = new Date(cycle.doc_date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Species label
    const speciesLabel = {
        broiler: 'Ayam Broiler',
        bebek: 'Bebek',
        lele: 'Lele',
        nila: 'Nila',
    }[farm.species] || 'Ayam Broiler';

    // Filter logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));

    const filteredTasks = allTasks.filter(task => {
        if (activeFilter === 'all') return true;
        const taskDate = new Date(task.task_date);
        taskDate.setHours(0, 0, 0, 0);
        if (activeFilter === 'today') {
            return taskDate.getTime() === today.getTime();
        }
        if (activeFilter === 'week') {
            return taskDate >= today && taskDate <= endOfWeek;
        }
        return true;
    });

    const toggleTask = (id) => {
        router.patch(route('timeline-tasks.toggle', { cycle: cycle.id, task: id }), {}, {
            preserveScroll: true
        });
    };

    const handleDeleteTask = (taskId) => {
        router.delete(route('timeline-tasks.destroy', { cycle: cycle.id, task: taskId }), {
            preserveScroll: true,
            onSuccess: () => setDeleteConfirm(null),
        });
    };

    const handleEditTargetDays = () => {
        const newTarget = prompt("Masukkan target hari baru:", cycle.target_days);
        if (newTarget) {
            const parsed = parseInt(newTarget);
            if (!isNaN(parsed) && parsed > 0) {
                router.patch(route('cycles.update-target', { cycle: cycle.id }), {
                    target_days: parsed
                }, {
                    preserveScroll: true
                });
            } else {
                alert("Target hari harus berupa angka positif.");
            }
        }
    };

    const getCategoryStyles = (category) => {
        switch (category) {
            case 'vaccination':
                return { bg: '#E8F0FE', color: '#1A73E8', label: 'Vaksinasi' };
            case 'sampling':
                return { bg: '#E4F7F6', color: '#00796B', label: 'Sampling' };
            case 'feeding':
                return { bg: '#FFF3E0', color: '#E65100', label: 'Pakan' };
            case 'management':
                return { bg: '#E8F5E9', color: '#2E7D32', label: 'Manajemen' };
            default:
                return { bg: '#F3E5F5', color: '#7B1FA2', label: 'Kustom' };
        }
    };

    const filterBtns = [
        { key: 'all', label: 'Semua' },
        { key: 'today', label: 'Hari Ini' },
        { key: 'week', label: 'Minggu Ini' },
    ];

    return (
        <>
            <Head title={`Timeline Kandang ${coop.coop_code}`} />

            <div className="mobile-container">
                <div className="main-scroll" style={{ paddingBottom: '100px' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px' }}>
                        <Link href="/dashboard" className="back-btn-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12" />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                        </Link>
                        <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-green)', margin: 0 }}>Golden Timeline</h1>
                    </div>

                    {/* Cycle Stats Card */}
                    <div className="input-group-card" style={{ background: 'var(--color-forest)', color: 'white' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>Kandang {coop.coop_code}</h2>
                        <p style={{ fontSize: '13px', margin: '4px 0 0', opacity: 0.9 }}>{farm.name} · {speciesLabel}{cycle.strain ? ` · ${cycle.strain}` : ''}</p>
                        
                        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', margin: '14px 0', padding: '10px 0 0', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <div>
                                <div style={{ opacity: 0.75 }}>TANGGAL DOC</div>
                                <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '2px' }}>{docDateFormatted}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ opacity: 0.75 }}>POPULASI MASUK</div>
                                <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '2px' }}>{cycle.doc_count.toLocaleString()} Ekor</div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs + Add Button */}
                    <div style={{ padding: '0 20px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '6px', flex: 1, background: '#F1F5F0', borderRadius: '12px', padding: '4px' }}>
                            {filterBtns.map(btn => (
                                <button
                                    key={btn.key}
                                    onClick={() => setActiveFilter(btn.key)}
                                    style={{
                                        flex: 1,
                                        padding: '8px 0',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: activeFilter === btn.key ? 'var(--color-forest)' : 'transparent',
                                        color: activeFilter === btn.key ? 'white' : 'var(--color-text-secondary)',
                                    }}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => { setEditingTask(null); setShowAddModal(true); }}
                            style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: 'var(--color-forest)', color: 'white', border: 'none',
                                fontSize: '22px', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}
                            aria-label="Tambah tugas"
                        >
                            +
                        </button>
                    </div>

                    {/* Task Count Badge */}
                    <div style={{ padding: '8px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-dark)', margin: 0, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            JADWAL SIKLUS ({cycle.target_days} HARI)
                            <button
                                onClick={handleEditTargetDays}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                                aria-label="Ubah Target"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
                                </svg>
                            </button>
                        </h3>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', background: '#F1F5F0', padding: '4px 10px', borderRadius: '8px', fontWeight: '600' }}>
                            {filteredTasks.length} tugas
                        </span>
                    </div>

                    {/* Golden Timeline Task List */}
                    <div style={{ padding: '12px 20px 0' }}>
                        {filteredTasks.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                                {activeFilter === 'today' ? 'Tidak ada jadwal hari ini.' :
                                 activeFilter === 'week' ? 'Tidak ada jadwal minggu ini.' :
                                 'Belum ada jadwal.'}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                                {/* Vertical Line */}
                                <div style={{ position: 'absolute', left: '22px', top: '15px', bottom: '15px', width: '2px', background: 'rgba(19, 48, 32, 0.1)', zIndex: 0 }} />

                                {filteredTasks.map((task) => {
                                    const styles = getCategoryStyles(task.category);
                                    const taskDateStr = new Date(task.task_date).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short'
                                    });

                                    return (
                                        <div key={task.id} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                                            {/* Day circle */}
                                            <div style={{
                                                width: '46px',
                                                height: '46px',
                                                borderRadius: '50%',
                                                background: task.is_done ? 'var(--color-forest)' : '#F1F5F9',
                                                border: task.is_done ? 'none' : '2px solid rgba(19, 48, 32, 0.15)',
                                                color: task.is_done ? 'white' : 'var(--color-text-secondary)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                            }}>
                                                <span style={{ fontSize: '10px', fontWeight: '500', lineHeight: 1 }}>HARI</span>
                                                <span style={{ fontSize: '16px', fontWeight: '700', lineHeight: 1.1 }}>{task.day_number}</span>
                                            </div>

                                            {/* Task details box */}
                                            <div
                                                onClick={() => toggleTask(task.id)}
                                                style={{
                                                    flex: 1,
                                                    background: 'white',
                                                    border: '1px solid #F1F5F9',
                                                    borderRadius: '16px',
                                                    padding: '12px 14px',
                                                    boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    gap: '12px',
                                                    alignItems: 'start',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{
                                                            fontSize: '9px',
                                                            fontWeight: '700',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            background: styles.bg,
                                                            color: styles.color,
                                                            padding: '2px 8px',
                                                            borderRadius: '6px'
                                                        }}>
                                                            {styles.label}
                                                        </span>
                                                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{taskDateStr}</span>
                                                    </div>
                                                    <p style={{
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        color: 'var(--color-text-dark)',
                                                        margin: '6px 0 0',
                                                        textDecoration: task.is_done ? 'line-through' : 'none',
                                                        opacity: task.is_done ? 0.6 : 1
                                                    }}>
                                                        {task.task_name}
                                                    </p>
                                                </div>

                                                {/* Action buttons */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                                    <div className={`agenda-checkbox ${task.is_done ? 'checked' : 'unchecked'}`} style={{ marginTop: '2px', flexShrink: 0 }}>
                                                        {task.is_done && (
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setEditingTask(task); setShowAddModal(true); }}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', opacity: 0.5 }}
                                                            aria-label="Edit tugas"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(task.id); }}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', opacity: 0.5 }}
                                                            aria-label="Hapus tugas"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="3 6 5 6 21 6" />
                                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* BOTTOM NAVIGATION */}
                <BottomNav activeTab="timeline" />
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
                }} onClick={() => setDeleteConfirm(null)}>
                    <div style={{
                        background: 'white', borderRadius: '20px', padding: '24px',
                        width: '100%', maxWidth: '340px', textAlign: 'center'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🗑️</div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px' }}>Hapus Tugas?</h3>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 20px' }}>
                            Tugas yang dihapus tidak dapat dikembalikan.
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '12px',
                                    border: '1.5px solid #E2E8F0', background: 'white',
                                    fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                                }}
                            >Batal</button>
                            <button
                                onClick={() => handleDeleteTask(deleteConfirm)}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '12px',
                                    border: 'none', background: '#EF4444', color: 'white',
                                    fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                                }}
                            >Hapus</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add / Edit Task Modal */}
            {showAddModal && (
                <TaskModal
                    cycle={cycle}
                    task={editingTask}
                    onClose={() => { setShowAddModal(false); setEditingTask(null); }}
                />
            )}
        </>
    );
}

function TaskModal({ cycle, task, onClose }) {
    const isEdit = !!task;
    const docDate = cycle.doc_date;

    const { data, setData, post, put, processing, errors } = useForm({
        task_name: task?.task_name || '',
        task_date: task?.task_date || new Date().toISOString().split('T')[0],
        category: task?.category || 'custom',
        notes: task?.notes || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('timeline-tasks.update', { cycle: cycle.id, task: task.id }), {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        } else {
            post(route('timeline-tasks.store', { cycle: cycle.id }), {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        }
    };

    const categories = [
        { value: 'vaccination', label: '💉 Vaksinasi' },
        { value: 'sampling', label: '📊 Sampling' },
        { value: 'feeding', label: '🌾 Pakan' },
        { value: 'management', label: '⚙️ Manajemen' },
        { value: 'custom', label: '📝 Kustom' },
    ];

    // Compute day number preview
    const dayPreview = (() => {
        if (!data.task_date || !docDate) return '—';
        const doc = new Date(docDate);
        const td = new Date(data.task_date);
        const diff = Math.floor((td - doc) / (1000 * 60 * 60 * 24)) + 1;
        return diff < 1 ? 1 : diff;
    })();

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000
        }} onClick={onClose}>
            <div style={{
                background: 'white', borderRadius: '24px 24px 0 0', padding: '24px',
                width: '100%', maxWidth: '420px', maxHeight: '85vh', overflow: 'auto'
            }} onClick={e => e.stopPropagation()}>
                {/* Handle bar */}
                <div style={{ width: '40px', height: '4px', background: '#D0D5D0', borderRadius: '2px', margin: '0 auto 16px' }} />
                
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 20px', color: 'var(--color-text-dark)' }}>
                    {isEdit ? 'Edit Tugas' : 'Tambah Tugas Kustom'}
                </h3>

                <form onSubmit={handleSubmit}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>NAMA TUGAS</label>
                    <div className="input-box-container" style={{ marginBottom: '14px' }}>
                        <input
                            type="text"
                            className="large-number-input"
                            placeholder="Contoh: Vaksinasi ND Booster"
                            style={{ fontSize: '15px' }}
                            value={data.task_name}
                            onChange={e => setData('task_name', e.target.value)}
                        />
                    </div>
                    {errors.task_name && <div style={{ color: 'red', fontSize: '11px', marginTop: '-10px', marginBottom: '10px' }}>{errors.task_name}</div>}

                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>TANGGAL</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
                        <div className="input-box-container" style={{ flex: 1 }}>
                            <input
                                type="date"
                                className="large-number-input"
                                style={{ fontSize: '15px' }}
                                value={data.task_date}
                                onChange={e => setData('task_date', e.target.value)}
                            />
                        </div>
                        <div style={{
                            background: 'var(--color-green-light)', borderRadius: '10px',
                            padding: '8px 14px', textAlign: 'center', flexShrink: 0
                        }}>
                            <div style={{ fontSize: '9px', fontWeight: '700', color: 'var(--color-forest)', letterSpacing: '0.5px' }}>HARI KE</div>
                            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-forest)' }}>{dayPreview}</div>
                        </div>
                    </div>

                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>KATEGORI</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                        {categories.map(cat => (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => setData('category', cat.value)}
                                style={{
                                    padding: '8px 14px', borderRadius: '10px',
                                    border: data.category === cat.value ? '2px solid var(--color-forest)' : '1.5px solid #E2E8F0',
                                    background: data.category === cat.value ? 'var(--color-green-light)' : 'white',
                                    fontWeight: '600', fontSize: '12px', cursor: 'pointer',
                                    color: data.category === cat.value ? 'var(--color-forest)' : 'var(--color-text-secondary)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>CATATAN (OPSIONAL)</label>
                    <div className="notes-textarea-container" style={{ marginBottom: '20px' }}>
                        <textarea
                            className="notes-textarea"
                            placeholder="Tambahkan catatan..."
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            rows={2}
                        />
                    </div>

                    <button
                        type="submit"
                        className="save-btn"
                        disabled={!data.task_name.trim() || processing}
                        style={{
                            width: '100%',
                            opacity: data.task_name.trim() && !processing ? 1 : 0.6,
                            cursor: data.task_name.trim() && !processing ? 'pointer' : 'not-allowed'
                        }}
                    >
                        {processing ? 'MENYIMPAN...' : isEdit ? 'SIMPAN PERUBAHAN' : 'TAMBAH TUGAS'}
                    </button>
                </form>
            </div>
        </div>
    );
}
