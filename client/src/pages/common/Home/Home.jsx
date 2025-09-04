import Banner from './components/Banner/Banner';
import CoursesList from './components/CoursesList/CoursesList';
import WhyChooseUs from './components/WhyChooseUs/WhyChooseUs';
import bannerData from '../../../data/BannerData';
import './Home.css';

const Home = () => {
    return (
        <>
            <Banner {...bannerData.home} />
            <CoursesList />
            <WhyChooseUs />
        </>
    )
}

export default Home