import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleCallback = () => {
            const searchParams = new URLSearchParams(location.search);
            const hashParams = new URLSearchParams(location.hash.substring(1));

            const token = searchParams.get('token') || hashParams.get('token') || hashParams.get('access_token');
            const userStr = searchParams.get('user') || hashParams.get('user');
            const roleFromParam = searchParams.get('role') || hashParams.get('role');
            const emailFromParam = searchParams.get('email') || hashParams.get('email');

            console.log('DEBUG: AuthCallback full search:', location.search);
            console.log('DEBUG: AuthCallback full hash:', location.hash);
            console.log('DEBUG: AuthCallback received params:', {
                hasToken: !!token,
                hasUserStr: !!userStr,
                roleFromParam,
                emailFromParam
            });

            if (token) {
                console.log('DEBUG: Token found, setting to localStorage');
                localStorage.setItem('access_token', token);

                let userData: any = null;
                if (userStr) {
                    try {
                        userData = JSON.parse(decodeURIComponent(userStr));
                        console.log('DEBUG: AuthCallback parsed userData:', userData);
                    } catch (e) {
                        console.error('Failed to parse user data from userStr (attempt 1):', userStr);
                        try {
                            // Try without decodeURIComponent in case it was already decoded by URLSearchParams
                            userData = JSON.parse(userStr);
                            console.log('DEBUG: AuthCallback parsed userData (attempt 2):', userData);
                        } catch (e2) {
                            console.error('Failed to parse user data from userStr (attempt 2):', e2);
                        }
                    }
                }

                // If userData is missing or incomplete, try to merge with other parameters
                if (!userData || !userData.role) {
                    userData = {
                        ...(userData || {}),
                        role: userData?.role || roleFromParam,
                        email: userData?.email || emailFromParam,
                        sub: userData?.sub || userData?.id
                    };
                    console.log('DEBUG: Augmented userData:', userData);
                }

                if (userData && (userData.role || userData.email)) {
                    localStorage.setItem('user', JSON.stringify(userData));
                    console.log('DEBUG: Auth success. Items in localStorage:', {
                        token: !!localStorage.getItem('access_token'),
                        user: !!localStorage.getItem('user')
                    });

                    // Final verification of storage
                    const storedToken = localStorage.getItem('access_token');
                    if (storedToken === token) {
                        console.log('DEBUG: Verified token storage matches');
                        navigate('/dashboard', { replace: true });
                    } else {
                        console.error('DEBUG: Storage mismatch or failed to persist!');
                        // Try one more time with direct assignment
                        window.localStorage.setItem('access_token', token);
                        window.localStorage.setItem('user', JSON.stringify(userData));
                        navigate('/dashboard', { replace: true });
                    }
                } else {
                    console.error('Incomplete user data after processing:', userData);
                    navigate('/login', {
                        state: { error: 'Incomplete user profile. Please check console logs.' },
                        replace: true
                    });
                }
            } else {
                console.error('No token found in callback URL query or hash');
                navigate('/login', {
                    state: { error: 'Authentication failed: No token provided' },
                    replace: true
                });
            }
        };

        if (location.search || location.hash) {
            handleCallback();
        } else {
            console.log('DEBUG: No search or hash params found in AuthCallback');
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
