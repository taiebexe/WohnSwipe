import { motion, useMotionValue, useTransform } from 'framer-motion';
import { FaBed, FaCalendarAlt, FaMapMarkerAlt, FaRulerCombined } from 'react-icons/fa';
import { formatCurrency, formatDate, getListingTheme } from '../lib/product';

export default function Card({ data, fit, onSwipe, style, interactive = true }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-220, 220], [-12, 12]);
    const opacity = useTransform(x, [-260, -160, 0, 160, 260], [0.2, 1, 1, 1, 0.2]);
    const likeOpacity = useTransform(x, [0, 50, 160], [0, 0.35, 1]);
    const nopeOpacity = useTransform(x, [-160, -50, 0], [1, 0.35, 0]);
    const theme = getListingTheme(data);

    const handleDragEnd = (_, info) => {
        if (!interactive) {
            return;
        }

        if (info.offset.x > 100) {
            onSwipe('RIGHT');
        } else if (info.offset.x < -100) {
            onSwipe('LEFT');
        }
    };

    const heroStyle = data.imageUrl
        ? {
              backgroundImage: `linear-gradient(180deg, rgba(20, 18, 18, 0.05) 0%, rgba(20, 18, 18, 0.65) 100%), url(${data.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
          }
        : {
              background: theme.gradient
          };

    const reasons = fit?.reasons?.length ? fit.reasons : ['Good starter option while you refine your preferences'];

    return (
        <motion.div
            className={`listing-card${interactive ? '' : ' listing-card--peek'}`}
            style={{
                ...style,
                x,
                rotate,
                opacity,
                position: 'absolute',
                top: 0,
                width: '100%',
                userSelect: 'none'
            }}
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28 }}
            drag={interactive ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={handleDragEnd}
            whileTap={interactive ? { cursor: 'grabbing', scale: 0.995 } : undefined}
        >
            <div className="listing-card__hero" style={heroStyle}>
                <div className="listing-card__pattern" />
                <div className="listing-card__overlay" />

                {interactive && (
                    <>
                        <motion.div className="listing-card__badge listing-card__badge--nope" style={{ opacity: nopeOpacity }}>
                            Pass
                        </motion.div>
                        <motion.div className="listing-card__badge listing-card__badge--like" style={{ opacity: likeOpacity }}>
                            Invite
                        </motion.div>
                    </>
                )}

                <div className="listing-card__topline">
                    <span className="pill pill--light">{theme.vibe}</span>
                    {fit && <span className="pill pill--light">{fit.score}% match</span>}
                </div>

                <div className="listing-card__hero-bottom">
                    <div className="listing-card__hero-copy">
                        <h2 className="listing-card__price">{formatCurrency(data.rent)}</h2>
                        <p className="listing-card__district">
                            <FaMapMarkerAlt />
                            <span>{data.district}</span>
                        </p>
                    </div>
                    <span className="listing-card__fit">{fit?.label ?? 'Curated pick'}</span>
                </div>
            </div>

            <div className="listing-card__content">
                <div className="listing-card__title-row">
                    <div>
                        <h3>{data.title}</h3>
                        <p className="listing-card__address">{data.address}</p>
                    </div>
                </div>

                <div className="listing-card__meta-grid">
                    <div className="listing-card__meta-item">
                        <FaBed />
                        <span>{data.rooms} rooms</span>
                    </div>
                    <div className="listing-card__meta-item">
                        <FaRulerCombined />
                        <span>{data.sizeSqm} m²</span>
                    </div>
                    <div className="listing-card__meta-item">
                        <FaCalendarAlt />
                        <span>Ready {formatDate(data.availableFrom)}</span>
                    </div>
                </div>

                <p className="listing-card__description">{data.description}</p>

                <div className="listing-card__reason-list">
                    {reasons.map((reason) => (
                        <span className="listing-card__chip" key={reason}>
                            {reason}
                        </span>
                    ))}
                </div>

                <div className="listing-card__footer">
                    <div>
                        <span className="section-card__eyebrow">Landlord</span>
                        <strong>{data.landlordName || 'Private listing'}</strong>
                    </div>
                    <div>
                        <span className="section-card__eyebrow">Contact</span>
                        <strong>{data.contactEmail || 'Shared after match'}</strong>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
