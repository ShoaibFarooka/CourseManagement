import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "./Testimonials.css";
import test from '../../../../../assets/images/testimonial1.jpg';

const testimonials = [
    {
        id: 1,
        name: "Ahmed Khan",
        role: "CPA Candidate",
        text: "eProExam’s structured approach made complex topics much easier to understand. The explanations helped me identify exactly where I was going wrong and improve quickly. I felt confident walking into the exam.",
        image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
        id: 2,
        name: "Sarah Williams",
        role: "CMA Candidate",
        text: "What I liked most about eProExam was the clarity of the content. Everything was aligned with the exam syllabus, and the study flow kept me focused without feeling overwhelmed.",
        image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
        id: 3,
        name: "Daniel Roberts",
        role: "CIA Candidate",
        text: "The course didn’t just prepare me for the exam—it helped me truly understand the concepts. The structure and explanations made a big difference in how I retained information.",
        image: "https://randomuser.me/api/portraits/men/65.jpg"
    },
    {
        id: 4,
        name: "Ayesha Malik",
        role: "Accounting Professional",
        text: "eProExam stands out for its depth and organization. The learning experience felt professional, focused, and practical. It’s a platform I would confidently recommend to serious candidates.",
        image: "https://randomuser.me/api/portraits/women/68.jpg"
    }
];


const Testimonials = () => {
    const [centerPadding, setCenterPadding] = useState("300px");

    useEffect(() => {
        const updatePadding = () => {
            const width = window.innerWidth;

            if (width <= 330) setCenterPadding("10px");
            else if (width <= 500) setCenterPadding("20px");
            else if (width <= 768) setCenterPadding("50px");
            else if (width <= 991) setCenterPadding("100px");
            else if (width <= 1210) setCenterPadding("200px");
            else if (width <= 1399) setCenterPadding("250px");
            else setCenterPadding("300px");
        };

        updatePadding();
        window.addEventListener("resize", updatePadding);
        return () => window.removeEventListener("resize", updatePadding);
    }, []);

    let sliderRef;

    const settings = {
        centerMode: true,
        centerPadding: centerPadding,
        slidesToShow: 1,
        infinite: true,
        arrows: false,
        dots: true,
        speed: 500,
        appendDots: dots => (
            <div className="custom-dots">
                <button className="custom-arrow prev" onClick={() => sliderRef && sliderRef.slickPrev()}>‹</button>
                <ul>{dots}</ul>
                <button className="custom-arrow next" onClick={() => sliderRef && sliderRef.slickNext()}>›</button>
            </div>
        ),
    };

    return (
        <div className="testimonial-slider">
            <div className="title">
                <span>Testimonials</span>
            </div>

            <Slider ref={slider => (sliderRef = slider)} {...settings}>
                {testimonials.map(t => (
                    <div key={t.id} className="testimonial-card">
                        <div className="image">
                            <img src={test} alt={t.name} />
                        </div>
                        <div className="info">
                            <p className="para">{t.text}</p>
                            <span className="name">{t.name}</span>
                            <span className="role">{t.role}</span>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default Testimonials;
