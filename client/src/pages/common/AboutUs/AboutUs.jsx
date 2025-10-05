import React from 'react'
import './AboutUs.css';
import About1 from '../../../assets/images/About1.jpg';
import About2 from '../../../assets/images/About2.jpg';
import { useNavigate } from 'react-router-dom';
const AboutUs = () => {

    const navigate = useNavigate();

    return (
        <>
            <div className='about-us'>
                <div className='title'>About Us</div>
                <div className='sub-title'>Join the millions who passed with Gleim.</div>
            </div>

            <div className='section-1'>
                <div className='left-1'>
                    <div className='h1'>Our Mission</div>
                    <p >When Dr. Gleim wrote the first CPA self-study book in 1974, he started the entire exam prep industry as we know it. We’ve remained at the forefront since.
                    </p>
                    <p >   Authored by industry leaders and accounting educators, featured at hundreds of colleges and universities worldwide, and used to pass millions of exams, Gleim CPA Review is ready to help you pass.</p>
                </div>
                <div className='right-1'>
                    <img src={About1} alt="Image" />
                </div>
            </div>


            <div className='section-2'>
                <div className='title'>Ready to Start Your Journey?</div>
                <p>Let's work together to turn your vision into reality.Our team is</p>
                <p>ready to help you achieve extraordinary results.</p>
                <div className='learn-btn'>
                    <button className='button' onClick={() => navigate('/')}>
                        Learn More
                    </button>
                </div>
            </div>


            <div className='section-3'>
                <div className='left-3'>
                    <img src={About2} alt="Image" />
                </div>
                <div className='right-3'>
                    <div className='h3'>Our Story</div>
                    <p>When Dr. Gleim wrote the first CPA self-study book in 1974, he started the entire exam prep industry as we know it. We’ve remained at the forefront since.
                    </p>
                    <p> Authored by industry leaders and accounting educators, featured at hundreds of colleges and universities worldwide, and used to pass millions of exams, Gleim CPA Review is ready to help you pass.</p>
                </div>
            </div>
        </>
    )
}

export default AboutUs
