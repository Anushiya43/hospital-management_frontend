import React from 'react';
import { Table, Badge, Button, Card } from 'react-bootstrap';
import { Calendar, Clock, User, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';

interface AppointmentListProps {
    appointments: any[];
    isPatient: boolean;
    onReschedule: (apt: any) => void;
    onCancel: (id: number) => void;
    onStatusUpdate: (id: number, status: string) => void;
    getStatusBadge: (status: string) => React.ReactNode;
}

const AppointmentList: React.FC<AppointmentListProps> = ({
    appointments,
    isPatient,
    onReschedule,
    onCancel,
    onStatusUpdate,
    getStatusBadge
}) => {
    if (appointments.length === 0) {
        return (
            <div className="text-center py-5 text-muted bg-white rounded-3 shadow-sm">
                <Calendar size={48} className="mb-3 opacity-20" />
                <h5>No appointments found</h5>
                <p>Your scheduled visits will appear here.</p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table View */}
            <div className="d-none d-md-block table-responsive">
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
                        {appointments.map((apt) => (
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
                                                    onClick={() => onReschedule(apt)}
                                                >
                                                    Reschedule
                                                </Button>
                                            )}
                                            <Button
                                                variant="link"
                                                className="text-danger p-0 text-decoration-none small"
                                                onClick={() => onCancel(apt.id)}
                                            >
                                                Cancel
                                            </Button>
                                            {!isPatient && (
                                                <Button
                                                    variant="link"
                                                    className="text-success p-0 text-decoration-none small"
                                                    onClick={() => onStatusUpdate(apt.id, 'COMPLETED')}
                                                >
                                                    Mark Completed
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="d-md-none d-flex flex-column gap-3 p-3">
                {appointments.map((apt) => (
                    <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                            <Card.Body className="p-3">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-primary bg-opacity-10 p-2 rounded-circle">
                                            {isPatient ? <Stethoscope size={20} className="text-primary" /> : <User size={20} className="text-primary" />}
                                        </div>
                                        <div>
                                            <div className="fw-bold h6 mb-0">{isPatient ? apt.doctor : apt.patient}</div>
                                            <div className="x-small text-muted">{isPatient ? (apt.specialization || 'General') : apt.type}</div>
                                        </div>
                                    </div>
                                    {getStatusBadge(apt.status)}
                                </div>
                                <hr className="opacity-10 my-2" />
                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <div className="x-small text-muted mb-1 text-uppercase fw-bold">Date</div>
                                        <div className="small fw-semibold d-flex align-items-center gap-1">
                                            <Calendar size={14} className="text-primary" /> {new Date(apt.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="x-small text-muted mb-1 text-uppercase fw-bold">Time</div>
                                        <div className="small fw-semibold d-flex align-items-center gap-1">
                                            <Clock size={14} className="text-primary" /> {apt.time}
                                        </div>
                                    </div>
                                </div>
                                {(apt.status === 'UPCOMING' || apt.status === 'BOOKED') && (
                                    <div className="d-flex gap-2">
                                        {isPatient && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="flex-grow-1 rounded-pill small fw-bold"
                                                onClick={() => onReschedule(apt)}
                                            >
                                                Reschedule
                                            </Button>
                                        )}
                                        {!isPatient && (
                                            <Button
                                                variant="success"
                                                size="sm"
                                                className="flex-grow-1 rounded-pill small fw-bold"
                                                onClick={() => onStatusUpdate(apt.id, 'COMPLETED')}
                                            >
                                                Complete
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="flex-grow-1 rounded-pill small fw-bold"
                                            onClick={() => onCancel(apt.id)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </>
    );
};

export default AppointmentList;
