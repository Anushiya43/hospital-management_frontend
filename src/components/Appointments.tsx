import { Container, Row, Col, Button, Alert, Card, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Plus, Search as SearchIcon, Filter as FilterIcon } from 'lucide-react';
import Navigation from './Navbar';
import { UserRole } from '../types/index';
import { useState, useEffect } from 'react';
import { appointmentApi } from '../services/api';
import AppointmentList from './AppointmentList';
import BookingModal from './BookingModal';
import RescheduleModal from './RescheduleModal';

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
                date: apt.date,
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
            const formatted = response.data.map((doc: any) => ({
                id: doc.doctorId || doc.id,
                name: doc.fullName,
                specialty: doc.specialization && doc.specialization[0] ? doc.specialization[0] : 'General',
                rating: '5.0'
            }));
            setDoctors(formatted);

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
        try {
            const response = await appointmentApi.getAvailableSlots(doctorId, date);
            if (Array.isArray(response.data)) {
                setAvailableSlots(response.data);
            } else {
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
            }, 1500);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Booking failed';
            setStatusMsg({ type: 'danger', text: Array.isArray(msg) ? msg.join(', ') : msg });
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
                    className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4"
                >
                    <div>
                        <h2 className="fw-bold mb-1">{isPatient ? 'My Appointments' : 'Patient Appointments'}</h2>
                        <p className="text-muted mb-0 small">
                            {isPatient
                                ? 'Track your upcoming visits and medical history.'
                                : 'Manage your medical schedule and patient bookings.'}
                        </p>
                    </div>
                    {isPatient && (
                        <Button
                            className="premium-btn btn-primary d-flex align-items-center gap-2 w-100 w-sm-auto justify-content-center"
                            onClick={() => setShowBookModal(true)}
                        >
                            <Plus size={20} /> New Appointment
                        </Button>
                    )}
                </motion.div>

                {statusMsg && !showBookModal && !showRescheduleModal && (
                    <Alert variant={statusMsg.type} onClose={() => setStatusMsg(null)} dismissible className="border-0 shadow-sm mb-4">
                        {statusMsg.text}
                    </Alert>
                )}

                <Card className="glass-card border-0 shadow-sm overflow-hidden mb-5">
                    <Card.Header className="bg-white p-3 p-md-4 border-0">
                        <Row className="align-items-center g-3">
                            <Col xs={12} md={6}>
                                <div className="input-group search-box">
                                    <span className="input-group-text bg-light border-0">
                                        <SearchIcon size={18} className="text-muted" />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control bg-light border-0"
                                        placeholder={isPatient ? "Search doctors..." : "Search patients..."}
                                        onChange={(e) => isPatient && fetchDoctors(e.target.value)}
                                    />
                                </div>
                            </Col>
                            <Col xs={12} md={6} className="d-flex justify-content-md-end gap-2">
                                <Button variant="light" className="d-flex align-items-center gap-2 border w-100 w-md-auto justify-content-center">
                                    <FilterIcon size={18} /> Filters
                                </Button>
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <AppointmentList
                            appointments={appointments}
                            isPatient={isPatient}
                            onReschedule={handleRescheduleInitiate}
                            onCancel={handleCancelAppointment}
                            onStatusUpdate={handleStatusUpdate}
                            getStatusBadge={getStatusBadge}
                        />
                    </Card.Body>
                </Card>
            </Container>

            <BookingModal
                show={showBookModal}
                onHide={() => setShowBookModal(false)}
                specializations={specializations}
                selectedSpecialization={selectedSpecialization}
                setSelectedSpecialization={setSelectedSpecialization}
                doctors={doctors}
                selectedDoctor={selectedDoctor}
                setSelectedDoctor={setSelectedDoctor}
                bookingDate={bookingDate}
                setBookingDate={setBookingDate}
                availableSlots={availableSlots}
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
                visitReason={visitReason}
                setVisitReason={setVisitReason}
                slotsLoading={slotsLoading}
                bookingLoading={bookingLoading}
                onBook={handleBookAppointment}
                statusMsg={statusMsg}
            />

            <RescheduleModal
                show={showRescheduleModal}
                onHide={() => setShowRescheduleModal(false)}
                appointmentToReschedule={appointmentToReschedule}
                bookingDate={bookingDate}
                setBookingDate={setBookingDate}
                availableSlots={availableSlots}
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
                slotsLoading={slotsLoading}
                rescheduleLoading={rescheduleLoading}
                onReschedule={handleRescheduleSubmit}
                statusMsg={statusMsg}
            />

            <style>{`
                .custom-table tbody tr { transition: background 0.3s ease; cursor: pointer; }
                .custom-table tbody tr:hover { background-color: rgba(13, 110, 253, 0.02) !important; }
                .x-small { font-size: 0.75rem; }
                .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #dee2e6; border-radius: 10px; }
                .ring-2-primary { box-shadow: 0 0 0 2px var(--bs-primary); }
                .bg-primary-light { background-color: rgba(13, 110, 253, 0.05) !important; }
                .premium-modal .modal-content { border: none; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden; }
                @media (max-width: 576px) {
                    .premium-btn { padding: 12px; }
                }
            `}</style>
        </>
    );
};

export default Appointments;
