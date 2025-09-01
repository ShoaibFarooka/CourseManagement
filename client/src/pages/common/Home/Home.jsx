import Banner from './components/Banner/Banner';
import CoursesList from './components/CoursesList/CoursesList';
import WhyChooseUs from './components/WhyChooseUs/WhyChooseUs';
import './Home.css';

const Home = () => {
    return (
        <>
            <Banner />
            <CoursesList />
            <WhyChooseUs />
        </>
    )
}

export default Home