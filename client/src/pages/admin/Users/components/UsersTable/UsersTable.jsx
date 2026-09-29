import './UsersTable.css';
import edit from '../../../../../assets/icons/edit.png';

const UsersTable = ({ users = [], onEdit }) => {
    if (!users.length) {
        return (
            <div className='table-container'>
                <span className='no-data'>No Users Found!</span>
            </div>
        );
    }

    const getPaymentStatus = (payments) => {
        if (!Array.isArray(payments) || payments.length === 0) {
            return "demo";
        }

        const activePayments = payments.filter(payment => {
            if (payment.isCancelled === true) {
                return false;
            }

            if (!payment.expiryDate) {
                return true;
            }

            return new Date(payment.expiryDate) > new Date();
        });

        if (activePayments.length > 0) {
            return "active";
        }

        const nonCancelledPayments = payments.filter(
            payment => payment.isCancelled !== true
        );

        // All purchased courses were cancelled
        if (nonCancelledPayments.length === 0) {
            return "cancelled";
        }

        // There were non-cancelled purchases, but all have expired
        return "expired";
    };

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
                            <div
                                style={{ textAlign: "center" }}
                                className="heading-sm"
                            >
                                Actions
                            </div>
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((user, index) => {
                        const paymentStatus = getPaymentStatus(user.payments);

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
                                    <div
                                        className="heading-xs table-h1"
                                        style={{ textTransform: "capitalize" }}
                                    >
                                        {user.isBlocked ? (
                                            <span className="blocked">
                                                Blocked
                                            </span>
                                        ) : (
                                            <span className="active">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                </td>

                                <td>
                                    <div className="heading-xs table-h1">
                                        {paymentStatus === "active" && (
                                            <span className="active">
                                                Active
                                            </span>
                                        )}

                                        {paymentStatus === "cancelled" && (
                                            <span className="blocked">
                                                Cancelled
                                            </span>
                                        )}

                                        {paymentStatus === "expired" && (
                                            <span className="blocked">
                                                Expired
                                            </span>
                                        )}

                                        {paymentStatus === "demo" && (
                                            <span className="demo">
                                                Demo
                                            </span>
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
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default UsersTable;