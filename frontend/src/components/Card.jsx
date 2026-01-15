import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { FaMapMarkerAlt, FaBed, FaRulerCombined } from 'react-icons/fa';

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

    return (
        <motion.div
            style={{
                ...style,
                x,
                rotate,
                opacity,
                position: 'absolute',
                top: 0,
                width: '100%',
                maxWidth: '400px', // constrain width within container
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
                height: '70%',
                backgroundColor: '#eee',
                backgroundImage: 'url(https://source.unsplash.com/random/800x600/?apartment,interior)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                    padding: '20px',
                    color: 'white'
                }}>
                    <h2 style={{ color: 'white', marginBottom: '5px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{data.rent} €</h2>
                    <p style={{ color: '#eee', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaMapMarkerAlt /> {data.district}
                    </p>
                </div>
            </div>

            {/* Content Area */}
            <div style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '10px' }}>{data.title}</h3>

                <div style={{ display: 'flex', gap: '15px', color: '#555', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaBed /> {data.rooms} Rooms
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaRulerCombined /> {data.sizeSqm} m²
                    </div>
                </div>

                <p style={{
                    fontSize: '0.9rem',
                    color: '#777',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {data.description}
                </p>
            </div>

            {/* Overlay Labels (Like/Nope) - Could add these later as motion values too */}
        </motion.div>
    );
}
