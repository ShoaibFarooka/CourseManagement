import { useEffect, useState } from 'react';
import UsersTable from './components/UsersTable/UsersTable';
import userService from '../../../services/userServices';
import './Users.css';
import { message } from 'antd';
import CustomModal from '../../../components/CustomModal/CustomModal';
import UserInfo from './components/UserInfo/UserInfo';
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';
import { useDispatch } from 'react-redux';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const PAGE_LIMIT = 5;

    const dispatch = useDispatch();

    const fetchUsers = async (page = 1) => {
        try {
            dispatch(ShowLoading());
            const res = await userService.getAllUsers(
                page,
                PAGE_LIMIT,
                search
            );

            setUsers(res.users || []);
            setCurrentPage(res.currentPage || 1);
            setTotalPages(res.totalPages || 1);
        } catch (error) {
            message.error(
                error?.response?.data?.message ||
                "Something went wrong!"
            );
        } finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

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

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by name or email"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className=".input"
                />
            </div>
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
            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button
                        className="btn"
                        onClick={() =>
                            setCurrentPage(prev => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>

                    {Array.from(
                        { length: totalPages },
                        (_, i) => i + 1
                    ).map(page => (
                        <button
                            key={page}
                            className={`manage-btn page-btn ${currentPage === page ? "active" : ""
                                }`}
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        className="btn"
                        onClick={() =>
                            setCurrentPage(prev =>
                                Math.min(prev + 1, totalPages)
                            )
                        }
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );

};

export default Users;