import { Container, Row, Col, Card, Button, Modal, Form, Table, Badge, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Calendar, Clock, Plus, Trash2, AlertCircle, Save } from 'lucide-react';
import Navigation from './Navbar';
import { useState, useEffect } from 'react';
import { availabilityApi, customAvailabilityApi } from '../services/doctorApi';

const DoctorAvailability = () => {
    const [regularAvailability, setRegularAvailability] = useState<any[]>([]);
    const [customAvailability, setCustomAvailability] = useState<any[]>([]);
    const [showRegularModal, setShowRegularModal] = useState(false);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

    // Auto-clear status message after 5 seconds
    useEffect(() => {
        if (statusMsg) {
            const timer = setTimeout(() => setStatusMsg(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [statusMsg]);

    // Form states
    const [regularForm, setRegularForm] = useState({
        dayOfWeek: ['MONDAY'],
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 30,
        maxCount: 1,
        scheduleType: 'STREAM'
    });

    const [customForm, setCustomForm] = useState<{
        date: string;
        scheduleType: 'STREAM' | 'WAVE';
        status: 'AVAILABLE' | 'UNAVAILABLE';
        reason: string;
        startTime?: string;
        endTime?: string;
        slotDuration: number;
        maxCount: number;
    }>({
        date: new Date().toISOString().split('T')[0],
        scheduleType: 'STREAM',
        status: 'AVAILABLE',
        reason: '',
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 30,
        maxCount: 1
    });

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            const [regRes, custRes] = await Promise.all([
                availabilityApi.getMyAvailability(),
                customAvailabilityApi.getForMonth(new Date().getFullYear(), new Date().getMonth() + 1)
            ]);
            setRegularAvailability(regRes.data);
            setCustomAvailability(custRes.data);
        } catch (error) {
            console.error('Error fetching availability:', error);
        }
    };

    const handleRegularSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setStatusMsg(null);
            await availabilityApi.create(regularForm);
            setStatusMsg({ type: 'success', text: 'Weekly availability added successfully!' });
            setTimeout(() => setShowRegularModal(false), 1500);
            fetchAvailability();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to add availability';
            setStatusMsg({ type: 'danger', text: Array.isArray(message) ? message.join(', ') : message });
        } finally {
            setLoading(false);
        }
    };

    const handleCustomSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setStatusMsg(null);
            // Ensure scheduleType is sent even for full-day overrides if required by backend
            await customAvailabilityApi.create(customForm);
            setStatusMsg({ type: 'success', text: 'Custom exception added successfully!' });
            setTimeout(() => setShowCustomModal(false), 1500);
            fetchAvailability();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to add exception';
            setStatusMsg({ type: 'danger', text: Array.isArray(message) ? message.join(', ') : message });
        } finally {
            setLoading(false);
        }
    };

    const deleteRegular = async (id: number) => {
        if (confirm('Delete this availability?')) {
            try {
                setStatusMsg(null);
                await availabilityApi.delete(id);
                setStatusMsg({ type: 'success', text: 'Availability deleted.' });
                fetchAvailability();
            } catch (error: any) {
                const message = error.response?.data?.message || 'Failed to delete';
                setStatusMsg({ type: 'danger', text: Array.isArray(message) ? message.join(', ') : message });
            }
        }
    };

    const deleteCustom = async (id: number) => {
        if (confirm('Delete this custom exception?')) {
            try {
                setStatusMsg(null);
                await customAvailabilityApi.delete(id);
                setStatusMsg({ type: 'success', text: 'Custom exception deleted.' });
                fetchAvailability();
            } catch (error: any) {
                const message = error.response?.data?.message || 'Failed to delete custom exception';
                setStatusMsg({ type: 'danger', text: Array.isArray(message) ? message.join(', ') : message });
            }
        }
    };

    return (
        <>
            <Navigation />
            <Container className="py-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 mb-md-5 text-center text-md-start"
                >
                    <h1 className="fw-bold h2 h1-md">Schedule Management</h1>
                    <p className="text-muted small lead-md">Define your weekly slots and manage date-specific exceptions.</p>
                </motion.div>

                {statusMsg && !showRegularModal && !showCustomModal && (
                    <Alert variant={statusMsg.type} onClose={() => setStatusMsg(null)} dismissible className="border-0 shadow-sm mb-4">
                        {statusMsg.text}
                    </Alert>
                )}

                <Row className="g-4">
                    {/* Regular Weekly Schedule */}
                    <Col lg={7}>
                        <Card className="glass-card border-0 shadow-sm h-100">
                            <Card.Header className="bg-white p-4 border-0 d-flex justify-content-between align-items-center">
                                <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                    <Clock className="text-primary" /> Weekly Schedule
                                </h4>
                                <Button size="sm" className="premium-btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowRegularModal(true)}>
                                    <Plus size={18} /> Add Slot
                                </Button>
                            </Card.Header>
                            <Card.Body className="p-4">
                                {regularAvailability.length === 0 ? (
                                    <div className="text-center py-5">
                                        <Clock size={48} className="text-muted mb-3 opacity-25" />
                                        <p className="text-muted">No weekly schedule set yet.</p>
                                    </div>
                                ) : (
                                    <>
                                        {['Morning', 'Afternoon', 'Evening'].map(period => {
                                            const periodSlots = regularAvailability.filter(item => {
                                                const hour = parseInt(item.startTime.split(':')[0], 10);
                                                if (period === 'Morning') return hour < 12;
                                                if (period === 'Afternoon') return hour >= 12 && hour < 17;
                                                return hour >= 17;
                                            });

                                            if (periodSlots.length === 0) return null;

                                            return (
                                                <div key={period} className="mb-4">
                                                    <h6 className="fw-bold text-uppercase text-muted small mb-3 border-bottom pb-2">{period}</h6>

                                                    {/* Desktop View */}
                                                    <div className="table-responsive d-none d-md-block">
                                                        <Table hover className="align-middle mb-0">
                                                            <thead className="bg-light">
                                                                <tr className="small text-muted text-uppercase">
                                                                    <th style={{ width: '30%' }}>Days</th>
                                                                    <th style={{ width: '30%' }}>Time</th>
                                                                    <th style={{ width: '20%' }}>Mode</th>
                                                                    <th style={{ width: '10%' }}>Caps</th>
                                                                    <th className="text-end" style={{ width: '10%' }}></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {periodSlots.map((item) => (
                                                                    <tr key={item.id}>
                                                                        <td>
                                                                            <div className="d-flex flex-wrap gap-1">
                                                                                {item.dayOfWeek.map((day: string) => (
                                                                                    <Badge key={day} className="bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 fw-normal">
                                                                                        {day.substring(0, 3)}
                                                                                    </Badge>
                                                                                ))}
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="fw-semibold text-dark">{item.startTime} - {item.endTime}</div>
                                                                            <div className="x-small text-muted">
                                                                                {item.scheduleType === 'STREAM' ? 'Continuous Stream' : `${item.slotDuration} min slots`}
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <Badge bg={item.scheduleType === 'STREAM' ? 'info' : 'secondary'} className="text-uppercase small">
                                                                                {item.scheduleType}
                                                                            </Badge>
                                                                        </td>
                                                                        <td>
                                                                            <div className="fw-bold text-dark">{item.maxCount}</div>
                                                                        </td>
                                                                        <td className="text-end">
                                                                            <Button variant="link" className="text-danger p-0 opacity-50 hover-opacity-100" onClick={() => deleteRegular(item.id)}>
                                                                                <Trash2 size={16} />
                                                                            </Button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </Table>
                                                    </div>

                                                    {/* Mobile Card View */}
                                                    <div className="d-md-none d-flex flex-column gap-3">
                                                        {periodSlots.map((item) => (
                                                            <Card key={item.id} className="border-0 bg-light rounded-4 overflow-hidden">
                                                                <Card.Body className="p-3">
                                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                                        <div className="fw-bold text-dark">{item.startTime} - {item.endTime}</div>
                                                                        <Button variant="link" className="text-danger p-0" onClick={() => deleteRegular(item.id)}>
                                                                            <Trash2 size={16} />
                                                                        </Button>
                                                                    </div>
                                                                    <div className="d-flex flex-wrap gap-1 mb-2">
                                                                        {item.dayOfWeek.map((day: string) => (
                                                                            <Badge key={day} className="bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 fw-normal x-small">
                                                                                {day.substring(0, 3)}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                    <div className="d-flex justify-content-between align-items-center x-small text-muted">
                                                                        <span>{item.scheduleType === 'STREAM' ? 'Continuous' : `${item.slotDuration}m slots`}</span>
                                                                        <span>Cap: <strong>{item.maxCount}</strong></span>
                                                                    </div>
                                                                </Card.Body>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Custom Exceptions */}
                    <Col lg={5}>
                        <Card className="glass-card border-0 shadow-sm h-100">
                            <Card.Header className="bg-white p-4 border-0 d-flex justify-content-between align-items-center">
                                <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                    <Calendar className="text-warning" /> Exceptions
                                </h4>
                                <Button size="sm" variant="outline-warning" className="premium-btn d-flex align-items-center gap-2" onClick={() => setShowCustomModal(true)}>
                                    <Plus size={18} /> Add Override
                                </Button>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center gap-2 mb-4 p-3 bg-warning bg-opacity-10 rounded-3 text-warning-emphasis small">
                                    <AlertCircle size={18} />
                                    <span>Exceptions override your regular weekly schedule for specific dates.</span>
                                </div>

                                {customAvailability.map((item) => (
                                    <div key={item.id} className="p-3 mb-3 border rounded-3 bg-light">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h6 className="fw-bold mb-0">{new Date(item.date).toLocaleDateString()}</h6>
                                            <div className="d-flex align-items-center gap-2">
                                                <Badge bg={item.status === 'AVAILABLE' ? 'info' : 'secondary'}>
                                                    {item.status === 'AVAILABLE' ? item.scheduleType : 'Unavailable'}
                                                </Badge>
                                                <Button
                                                    variant="link"
                                                    className="text-danger p-0 opacity-50 hover-opacity-100"
                                                    onClick={() => deleteCustom(item.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="small text-muted mb-1">
                                            {item.startTime ? (
                                                <>{item.startTime} - {item.endTime} • {item.maxCount} per slot</>
                                            ) : 'All day'}
                                        </div>
                                        {item.reason && <div className="x-small text-muted italic">"{item.reason}"</div>}
                                    </div>
                                ))}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Regular Modal */}
            <Modal show={showRegularModal} onHide={() => setShowRegularModal(false)} centered>
                <Modal.Header closeButton className="border-0 p-4 pb-0">
                    <Modal.Title className="fw-bold">Add Weekly Slot</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {statusMsg && statusMsg.type === 'danger' && (
                        <Alert variant="danger" className="py-2 small border-0 mb-3">
                            <AlertCircle size={16} className="me-2" />
                            {statusMsg.text}
                        </Alert>
                    )}
                    {statusMsg && statusMsg.type === 'success' && (
                        <Alert variant="success" className="py-2 small border-0 mb-3">
                            {statusMsg.text}
                        </Alert>
                    )}
                    <Form onSubmit={handleRegularSubmit}>
                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold">Schedule Mode</Form.Label>
                            <Row className="g-2">
                                <Col>
                                    <Form.Check
                                        type="radio"
                                        label="Stream (1 by 1)"
                                        name="scheduleType"
                                        checked={regularForm.scheduleType === 'STREAM'}
                                        onChange={() => setRegularForm({ ...regularForm, scheduleType: 'STREAM' })}
                                        id="mode-stream"
                                        className="h-100 p-3 border rounded-3"
                                    />
                                </Col>
                                <Col>
                                    <Form.Check
                                        type="radio"
                                        label="Wave (Group)"
                                        name="scheduleType"
                                        checked={regularForm.scheduleType === 'WAVE'}
                                        onChange={() => setRegularForm({ ...regularForm, scheduleType: 'WAVE' })}
                                        id="mode-wave"
                                        className="h-100 p-3 border rounded-3"
                                    />
                                </Col>
                            </Row>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Select Days</Form.Label>
                            <div className="d-flex flex-wrap gap-2">
                                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
                                    <div key={day}>
                                        <input
                                            type="checkbox"
                                            className="btn-check"
                                            id={`day-${day}`}
                                            checked={regularForm.dayOfWeek.includes(day)}
                                            onChange={(e) => {
                                                const isChecked = e.target.checked;
                                                setRegularForm(prev => ({
                                                    ...prev,
                                                    dayOfWeek: isChecked
                                                        ? [...prev.dayOfWeek, day]
                                                        : prev.dayOfWeek.filter(d => d !== day)
                                                }));
                                            }}
                                            autoComplete="off"
                                        />
                                        <label className={`btn btn-outline-primary border-primary border-opacity-25 rounded-3 px-3 py-2 ${regularForm.dayOfWeek.includes(day) ? 'active' : ''}`} htmlFor={`day-${day}`}>
                                            {day.substring(0, 3)}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Start Time</Form.Label>
                                    <Form.Control type="time" value={regularForm.startTime} onChange={e => setRegularForm({ ...regularForm, startTime: e.target.value })} className="bg-light border-0" required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">End Time</Form.Label>
                                    <Form.Control type="time" value={regularForm.endTime} onChange={e => setRegularForm({ ...regularForm, endTime: e.target.value })} className="bg-light border-0" required />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            {regularForm.scheduleType !== 'STREAM' && (
                                <Col md={6}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="small fw-bold">Slot Duration (min)</Form.Label>
                                        <Form.Select value={regularForm.slotDuration} onChange={e => setRegularForm({ ...regularForm, slotDuration: Number(e.target.value) })} className="bg-light border-0">
                                            <option value={15}>15 minutes</option>
                                            <option value={30}>30 minutes</option>
                                            <option value={45}>45 minutes</option>
                                            <option value={60}>1 hour</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            )}
                            <Col md={regularForm.scheduleType === 'STREAM' ? 12 : 6}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">Patient Capacity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min={1}
                                        value={regularForm.maxCount}
                                        onChange={e => setRegularForm({ ...regularForm, maxCount: Number(e.target.value) })}
                                        className="bg-light border-0"
                                        required
                                    />
                                    {regularForm.scheduleType === 'STREAM' && <small className="text-muted">Total patients for this stream</small>}
                                </Form.Group>
                            </Col>
                        </Row>

                        {regularForm.startTime && regularForm.endTime && (
                            <Alert variant="info" className="py-2 small border-0 mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <Clock size={16} />
                                    <strong>Schedule Preview:</strong>
                                </div>
                                <div className="mt-1">
                                    {(() => {
                                        const start = parseInt(regularForm.startTime.split(':')[0]) * 60 + parseInt(regularForm.startTime.split(':')[1]);
                                        const end = parseInt(regularForm.endTime.split(':')[0]) * 60 + parseInt(regularForm.endTime.split(':')[1]);
                                        const duration = regularForm.scheduleType === 'STREAM' ? (end - start) : regularForm.slotDuration;

                                        if (end <= start) return 'Invalid time range';

                                        const count = Math.floor((end - start) / duration);
                                        const effectiveEnd = start + (count * duration);

                                        const h = Math.floor(effectiveEnd / 60);
                                        const m = effectiveEnd % 60;
                                        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

                                        return (
                                            <span>
                                                Will generate <strong>{Math.max(0, count)}</strong> {regularForm.scheduleType === 'STREAM' ? 'stream' : 'slots'}.
                                                {regularForm.scheduleType !== 'STREAM' && effectiveEnd < end && (
                                                    <span className="text-danger fw-bold ms-1"> Note: Last slot ends at {timeStr} (before {regularForm.endTime}).</span>
                                                )}
                                                {regularForm.scheduleType !== 'STREAM' && effectiveEnd === end && (
                                                    <span className="text-success ms-1"> Fits perfectly.</span>
                                                )}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </Alert>
                        )}

                        <Button type="submit" className="w-100 premium-btn btn-primary py-2 fw-bold d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                            <Save size={18} /> Save Schedule
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Custom Modal */}
            <Modal show={showCustomModal} onHide={() => setShowCustomModal(false)} centered>
                <Modal.Header closeButton className="border-0 p-4 pb-0">
                    <Modal.Title className="fw-bold">Add Calendar Override</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {statusMsg && statusMsg.type === 'danger' && (
                        <Alert variant="danger" className="py-2 small border-0 mb-3">
                            <AlertCircle size={16} className="me-2" />
                            {statusMsg.text}
                        </Alert>
                    )}
                    {statusMsg && statusMsg.type === 'success' && (
                        <Alert variant="success" className="py-2 small border-0 mb-3">
                            {statusMsg.text}
                        </Alert>
                    )}
                    <Form onSubmit={handleCustomSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Select Date</Form.Label>
                            <Form.Control type="date" value={customForm.date} min={new Date().toISOString().split('T')[0]} onChange={e => setCustomForm({ ...customForm, date: e.target.value })} className="bg-light border-0" required />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Availability Status</Form.Label>
                            <div className="d-flex gap-3">
                                <Form.Check
                                    type="radio"
                                    label="Available (Modified Hours)"
                                    name="type"
                                    checked={customForm.status === 'AVAILABLE'}
                                    onChange={() => setCustomForm({ ...customForm, status: 'AVAILABLE', startTime: '09:00', endTime: '17:00' })}
                                    id="status-available"
                                />
                                <Form.Check
                                    type="radio"
                                    label="Unavailable (Full Day)"
                                    name="type"
                                    checked={customForm.status === 'UNAVAILABLE'}
                                    onChange={() => setCustomForm({ ...customForm, status: 'UNAVAILABLE', startTime: undefined, endTime: undefined })}
                                    id="status-unavailable"
                                />
                            </div>
                        </Form.Group>

                        {customForm.status === 'AVAILABLE' && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Schedule Mode</Form.Label>
                                    <div className="d-flex gap-3">
                                        <Form.Check
                                            type="radio"
                                            label="Stream"
                                            name="customScheduleType"
                                            checked={customForm.scheduleType === 'STREAM'}
                                            onChange={() => setCustomForm({ ...customForm, scheduleType: 'STREAM' })}
                                            id="custom-mode-stream"
                                        />
                                        <Form.Check
                                            type="radio"
                                            label="Wave"
                                            name="customScheduleType"
                                            checked={customForm.scheduleType === 'WAVE'}
                                            onChange={() => setCustomForm({ ...customForm, scheduleType: 'WAVE' })}
                                            id="custom-mode-wave"
                                        />
                                    </div>
                                </Form.Group>

                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Start Time</Form.Label>
                                            <Form.Control type="time" value={customForm.startTime} onChange={e => setCustomForm({ ...customForm, startTime: e.target.value })} className="bg-light border-0" required />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">End Time</Form.Label>
                                            <Form.Control type="time" value={customForm.endTime} onChange={e => setCustomForm({ ...customForm, endTime: e.target.value })} className="bg-light border-0" required />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    {customForm.scheduleType !== 'STREAM' && (
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold">Slot Duration (min)</Form.Label>
                                                <Form.Select value={customForm.slotDuration} onChange={e => setCustomForm({ ...customForm, slotDuration: Number(e.target.value) })} className="bg-light border-0">
                                                    <option value={15}>15 minutes</option>
                                                    <option value={30}>30 minutes</option>
                                                    <option value={45}>45 minutes</option>
                                                    <option value={60}>1 hour</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    )}
                                    <Col md={customForm.scheduleType === 'STREAM' ? 12 : 6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Capacity</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min={1}
                                                value={customForm.maxCount}
                                                onChange={e => setCustomForm({ ...customForm, maxCount: Number(e.target.value) })}
                                                className="bg-light border-0"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </>
                        )}

                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold">Reason (Optional)</Form.Label>
                            <Form.Control type="text" value={customForm.reason} onChange={e => setCustomForm({ ...customForm, reason: e.target.value })} className="bg-light border-0" placeholder="e.g. Vacation, Conference" />
                        </Form.Group>

                        <Button type="submit" variant="warning" className="w-100 premium-btn py-2 fw-bold d-flex align-items-center justify-content-center gap-2 text-white" disabled={loading}>
                            <Save size={18} /> Apply Override
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <style>{`
                .btn-check:checked + label {
                    background-color: var(--bs-primary);
                    color: white;
                    border-color: var(--bs-primary);
                }
                .btn-check + label {
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    border: 1px solid #dee2e6;
                    cursor: pointer;
                    font-size: 0.8rem;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .x-small { font-size: 0.75rem; }
                .italic { font-style: italic; }
            `}</style>
        </>
    );
};

export default DoctorAvailability;
