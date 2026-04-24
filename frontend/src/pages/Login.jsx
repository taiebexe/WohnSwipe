import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import AuthLayout from '../components/AuthLayout';
import { getProfileCompleteness, normalizeProfile } from '../lib/product';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await login(email, password);
            let nextRoute = '/swipe';

            try {
                const profileResponse = await api.get('/me');
                const completion = getProfileCompleteness(normalizeProfile(profileResponse.data));
                if (completion.percentage < 60) {
                    nextRoute = '/profile';
                }
            } catch (profileError) {
                nextRoute = '/profile';
            }

            navigate(nextRoute, { replace: true });
        } catch (err) {
            setError('Login failed. Check your email and password.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout
            eyebrow="Launch beta"
            title="Find the right apartment before someone else replies first."
            subtitle="Sign in to rank listings around your search profile and turn promising swipes into ready-to-send inquiry messages."
        >
            <div className="section-card__header">
                <div>
                    <span className="section-card__eyebrow">Welcome back</span>
                    <h2>Continue your apartment search</h2>
                </div>
            </div>

            {error && <div className="status-message status-message--error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="field-group">
                    <label htmlFor="login-email">Email</label>
                    <input
                        id="login-email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        type="email"
                        placeholder="you@berlinmove.com"
                        required
                    />
                </div>

                <div className="field-group">
                    <label htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        type="password"
                        placeholder="Minimum 8 characters"
                        required
                    />
                </div>

                <button type="submit" className="primary-button primary-button--full" disabled={submitting}>
                    {submitting ? 'Signing in' : 'Open my shortlist'}
                </button>
            </form>

            <p className="auth-footer__text">
                No account yet?{' '}
                <Link className="inline-link" to="/register">
                    Create one
                </Link>
            </p>
        </AuthLayout>
    );
}
