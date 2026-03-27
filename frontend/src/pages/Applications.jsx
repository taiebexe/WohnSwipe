import { useState, useEffect } from 'react';
import api from '../api';

const STATUS_STYLES = {
    SENT: { bg: '#d4edda', color: '#155724', label: 'Sent' },
    PENDING: { bg: '#fff3cd', color: '#856404', label: 'Pending' },
    FAILED: { bg: '#f8d7da', color: '#721c24', label: 'Failed' },
    CLIPBOARD: { bg: '#d1ecf1', color: '#0c5460', label: 'Copied' },
};

export default function Applications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchApplications(0);
    }, []);

    const fetchApplications = async (pageNum) => {
        setLoading(true);
        try {
            const res = await api.get(`/applications?page=${pageNum}&size=20`);
            setApplications(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
            setPage(pageNum);
        } catch (err) {
            console.error('Failed to fetch applications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async (appId) => {
        try {
            await api.post(`/applications/${appId}/retry`);
            fetchApplications(page);
        } catch (err) {
            console.error('Retry failed:', err);
        }
    };

    if (loading && applications.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#aaa' }}>
                Loading applications...
            </div>
        );
    }

    return (
        <div style={{
            padding: '0',
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
                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>My Applications</h2>
                <p style={{ margin: '5px 0 0', color: '#888', fontSize: '0.85rem' }}>
                    {applications.length} application{applications.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 15px' }}>
                {applications.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#aaa', paddingTop: '60px' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>&#128236;</div>
                        <p>No applications yet</p>
                        <p style={{ fontSize: '0.85rem' }}>Swipe right on apartments to apply!</p>
                    </div>
                ) : (
                    applications.map(app => {
                        const status = STATUS_STYLES[app.status] || STATUS_STYLES.PENDING;
                        const isExpanded = expandedId === app.id;

                        return (
                            <div
                                key={app.id}
                                onClick={() => setExpandedId(isExpanded ? null : app.id)}
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    marginBottom: '10px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                    cursor: 'pointer',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ padding: '15px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    {/* Thumbnail */}
                                    <div style={{
                                        width: '50px', height: '50px', borderRadius: '10px',
                                        background: '#eee',
                                        backgroundImage: app.listingImageUrl ? `url(${app.listingImageUrl})` : undefined,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        flexShrink: 0
                                    }} />

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontWeight: '600', fontSize: '0.9rem',
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                        }}>
                                            {app.listingTitle || 'Apartment'}
                                        </div>
                                        <div style={{ color: '#888', fontSize: '0.8rem' }}>
                                            {app.listingDistrict || 'Berlin'} &bull; {app.listingRent ? `${app.listingRent}\u20AC` : ''}
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div style={{
                                        background: status.bg, color: status.color,
                                        padding: '4px 10px', borderRadius: '12px',
                                        fontSize: '0.75rem', fontWeight: 'bold',
                                        flexShrink: 0
                                    }}>
                                        {status.label}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div style={{
                                        padding: '0 15px 15px',
                                        borderTop: '1px solid #f0f0f0'
                                    }}>
                                        {app.message && (
                                            <textarea
                                                readOnly
                                                value={app.message}
                                                style={{
                                                    width: '100%', height: '120px',
                                                    background: '#f8f9fa',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    padding: '10px',
                                                    fontSize: '0.8rem',
                                                    marginTop: '10px',
                                                    resize: 'none',
                                                    color: '#333'
                                                }}
                                            />
                                        )}

                                        <div style={{
                                            display: 'flex', gap: '8px', marginTop: '10px',
                                            flexWrap: 'wrap'
                                        }}>
                                            {app.message && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigator.clipboard.writeText(app.message);
                                                    }}
                                                    style={{
                                                        background: '#f0f0f0', color: '#333',
                                                        padding: '8px 14px', borderRadius: '8px',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    Copy Message
                                                </button>
                                            )}

                                            {app.listingSourceUrl && (
                                                <a
                                                    href={app.listingSourceUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{
                                                        background: '#f0f0f0', color: '#333',
                                                        padding: '8px 14px', borderRadius: '8px',
                                                        fontSize: '0.8rem', textDecoration: 'none'
                                                    }}
                                                >
                                                    View Listing
                                                </a>
                                            )}

                                            {app.status === 'FAILED' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRetry(app.id);
                                                    }}
                                                    style={{
                                                        background: '#fbc531', color: 'white',
                                                        padding: '8px 14px', borderRadius: '8px',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    Retry
                                                </button>
                                            )}
                                        </div>

                                        {app.errorMessage && (
                                            <p style={{
                                                color: '#dc3545', fontSize: '0.75rem',
                                                marginTop: '8px'
                                            }}>
                                                Error: {app.errorMessage}
                                            </p>
                                        )}

                                        <p style={{ color: '#aaa', fontSize: '0.7rem', marginTop: '8px' }}>
                                            {app.sentAt ? `Sent: ${new Date(app.sentAt).toLocaleString('de-DE')}` : `Created: ${new Date(app.createdAt).toLocaleString('de-DE')}`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', padding: '15px' }}>
                        <button
                            disabled={page === 0}
                            onClick={() => fetchApplications(page - 1)}
                            style={{
                                padding: '8px 16px', borderRadius: '8px',
                                background: page === 0 ? '#eee' : '#fbc531',
                                color: page === 0 ? '#aaa' : 'white',
                                fontSize: '0.85rem'
                            }}
                        >
                            Previous
                        </button>
                        <span style={{ padding: '8px', color: '#888', fontSize: '0.85rem' }}>
                            {page + 1} / {totalPages}
                        </span>
                        <button
                            disabled={page >= totalPages - 1}
                            onClick={() => fetchApplications(page + 1)}
                            style={{
                                padding: '8px 16px', borderRadius: '8px',
                                background: page >= totalPages - 1 ? '#eee' : '#fbc531',
                                color: page >= totalPages - 1 ? '#aaa' : 'white',
                                fontSize: '0.85rem'
                            }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
