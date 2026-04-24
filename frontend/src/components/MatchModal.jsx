import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaCopy, FaEnvelopeOpenText, FaTimes } from 'react-icons/fa';
import { formatCurrency, formatDate, getListingTheme } from '../lib/product';

export default function MatchModal({ match, copied, onCopy, onClose }) {
    if (!match) {
        return null;
    }

    const theme = getListingTheme(match.listing);

    return (
        <AnimatePresence>
            <motion.div
                className="match-modal__backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="match-modal__sheet"
                    initial={{ opacity: 0, y: 32, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.98 }}
                    transition={{ duration: 0.24 }}
                >
                    <div className="match-modal__hero" style={{ background: theme.gradient }}>
                        <button type="button" className="icon-button icon-button--light" onClick={onClose} aria-label="Close match modal">
                            <FaTimes />
                        </button>

                        <span className="eyebrow-chip eyebrow-chip--light">
                            <FaCheckCircle />
                            <span>Inquiry ready</span>
                        </span>
                        <h2>{match.listing.title}</h2>
                        <p>
                            {formatCurrency(match.listing.rent)} · {match.listing.district} · {match.fit.label}
                        </p>
                    </div>

                    <div className="match-modal__body">
                        <div className="match-modal__meta">
                            <div className="pill">{formatDate(match.listing.availableFrom)} move-in ready</div>
                            {match.listing.contactEmail && <div className="pill">{match.listing.contactEmail}</div>}
                        </div>

                        <p className="match-modal__intro">
                            WohnSwipe drafted this first message from the profile you saved, so you can move from “interested”
                            to “sent” without losing momentum.
                        </p>

                        <textarea readOnly className="match-modal__message" value={match.message} />

                        <div className="match-modal__actions">
                            <button type="button" className="primary-button" onClick={onCopy}>
                                <FaCopy />
                                <span>{copied ? 'Copied to clipboard' : 'Copy inquiry'}</span>
                            </button>

                            <Link to="/matches" className="secondary-button" onClick={onClose}>
                                <FaEnvelopeOpenText />
                                <span>Open matches inbox</span>
                            </Link>

                            <button type="button" className="ghost-button" onClick={onClose}>
                                Keep swiping
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
