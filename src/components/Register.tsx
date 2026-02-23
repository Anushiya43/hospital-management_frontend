import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Row, Col, InputGroup, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, UserPlus, UserCircle } from 'lucide-react';
import { UserRole } from '../types';

import { authApi } from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: UserRole.PATIENT,
    });
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'danger', text: string } | null>(null);
    const navigate = useNavigate();

    // Auto-hide status message
    useEffect(() => {
        if (statusMsg) {
            const timer = setTimeout(() => setStatusMsg(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [statusMsg]);

    const handleSendOtp = async () => {
        try {
            setLoading(true);
            setStatusMsg(null);
            await authApi.sendOtp(formData.email);
            setIsOtpSent(true);
            setStatusMsg({ type: 'success', text: 'OTP sent to your email.' });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to send OTP';
            setStatusMsg({ type: 'danger', text: Array.isArray(message) ? message.join(', ') : message });
        } finally {
            setLoading(false);
        }
    };


    const handleFinalRegister = async () => {
        try {
            setLoading(true);
            setStatusMsg(null);
            await authApi.register({
                email: formData.email,
                password: formData.password,
                conformPassword: formData.confirmPassword, // Updated to match backend
                role: formData.role
            });
            setStatusMsg({ type: 'success', text: 'Registration successful! Redirecting to login...' });
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error: any) {
            console.error('Registration failed:', error);
            const message = error.response?.data?.message || 'Registration failed';
            setStatusMsg({ type: 'danger', text: Array.isArray(message) ? message.join(', ') : message });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtpAndRegister = async () => {
        try {
            setLoading(true);
            setStatusMsg(null);
            await authApi.verifyOtp(formData.email, otp);
            setIsEmailVerified(true);
            await handleFinalRegister();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Invalid OTP';
            setStatusMsg({ type: 'danger', text: Array.isArray(message) ? message.join(', ') : message });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleDoctorAuth = () => {
        authApi.googleDoctorAuth();
    };

    const handleGooglePatientAuth = () => {
        authApi.googlePatientAuth();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (!isOtpSent) {
            await handleSendOtp();
        } else if (!isEmailVerified) {
            await handleVerifyOtpAndRegister();
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <Container className="d-flex align-items-center justify-content-center min-vh-100 py-5">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-100"
                style={{ maxWidth: '550px' }}
            >
                <Card className="glass-card p-4 border-0">
                    <Card.Body>
                        {statusMsg && (
                            <Alert variant={statusMsg.type} onClose={() => setStatusMsg(null)} dismissible className="border-0 shadow-sm py-2 small mb-4">
                                {statusMsg.text}
                            </Alert>
                        )}
                        <div className="text-center mb-4">
                            <div className="d-inline-flex bg-primary bg-opacity-10 p-3 rounded-circle mb-3">
                                <UserPlus size={40} className="text-primary" />
                            </div>
                            <h2 className="fw-bold text-dark">Create Account</h2>
                            <p className="text-muted">Join our healthcare network today</p>
                        </div>

                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={12}>
                                    <div className="mb-4 text-center border-bottom pb-4">
                                        <Button
                                            variant="outline-dark"
                                            className="w-100 premium-btn bg-white d-flex align-items-center justify-content-center gap-2 mb-2"
                                            onClick={handleGoogleDoctorAuth}
                                        >
                                            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '18px' }} />
                                            Continue as Doctor with Google
                                        </Button>
                                        <Button
                                            variant="outline-dark"
                                            className="w-100 premium-btn bg-white d-flex align-items-center justify-content-center gap-2 mb-2"
                                            onClick={handleGooglePatientAuth}
                                        >
                                            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '18px' }} />
                                            Continue as Patient with Google
                                        </Button>
                                        <div className="text-muted small">Or register with email</div>
                                    </div>
                                </Col>

                                <Col xs={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small text-uppercase fw-bold text-secondary">Account Type</Form.Label>
                                        <div className="d-flex flex-wrap flex-sm-nowrap gap-2">
                                            {Object.values(UserRole).map((role) => (
                                                <Button
                                                    key={role}
                                                    variant={formData.role === role ? 'primary' : 'outline-secondary'}
                                                    className="flex-grow-1 premium-btn py-2 px-1"
                                                    size="sm"
                                                    onClick={() => setFormData({ ...formData, role: role as UserRole })}
                                                    disabled={isEmailVerified}
                                                >
                                                    {role}
                                                </Button>
                                            ))}
                                        </div>
                                    </Form.Group>
                                </Col>

                                <Col xs={12}>
                                    <Form.Group className="mb-3" controlId="email">
                                        <Form.Label className="small text-uppercase fw-bold text-secondary">Email Address</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text className="bg-white border-end-0">
                                                <Mail size={18} className="text-muted" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                name="email"
                                                type="email"
                                                placeholder="john@example.com"
                                                onChange={handleChange}
                                                required
                                                className="border-start-0"
                                                disabled={isOtpSent}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>

                                {isOtpSent && !isEmailVerified && (
                                    <Col xs={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-uppercase fw-bold text-secondary">Enter OTP</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="6-digit OTP"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    required
                                                />
                                            </InputGroup>
                                            <div className="text-end mt-2">
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="p-0 text-decoration-none"
                                                    onClick={handleSendOtp}
                                                    disabled={loading}
                                                >
                                                    Resend OTP
                                                </Button>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                )}

                                <Col xs={12}>
                                    <Form.Group className="mb-3" controlId="phone">
                                        <Form.Label className="small text-uppercase fw-bold text-secondary">Phone Number</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text className="bg-white border-end-0">
                                                <Phone size={18} className="text-muted" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                name="phone"
                                                type="tel"
                                                placeholder="+1 (555) 000-0000"
                                                onChange={handleChange}
                                                className="border-start-0"
                                                disabled={isOtpSent}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={6}>
                                    <Form.Group className="mb-3" controlId="password">
                                        <Form.Label className="small text-uppercase fw-bold text-secondary">Password</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text className="bg-white border-end-0">
                                                <Lock size={18} className="text-muted" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                name="password"
                                                type="password"
                                                placeholder="••••••••"
                                                onChange={handleChange}
                                                required
                                                className="border-start-0"
                                                disabled={isOtpSent}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>

                                <Col xs={12} md={6}>
                                    <Form.Group className="mb-3" controlId="confirmPassword">
                                        <Form.Label className="small text-uppercase fw-bold text-secondary">Confirm</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text className="bg-white border-end-0">
                                                <Lock size={18} className="text-muted" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                name="confirmPassword"
                                                type="password"
                                                placeholder="••••••••"
                                                onChange={handleChange}
                                                required
                                                className="border-start-0"
                                                disabled={isOtpSent}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Button
                                type="submit"
                                className="w-100 mt-3 premium-btn btn-primary shadow-sm"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : isOtpSent ? 'Verify & Register' : 'Register & Send OTP'}
                            </Button>
                        </Form>

                        <div className="mt-4 text-center">
                            <p className="text-muted small">
                                Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Sign In</Link>
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            </motion.div>
        </Container>
    );
};

export default Register;
