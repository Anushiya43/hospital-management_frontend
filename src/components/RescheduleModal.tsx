import React from 'react';
import { Modal, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { Clock, User } from 'lucide-react';

interface RescheduleModalProps {
    show: boolean;
    onHide: () => void;
    appointmentToReschedule: any;
    bookingDate: string;
    setBookingDate: (date: string) => void;
    availableSlots: any[];
    selectedSlot: string;
    setSelectedSlot: (slot: string) => void;
    slotsLoading: boolean;
    rescheduleLoading: boolean;
    onReschedule: () => void;
    statusMsg: { type: 'success' | 'danger', text: string } | null;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
    show,
    onHide,
    appointmentToReschedule,
    bookingDate,
    setBookingDate,
    availableSlots,
    selectedSlot,
    setSelectedSlot,
    slotsLoading,
    rescheduleLoading,
    onReschedule,
    statusMsg
}) => {
    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="premium-modal">
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
                    <Button variant="light" className="flex-grow-1 py-2 fw-semibold rounded-pill" onClick={onHide}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        className="flex-grow-1 premium-btn py-2 fw-bold rounded-pill shadow-sm"
                        onClick={onReschedule}
                        disabled={rescheduleLoading}
                    >
                        {rescheduleLoading ? 'Processing...' : 'Confirm Reschedule'}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default RescheduleModal;
