import './UsersTable.css';
import edit from '../../../../../assets/icons/edit.png';

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
                        <th className='heading-sm'>#</th>
                        <th>
                            <div className="heading-sm">Name</div>
                        </th>
                        <th>
                            <div className="heading-sm">Email</div>
                        </th>
                        <th>
                            <div className="heading-sm">Status</div>
                        </th>
                        <th>
                            <div className="heading-sm">Payment</div>
                        </th>
                        <th>
                            <div style={{ textAlign: "center" }} className="heading-sm">Actions</div>
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {
                        users.map((user, index) => {
                            const hasPurchased = Array.isArray(user.payments) && user.payments.length > 0;

                            return (
                                <tr key={user._id || index}>
                                    <td>{index + 1}</td>

                                    <td>
                                        <div className="heading-xs table-h1">
                                            {user.name}
                                        </div>
                                    </td>

                                    <td>
                                        <div className="heading-xs table-h1">
                                            {user.email}
                                        </div>
                                    </td>

                                    <td>
                                        <div className="heading-xs table-h1" style={{ textTransform: "capitalize" }}>
                                            {user.isBlocked ? (
                                                <span className="blocked">Blocked</span>
                                            ) : (
                                                <span className="active">Active</span>
                                            )}
                                        </div>
                                    </td>

                                    <td>
                                        <div className="heading-xs table-h1">
                                            {hasPurchased ? (
                                                <span className="active">Active</span>
                                            ) : (
                                                <span className="demo">Demo</span>
                                            )}
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
                            );
                        })
                    }
                </tbody>
            </table>
        </div >
    );
};

export default UsersTable;