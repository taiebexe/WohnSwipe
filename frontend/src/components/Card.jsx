import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { FaMapMarkerAlt, FaBed, FaRulerCombined, FaExternalLinkAlt } from 'react-icons/fa';

const SOURCE_BADGES = {
    WG_GESUCHT: { label: 'WG-Gesucht', color: '#f48024' },
    SEED: { label: 'WohnSwipe', color: '#fbc531' },
};

export default function Card({ data, onSwipe, style }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    const handleDragEnd = (event, info) => {
        if (info.offset.x > 100) {
            onSwipe('RIGHT');
        } else if (info.offset.x < -100) {
            onSwipe('LEFT');
        }
    };

    const badge = SOURCE_BADGES[data.source] || SOURCE_BADGES.SEED;
    const imageUrl = data.imageUrl || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop';

    return (
        <motion.div
            style={{
                ...style,
                x, rotate, opacity,
                position: 'absolute',
                top: 0,
                width: '100%',
                maxWidth: '400px',
                height: '600px',
                borderRadius: '20px',
                backgroundColor: '#fff',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                cursor: 'grab',
                overflow: 'hidden',
                userSelect: 'none'
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: 'grabbing' }}
        >
            {/* Image Area */}
            <div style={{
                height: '65%',
                backgroundColor: '#eee',
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
            }}>
                {/* Source Badge */}
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: badge.color,
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    zIndex: 2
                }}>
                    {badge.label}
                </div>

                {/* View Original Link */}
                {data.sourceUrl && (
                    <a
                        href={data.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            padding: '6px 10px',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            zIndex: 2
                        }}
                    >
                        <FaExternalLinkAlt size={10} /> Original
                    </a>
                )}

                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                    padding: '20px',
                    color: 'white'
                }}>
                    <h2 style={{ color: 'white', marginBottom: '5px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        {data.rent} &euro;
                    </h2>
                    <p style={{ color: '#eee', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaMapMarkerAlt /> {data.district || 'Berlin'}
                    </p>
                </div>
            </div>

            {/* Content Area */}
            <div style={{ padding: '15px 20px' }}>
                <h3 style={{ marginBottom: '8px', fontSize: '1rem' }}>{data.title}</h3>

                <div style={{ display: 'flex', gap: '15px', color: '#555', marginBottom: '10px', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaBed /> {data.rooms} Rooms
                    </div>
                    {data.sizeSqm && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaRulerCombined /> {data.sizeSqm} m&sup2;
                        </div>
                    )}
                </div>

                <p style={{
                    fontSize: '0.85rem',
                    color: '#777',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {data.description}
                </p>
            </div>
        </motion.div>
    );
}
