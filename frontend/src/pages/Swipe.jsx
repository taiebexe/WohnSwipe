import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaHeart, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

export default function Swipe() {
    const [listings, setListings] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [generatedMessage, setGeneratedMessage] = useState(null);
    const { logout } = useAuth();

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = () => {
        api.get('/listings/feed').then(res => {
            setListings(res.data);
            setCurrentIndex(0);
        });
    };

    const handleSwipe = async (direction) => {
        const listing = listings[currentIndex];
        if (!listing) return;

        // Optimistic UI update: remove card immediately
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);

        try {
            const res = await api.post('/swipes', {
                listingId: listing.id,
                direction: direction
            });

            if (res.data.match && res.data.message) {
                setGeneratedMessage(res.data.message);
            }
        } catch (err) {
            console.error(err);
            // Revert if error? For now, just log it.
        }
    };

    const currentListing = listings[currentIndex];
    const nextListing = listings[currentIndex + 1];

    return (
        <div className="full-screen" style={{ display: 'flex', flexDirection: 'column', background: '#f5f7fa' }}>
            {/* Header */}
            <div style={{
                padding: '15px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10
            }}>
                <button onClick={logout} style={{ background: 'none', color: '#ccc', padding: 0 }}>
                    <FaSignOutAlt size={24} />
                </button>
                <div style={{ fontWeight: 'bold', color: '#fbc531', fontSize: '1.2rem' }}>WohnSwipe</div>
                <button style={{ background: 'none', color: '#ccc', padding: 0 }}>
                    <FaUserCircle size={28} />
                </button>
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
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
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
                            <h1 style={{ color: '#2ed573', fontSize: '3rem', marginBottom: '20px' }}>It's a Match!</h1>
                            <p style={{ color: '#white', marginBottom: '20px', textAlign: 'center' }}>
                                Here's your AI-generated inquiry:
                            </p>
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
                                    borderRadius: '10px'
                                }}
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedMessage);
                                    setGeneratedMessage(null);
                                }}
                                style={{ background: 'white', color: 'black', width: '100%', borderRadius: '30px', padding: '15px' }}
                            >
                                Copy & Keep Swiping
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
                        onSwipe={() => { }} // Non-interactive
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
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🏙️</div>
                        <h3>No more apartments</h3>
                        <p>Check back later!</p>
                        <button onClick={fetchFeed} style={{ marginTop: '20px', width: 'auto' }}>Refresh Feed</button>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div style={{
                height: '100px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '30px',
                paddingBottom: '20px'
            }}>
                <button
                    onClick={() => handleSwipe('LEFT')}
                    className="center-flex"
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'white',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                        color: '#ff6b6b',
                        fontSize: '24px'
                    }}
                >
                    <FaTimes />
                </button>

                <button
                    onClick={() => handleSwipe('RIGHT')}
                    className="center-flex"
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #fbc531, #e1b12c)',
                        boxShadow: '0 5px 15px rgba(251, 197, 49, 0.4)',
                        color: 'white',
                        fontSize: '24px'
                    }}
                >
                    <FaHeart />
                </button>
            </div>
        </div>
    );
}
