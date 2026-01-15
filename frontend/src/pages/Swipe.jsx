import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

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

        try {
            const res = await api.post('/swipes', {
                listingId: listing.id,
                direction: direction
            });

            if (res.data.match && res.data.message) {
                setGeneratedMessage(res.data.message);
            } else {
                nextCard();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const nextCard = () => {
        setCurrentIndex(prev => prev + 1);
        setGeneratedMessage(null);
    };

    const currentListing = listings[currentIndex];

    if (generatedMessage) {
        return (
            <div className="card message-card">
                <h2>It's a Match! 🎉</h2>
                <p>AI generated inquiry for this apartment:</p>
                <textarea readOnly value={generatedMessage} rows={10} />
                <div className="buttons">
                    <button onClick={() => navigator.clipboard.writeText(generatedMessage)}>Copy to Clipboard</button>
                    <button onClick={nextCard}>Keep Swiping</button>
                </div>
            </div>
        );
    }

    if (!currentListing) {
        return (
            <div className="card">
                <h2>No more listings!</h2>
                <p>Check back later or adjust your filters.</p>
                <button onClick={fetchFeed}>Refresh</button>
                <button onClick={logout} className="secondary">Logout</button>
            </div>
        );
    }

    return (
        <div className="swipe-container">
            <div className="header">
                <Link to="/profile">Edit Profile</Link>
                <button onClick={logout} className="link-btn">Logout</button>
            </div>

            <div className="card listing-card">
                {/* Placeholder Image */}
                <div className="listing-image" style={{ backgroundColor: '#ddd', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>Apartment Image</span>
                </div>
                <div className="listing-details">
                    <h2>{currentListing.title}</h2>
                    <p className="price">{currentListing.rent} € • {currentListing.rooms} Rooms • {currentListing.sizeSqm} m²</p>
                    <p className="location">📍 {currentListing.district}</p>
                    <p className="desc">{currentListing.description}</p>
                    <p className="avail">Available: {currentListing.availableFrom}</p>
                </div>
            </div>

            <div className="actions">
                <button className="swipe-btn left" onClick={() => handleSwipe('LEFT')}>PASS ❌</button>
                <button className="swipe-btn right" onClick={() => handleSwipe('RIGHT')}>SWIPE ✅</button>
            </div>
        </div>
    );
}
