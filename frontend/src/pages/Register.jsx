import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { register, login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Use at least 8 characters so your account feels launch-ready too.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match yet.');
            return;
        }

        setSubmitting(true);

        try {
            await register(email, password);
            await login(email, password);
            navigate('/profile', { replace: true });
        } catch (err) {
            setError('Registration failed. Try a different email or try again in a moment.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout
            eyebrow="New account"
            title="Set up your renter profile in minutes, not messages."
            subtitle="Create an account and we’ll drop you straight into profile setup so the apartment feed can start feeling tailored instead of generic."
        >
            <div className="section-card__header">
                <div>
                    <span className="section-card__eyebrow">Create account</span>
                    <h2>Start your WohnSwipe beta</h2>
                </div>
            </div>

            {error && <div className="status-message status-message--error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="field-group">
                    <label htmlFor="register-email">Email</label>
                    <input
                        id="register-email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        type="email"
                        placeholder="you@berlinmove.com"
                        required
                    />
                </div>

                <div className="auth-input-grid">
                    <div className="field-group">
                        <label htmlFor="register-password">Password</label>
                        <input
                            id="register-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            type="password"
                            placeholder="At least 8 characters"
                            minLength={8}
                            required
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="register-confirm-password">Confirm password</label>
                        <input
                            id="register-confirm-password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            type="password"
                            placeholder="Repeat password"
                            minLength={8}
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="primary-button primary-button--full" disabled={submitting}>
                    {submitting ? 'Creating account' : 'Create account and continue'}
                </button>
            </form>

            <p className="auth-footer__text">
                Already have an account?{' '}
                <Link className="inline-link" to="/login">
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
}
