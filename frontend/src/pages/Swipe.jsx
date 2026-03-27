import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaHeart } from 'react-icons/fa';

export default function Swipe() {
    const [listings, setListings] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [generatedMessage, setGeneratedMessage] = useState(null);
    const [applicationStatus, setApplicationStatus] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const { logout } = useAuth();

    const fetchFeed = useCallback(async (pageNum = 0, append = false) => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await api.get(`/listings/feed?page=${pageNum}&size=20`);
            const newListings = res.data.content || res.data;
            if (append) {
                setListings(prev => [...prev, ...newListings]);
            } else {
                setListings(Array.isArray(newListings) ? newListings : []);
                setCurrentIndex(0);
            }
            setHasMore(res.data.last === false);
            setPage(pageNum);
        } catch (err) {
            console.error('Failed to fetch feed:', err);
        } finally {
            setLoading(false);
        }
    }, [loading]);

    useEffect(() => {
        fetchFeed(0);
    }, []);

    // Infinite scroll: fetch more when near end
    useEffect(() => {
        if (hasMore && currentIndex >= listings.length - 3 && listings.length > 0 && !loading) {
            fetchFeed(page + 1, true);
        }
    }, [currentIndex, listings.length, hasMore, loading]);

    const handleSwipe = async (direction) => {
        const listing = listings[currentIndex];
        if (!listing) return;

        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);

        try {
            const res = await api.post('/swipes', {
                listingId: listing.id,
                direction: direction
            });

            if (res.data.match && res.data.message) {
                setGeneratedMessage(res.data.message);
                setApplicationStatus(res.data.applicationStatus);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const dismissOverlay = () => {
        if (applicationStatus !== 'PENDING' && applicationStatus !== 'SENT') {
            navigator.clipboard.writeText(generatedMessage);
        }
        setGeneratedMessage(null);
        setApplicationStatus(null);
    };

    const currentListing = listings[currentIndex];
    const nextListing = listings[currentIndex + 1];

    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            background: '#f5f7fa', height: '100%'
        }}>
            {/* Header */}
            <div style={{
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10
            }}>
                <div style={{ fontWeight: 'bold', color: '#fbc531', fontSize: '1.2rem' }}>WohnSwipe</div>
            </div>

            {/* Card Stack */}
            <div className="card-container" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <AnimatePresence>
                    {generatedMessage && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'absolute',
                                top: 0, left: 0, width: '100%', height: '100%',
                                background: 'rgba(0,0,0,0.85)',
                                color: 'white',
                                zIndex: 100,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '30px'
                            }}
                        >
                            {applicationStatus === 'PENDING' || applicationStatus === 'SENT' ? (
                                <>
                                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>&#9989;</div>
                                    <h1 style={{ color: '#2ed573', fontSize: '2rem', marginBottom: '10px' }}>
                                        Application Sent!
                                    </h1>
                                    <p style={{ color: '#aaa', marginBottom: '20px', textAlign: 'center' }}>
                                        Your AI-generated inquiry has been emailed to the landlord.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h1 style={{ color: '#2ed573', fontSize: '2.5rem', marginBottom: '10px' }}>
                                        It's a Match!
                                    </h1>
                                    <p style={{ color: '#aaa', marginBottom: '15px', textAlign: 'center' }}>
                                        Copy this AI-generated inquiry:
                                    </p>
                                </>
                            )}
                            <textarea
                                readOnly
                                value={generatedMessage}
                                style={{
                                    width: '100%',
                                    height: '150px',
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    border: '1px solid #555',
                                    marginBottom: '20px',
                                    borderRadius: '10px',
                                    padding: '12px',
                                    fontSize: '0.85rem'
                                }}
                            />
                            <button
                                onClick={dismissOverlay}
                                style={{
                                    background: 'white', color: 'black',
                                    width: '100%', borderRadius: '30px', padding: '15px',
                                    fontWeight: 'bold', fontSize: '1rem'
                                }}
                            >
                                {applicationStatus === 'PENDING' || applicationStatus === 'SENT'
                                    ? 'Keep Swiping'
                                    : 'Copy & Keep Swiping'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Background (Next) Card */}
                {nextListing && (
                    <Card
                        key={nextListing.id}
                        data={nextListing}
                        style={{ transform: 'scale(0.95)', top: '10px', opacity: 0.5, zIndex: 0 }}
                        onSwipe={() => {}}
                    />
                )}

                {/* Foreground (Current) Card */}
                {currentListing ? (
                    <Card
                        key={currentListing.id}
                        data={currentListing}
                        onSwipe={handleSwipe}
                        style={{ zIndex: 1 }}
                    />
                ) : (
                    <div className="center-flex" style={{ height: '100%', flexDirection: 'column', color: '#aaa' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>&#127961;</div>
                        <h3>No more apartments</h3>
                        <p>{loading ? 'Loading more...' : 'Check back later!'}</p>
                        <button onClick={() => fetchFeed(0)} style={{ marginTop: '20px', width: 'auto' }}>
                            Refresh Feed
                        </button>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div style={{
                height: '80px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '30px',
                paddingBottom: '10px'
            }}>
                <button
                    onClick={() => handleSwipe('LEFT')}
                    className="center-flex"
                    style={{
                        width: '60px', height: '60px', borderRadius: '50%',
                        background: 'white',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                        color: '#ff6b6b', fontSize: '24px'
                    }}
                >
                    <FaTimes />
                </button>

                <button
                    onClick={() => handleSwipe('RIGHT')}
                    className="center-flex"
                    style={{
                        width: '60px', height: '60px', borderRadius: '50%',
                        background: 'linear-gradient(45deg, #fbc531, #e1b12c)',
                        boxShadow: '0 5px 15px rgba(251, 197, 49, 0.4)',
                        color: 'white', fontSize: '24px'
                    }}
                >
                    <FaHeart />
                </button>
            </div>
        </div>
    );
}
