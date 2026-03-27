import { useNavigate, useLocation } from 'react-router-dom';
import { FaHeart, FaListAlt, FaCog } from 'react-icons/fa';

const tabs = [
    { path: '/swipe', icon: FaHeart, label: 'Swipe' },
    { path: '/applications', icon: FaListAlt, label: 'Applications' },
    { path: '/settings', icon: FaCog, label: 'Settings' },
];

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: '60px',
            background: 'white',
            borderTop: '1px solid #eee',
            flexShrink: 0
        }}>
            {tabs.map(({ path, icon: Icon, label }) => {
                const active = location.pathname === path;
                return (
                    <button
                        key={path}
                        onClick={() => navigate(path)}
                        style={{
                            background: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '8px 16px',
                            color: active ? '#fbc531' : '#aaa',
                            transition: 'color 0.2s'
                        }}
                    >
                        <Icon size={20} />
                        <span style={{ fontSize: '0.65rem', fontWeight: active ? '700' : '400' }}>
                            {label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
