import './PublisherTable.css'
import edit from '../../../../../assets/icons/edit.png';
import del from '../../../../../assets/icons/del.png';

const PublisherTable = ({ courseData, onEdit, onDelete }) => {
    return (
        <div className="table-container">
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th >
                            <div className='heading-md table-h1'>
                                Name
                            </div>
                        </th>
                        <th>
                            <div className='heading-md table-h2'>
                                Actions
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {
                        courseData.publishers.map((pub, index) => (
                            <tr key={index}>
                                <td>
                                    <div className='heading-sm table-h1'>
                                        {pub.name}
                                    </div>
                                </td>
                                <td>
                                    <div className="action-btn-wrapper">
                                        <button className="action-btn" onClick={() => onEdit(index)}>
                                            <img src={edit} alt="Edit" />
                                        </button>
                                        <button className="action-btn" onClick={() => onDelete()}>
                                            <img src={del} alt="Delete" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    )
}
export default PublisherTable
