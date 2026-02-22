import { Container, Row, Col, Card, Button, Badge, Table, Modal, Form, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Calendar, Clock, Plus, Filter, Search, User, MoreVertical, Stethoscope } from 'lucide-react';
import Navigation from './Navbar';
import { UserRole } from '../types/index';
import { useState, useEffect } from 'react';
import { appointmentApi } from '../services/api';

const Appointments = () => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const isPatient = user?.role === UserRole.PATIENT;

    const [appointments, setAppointments] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [showBookModal, setShowBookModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [appointmentToReschedule, setAppointmentToReschedule] = useState<any>(null);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

    // Booking Form State
    const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');
    const [specializations, setSpecializations] = useState<string[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [bookingDate, setBookingDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [visitReason, setVisitReason] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [rescheduleLoading, setRescheduleLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);

    // Auto-hide status message
    useEffect(() => {
        if (statusMsg) {
            const timer = setTimeout(() => setStatusMsg(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [statusMsg]);

    useEffect(() => {
        if (isPatient) {
            fetchMyAppointments();
            fetchDoctors();
        } else {
            fetchDoctorAppointments();
        }
    }, [isPatient]);

    const fetchMyAppointments = async () => {
        try {
            const response = await appointmentApi.getMyAppointments();
            const formatted = response.data.map((apt: any) => ({
                id: apt.id,
                patient: 'Me',
                doctor: `Dr. ${apt.doctor?.fullName || 'Unknown'}`,
                doctorId: apt.doctorId,
                date: apt.date, // Keep original date string/object to be formatted by Date component
                time: `${apt.startTime} - ${apt.endTime}`,
                startTime: apt.startTime,
                endTime: apt.endTime,
                status: apt.status,
                type: apt.type,
                specialization: apt.doctor?.specialization?.[0] || 'General'
            }));
            setAppointments(formatted);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        }
    };

    const fetchDoctorAppointments = async () => {
        try {
            const response = await appointmentApi.getDoctorAppointments();
            const formatted = response.data.map((apt: any) => ({
                id: apt.id,
                patient: apt.patient?.fullName || 'Unknown',
                doctor: 'Me',
                doctorId: apt.doctorId,
                date: apt.date,
                time: `${apt.startTime} - ${apt.endTime}`,
                startTime: apt.startTime,
                endTime: apt.endTime,
                status: apt.status,
                type: apt.type
            }));
            setAppointments(formatted);
        } catch (error) {
            console.error("Failed to fetch doctor appointments", error);
        }
    };

    const fetchDoctors = async (query = '') => {
        try {
            const response = await appointmentApi.searchDoctors(query);
            console.log("Fetched doctors:", response.data);
            const formatted = response.data.map((doc: any) => ({
                id: doc.doctorId || doc.id,
                name: doc.fullName,
                specialty: doc.specialization && doc.specialization[0] ? doc.specialization[0] : 'General',
                rating: '5.0'
            }));
            setDoctors(formatted);

            // Extract unique specializations
            const specs = Array.from(new Set(formatted.map((d: any) => d.specialty))).sort() as string[];
            setSpecializations(specs);
        } catch (error) {
            console.error("Failed to fetch doctors", error);
        }
    };

    useEffect(() => {
        if (selectedDoctor && bookingDate) {
            fetchSlots(selectedDoctor.id, bookingDate);
        } else {
            setAvailableSlots([]);
        }
    }, [selectedDoctor, bookingDate]);

    // Reset selections when modal closes or opens
    useEffect(() => {
        if (showBookModal || showRescheduleModal) {
            if (!showRescheduleModal) {
                setSelectedSpecialization('');
                setSelectedDoctor(null);
                setBookingDate('');
                setSelectedSlot('');
                setVisitReason('');
                setAvailableSlots([]);
            }
        }
    }, [showBookModal, showRescheduleModal]);

    const fetchSlots = async (doctorId: number, date: string) => {
        setSlotsLoading(true);
        console.log(`Fetching slots for doctorId: ${doctorId} (${typeof doctorId}), date: ${date}`);
        try {
            const response = await appointmentApi.getAvailableSlots(doctorId, date);
            console.log("Slots API Response:", response);
            console.log("Slots Data:", response.data);
            if (Array.isArray(response.data)) {
                setAvailableSlots(response.data);
            } else {
                console.warn("Slots response data is not an array:", response.data);
                setAvailableSlots([]);
            }
        } catch (error) {
            console.error("Failed to fetch slots", error);
            setAvailableSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleBookAppointment = async () => {
        if (!selectedDoctor || !bookingDate || !selectedSlot) {
            setStatusMsg({ type: 'danger', text: 'Please fill all required fields.' });
            return;
        }

        const slot = availableSlots.find(s => s.startTime === selectedSlot);
        if (!slot) return;

        try {
            setBookingLoading(true);
            await appointmentApi.bookAppointment({
                doctorId: selectedDoctor.id,
                date: bookingDate,
                startTime: slot.startTime,
                endTime: slot.endTime,
                type: slot.type,
            });
            setStatusMsg({ type: 'success', text: 'Appointment booked successfully!' });
            setTimeout(() => {
                setShowBookModal(false);
                fetchMyAppointments();
                setSelectedDoctor(null);
                setBookingDate('');
                setSelectedSlot('');
                setVisitReason('');
            }, 1500);
        } catch (error: any) {
            console.error("Booking failed", error);
            const msg = error.response?.data?.message || 'Booking failed';

            if (error.response?.status === 404 && (msg.includes('Patient profile') || msg.includes('Patient record'))) {
                setStatusMsg({
                    type: 'danger',
                    text: 'You need to complete your profile before booking an appointment. Please go to the Profile page.'
                });
            } else {
                setStatusMsg({ type: 'danger', text: Array.isArray(msg) ? msg.join(', ') : msg });
            }
        } finally {
            setBookingLoading(false);
        }
    };

    const handleRescheduleInitiate = (apt: any) => {
        setAppointmentToReschedule(apt);
        setSelectedDoctor({ id: apt.doctorId, name: apt.doctor });
        setBookingDate(new Date(apt.date).toISOString().split('T')[0]);
        setSelectedSlot(apt.startTime);
        setShowRescheduleModal(true);
    };

    const handleRescheduleSubmit = async () => {
        if (!selectedSlot || !bookingDate) {
            setStatusMsg({ type: 'danger', text: 'Please select a date and time.' });
            return;
        }

        const slot = availableSlots.find(s => s.startTime === selectedSlot);

        try {
            setRescheduleLoading(true);
            await appointmentApi.rescheduleAppointment(appointmentToReschedule.id, {
                date: bookingDate,
                startTime: slot ? slot.startTime : selectedSlot,
                endTime: slot ? slot.endTime : appointmentToReschedule.endTime,
            });
            setStatusMsg({ type: 'success', text: 'Appointment rescheduled successfully!' });
            setTimeout(() => {
                setShowRescheduleModal(false);
                setAppointmentToReschedule(null);
                fetchMyAppointments();
            }, 1500);
        } catch (error: any) {
            console.error("Rescheduling failed", error);
            const msg = error.response?.data?.message || 'Rescheduling failed';
            setStatusMsg({ type: 'danger', text: Array.isArray(msg) ? msg.join(', ') : msg });
        } finally {
            setRescheduleLoading(false);
        }
    };

    const handleCancelAppointment = async (id: number) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            await appointmentApi.cancelAppointment(id);
            setStatusMsg({ type: 'success', text: 'Appointment cancelled successfully' });
            if (isPatient) fetchMyAppointments(); else fetchDoctorAppointments();
        } catch (error: any) {
            setStatusMsg({ type: 'danger', text: error.response?.data?.message || 'Cancellation failed' });
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await appointmentApi.updateStatus(id, status);
            setAppointments(appointments.map(apt => apt.id === id ? { ...apt, status } : apt));
            setStatusMsg({ type: 'success', text: `Appointment marked as ${status.toLowerCase()}` });
        } catch (error) {
            console.error("Failed to update status", error);
            setStatusMsg({ type: 'danger', text: 'Failed to update status' });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'BOOKED': case 'UPCOMING': return <Badge bg="success" className="rounded-pill p-2 px-3">Confirmed</Badge>;
            case 'COMPLETED': return <Badge bg="primary" className="rounded-pill p-2 px-3">Completed</Badge>;
            case 'CANCELLED': case 'CANCELED': return <Badge bg="danger" className="rounded-pill p-2 px-3">Cancelled</Badge>;
            default: return <Badge bg="secondary" className="rounded-pill p-2 px-3">{status}</Badge>;
        }
    };

    return (
        <>
            <Navigation />
            <Container className="py-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="d-flex justify-content-between align-items-center mb-4"
                >
                    <div>
                        <h2 className="fw-bold mb-1">{isPatient ? 'My Appointments' : 'Patient Appointments'}</h2>
                        <p className="text-muted mb-0">
                            {isPatient
                                ? 'Track your upcoming visits and medical history.'
                                : 'Manage your medical schedule and patient bookings.'}
                        </p>
                    </div>
                    {isPatient && (
                        <Button
                            className="premium-btn btn-primary d-flex align-items-center gap-2"
                            onClick={() => setShowBookModal(true)}
                        >
                            <Plus size={20} /> New Appointment
                        </Button>
                    )}
                </motion.div>

                {statusMsg && !showBookModal && (
                    <Alert variant={statusMsg.type} onClose={() => setStatusMsg(null)} dismissible className="border-0 shadow-sm mb-4">
                        {statusMsg.text}
                    </Alert>
                )}

                <Card className="glass-card border-0 shadow-sm overflow-hidden">
                    <Card.Header className="bg-white p-4 border-0">
                        <Row className="align-items-center g-3">
                            <Col md={6}>
                                <div className="input-group search-box">
                                    <span className="input-group-text bg-light border-0">
                                        <Search size={18} className="text-muted" />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control bg-light border-0"
                                        placeholder={isPatient ? "Search by doctor or type..." : "Search by patient or type..."}
                                        onChange={(e) => isPatient && fetchDoctors(e.target.value)}
                                    />
                                </div>
                            </Col>
                            <Col md={6} className="d-flex justify-content-md-end gap-2">
                                <Button variant="light" className="d-flex align-items-center gap-2 border">
                                    <Filter size={18} /> Filters
                                </Button>
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table hover className="align-middle mb-0 custom-table">
                                <thead className="bg-light text-secondary">
                                    <tr>
                                        <th className="px-4 py-3 border-0">{isPatient ? 'Doctor / Specialty' : 'Patient / Detail'}</th>
                                        <th className="py-3 border-0">Date & Time</th>
                                        <th className="py-3 border-0">Type</th>
                                        <th className="py-3 border-0">Status</th>
                                        <th className="px-4 py-3 border-0 text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-5 text-muted">No appointments found.</td></tr>
                                    ) : (
                                        appointments.map((apt) => (
                                            <tr key={apt.id} className="border-bottom">
                                                <td className="px-4 py-4">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="bg-primary bg-opacity-10 p-2 rounded-circle">
                                                            {isPatient ? <Stethoscope size={20} className="text-primary" /> : <User size={20} className="text-primary" />}
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold">{isPatient ? apt.doctor : apt.patient}</div>
                                                            <div className="small text-muted">{isPatient ? (apt.specialization || 'General') : apt.type}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="d-flex align-items-center gap-2 fw-semibold">
                                                        <Calendar size={16} className="text-muted" /> {new Date(apt.date).toLocaleDateString()}
                                                    </div>
                                                    <div className="small text-muted d-flex align-items-center gap-2 mt-1">
                                                        <Clock size={14} /> {apt.time}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className="text-dark fw-medium">{apt.type}</span>
                                                </td>
                                                <td className="py-4">
                                                    {getStatusBadge(apt.status)}
                                                </td>
                                                <td className="px-4 py-4 text-end">
                                                    {(apt.status === 'UPCOMING' || apt.status === 'BOOKED') && (
                                                        <div className="d-flex flex-column align-items-end gap-1">
                                                            {isPatient && (
                                                                <Button
                                                                    variant="link"
                                                                    className="text-primary p-0 text-decoration-none small fw-bold"
                                                                    onClick={() => handleRescheduleInitiate(apt)}
                                                                >
                                                                    Reschedule
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="link"
                                                                className="text-danger p-0 text-decoration-none small"
                                                                onClick={() => handleCancelAppointment(apt.id)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            {!isPatient && (
                                                                <Button
                                                                    variant="link"
                                                                    className="text-success p-0 text-decoration-none small"
                                                                    onClick={() => handleStatusUpdate(apt.id, 'COMPLETED')}
                                                                >
                                                                    Mark Completed
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            </Container>

            {/* Reschedule Modal */}
            <Modal show={showRescheduleModal} onHide={() => setShowRescheduleModal(false)} centered size="lg" className="premium-modal">
                <Modal.Header closeButton className="border-0 p-4 pb-0">
                    <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                        <div className="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                            <Clock size={20} />
                        </div>
                        <div>
                            Reschedule Appointment
                            <div className="text-muted small fw-normal" style={{ fontSize: '0.9rem' }}>Pick a new date and time</div>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 pt-2">
                    {statusMsg && (
                        <Alert variant={statusMsg.type} className="py-2 small border-0 mb-3 text-center rounded-3">
                            {statusMsg.text}
                        </Alert>
                    )}
                    <Row className="g-4">
                        <Col md={12}>
                            <div className="bg-light p-3 rounded-4 mb-2 d-flex align-items-center gap-3 border">
                                <div className="bg-white p-2 rounded-circle shadow-sm">
                                    <User className="text-primary" size={24} />
                                </div>
                                <div>
                                    <div className="small text-muted">Currently scheduled with</div>
                                    <div className="fw-bold">{appointmentToReschedule?.doctor}</div>
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="p-3 bg-light rounded-4 h-100">
                                <Form.Label className="fw-bold text-uppercase text-secondary small mb-3">Choose New Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    className="border-0 shadow-none bg-white p-3 rounded-3 fw-bold"
                                    value={bookingDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    style={{ fontSize: '1.1rem' }}
                                />
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="p-3 bg-light rounded-4 h-100">
                                <Form.Label className="fw-bold text-uppercase text-secondary small mb-3">Select New Time</Form.Label>
                                {slotsLoading ? (
                                    <div className="text-center text-primary py-4 d-flex flex-column align-items-center justify-content-center h-75">
                                        <div className="spinner-border spinner-border-sm mb-2" role="status"></div>
                                        <small className="fw-bold">Checking availability...</small>
                                    </div>
                                ) : availableSlots.length === 0 ? (
                                    <div className="text-center text-danger py-4 d-flex flex-column align-items-center justify-content-center h-75">
                                        <small className="fw-bold">No slots available on this date</small>
                                    </div>
                                ) : (
                                    <div className="d-grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', maxHeight: '200px', overflowY: 'auto' }}>
                                        {availableSlots.map((slot, idx) => (
                                            <Button
                                                key={idx}
                                                variant={selectedSlot === slot.startTime ? 'primary' : 'outline-secondary'}
                                                className={`border shadow-sm py-2 px-1 d-flex flex-column align-items-center justify-content-center ${selectedSlot === slot.startTime ? '' : 'bg-white text-dark'}`}
                                                onClick={() => setSelectedSlot(slot.startTime)}
                                                style={{ borderRadius: '12px', minHeight: '60px' }}
                                            >
                                                <span className="fw-bold small">{slot.startTime} - {slot.endTime}</span>
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>

                    <div className="mt-4 pt-3 border-top d-flex gap-3">
                        <Button variant="light" className="flex-grow-1 py-2 fw-semibold rounded-pill" onClick={() => setShowRescheduleModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-grow-1 premium-btn py-2 fw-bold rounded-pill shadow-sm"
                            onClick={handleRescheduleSubmit}
                            disabled={rescheduleLoading}
                        >
                            {rescheduleLoading ? 'Processing...' : 'Confirm Reschedule'}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal show={showBookModal} onHide={() => setShowBookModal(false)} centered size="lg" className="premium-modal">
                <Modal.Header closeButton className="border-0 p-4 pb-0">
                    <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                        <div className="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                            <Calendar size={20} />
                        </div>
                        <div>
                            New Appointment
                            <div className="text-muted small fw-normal" style={{ fontSize: '0.9rem' }}>Fill in the details below</div>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 pt-2">
                    {statusMsg && (
                        <Alert variant={statusMsg.type} className="py-2 small border-0 mb-3 text-center rounded-3">
                            {statusMsg.text}
                        </Alert>
                    )}
                    <Form>
                        {/* Step 1: Select Specialization */}
                        <div className="mb-4">
                            <Form.Label className="fw-bold text-uppercase text-secondary small mb-3">1. Select Specialization</Form.Label>
                            <div className="d-flex gap-2 overflow-auto pb-3 custom-scrollbar px-1">
                                {specializations.map(spec => (
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={spec}>
                                        <Button
                                            variant={selectedSpecialization === spec ? 'primary' : 'outline-secondary'}
                                            className={`rounded-pill px-4 py-2 fw-medium ${selectedSpecialization === spec ? 'shadow-sm' : 'border-0 bg-light text-dark'}`}
                                            onClick={() => {
                                                setSelectedSpecialization(spec);
                                                setSelectedDoctor(null); // Reset doctor when specialization changes
                                            }}
                                        >
                                            {spec}
                                        </Button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Step 2: Select Doctor (Filtered) */}
                        <div className="mb-4">
                            <Form.Label className="fw-bold text-uppercase text-secondary small mb-3">2. Select Doctor</Form.Label>
                            {!selectedSpecialization ? (
                                <div className="text-center text-muted py-3 bg-light rounded-3 d-flex flex-column align-items-center justify-content-center border border-dashed">
                                    <Stethoscope size={24} className="mb-2 opacity-50" />
                                    <small>Please select a specialization first</small>
                                </div>
                            ) : (
                                <div className="d-flex gap-3 overflow-auto pb-3 custom-scrollbar px-1">
                                    {doctors.filter(d => d.specialty === selectedSpecialization).map(doc => (
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={doc.id}>
                                            <Card
                                                className={`border-0 shadow-sm p-3 cursor-pointer text-center flex-shrink-0 position-relative ${selectedDoctor?.id === doc.id ? 'ring-2-primary bg-primary-light' : 'bg-light'}`}
                                                onClick={() => setSelectedDoctor(doc)}
                                                style={{ minWidth: '160px', borderRadius: '16px', transition: 'all 0.2s' }}
                                            >
                                                {selectedDoctor?.id === doc.id && (
                                                    <div className="position-absolute top-0 end-0 m-2 text-primary">
                                                        <div className="bg-white rounded-circle p-1 d-flex shadow-sm">
                                                            <div className="bg-primary rounded-circle" style={{ width: 8, height: 8 }} />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="bg-white p-3 rounded-circle mx-auto mb-3 shadow-sm d-flex align-items-center justify-content-center" style={{ width: 60, height: 60 }}>
                                                    <User className="text-primary" size={30} />
                                                </div>
                                                <div className="fw-bold text-dark text-truncate px-1">{doc.name}</div>
                                                <div className="text-muted small">{doc.specialty}</div>
                                            </Card>
                                        </motion.div>
                                    ))}
                                    {doctors.filter(d => d.specialty === selectedSpecialization).length === 0 && (
                                        <div className="w-100 text-center text-muted py-3">No doctors found for this specialization.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <Row className="g-4">
                            <Col md={6}>
                                <div className="p-3 bg-light rounded-4 h-100">
                                    <Form.Label className="fw-bold text-uppercase text-secondary small mb-3">3. Choose Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        className="border-0 shadow-none bg-white p-3 rounded-3 fw-bold"
                                        value={bookingDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                        style={{ fontSize: '1.1rem' }}
                                        disabled={!selectedDoctor}
                                    />
                                    <div className="mt-3 small text-muted">
                                        <Clock size={14} className="me-1" /> Select a date to view availability.
                                    </div>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="p-3 bg-light rounded-4 h-100">
                                    <Form.Label className="fw-bold text-uppercase text-secondary small mb-3">4. Select Time</Form.Label>
                                    {!bookingDate || !selectedDoctor ? (
                                        <div className="text-center text-muted py-4 d-flex flex-column align-items-center justify-content-center h-75 opacity-50">
                                            <Calendar size={32} className="mb-2" />
                                            <small>Pick a doctor & date first</small>
                                        </div>
                                    ) : slotsLoading ? (
                                        <div className="text-center text-primary py-4 d-flex flex-column align-items-center justify-content-center h-75">
                                            <div className="spinner-border spinner-border-sm mb-2" role="status"></div>
                                            <small className="fw-bold">Checking availability...</small>
                                        </div>
                                    ) : availableSlots.length === 0 ? (
                                        <div className="text-center text-danger py-4 d-flex flex-column align-items-center justify-content-center h-75">
                                            <small className="fw-bold">No slots available</small>
                                        </div>
                                    ) : (
                                        <div className="d-grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', maxHeight: '250px', overflowY: 'auto' }}>
                                            {availableSlots.map((slot, idx) => (
                                                <Button
                                                    key={idx}
                                                    variant={selectedSlot === slot.startTime ? 'primary' : 'outline-secondary'}
                                                    className={`border shadow-sm py-2 px-1 d-flex flex-column align-items-center justify-content-center ${selectedSlot === slot.startTime ? '' : 'bg-white text-dark'}`}
                                                    onClick={() => setSelectedSlot(slot.startTime)}
                                                    style={{ borderRadius: '12px', minHeight: '65px' }}
                                                >
                                                    <span className="fw-bold small">{slot.startTime} - {slot.endTime}</span>
                                                    <div className="d-flex align-items-center gap-1 mt-1">
                                                        <span style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }} className="text-uppercase badge bg-light text-dark border">{slot.type}</span>
                                                        {slot.availableCapacity !== undefined && (
                                                            <span style={{ fontSize: '0.65rem' }} className="text-muted">({slot.availableCapacity} left)</span>
                                                        )}
                                                    </div>
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Col>

                            <Col md={12}>
                                <Form.Label className="fw-bold text-uppercase text-secondary small">Reason for Visit</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Briefly describe your symptoms or reason for visit..."
                                    className="bg-light border-0 rounded-4 p-3"
                                    value={visitReason}
                                    onChange={(e) => setVisitReason(e.target.value)}
                                />
                            </Col>
                        </Row>

                        <div className="mt-4 pt-3 border-top d-flex gap-3">
                            <Button variant="light" className="flex-grow-1 py-2 fw-semibold rounded-pill" onClick={() => setShowBookModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-grow-1 premium-btn py-2 fw-bold rounded-pill shadow-sm"
                                onClick={handleBookAppointment}
                                disabled={bookingLoading}
                            >
                                {bookingLoading ? 'Processing Booking...' : 'Confirm Appointment'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <style>{`
        .custom-table tbody tr {
          transition: background 0.3s ease;
          cursor: pointer;
        }
        .custom-table tbody tr:hover {
          background-color: rgba(13, 110, 253, 0.02) !important;
        }
        .table-responsive {
          border-radius: 0 0 20px 20px;
        }
        .x-small { font-size: 0.75rem; }
        .cursor-pointer { cursor: pointer; }
        .hover-shadow:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.1); transform: translateY(-2px); transition: all 0.3s; }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #dee2e6; border-radius: 10px; }
        
        .ring-2-primary { box-shadow: 0 0 0 2px var(--bs-primary); }
        .bg-primary-light { background-color: rgba(13, 110, 253, 0.05) !important; }
        
        /* Modal tweaks */
        .premium-modal .modal-content {
            border: none;
            border-radius: 24px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
      `}</style>
        </>
    );
};

export default Appointments;
