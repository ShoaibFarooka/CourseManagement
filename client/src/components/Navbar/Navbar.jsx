import './Navbar.css';
import { useSelector } from 'react-redux';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import UserNavbar from '../UserNavbar/UserNavbar';
const Navbar = () => {

    const { user } = useSelector(state => state.user);
    const role = user?.role || 'guest';
    if (role === 'admin') {
        return <AdminNavbar />
    }
    return <UserNavbar />
}

export default Navbar
