import './Footer.css';
import { useSelector } from 'react-redux';
import AdminFooter from '../AdminFooter/AdminFooter';
import UserFooter from '../UserFooter/UserFooter';

const Footer = () => {
    const { user } = useSelector(state => state.user);
    const role = user?.role || 'guest';

    if (role === 'admin') {
        return <AdminFooter />
    }
    return <UserFooter />
}

export default Footer
