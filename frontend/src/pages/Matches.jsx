import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCopy, FaEnvelope, FaInbox, FaMapMarkerAlt, FaRedoAlt } from 'react-icons/fa';
import api from '../api';
import { formatCurrency, formatDate, getListingTheme, getTopDistrict } from '../lib/product';

export default function Matches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await api.get('/swipes/matches');
            setMatches(response.data);
        } catch (err) {
            setError('We could not load your matched listings right now.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async (id, message) => {
        try {
            await navigator.clipboard.writeText(message);
            setCopiedId(id);
            window.setTimeout(() => setCopiedId(null), 1800);
        } catch (err) {
            setError('Clipboard access is blocked in this browser context.');
        }
    };

    const topDistrict = getTopDistrict(matches);

    return (
        <div className="page">
            <section className="page-hero">
                <div className="hero-grid">
                    <div>
                        <span className="eyebrow-chip">Matches inbox</span>
                        <h1>Every yes should lead somewhere.</h1>
                        <p>
                            The MVP already generated inquiries, but they vanished after the swipe. This inbox turns matches
                            into something users can actually revisit and act on.
                        </p>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-card">
                            <span className="stat-card__label">Saved matches</span>
                            <strong className="stat-card__value">{matches.length}</strong>
                        </div>
                        <div className="stat-card">
                            <span className="stat-card__label">Top district</span>
                            <strong className="stat-card__value">{topDistrict}</strong>
                        </div>
                    </div>
                </div>
            </section>

            {error && <div className="status-message status-message--error">{error}</div>}

            <div className="section-toolbar">
                <button type="button" className="secondary-button" onClick={loadMatches} disabled={loading}>
                    <FaRedoAlt />
                    <span>{loading ? 'Refreshing' : 'Refresh inbox'}</span>
                </button>
            </div>

            {loading ? (
                <div className="section-card section-card--ghost">
                    <h3>Loading your saved matches</h3>
                    <p>Pulling inquiry history from the backend so this feels more like a real product inbox.</p>
                </div>
            ) : matches.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">
                        <FaInbox />
                    </div>
                    <h2>No matches yet</h2>
                    <p>Swipe right on a listing and its AI-generated message will be saved here for later follow-up.</p>
                </div>
            ) : (
                <div className="matches-grid">
                    {matches.map((match, index) => {
                        const theme = getListingTheme(match);

                        return (
                            <motion.article
                                className="match-card"
                                key={`${match.listingId}-${match.matchedAt}`}
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="match-card__listing" style={{ background: theme.gradient }}>
                                    <span className="pill pill--light">
                                        <FaMapMarkerAlt />
                                        <span>{match.district}</span>
                                    </span>
                                    <h2>{match.title}</h2>
                                    <p>{match.address}</p>
                                    <div className="match-card__stats">
                                        <div>{formatCurrency(match.rent)}</div>
                                        <div>{match.rooms} rooms</div>
                                        <div>{match.sizeSqm} m²</div>
                                        <div>Ready {formatDate(match.availableFrom)}</div>
                                    </div>
                                </div>

                                <div className="match-card__body">
                                    <div className="match-card__top">
                                        <div>
                                            <span className="section-card__eyebrow">Generated inquiry</span>
                                            <h3>Ready for landlord outreach</h3>
                                        </div>
                                        {match.contactEmail && (
                                            <a className="text-link" href={`mailto:${match.contactEmail}`}>
                                                <FaEnvelope />
                                                <span>Email landlord</span>
                                            </a>
                                        )}
                                    </div>

                                    <p className="match-card__description">{match.description}</p>

                                    <textarea readOnly className="match-card__message" value={match.message} />

                                    <div className="match-card__actions">
                                        <button
                                            type="button"
                                            className="primary-button"
                                            onClick={() => handleCopy(match.listingId, match.message)}
                                        >
                                            <FaCopy />
                                            <span>{copiedId === match.listingId ? 'Copied' : 'Copy inquiry'}</span>
                                        </button>
                                        <div className="pill">{formatDate(match.availableFrom)} availability</div>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
