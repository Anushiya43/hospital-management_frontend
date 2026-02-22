import { UserRole } from '../types';
import DoctorProfile from './DoctorProfile';
import PatientProfile from './PatientProfile';

const Profile = () => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    if (!user) {
        return (
            <div className="text-center py-5">
                <h3>Please login to view profile</h3>
            </div>
        );
    }

    if (user.role === UserRole.DOCTOR) {
        return <DoctorProfile />;
    }

    return <PatientProfile />;
};

export default Profile;
