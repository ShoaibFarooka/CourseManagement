import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, verifyAuthorization } from '../../utilis/authUtilis';
import { useSelector } from 'react-redux';
import Unauthorized from '../../pages/common/Unauthorized/Unauthorized';

const ProtectedRoute = ({ children, ...rest }) => {
    const location = useLocation();
    const redirectTo = '/login';
    const isAuth = isAuthenticated();
    const [isAuthorized, setIsAuthorized] = useState('pending');
    const hasLoggedOut = useSelector(state => state.logout.hasLoggedOut);
    const { user } = useSelector(state => state.user);

    useEffect(() => {
        if (isAuth && user) {
            const authorized = verifyAuthorization(user.role);
            setIsAuthorized(authorized ? 'yes' : 'no');
        }
    }, [isAuth, location, user]);

    return isAuth ? (
        <>
            {isAuthorized === 'pending' ?
                ''
                :
                isAuthorized === 'yes' ?
                    <>
                        {React.cloneElement(children, { ...rest })}
                    </>
                    :
                    <>
                        <Unauthorized />
                    </>
            }
        </>
    ) : (
        <>
            {
                hasLoggedOut ?
                    <Navigate to={redirectTo} />
                    :
                    <Navigate to={redirectTo} replace state={{ from: location }} />
            }
        </>
    );
};

export default ProtectedRoute;