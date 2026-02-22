import { Container, Row, Col, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Activity, Shield, Clock, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-vh-100 d-flex flex-column">
            {/* Navigation on Landing */}
            <nav className="p-4 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2 fw-bold text-primary fs-4">
                    <Activity size={32} />
                    <span>CareSync</span>
                </div>
                <div className="d-flex gap-3">
                    <Link to="/login">
                        <Button variant="link" className="text-decoration-none fw-semibold">Sign In</Button>
                    </Link>
                    <Link to="/register">
                        <Button className="premium-btn btn-primary">Join Now</Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <Container className="flex-grow-1 d-flex align-items-center py-5">
                <Row className="align-items-center g-5">
                    <Col lg={6}>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="badge bg-primary bg-opacity-10 text-primary p-2 px-3 rounded-pill mb-3 fw-bold">
                                Next-Gen Healthcare Management
                            </span>
                            <h1 className="display-3 fw-bold mb-4">
                                Smart Healthcare <br />
                                <span className="text-primary">Simplified.</span>
                            </h1>
                            <p className="lead text-muted mb-5">
                                Experience the future of hospital management. Connect doctors and patients
                                with seamless scheduling, electronic records, and premium healthcare delivery tools.
                            </p>
                            <div className="d-flex gap-3 flex-wrap">
                                <Link to="/register">
                                    <Button size="lg" className="premium-btn btn-primary d-flex align-items-center gap-2">
                                        Start Your Journey <ArrowRight size={20} />
                                    </Button>
                                </Link>
                                <Button size="lg" variant="outline-dark" className="premium-btn">
                                    Explore Features
                                </Button>
                            </div>
                        </motion.div>
                    </Col>
                    <Col lg={6}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1 }}
                            className="position-relative"
                        >
                            <div
                                className="glass-card p-5 text-center animate-fade-in"
                                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)' }}
                            >
                                <img
                                    src="https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg"
                                    alt="Doctor Illustration"
                                    className="img-fluid rounded-4 mb-4 shadow-lg"
                                    style={{ maxWidth: '80%' }}
                                />
                                <div className="d-flex justify-content-center gap-4">
                                    <div className="text-center">
                                        <h4 className="fw-bold mb-0">10k+</h4>
                                        <p className="small text-muted">Patients</p>
                                    </div>
                                    <div className="vr"></div>
                                    <div className="text-center">
                                        <h4 className="fw-bold mb-0">500+</h4>
                                        <p className="small text-muted">Doctors</p>
                                    </div>
                                    <div className="vr"></div>
                                    <div className="text-center">
                                        <h4 className="fw-bold mb-0">99%</h4>
                                        <p className="small text-muted">Satisfaction</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Element */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="position-absolute glass-card p-3 d-flex align-items-center gap-3 shadow-sm"
                                style={{ top: '10%', right: '-5%', maxWidth: '200px' }}
                            >
                                <div className="bg-success bg-opacity-10 p-2 rounded-circle">
                                    <Shield size={20} className="text-success" />
                                </div>
                                <div>
                                    <h6 className="mb-0 fw-bold">Secure Data</h6>
                                    <p className="small text-muted mb-0">HIPAA Compliant</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </Col>
                </Row>
            </Container>

            {/* Trust Section */}
            <div className="py-5 bg-white bg-opacity-50">
                <Container>
                    <Row className="g-4">
                        {[
                            { icon: <Clock />, title: "Real-time Booking", desc: "Instantly schedule appointments with any available specialist." },
                            { icon: <Users />, title: "Specialist Network", desc: "Access top-tier medical professionals across all departments." },
                            { icon: <Activity />, title: "Smart Monitoring", desc: "Track patient progress and vitals with integrated digital tools." }
                        ].map((f, i) => (
                            <Col md={4} key={i}>
                                <div className="p-4 text-center h-100">
                                    <div className="d-inline-flex bg-primary bg-opacity-10 p-3 rounded-circle mb-3 text-primary">
                                        {f.icon}
                                    </div>
                                    <h5 className="fw-bold">{f.title}</h5>
                                    <p className="text-muted">{f.desc}</p>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default Home;
