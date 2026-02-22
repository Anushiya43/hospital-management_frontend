import { Container } from 'react-bootstrap';
import { motion } from 'framer-motion';
import Navigation from './Navbar';

const DoctorDashboard = () => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    return (
        <>
            <Navigation />
            <Container className="py-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-5"
                >
                    <h1 className="fw-bold display-5">
                        Good Morning, Dr. {user?.email ? user.email.split('@')[0] : 'Guest'}
                    </h1>
                    <p className="text-muted lead">
                        Welcome to your dashboard.
                    </p>
                </motion.div>
            </Container>
        </>
    );
};

export default DoctorDashboard;
