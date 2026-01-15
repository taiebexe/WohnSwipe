import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(email, password);
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            setError('Registration failed.');
        }
    };

    return (
        <div className="card">
            <h2>Register</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
                </div>
                <button type="submit">Register</button>
            </form>
            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}
