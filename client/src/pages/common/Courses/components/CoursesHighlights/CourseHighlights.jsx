import './CourseHighlights.css';
import coursehighlights from '../../../../../data/courseshighlights.json';

const CourseHighlights = () => {

    const getImageUrl = (imageName) => {
        return new URL(`../../../../../assets/images/${imageName}`, import.meta.url).href;
    };

    return (
        <div className="course-highlight">
            <div className="title">
                <span className="main-title">Course Highlights</span>
                <p className="subtitle">Prepare with confidence. Pass the first time.</p>
            </div>

            {coursehighlights.map((highlight, index) => {

                const parts = highlight.description.split("Developed by");
                return (
                    <div
                        className={`box ${index % 2 === 0 ? "left" : "right"}`}
                        key={index}
                    >
                        <div className="image">
                            <img src={getImageUrl(highlight.path)} alt={highlight.title} />
                        </div>

                        <div className="content">
                            <div className='methodology'>The EProExam Methodology</div>
                            <div className="heading">{highlight.title}</div>
                            <p>{parts[0]}</p>
                            <p>{parts[1] ? "Developed by" + parts[1] : ""}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

export default CourseHighlights;
