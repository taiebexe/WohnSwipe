import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../api';
import Card from '../components/Card';
import MatchModal from '../components/MatchModal';
import { FaHeart, FaRedoAlt, FaSlidersH, FaTimes } from 'react-icons/fa';
import {
    formatCurrency,
    formatDate,
    getListingFit,
    getProfileCompleteness,
    normalizeProfile,
    sortListingsByFit
} from '../lib/product';

export default function Swipe() {
    const [listings, setListings] = useState([]);
    const [profile, setProfile] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [matchesCount, setMatchesCount] = useState(0);
    const [matchModal, setMatchModal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isSwiping, setIsSwiping] = useState(false);
    const [error, setError] = useState('');
    const [copyState, setCopyState] = useState(false);

    useEffect(() => {
        loadDiscover();
    }, []);

    const loadDiscover = async (isRefresh = false) => {
        setError('');

        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const [feedResult, profileResult, matchesResult] = await Promise.allSettled([
                api.get('/listings/feed'),
                api.get('/me'),
                api.get('/swipes/matches')
            ]);

            if (feedResult.status !== 'fulfilled' || profileResult.status !== 'fulfilled') {
                throw new Error('Could not load feed data');
            }

            const normalizedProfile = normalizeProfile(profileResult.value.data);
            const curatedListings = sortListingsByFit(feedResult.value.data, normalizedProfile);

            setProfile(normalizedProfile);
            setListings(curatedListings);
            setCurrentIndex(0);
            setMatchModal(null);

            if (matchesResult.status === 'fulfilled') {
                setMatchesCount(matchesResult.value.data.length);
            }
        } catch (err) {
            setError('We could not load your discovery feed right now.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSwipe = async (direction) => {
        if (isSwiping) {
            return;
        }

        const listing = listings[currentIndex];
        if (!listing) {
            return;
        }

        const activeIndex = currentIndex;
        const fit = getListingFit(listing, profile);
        setIsSwiping(true);
        setCurrentIndex(activeIndex + 1);
        setError('');

        try {
            const res = await api.post('/swipes', {
                listingId: listing.id,
                direction: direction
            });

            if (res.data.match && res.data.message) {
                setMatchesCount((previous) => previous + 1);
                setMatchModal({
                    listing,
                    message: res.data.message,
                    fit
                });
            }
        } catch (err) {
            setCurrentIndex(activeIndex);
            setError('Swipe failed. Please try again.');
        } finally {
            setIsSwiping(false);
        }
    };

    const handleCopyMessage = async () => {
        if (!matchModal?.message) {
            return;
        }

        try {
            await navigator.clipboard.writeText(matchModal.message);
            setCopyState(true);
            window.setTimeout(() => setCopyState(false), 1800);
        } catch (err) {
            setError('Clipboard access is blocked in this browser context.');
        }
    };

    const currentListing = listings[currentIndex];
    const nextListing = listings[currentIndex + 1];
    const currentFit = currentListing ? getListingFit(currentListing, profile) : null;
    const profileCompletion = getProfileCompleteness(profile || {});

    return (
        <div className="page">
            <section className="page-hero">
                <div className="hero-grid">
                    <div>
                        <span className="eyebrow-chip">Discover feed</span>
                        <h1>Apartment discovery that now feels curated, not random.</h1>
                        <p>
                            Listings are ranked against your budget, space target, timing and district preferences so the
                            first card feels like a recommendation, not just the next row in a table.
                        </p>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-card">
                            <span className="stat-card__label">Listings remaining</span>
                            <strong className="stat-card__value">{Math.max(listings.length - currentIndex, 0)}</strong>
                        </div>
                        <div className="stat-card">
                            <span className="stat-card__label">Saved matches</span>
                            <strong className="stat-card__value">{matchesCount}</strong>
                        </div>
                    </div>
                </div>
            </section>

            {error && <div className="status-message status-message--error">{error}</div>}

            {profileCompletion.percentage < 75 && (
                <div className="helper-banner">
                    <div>
                        <strong>Profile {profileCompletion.percentage}% complete.</strong>
                        <p>Add more context to improve ranking quality and inquiry tone.</p>
                    </div>
                    <Link to="/profile" className="secondary-button">
                        <FaSlidersH />
                        <span>Finish profile</span>
                    </Link>
                </div>
            )}

            <div className="discover-layout">
                <div className="discover-main">
                    <div className="deck-frame">
                        {loading ? (
                            <div className="section-card section-card--ghost">
                                <h3>Preparing your deck</h3>
                                <p>Pulling listings, preferences and past matches into one launch-ready flow.</p>
                            </div>
                        ) : (
                            <>
                                {nextListing && (
                                    <Card
                                        key={`peek-${nextListing.id}`}
                                        data={nextListing}
                                        fit={getListingFit(nextListing, profile)}
                                        interactive={false}
                                        style={{
                                            transform: 'translateY(20px) scale(0.97)',
                                            opacity: 0.78,
                                            zIndex: 1
                                        }}
                                    />
                                )}

                                <AnimatePresence mode="popLayout">
                                    {currentListing ? (
                                        <Card
                                            key={currentListing.id}
                                            data={currentListing}
                                            fit={currentFit}
                                            onSwipe={handleSwipe}
                                            style={{ zIndex: 2 }}
                                        />
                                    ) : (
                                        <motion.div
                                            className="empty-state"
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <div className="empty-state__icon">🏙</div>
                                            <h2>No more curated listings right now</h2>
                                            <p>Refresh the feed, review saved matches, or tighten your preferences for the next pass.</p>
                                            <div className="section-toolbar">
                                                <button
                                                    type="button"
                                                    className="primary-button"
                                                    onClick={() => loadDiscover(true)}
                                                    disabled={refreshing}
                                                >
                                                    <FaRedoAlt />
                                                    <span>{refreshing ? 'Refreshing' : 'Refresh feed'}</span>
                                                </button>
                                                <Link to="/matches" className="secondary-button">
                                                    Review matches
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </div>

                    <div className="swipe-controls">
                        <button
                            type="button"
                            className="swipe-button swipe-button--pass"
                            onClick={() => handleSwipe('LEFT')}
                            disabled={!currentListing || isSwiping}
                            aria-label="Pass on listing"
                        >
                            <FaTimes />
                        </button>

                        <button
                            type="button"
                            className="swipe-button swipe-button--refresh"
                            onClick={() => loadDiscover(true)}
                            disabled={refreshing}
                            aria-label="Refresh feed"
                        >
                            <FaRedoAlt />
                        </button>

                        <button
                            type="button"
                            className="swipe-button swipe-button--like"
                            onClick={() => handleSwipe('RIGHT')}
                            disabled={!currentListing || isSwiping}
                            aria-label="Like listing"
                        >
                            <FaHeart />
                        </button>
                    </div>

                    <p className="swipe-hint">Drag the card left or right, or use the controls below for quick decisions.</p>
                </div>

                <aside className="discover-sidebar">
                    <div className="section-card">
                        <div className="section-card__header">
                            <div>
                                <span className="section-card__eyebrow">Search brief</span>
                                <h2>What the feed is optimizing for</h2>
                            </div>
                        </div>

                        <div className="detail-list">
                            <div className="detail-list__item">
                                <span>Budget</span>
                                <strong>{profile?.maxRent ? formatCurrency(profile.maxRent) : 'Flexible'}</strong>
                            </div>
                            <div className="detail-list__item">
                                <span>Move-in target</span>
                                <strong>{profile?.moveInDate ? formatDate(profile.moveInDate) : 'Flexible'}</strong>
                            </div>
                            <div className="detail-list__item">
                                <span>Minimum rooms</span>
                                <strong>{profile?.preferredRooms || 'Open'}</strong>
                            </div>
                            <div className="detail-list__item">
                                <span>Preferred districts</span>
                                <strong>{profile?.districts || 'Not set yet'}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-card__header">
                            <div>
                                <span className="section-card__eyebrow">Current top pick</span>
                                <h2>{currentListing ? currentListing.title : 'Awaiting next listing'}</h2>
                            </div>
                        </div>

                        {currentListing && currentFit ? (
                            <>
                                <div className="detail-list">
                                    <div className="detail-list__item">
                                        <span>Match score</span>
                                        <strong>{currentFit.score}%</strong>
                                    </div>
                                    <div className="detail-list__item">
                                        <span>Price</span>
                                        <strong>{formatCurrency(currentListing.rent)}</strong>
                                    </div>
                                    <div className="detail-list__item">
                                        <span>Available</span>
                                        <strong>{formatDate(currentListing.availableFrom)}</strong>
                                    </div>
                                </div>

                                <div className="chip-group">
                                    {currentFit.reasons.map((reason) => (
                                        <span className="chip chip--active" key={reason}>
                                            {reason}
                                        </span>
                                    ))}
                                    {currentFit.notes.map((note) => (
                                        <span className="chip" key={note}>
                                            {note}
                                        </span>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p>Refresh the feed or revisit your profile to keep the shortlist moving.</p>
                        )}
                    </div>
                </aside>
            </div>

            <MatchModal
                match={matchModal}
                copied={copyState}
                onCopy={handleCopyMessage}
                onClose={() => {
                    setMatchModal(null);
                    setCopyState(false);
                }}
            />
        </div>
    );
}
