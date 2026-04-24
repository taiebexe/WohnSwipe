import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    getDistrictList,
    getProfileCompleteness,
    getProfilePreview,
    normalizeProfile,
    serializeProfileForApi
} from '../lib/product';

const districtSuggestions = ['Friedrichshain', 'Mitte', 'Kreuzberg', 'Neukölln', 'Wedding', 'Prenzlauer Berg'];
const incomeRanges = ['Under 2.5k net', '2.5k - 4k net', '4k - 6k net', '6k+ net'];
const toneOptions = [
    { value: 'friendly', label: 'Friendly', description: 'Warm, conversational, still respectful.' },
    { value: 'formal', label: 'Formal', description: 'Clear, polished and more traditional.' }
];
const petOptions = ['No pets', 'Cat', 'Dog', 'Small pet', 'Open to pet-friendly homes'];

export default function Profile() {
    const [profile, setProfile] = useState(normalizeProfile());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);

        try {
            const response = await api.get('/me');
            setProfile(normalizeProfile(response.data));
        } catch (err) {
            setStatus({ type: 'error', message: 'We could not load your profile right now.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const toggleDistrict = (district) => {
        const activeDistricts = getDistrictList(profile.districts);
        const nextDistricts = activeDistricts.includes(district)
            ? activeDistricts.filter((item) => item !== district)
            : [...activeDistricts, district];

        setProfile((previous) => ({
            ...previous,
            districts: nextDistricts.join(', ')
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setStatus({ type: '', message: '' });

        try {
            await api.put('/me/profile', serializeProfileForApi(profile));
            setStatus({
                type: 'success',
                message: 'Profile saved. Your swipe deck will now feel more intentional.'
            });
        } catch (err) {
            setStatus({
                type: 'error',
                message: 'Saving failed. Please review your inputs and try again.'
            });
        } finally {
            setSaving(false);
        }
    };

    const completion = getProfileCompleteness(profile);
    const selectedDistricts = getDistrictList(profile.districts);

    return (
        <div className="page">
            <section className="page-hero">
                <div className="hero-grid">
                    <div>
                        <span className="eyebrow-chip">Profile setup</span>
                        <h1>Give the matching engine something real to work with.</h1>
                        <p>
                            This page now behaves more like product onboarding than a placeholder form. The more detail you
                            add, the more believable the ranking and inquiry tone become.
                        </p>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-card">
                            <span className="stat-card__label">Completion</span>
                            <strong className="stat-card__value">{completion.percentage}%</strong>
                        </div>
                        <div className="stat-card">
                            <span className="stat-card__label">Districts saved</span>
                            <strong className="stat-card__value">{selectedDistricts.length}</strong>
                        </div>
                    </div>
                </div>
            </section>

            {status.message && (
                <div className={`status-message ${status.type === 'error' ? 'status-message--error' : 'status-message--success'}`}>
                    {status.message}
                </div>
            )}

            <div className="profile-layout">
                <motion.form
                    onSubmit={handleSubmit}
                    className="section-card"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="section-card__header">
                        <div>
                            <span className="section-card__eyebrow">Renter identity</span>
                            <h2>Shape how landlords experience you</h2>
                        </div>
                    </div>

                    <div className="progress-bar" aria-hidden="true">
                        <div className="progress-bar__value" style={{ width: `${completion.percentage}%` }} />
                    </div>

                    {loading ? (
                        <div className="section-card section-card--ghost">
                            <p>Loading your saved preferences…</p>
                        </div>
                    ) : (
                        <>
                            <section className="form-section">
                                <div className="form-section__header">
                                    <span className="section-card__eyebrow">About you</span>
                                    <h3>Make the inquiry message sound credible</h3>
                                </div>

                                <div className="form-section__grid">
                                    <div className="field-group">
                                        <label htmlFor="profile-name">Full name</label>
                                        <input
                                            id="profile-name"
                                            name="name"
                                            value={profile.name}
                                            onChange={handleChange}
                                            placeholder="Alex Weber"
                                            required
                                        />
                                    </div>

                                    <div className="field-group">
                                        <label htmlFor="profile-age">Age</label>
                                        <input
                                            id="profile-age"
                                            name="age"
                                            value={profile.age}
                                            onChange={handleChange}
                                            placeholder="29"
                                            type="number"
                                            min="18"
                                        />
                                    </div>

                                    <div className="field-group">
                                        <label htmlFor="profile-job">Job or role</label>
                                        <input
                                            id="profile-job"
                                            name="job"
                                            value={profile.job}
                                            onChange={handleChange}
                                            placeholder="Product designer"
                                        />
                                    </div>

                                    <div className="field-group">
                                        <label htmlFor="profile-income">Net income range</label>
                                        <select
                                            id="profile-income"
                                            name="netIncomeRange"
                                            value={profile.netIncomeRange}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select a range</option>
                                            {incomeRanges.map((range) => (
                                                <option key={range} value={range}>
                                                    {range}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="field-group field-group--wide">
                                        <label htmlFor="profile-bio">Short renter bio</label>
                                        <textarea
                                            id="profile-bio"
                                            name="bio"
                                            value={profile.bio}
                                            onChange={handleChange}
                                            placeholder="What should a landlord know in the first 10 seconds?"
                                            rows="4"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="form-section">
                                <div className="form-section__header">
                                    <span className="section-card__eyebrow">Search criteria</span>
                                    <h3>Tell WohnSwipe what “good” looks like</h3>
                                </div>

                                <div className="form-section__grid">
                                    <div className="field-group">
                                        <label htmlFor="profile-move-in">Target move-in date</label>
                                        <input
                                            id="profile-move-in"
                                            name="moveInDate"
                                            value={profile.moveInDate}
                                            onChange={handleChange}
                                            type="date"
                                        />
                                    </div>

                                    <div className="field-group">
                                        <label htmlFor="profile-max-rent">Max rent</label>
                                        <input
                                            id="profile-max-rent"
                                            name="maxRent"
                                            value={profile.maxRent}
                                            onChange={handleChange}
                                            placeholder="1400"
                                            type="number"
                                            min="0"
                                        />
                                    </div>

                                    <div className="field-group">
                                        <label htmlFor="profile-rooms">Minimum rooms</label>
                                        <input
                                            id="profile-rooms"
                                            name="preferredRooms"
                                            value={profile.preferredRooms}
                                            onChange={handleChange}
                                            placeholder="2"
                                            type="number"
                                            min="0.5"
                                            step="0.5"
                                        />
                                    </div>

                                    <div className="field-group">
                                        <label htmlFor="profile-pets">Pets</label>
                                        <select id="profile-pets" name="pets" value={profile.pets} onChange={handleChange}>
                                            <option value="">Choose one</option>
                                            {petOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="field-group field-group--wide">
                                        <label htmlFor="profile-districts">Preferred districts</label>
                                        <input
                                            id="profile-districts"
                                            name="districts"
                                            value={profile.districts}
                                            onChange={handleChange}
                                            placeholder="Friedrichshain, Kreuzberg"
                                        />
                                        <div className="chip-group">
                                            {districtSuggestions.map((district) => (
                                                <button
                                                    type="button"
                                                    key={district}
                                                    className={`chip${selectedDistricts.includes(district) ? ' chip--active' : ''}`}
                                                    onClick={() => toggleDistrict(district)}
                                                >
                                                    {district}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <label className="checkbox-row">
                                        <input
                                            name="smoker"
                                            type="checkbox"
                                            checked={profile.smoker}
                                            onChange={handleChange}
                                        />
                                        <span>Smoker</span>
                                    </label>
                                </div>
                            </section>

                            <section className="form-section">
                                <div className="form-section__header">
                                    <span className="section-card__eyebrow">Application tone</span>
                                    <h3>Choose how generated messages should sound</h3>
                                </div>

                                <div className="chip-group chip-group--tones">
                                    {toneOptions.map((toneOption) => (
                                        <button
                                            key={toneOption.value}
                                            type="button"
                                            className={`chip chip--tone${profile.tone === toneOption.value ? ' chip--active' : ''}`}
                                            onClick={() =>
                                                setProfile((previous) => ({
                                                    ...previous,
                                                    tone: toneOption.value
                                                }))
                                            }
                                        >
                                            <strong>{toneOption.label}</strong>
                                            <span>{toneOption.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <div className="section-toolbar">
                                <button type="submit" className="primary-button" disabled={saving}>
                                    {saving ? 'Saving profile' : 'Save profile'}
                                </button>
                                <Link to="/swipe" className="secondary-button">
                                    View curated listings
                                </Link>
                            </div>
                        </>
                    )}
                </motion.form>

                <motion.aside
                    className="profile-sidebar"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 }}
                >
                    <div className="section-card profile-preview">
                        <div className="section-card__header">
                            <div>
                                <span className="section-card__eyebrow">Preview</span>
                                <h2>How the product reads your profile</h2>
                            </div>
                        </div>

                        <p>{getProfilePreview(profile)}</p>

                        <div className="detail-list">
                            <div className="detail-list__item">
                                <span>Priority districts</span>
                                <strong>{selectedDistricts.length > 0 ? selectedDistricts.join(', ') : 'Not set yet'}</strong>
                            </div>
                            <div className="detail-list__item">
                                <span>Budget ceiling</span>
                                <strong>{profile.maxRent ? `€${profile.maxRent}` : 'Flexible'}</strong>
                            </div>
                            <div className="detail-list__item">
                                <span>Tone</span>
                                <strong>{profile.tone === 'formal' ? 'Formal' : 'Friendly'}</strong>
                            </div>
                        </div>

                        <p className="profile-preview__note">
                            Missing fields: {completion.missing.length > 0 ? completion.missing.join(', ') : 'None'}
                        </p>
                    </div>
                </motion.aside>
            </div>
        </div>
    );
}
