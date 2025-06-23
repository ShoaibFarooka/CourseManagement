import './Unauthorized.css';

const Unauthorized = () => {
    return (
        <div className="unauthorized-page">
            <div className="inner-content">
                <h1>401 Unauthorized</h1>
                <p>Oops! You don't have permission to access this page.</p>
            </div>
        </div>
    );
};

export default Unauthorized;