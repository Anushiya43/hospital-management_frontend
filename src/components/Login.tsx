import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, InputGroup, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, LayoutDashboard, AlertCircle } from 'lucide-react';
import { authApi } from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'danger', text: string } | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Check for errors from navigation state (e.g. from AuthCallback)
    useEffect(() => {
        const state = location.state as { error?: string };
        if (state?.error) {
            setStatusMsg({ type: 'danger', text: state.error });
            // Clear location state to prevent message showing again on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Auto-hide status message
    useEffect(() => {
        if (statusMsg) {
            const timer = setTimeout(() => setStatusMsg(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [statusMsg]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setStatusMsg(null);
            const response = await authApi.login({ email, password });
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setStatusMsg({ type: 'success', text: 'Login successful! Redirecting...' });
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (error: any) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || 'Invalid credentials';
            setStatusMsg({ type: 'danger', text: Array.isArray(message) ? message.join(', ') : message });
        } finally {
            setLoading(false);
        }
    };



    return (
        <Container className="d-flex align-items-center justify-content-center min-vh-100">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-100"
                style={{ maxWidth: '450px' }}
            >
                <Card className="glass-card p-3 p-md-4">
                    <Card.Body className="p-2 p-md-3">
                        {statusMsg && (
                            <Alert variant={statusMsg.type} onClose={() => setStatusMsg(null)} dismissible className="border-0 shadow-sm py-2 small">
                                {statusMsg.type === 'danger' && <AlertCircle size={16} className="me-2" />}
                                {statusMsg.text}
                            </Alert>
                        )}
                        <div className="text-center mb-4">
                            <div className="d-inline-flex bg-primary bg-opacity-10 p-3 rounded-circle mb-3">
                                <LayoutDashboard size={32} className="text-primary d-md-none" />
                                <LayoutDashboard size={40} className="text-primary d-none d-md-block" />
                            </div>
                            <h2 className="fw-bold text-dark h3 h2-md">Welcome Back</h2>
                            <p className="text-muted small">Access your medical portal and records</p>
                        </div>

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="email">
                                <Form.Label className="small text-uppercase fw-bold text-secondary">Email Address</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-white border-end-0">
                                        <Mail size={18} className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="email"
                                        placeholder="name@hospital.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="border-start-0"
                                    />
                                </InputGroup>
                            </Form.Group>

                            <Form.Group className="mb-4" controlId="password">
                                <Form.Label className="small text-uppercase fw-bold text-secondary">Password</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-white border-end-0">
                                        <Lock size={18} className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="border-start-0"
                                    />
                                </InputGroup>
                            </Form.Group>



                            <Button
                                type="submit"
                                className="w-100 premium-btn btn-primary d-flex align-items-center justify-content-center gap-2"
                                disabled={loading}
                            >
                                {loading ? 'Signing In...' : <><LogIn size={18} /> Sign In</>}
                            </Button>
                        </Form>

                        <div className="mt-4 text-center">
                            <p className="text-muted small">
                                Don't have an account? <Link to="/register" className="text-primary fw-bold text-decoration-none">Sign Up</Link>
                            </p>
                        </div>

                        <div className="mt-4 border-top pt-4">
                            <div className="d-grid gap-2">
                                <Button
                                    variant="outline-dark"
                                    className="w-100 premium-btn bg-white d-flex align-items-center justify-content-center gap-2"
                                    onClick={() => authApi.googlePatientAuth()}
                                >
                                    <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '18px' }} />
                                    Sign in with Google
                                </Button>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </motion.div>
        </Container>
    );
};

export default Login;
