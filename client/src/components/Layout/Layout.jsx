import './Layout.css'
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isAuthenticated } from '../../utilis/authUtilis';
import { fetchUserInfo } from '../../redux/userSlice';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

const Layout = ({ showHeader, showFooter, children }) => {
    const isAuth = isAuthenticated();
    const { user } = useSelector(state => state.user);

    const dispatch = useDispatch();

    useEffect(() => {
        console.log("Layout effect")
        if (isAuth && !user) {
            dispatch(fetchUserInfo());
        }
    }, [isAuth, user]);

    return (
        <div className="layout">
            {showHeader && <Navbar />}
            <main className="layout-content">{children}</main>
            {showFooter && <Footer />}
        </div>
    )
};

export default Layout;