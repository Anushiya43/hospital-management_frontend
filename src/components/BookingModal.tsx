import React from 'react';
import { Modal, Form, Row, Col, Button, Card, Alert } from 'react-bootstrap';
import { Calendar, Clock, User, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';

interface BookingModalProps {
    show: boolean;
    onHide: () => void;
    specializations: string[];
    selectedSpecialization: string;
    setSelectedSpecialization: (spec: string) => void;
    doctors: any[];
    selectedDoctor: any;
    setSelectedDoctor: (doc: any) => void;
    bookingDate: string;
    setBookingDate: (date: string) => void;
    availableSlots: any[];
    selectedSlot: string;
    setSelectedSlot: (slot: string) => void;
    visitReason: string;
    setVisitReason: (reason: string) => void;
    slotsLoading: boolean;
    bookingLoading: boolean;
    onBook: () => void;
    statusMsg: { type: 'success' | 'danger', text: string } | null;
}

const BookingModal: React.FC<BookingModalProps> = ({
    show,
    onHide,
    specializations,
    selectedSpecialization,
    setSelectedSpecialization,
    doctors,
    selectedDoctor,
    setSelectedDoctor,
    bookingDate,
    setBookingDate,
    availableSlots,
    selectedSlot,
    setSelectedSlot,
    visitReason,
    setVisitReason,
    slotsLoading,
    bookingLoading,
    onBook,
    statusMsg
}) => {
    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="premium-modal">
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
                                            setSelectedDoctor(null);
                                        }}
                                    >
                                        {spec}
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Select Doctor */}
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
                        <Button variant="light" className="flex-grow-1 py-2 fw-semibold rounded-pill" onClick={onHide}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-grow-1 premium-btn py-2 fw-bold rounded-pill shadow-sm"
                            onClick={onBook}
                            disabled={bookingLoading}
                        >
                            {bookingLoading ? 'Processing Booking...' : 'Confirm Appointment'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default BookingModal;
