import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/AppShell';
import Login from './pages/Login';
import Matches from './pages/Matches';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Swipe from './pages/Swipe';
import './App.css';

const PublicOnlyRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? <Navigate to="/swipe" replace /> : children;
};

const ProtectedLayout = () => {
    const { user } = useAuth();
    return user ? (
        <AppShell>
            <Outlet />
        </AppShell>
    ) : (
        <Navigate to="/login" replace />
    );
};

const HomeRedirect = () => {
    const { user } = useAuth();
    return <Navigate to={user ? '/swipe' : '/login'} replace />;
};

function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <PublicOnlyRoute>
                        <Login />
                    </PublicOnlyRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicOnlyRoute>
                        <Register />
                    </PublicOnlyRoute>
                }
            />

            <Route element={<ProtectedLayout />}>
                <Route path="/swipe" element={<Swipe />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="/" element={<HomeRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
