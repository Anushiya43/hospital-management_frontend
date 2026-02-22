import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, LogOut, User as UserIcon } from 'lucide-react';

const Navigation = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isDoctor = user?.role === 'DOCTOR';
    const isPatient = user?.role === 'PATIENT';

    return (
        <Navbar expand="lg" className="glass-card m-3 border-0 sticky-top shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 fw-bold text-primary">
                    <Activity size={28} />
                    <span>CareSync</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto align-items-center gap-3">
                        <Nav.Link as={Link} to="/dashboard" className="px-3">Dashboard</Nav.Link>
                        <Nav.Link as={Link} to="/appointments" className="px-3">Appointments</Nav.Link>
                        {isDoctor && (
                            <Nav.Link as={Link} to="/availability" className="px-3">Availability</Nav.Link>
                        )}
                        <Nav.Link as={Link} to="/profile" className="px-3">Profile</Nav.Link>
                        <div className="d-flex align-items-center gap-2 ms-lg-3">
                            <Button
                                variant="outline-primary"
                                className="premium-btn d-flex align-items-center gap-2"
                                onClick={() => navigate('/profile')}
                            >
                                <UserIcon size={18} /> {user.email ? user.email.split('@')[0] : 'Profile'}
                            </Button>
                            <Button
                                variant="danger"
                                className="premium-btn d-flex align-items-center gap-2"
                                onClick={handleLogout}
                            >
                                <LogOut size={18} />
                            </Button>
                        </div>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;
