import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Swipe from './pages/Swipe';
import Applications from './pages/Applications';
import Settings from './pages/Settings';
import BottomNav from './components/BottomNav';
import './App.css';

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

const PAGES_WITH_NAV = ['/swipe', '/applications', '/settings'];

function AppContent() {
    const location = useLocation();
    const { user } = useAuth();
    const showNav = user && PAGES_WITH_NAV.includes(location.pathname);

    return (
        <div className="app-container">
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={
                        <PrivateRoute><Profile /></PrivateRoute>
                    } />
                    <Route path="/swipe" element={
                        <PrivateRoute><Swipe /></PrivateRoute>
                    } />
                    <Route path="/applications" element={
                        <PrivateRoute><Applications /></PrivateRoute>
                    } />
                    <Route path="/settings" element={
                        <PrivateRoute><Settings /></PrivateRoute>
                    } />
                    <Route path="/" element={<Navigate to="/swipe" />} />
                </Routes>
            </div>
            {showNav && <BottomNav />}
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
