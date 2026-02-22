import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleCallback = () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');
            const userStr = params.get('user');

            if (token) {
                console.log('DEBUG: AuthCallback token found');
                localStorage.setItem('access_token', token);

                let userData: any = null;
                if (userStr) {
                    try {
                        userData = JSON.parse(decodeURIComponent(userStr));
                        console.log('DEBUG: AuthCallback parsed userData from userStr:', userData);
                    } catch (e) {
                        console.error('Failed to parse user data from userStr', e);
                    }
                }

                if (!userData || !userData.role) {
                    const role = params.get('role');
                    const email = params.get('email');
                    console.log('DEBUG: Falling back to individual params. role:', role, 'email:', email);
                    if (role) {
                        userData = { ...userData, role, email };
                    }
                }

                if (userData) {
                    console.log('DEBUG: AuthCallback saving user to localStorage:', userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                } else {
                    console.warn('DEBUG: No user data found to save');
                }

                navigate('/dashboard');
            } else {
                console.error('No token found in callback URL');
                navigate('/login', { state: { error: 'Authentication failed' } });
            }
        };

        if (location.search) {
            handleCallback();
        } else {
            navigate('/login');
        }
    }, [location, navigate]);

    return (
        <Container className="d-flex align-items-center justify-content-center min-vh-100">
            <div className="text-center">
                <Spinner animation="border" variant="primary" className="mb-3" />
                <h3>Authenticating...</h3>
                <p className="text-muted">Please wait while we complete your sign-in.</p>
            </div>
        </Container>
    );
};

export default AuthCallback;
