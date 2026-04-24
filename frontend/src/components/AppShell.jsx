import { NavLink } from 'react-router-dom';
import { FaCompass, FaEnvelopeOpenText, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getUserLabel } from '../lib/product';

const navigation = [
    { to: '/swipe', label: 'Discover', icon: <FaCompass /> },
    { to: '/matches', label: 'Matches', icon: <FaEnvelopeOpenText /> },
    { to: '/profile', label: 'Profile', icon: <FaUserCircle /> }
];

export default function AppShell({ children }) {
    const { user, logout } = useAuth();
    const displayName = getUserLabel(user);

    return (
        <div className="shell-backdrop">
            <div className="product-shell">
                <aside className="product-sidebar">
                    <div className="brand-lockup">
                        <div className="brand-mark">W</div>
                        <div>
                            <div className="brand-name">WohnSwipe</div>
                            <p className="brand-tagline">Launch-ready apartment discovery</p>
                        </div>
                    </div>

                    <p className="sidebar-copy">
                        A sharper shell for the repo’s best idea: fast apartment discovery paired with AI-written outreach.
                    </p>

                    <div className="shell-user-card">
                        <span className="shell-user-card__label">Signed in as</span>
                        <strong>{displayName}</strong>
                        <small>{user?.email}</small>
                    </div>

                    <nav className="shell-nav" aria-label="Primary">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `shell-nav__link${isActive ? ' shell-nav__link--active' : ''}`
                                }
                            >
                                <span className="shell-nav__icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    <button type="button" className="shell-signout" onClick={logout}>
                        <FaSignOutAlt />
                        <span>Sign out</span>
                    </button>
                </aside>

                <div className="product-main">
                    <header className="mobile-bar">
                        <div className="brand-lockup brand-lockup--mobile">
                            <div className="brand-mark">W</div>
                            <div>
                                <div className="brand-name">WohnSwipe</div>
                                <p className="brand-tagline">Product shell</p>
                            </div>
                        </div>

                        <button type="button" className="icon-button" onClick={logout} aria-label="Sign out">
                            <FaSignOutAlt />
                        </button>
                    </header>

                    <main className="product-content">{children}</main>

                    <nav className="mobile-nav" aria-label="Bottom navigation">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `mobile-nav__link${isActive ? ' mobile-nav__link--active' : ''}`
                                }
                            >
                                <span className="mobile-nav__icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}
