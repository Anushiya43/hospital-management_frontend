import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import Appointments from './components/Appointments';
import Profile from './components/Profile';
import DoctorAvailability from './components/DoctorAvailability';

import AuthCallback from './components/AuthCallback';

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/availability" element={<DoctorAvailability />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
