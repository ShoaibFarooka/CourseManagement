import './UsersTable.css';
import edit from '../../../../../assets/icons/edit.png';
import del from '../../../../../assets/icons/del.png';
import { Popconfirm } from 'antd';

const UsersTable = ({ users = [], onEdit }) => {
    if (!users.length) {
        return <div className='table-container'>
            <span className='no-data'>No Users Found!</span>
        </div>
    }
    return (
        <div className="table-container">
            <table className="table table-striped users-table">
                <thead>
                    <tr>
                        <th className='heading-md'>#</th>
                        <th>
                            <div className="heading-md">Name</div>
                        </th>
                        <th>
                            <div className="heading-md">Email</div>
                        </th>
                        <th>
                            <div className="heading-md">Actions</div>
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {
                        users.map((user, index) => (
                            <tr key={user._id || index}>
                                <td>{index + 1}</td>

                                <td>
                                    <div className="heading-sm table-h1">
                                        {user.name}
                                    </div>
                                </td>

                                <td>
                                    <div className="heading-sm table-h1">
                                        {user.email}
                                    </div>
                                </td>

                                <td>
                                    <div className="action-btn-wrapper cont">
                                        <button
                                            className="action-btn"
                                            onClick={() => onEdit(user)}
                                        >
                                            <img src={edit} alt="Edit" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    );
};

export default UsersTable;