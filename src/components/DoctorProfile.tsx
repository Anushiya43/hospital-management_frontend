import { Container, Row, Col, Card, Button, Form, Nav, Badge, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Key, Camera, Stethoscope, Briefcase, Info, Edit2, Plus, X, Save } from 'lucide-react';
import Navigation from './Navbar';
import { useState, useEffect } from 'react';
import { doctorApi } from '../services/doctorApi';

const DoctorProfile = () => {
    const [activeTab, setActiveTab] = useState('personal');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [profileData, setProfileData] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

    // Auto-hide status message
    useEffect(() => {
        if (statusMsg) {
            const timer = setTimeout(() => setStatusMsg(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [statusMsg]);

    const [profileFormData, setProfileFormData] = useState({
        fullName: '',
        specialization: '',
        experienceYears: 0
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await doctorApi.getProfile();
            const myProfile = response.data;

            if (myProfile) {
                setProfileData(myProfile);
                setProfileFormData({
                    fullName: myProfile.fullName || '',
                    specialization: myProfile.specialization?.join(', ') || '',
                    experienceYears: myProfile.experienceYears || 0
                });
            } else {
                setProfileData(null);
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            setProfileData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setStatusMsg(null);

            const specializations = profileFormData.specialization.split(',').map(s => s.trim()).filter(s => s.length > 0);

            if (specializations.length === 0) {
                throw new Error('Please enter at least one specialization');
            }

            const data = {
                fullName: profileFormData.fullName,
                specialization: specializations,
                experienceYears: Math.max(0, isNaN(Number(profileFormData.experienceYears)) ? 0 : Number(profileFormData.experienceYears))
            };

            if (profileData) {
                await doctorApi.updateProfile(data);
            } else {
                await doctorApi.createProfile(data);
            }

            setStatusMsg({ type: 'success', text: profileData ? 'Profile updated successfully!' : 'Profile created successfully!' });
            setIsEditing(false);
            fetchProfile();
        } catch (error: any) {
            console.error('Error saving profile:', error);
            const message = error.response?.data?.message || error.message || 'Failed to save profile';
            setStatusMsg({ type: 'danger', text: Array.isArray(message) ? message.join(', ') : message });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (profileData) {
            setProfileFormData({
                fullName: profileData.fullName || '',
                specialization: profileData.specialization?.join(', ') || '',
                experienceYears: profileData.experienceYears || 0
            });
        }
        setIsEditing(false);
    };

    return (
        <>
            <Navigation />
            <Container className="py-5">
                <Row className="g-4">
                    {/* Sidebar */}
                    <Col lg={4}>
                        <Card className="glass-card border-0 shadow-sm p-4 text-center">
                            <div className="position-relative d-inline-block mx-auto mb-4">
                                <div
                                    className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mx-auto shadow-sm"
                                    style={{ width: '150px', height: '150px' }}
                                >
                                    <User size={80} className="text-primary" />
                                </div>
                                <Button
                                    size="sm"
                                    variant="primary"
                                    className="position-absolute bottom-0 end-0 rounded-circle p-2 shadow"
                                >
                                    <Camera size={16} />
                                </Button>
                            </div>
                            <h3 className="fw-bold mb-1 truncate-text">{profileData?.fullName || (user.email ? user.email.split('@')[0] : 'Doctor Profile')}</h3>
                            <p className="text-muted small mb-4">Doctor</p>

                            <div className="text-start border-top pt-4">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="bg-primary bg-opacity-10 p-2 rounded">
                                        <Mail size={18} className="text-primary" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="small text-muted">Email</div>
                                        <div className="fw-semibold truncate-text">{user.email || 'N/A'}</div>
                                    </div>
                                </div>

                                {profileData && (
                                    <>
                                        <div className="d-flex align-items-center gap-3 mb-3">
                                            <div className="bg-primary bg-opacity-10 p-2 rounded">
                                                <Stethoscope size={18} className="text-primary" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="small text-muted">Specialization</div>
                                                <div className="fw-semibold truncate-text">{profileData.specialization?.join(', ')}</div>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center gap-3 mb-3">
                                            <div className="bg-primary bg-opacity-10 p-2 rounded">
                                                <Briefcase size={18} className="text-primary" />
                                            </div>
                                            <div>
                                                <div className="small text-muted">Experience</div>
                                                <div className="fw-semibold">{profileData.experienceYears} Years</div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-primary bg-opacity-10 p-2 rounded">
                                        <MapPin size={18} className="text-primary" />
                                    </div>
                                    <div>
                                        <div className="small text-muted">Location</div>
                                        <div className="fw-semibold">Not Set</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Settings Area */}
                    <Col lg={8}>
                        <Card className="glass-card border-0 shadow-sm overflow-hidden h-100">
                            <Card.Header className="bg-white p-0 border-0 d-flex flex-wrap justify-content-between align-items-center pe-4">
                                <Nav variant="tabs" className="px-4 pt-3 border-0">
                                    <Nav.Item>
                                        <Nav.Link
                                            active={activeTab === 'personal'}
                                            onClick={() => setActiveTab('personal')}
                                            className={`border-0 border-bottom border-3 ${activeTab === 'personal' ? 'border-primary text-primary' : 'text-muted'}`}
                                        >
                                            Professional Profile
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            active={activeTab === 'security'}
                                            onClick={() => setActiveTab('security')}
                                            className={`border-0 border-bottom border-3 ${activeTab === 'security' ? 'border-primary text-primary' : 'text-muted'}`}
                                        >
                                            Security
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>

                                {activeTab === 'personal' && !isEditing && (
                                    <div className="pt-3 pb-2 ms-4 ms-lg-0">
                                        {profileData ? (
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="d-flex align-items-center gap-2 rounded-pill px-3"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                <Edit2 size={14} /> Update Profile
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="d-flex align-items-center gap-2 rounded-pill px-3 shadow-sm"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                <Plus size={14} /> Create Profile
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </Card.Header>
                            <Card.Body className="p-4">
                                {statusMsg && (
                                    <Alert variant={statusMsg.type} onClose={() => setStatusMsg(null)} dismissible className="border-0 shadow-sm mb-4">
                                        {statusMsg.text}
                                    </Alert>
                                )}
                                <motion.div
                                    key={activeTab + isEditing}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {activeTab === 'personal' && (
                                        isEditing ? (
                                            <Form onSubmit={handleProfileSubmit}>
                                                <Row className="g-3">
                                                    <Col md={12}>
                                                        <Form.Group>
                                                            <Form.Label className="small fw-bold">Full Name</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={profileFormData.fullName}
                                                                onChange={(e) => setProfileFormData({ ...profileFormData, fullName: e.target.value })}
                                                                className="bg-light border-0 py-2"
                                                                placeholder="John Doe"
                                                                required
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={8}>
                                                        <Form.Group>
                                                            <Form.Label className="small fw-bold">Specializations (comma separated)</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={profileFormData.specialization}
                                                                onChange={(e) => setProfileFormData({ ...profileFormData, specialization: e.target.value })}
                                                                className="bg-light border-0 py-2"
                                                                placeholder="Cardiology, Surgery"
                                                                required
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group>
                                                            <Form.Label className="small fw-bold">Experience (Years)</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                value={profileFormData.experienceYears}
                                                                onChange={(e) => setProfileFormData({ ...profileFormData, experienceYears: Number(e.target.value) })}
                                                                className="bg-light border-0 py-2"
                                                                required
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <div className="d-flex gap-2 mt-4">
                                                    <Button
                                                        type="submit"
                                                        className="premium-btn btn-primary d-flex align-items-center gap-2"
                                                        disabled={loading}
                                                    >
                                                        {loading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="light"
                                                        className="premium-btn d-flex align-items-center gap-2 border"
                                                        onClick={handleCancel}
                                                        disabled={loading}
                                                    >
                                                        <X size={16} /> Cancel
                                                    </Button>
                                                </div>
                                            </Form>
                                        ) : (
                                            <div className="py-2">
                                                {profileData ? (
                                                    <Row className="g-4">
                                                        <Col md={6}>
                                                            <div className="mb-4">
                                                                <label className="text-muted small uppercase fw-bold mb-1 d-block">Full Name</label>
                                                                <div className="fw-semibold fs-5">{profileData.fullName}</div>
                                                            </div>
                                                            <div className="mb-4">
                                                                <label className="text-muted small uppercase fw-bold mb-1 d-block">Experience</label>
                                                                <div className="fw-semibold fs-5">{profileData.experienceYears} Years</div>
                                                            </div>
                                                        </Col>
                                                        <Col md={6}>
                                                            <div className="mb-4">
                                                                <label className="text-muted small uppercase fw-bold mb-1 d-block">Status</label>
                                                                <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2">
                                                                    Active Account
                                                                </Badge>
                                                            </div>
                                                            <div className="mb-4">
                                                                <label className="text-muted small uppercase fw-bold mb-1 d-block">Specializations</label>
                                                                <div className="d-flex flex-wrap gap-2">
                                                                    {profileData.specialization?.map((spec: string) => (
                                                                        <Badge key={spec} bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 fw-normal">
                                                                            {spec}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </Col>
                                                        <Col xs={12}>
                                                            <div className="bg-light p-3 rounded-3 d-flex align-items-start gap-2 border">
                                                                <Info size={20} className="text-primary mt-1 flex-shrink-0" />
                                                                <p className="small text-muted mb-0">
                                                                    This information is used to personalize your experience and is visible to the hospital administration.
                                                                    Keep your profile updated to ensure better service.
                                                                </p>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                ) : (
                                                    <div className="text-center py-5">
                                                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                                                            <User size={40} className="text-muted" />
                                                        </div>
                                                        <h5 className="fw-bold">No Profile Found</h5>
                                                        <p className="text-muted small mb-4">You haven't set up your professional profile yet. Create one now to get started.</p>
                                                        <Button
                                                            variant="primary"
                                                            className="premium-btn d-flex align-items-center gap-2 mx-auto"
                                                            onClick={() => setIsEditing(true)}
                                                        >
                                                            <Plus size={16} /> Create Profile Now
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )}

                                    {activeTab === 'security' && (
                                        <div className="py-2">
                                            <div className="d-flex align-items-center justify-content-between mb-4 pb-4 border-bottom">
                                                <div>
                                                    <h6 className="fw-bold mb-1">Two-Factor Authentication</h6>
                                                    <p className="text-muted small mb-0">Add an extra layer of security to your account.</p>
                                                </div>
                                                <Form.Check type="switch" id="tfa-switch" defaultChecked />
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between mb-4 pb-4 border-bottom">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-light p-2 rounded">
                                                        <Key size={20} />
                                                    </div>
                                                    <div>
                                                        <h6 className="fw-bold mb-1">Change Password</h6>
                                                        <p className="text-muted small mb-0">Update your account password regularly.</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline-primary" size="sm" className="premium-btn">Update</Button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default DoctorProfile;
