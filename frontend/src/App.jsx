import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Swipe from './pages/Swipe';
import './App.css';

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    } />
                    <Route path="/swipe" element={
                        <PrivateRoute>
                            <Swipe />
                        </PrivateRoute>
                    } />
                    <Route path="/" element={<Navigate to="/swipe" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
