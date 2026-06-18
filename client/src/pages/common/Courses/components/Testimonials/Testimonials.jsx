import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "./Testimonials.css";
import img2 from '../../../../../assets/images/img2.jpeg';
import img3 from '../../../../../assets/images/img3.jpeg';
import img4 from '../../../../../assets/images/img4.jpeg';
import img5 from '../../../../../assets/images/img5.jpeg';
import img6 from '../../../../../assets/images/img6.jpeg';
import img7 from '../../../../../assets/images/img7.jpeg';

const testimonials = [
    {
        id: 1,
        name: "Ahmed Khan",
        role: "CPA Candidate",
        course: "CPA",
        text: "The CPA course on eProExam gave me practical clarity. The structured modules and detailed practice tests helped me gain confidence and truly understand complex topics.",
        image: img2,
    },
    {
        id: 2,
        name: "James Wilson",
        role: "CMA Candidate",
        course: "CMA",
        text: "The CMA content was well-organized and concept-focused. I could track my progress and pinpoint areas to improve. It made my study sessions truly effective.",
        image: img3
    },
    {
        id: 3,
        name: "Daniel Roberts",
        role: "CIA Candidate",
        course: "CIA",
        text: "The CIA course helped break down complex auditing concepts into manageable lessons. Practice questions boosted my confidence before the real exam.",
        image: img5
    },
    {
        id: 4,
        name: "Ayesha Malik",
        role: "CFE Candidate",
        course: "CFE",
        text: "The CFE course was detailed and practical. Real case examples and organized lessons helped me retain information and prepare confidently for the exam.",
        image: img4
    },
    {
        id: 5,
        name: "Michael Lee",
        role: "CISA Candidate",
        course: "CISA",
        text: "For CISA, the practice questions and structured lessons were game-changers. It made studying much more efficient and helped me perform well under exam conditions.",
        image: img6
    },
    {
        id: 6,
        name: "David Anderson",
        role: "CRMA Candidate",
        course: "CRMA",
        text: "The CRMA course explained internal audit concepts clearly and practically. I could go through each topic step by step, and the practice sets boosted my confidence.",
        image: img7
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
                            <img src={t.image} alt={t.name} />
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
