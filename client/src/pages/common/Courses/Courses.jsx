import { useNavigate, useParams } from 'react-router-dom';
import Banner from '../Home/components/Banner/Banner.jsx';
import bannerData from '../../../data/bannerData.js';
import CourseHighlights from './components/CoursesHighlights/CourseHighlights.jsx';
import SubBanner from './components/SubBanner/SubBanner.jsx';
import Testimonials from './components/Testimonials/Testimonials.jsx';

const UserCourses = () => {
    const { exam } = useParams();
    const examData = bannerData.courses[exam.toLowerCase()];
    const navigate = useNavigate();

    const handleClickDemoNow = () => {
        navigate('/unit-exams');
    }

    return (
        <>
            <Banner
                {...examData}
                onButtonClick={handleClickDemoNow}
            />
            <CourseHighlights />
            <SubBanner
                examName={examData?.examName}
                onButtonClick={handleClickDemoNow}
            />
            <Testimonials />
        </>
    );
};

export default UserCourses;
