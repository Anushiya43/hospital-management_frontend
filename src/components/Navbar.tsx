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
        <Navbar expand="lg" className="glass-card m-2 m-md-3 border-0 sticky-top shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 fw-bold text-primary">
                    <Activity size={24} className="d-md-none" />
                    <Activity size={28} className="d-none d-md-block" />
                    <span>CareSync</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none">
                    <span className="navbar-toggler-icon small"></span>
                </Navbar.Toggle>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto align-items-center gap-2 gap-lg-3 py-3 py-lg-0">
                        <Nav.Link as={Link} to="/dashboard" className="px-3 w-100 text-center text-lg-start">Dashboard</Nav.Link>
                        <Nav.Link as={Link} to="/appointments" className="px-3 w-100 text-center text-lg-start">Appointments</Nav.Link>
                        {isDoctor && (
                            <Nav.Link as={Link} to="/availability" className="px-3 w-100 text-center text-lg-start">Availability</Nav.Link>
                        )}
                        <Nav.Link as={Link} to="/profile" className="px-3 w-100 text-center text-lg-start">Profile</Nav.Link>
                        <div className="d-flex align-items-center justify-content-center gap-2 ms-lg-3 mt-3 mt-lg-0 w-100 w-lg-auto">
                            <Button
                                variant="outline-primary"
                                className="premium-btn d-flex align-items-center gap-2 rounded-pill px-3"
                                onClick={() => navigate('/profile')}
                            >
                                <UserIcon size={18} />
                                <span className="d-none d-lg-inline">{user.email ? user.email.split('@')[0] : 'Profile'}</span>
                            </Button>
                            <Button
                                variant="danger"
                                className="premium-btn d-flex align-items-center gap-2 rounded-pill px-3"
                                onClick={handleLogout}
                            >
                                <LogOut size={18} />
                                <span className="d-lg-none">Logout</span>
                            </Button>
                        </div>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;
