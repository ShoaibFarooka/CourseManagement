import { useParams } from 'react-router-dom';
import Banner from '../Home/components/Banner/Banner.jsx';
import bannerData from '../../../data/BannerData.js';
import CourseHighlights from './components/CoursesHighlights/CourseHighlights.jsx';
import SubBanner from './components/SubBanner/SubBanner.jsx';
import Testimonials from './components/Testimonials/Testimonials.jsx';

const UserCourses = () => {
    const { exam } = useParams();
    const examData = bannerData.courses[exam.toLowerCase()];

    return (
        <>
            <Banner {...examData} />
            <CourseHighlights />
            <SubBanner examName={examData?.examName} />
            <Testimonials />
        </>
    );
};

export default UserCourses;
