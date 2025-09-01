import './CoursesList.css';
import { useNavigate } from "react-router-dom";
import courseslist from '../../../../../data/courseslist.json';

const CoursesList = () => {
    const navigate = useNavigate();

    const getImageUrl = (imageName) => {
        return new URL(`../../../../../assets/images/${imageName}`, import.meta.url).href;
    };

    return (
        <div className="courses-list">
            <div className="title">
                <span className="main-title">The Exams We Cover</span>
                <p className="subtitle">Prepare with confidence. Pass the first time.</p>
            </div>

            {courseslist.map((course, index) => {
                const parts = course.description.split("Authored by");

                return (
                    <div
                        className={`box ${index % 2 === 0 ? "left" : "right"}`}
                        key={index}
                    >
                        <div className="image">
                            <img src={getImageUrl(course.path)} alt={course.title} />
                        </div>

                        <div className="content">
                            <div className='heading'>{course.title} Exam Prep</div>
                            <p>{parts[0]}</p>
                            <p>{parts[1] ? "Authored by" + parts[1] : ""}</p>

                            <button
                                className="button"
                                onClick={() => navigate(course.to)}
                            >
                                View {course.title} Product
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CoursesList;
