import { router } from '@inertiajs/react';

export default function AgendaSection({ todayTasks = [] }) {
    const toggleItem = (task) => {
        router.patch(route('timeline-tasks.toggle', { cycle: task.cycle_id, task: task.id }), {}, {
            preserveScroll: true
        });
    };

    return (
        <div className="agenda-section">
            <div className="agenda-header">
                <span className="agenda-icon">📋</span>
                <h3 className="agenda-title">AGENDA HARI INI</h3>
            </div>
            <div className="agenda-list">
                {todayTasks.length === 0 ? (
                    <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                        Tidak ada agenda khusus hari ini. Lakukan pemantauan rutin.
                    </div>
                ) : (
                    todayTasks.map((task) => (
                        <div
                            key={task.id}
                            className="agenda-item"
                            onClick={() => toggleItem(task)}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', cursor: 'pointer' }}
                        >
                            <div className={`agenda-checkbox ${task.is_done ? 'checked' : 'unchecked'}`}>
                                {task.is_done && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                            <span
                                className={`agenda-item-text ${
                                    task.is_done ? 'done' : 'pending'
                                }`}
                            >
                                {task.task_name}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
