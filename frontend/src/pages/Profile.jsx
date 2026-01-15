import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const [profile, setProfile] = useState({
        name: '', age: '', job: '', netIncomeRange: '', moveInDate: '',
        pets: '', smoker: false, bio: '', districts: '', maxRent: '', preferredRooms: '', tone: 'friendly'
    });
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/me').then(res => {
            // If items are null, keep default empty string to avoid uncontrolled inputs warning
            const data = res.data;
            Object.keys(data).forEach(k => { if (data[k] === null) data[k] = '' });
            setProfile(data);
        }).catch(err => console.error(err));
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/me/profile', profile);
            alert('Profile updated!');
            navigate('/swipe');
        } catch (err) {
            console.error(err);
            alert('Failed to update profile');
        }
    };

    return (
        <div className="card profile-card">
            <h2>Your Profile</h2>
            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
                    <input name="name" value={profile.name} onChange={handleChange} placeholder="Name" required />
                    <input name="age" value={profile.age} onChange={handleChange} placeholder="Age" type="number" />
                </div>
                <input name="job" value={profile.job} onChange={handleChange} placeholder="Job" />
                <input name="moveInDate" value={profile.moveInDate} onChange={handleChange} placeholder="Move-in Date" type="date" />
                <textarea name="bio" value={profile.bio} onChange={handleChange} placeholder="Short Bio" />

                <h3>Preferences</h3>
                <div className="form-row">
                    <input name="maxRent" value={profile.maxRent} onChange={handleChange} placeholder="Max Rent (€)" type="number" />
                    <input name="preferredRooms" value={profile.preferredRooms} onChange={handleChange} placeholder="Min Rooms" type="number" step="0.5" />
                </div>
                <input name="districts" value={profile.districts} onChange={handleChange} placeholder="Preferred Districts (comma sep.)" />

                <div className="form-row">
                    <select name="tone" value={profile.tone} onChange={handleChange}>
                        <option value="friendly">Friendly Tone</option>
                        <option value="formal">Formal Tone</option>
                    </select>
                </div>

                <button type="submit">Save & Start Swiping</button>
            </form>
        </div>
    );
}
