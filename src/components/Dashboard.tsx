import { UserRole } from '../types';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';

const Dashboard = () => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    if (!user) {
        return (
            <div className="text-center py-5">
                <h3>Please login to view dashboard</h3>
            </div>
        );
    }

    if (user.role === UserRole.DOCTOR) {
        return <DoctorDashboard />;
    }

    return <PatientDashboard />;
};

export default Dashboard;
