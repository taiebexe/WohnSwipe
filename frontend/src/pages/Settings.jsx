import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
    const [settings, setSettings] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const { logout } = useAuth();

    useEffect(() => {
        api.get('/settings').then(res => {
            setSettings(res.data);
        }).catch(err => {
            console.error('Failed to load settings:', err);
            setSettings({ autoApplyEnabled: false, dailyApplyLimit: 10 });
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            const res = await api.put('/settings', settings);
            setSettings(res.data);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Failed to save settings:', err);
        } finally {
            setSaving(false);
        }
    };

    if (!settings) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#aaa' }}>
                Loading settings...
            </div>
        );
    }

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#f5f7fa'
        }}>
            {/* Header */}
            <div style={{
                padding: '20px',
                background: 'white',
                borderBottom: '1px solid #eee'
            }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Settings</h2>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                {/* Auto-Apply Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                    }}>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Auto-Apply</div>
                            <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '4px' }}>
                                Automatically send applications when you swipe right
                            </div>
                        </div>
                        <button
                            onClick={() => setSettings(s => ({ ...s, autoApplyEnabled: !s.autoApplyEnabled }))}
                            style={{
                                width: '50px', height: '28px',
                                borderRadius: '14px',
                                background: settings.autoApplyEnabled ? '#2ed573' : '#ddd',
                                position: 'relative',
                                transition: 'background 0.2s',
                                padding: 0, border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{
                                width: '24px', height: '24px',
                                borderRadius: '50%',
                                background: 'white',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                position: 'absolute',
                                top: '2px',
                                left: settings.autoApplyEnabled ? '24px' : '2px',
                                transition: 'left 0.2s'
                            }} />
                        </button>
                    </div>

                    {settings.autoApplyEnabled && (
                        <div style={{
                            padding: '12px',
                            background: '#fff9e6',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            color: '#856404'
                        }}>
                            When enabled, your AI-generated inquiry will be emailed directly to
                            the landlord for listings that have a contact email.
                        </div>
                    )}
                </div>

                {/* Daily Limit */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '8px' }}>
                        Daily Application Limit
                    </div>
                    <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '12px' }}>
                        Maximum number of auto-sent applications per day
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={settings.dailyApplyLimit}
                            onChange={(e) => setSettings(s => ({ ...s, dailyApplyLimit: parseInt(e.target.value) }))}
                            style={{ flex: 1 }}
                        />
                        <span style={{
                            fontWeight: 'bold', fontSize: '1.1rem',
                            color: '#ff4757', minWidth: '30px', textAlign: 'center'
                        }}>
                            {settings.dailyApplyLimit}
                        </span>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        background: saved ? '#2ed573' : 'linear-gradient(45deg, #ff4757, #ff6b81)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        marginBottom: '12px',
                        opacity: saving ? 0.7 : 1
                    }}
                >
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
                </button>

                {/* Account Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '15px' }}>
                        Account
                    </div>
                    <button
                        onClick={logout}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            background: '#f8f9fa',
                            color: '#dc3545',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                        }}
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}
