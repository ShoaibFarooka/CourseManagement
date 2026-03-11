import { useEffect, useState } from 'react';
import UsersTable from './components/UsersTable/UsersTable';
import userService from '../../../services/userServices';
import './Users.css';
import { message } from 'antd';
import CustomModal from '../../../components/CustomModal/CustomModal';
import UserInfo from './components/UserInfo/UserInfo';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = async () => {
        try {
            const res = await userService.getAllUsers();
            setUsers(res.users || []);
        } catch (error) {
            message.error(
                error?.response?.data?.message || "Something went wrong!"
            );
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleClickEdit = (user) => {
        setSelectedUser(user);
        setIsOpenModal(true);
    };

    const handleClickCloseModal = () => {
        setIsOpenModal(false);
        setSelectedUser(null);
    };

    return (
        <div className="users-page">
            <UsersTable
                users={users}
                onEdit={handleClickEdit}
            />

            <CustomModal
                isOpen={isOpenModal}
                onRequestClose={handleClickCloseModal}
                contentLabel="User Info"
            >
                <UserInfo user={selectedUser} />
            </CustomModal>
        </div>
    );
};

export default Users;