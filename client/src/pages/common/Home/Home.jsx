import Banner from './components/Banner/Banner';
import CoursesList from './components/CoursesList/CoursesList';
import WhyChooseUs from './components/WhyChooseUs/WhyChooseUs';
import bannerData from '../../../data/bannerData.js';
import './Home.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {

    const navigate = useNavigate();

    const handleClickDemoNow = () => {
        navigate('/dashboard/unit-exams');
    }

    return (
        <>
            <Banner
                {...bannerData.home}
                onButtonClick={handleClickDemoNow}
            />
            <CoursesList />
            <WhyChooseUs />
        </>
    )
}

export default Home