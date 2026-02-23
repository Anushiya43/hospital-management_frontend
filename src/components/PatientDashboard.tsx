import { Container } from 'react-bootstrap';
import { motion } from 'framer-motion';
import Navigation from './Navbar';

const PatientDashboard = () => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    return (
        <>
            <Navigation />
            <Container className="py-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-4 mb-md-5"
                >
                    <h1 className="fw-bold h2 h1-md mb-2">
                        Hello, {user?.email ? user.email.split('@')[0] : 'Guest'}
                    </h1>
                    <p className="text-muted small lead-md">
                        Welcome to your dashboard.
                    </p>
                </motion.div>
            </Container>
        </>
    );
};

export default PatientDashboard;
