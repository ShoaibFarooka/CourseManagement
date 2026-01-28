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
                <div className='sub-title'>Join successful candidates who passed with EProExam Prep.</div>
            </div>

            <div className='section-1'>
                <div className='left-1'>
                    <div className='h1'>Our Mission</div>
                    <p >At EProExam Prep, our mission is to help candidates prepare smarter and pass with confidence. Created by experienced educators and industry professionals, our exam-focused programs simplify learning and deliver proven results. Trusted by learners worldwide, EProExam Prep is your partner in achieving professional success.
                    </p>
                    <p >   Authored by industry experts and experienced educators, trusted by learners worldwide, and used to pass thousands of exams, EProExam Prep is ready to help you succeed.</p>
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
                    <button className='button' onClick={() => navigate('/home')}>
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
                    <p>EProExam Prep was created to simplify professional exam preparation and help candidates succeed with confidence. Built by industry experts and experienced educators, our programs focus on what matters most—clear concepts, effective practice, and real results.
                    </p>
                    <p> Trusted by learners worldwide and used to pass thousands of exams across leading certifications, EProExam Prep continues to empower professionals to achieve their goals and advance their careers.</p>
                </div>
            </div>
        </>
    )
}

export default AboutUs
