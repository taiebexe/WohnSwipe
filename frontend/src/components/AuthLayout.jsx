import { motion } from 'framer-motion';
import { FaBolt, FaEnvelopeOpenText, FaMapMarkedAlt } from 'react-icons/fa';

const launchPoints = [
    {
        icon: <FaMapMarkedAlt />,
        title: 'Curated apartment discovery',
        copy: 'Rank listings around your budget, move-in timing, and favourite districts.'
    },
    {
        icon: <FaEnvelopeOpenText />,
        title: 'Inquiry messages that are ready to send',
        copy: 'Every match can turn into a polished first contact instead of a blank page.'
    },
    {
        icon: <FaBolt />,
        title: 'Fast enough for competitive markets',
        copy: 'Designed around quick decisions without losing the detail renters actually need.'
    }
];

export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
    return (
        <div className="auth-shell">
            <motion.section
                className="auth-hero"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
            >
                <span className="eyebrow-chip">{eyebrow}</span>
                <div className="brand-lockup brand-lockup--auth">
                    <div className="brand-mark">W</div>
                    <div>
                        <div className="brand-name">WohnSwipe</div>
                        <p className="brand-tagline">Berlin apartment matching, rebuilt for launch.</p>
                    </div>
                </div>

                <h1>{title}</h1>
                <p className="auth-hero__subtitle">{subtitle}</p>

                <div className="auth-metrics">
                    <div className="stat-card">
                        <span className="stat-card__label">Product lens</span>
                        <strong className="stat-card__value">Speed + trust</strong>
                    </div>
                    <div className="stat-card">
                        <span className="stat-card__label">Core promise</span>
                        <strong className="stat-card__value">Swipe, shortlist, send</strong>
                    </div>
                </div>

                <div className="launch-points">
                    {launchPoints.map((point) => (
                        <article className="launch-point" key={point.title}>
                            <div className="launch-point__icon">{point.icon}</div>
                            <div>
                                <h3>{point.title}</h3>
                                <p>{point.copy}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </motion.section>

            <motion.section
                className="auth-panel"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
            >
                <div className="auth-card">
                    {children}
                    {footer}
                </div>
            </motion.section>
        </div>
    );
}
