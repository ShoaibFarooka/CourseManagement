import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "./Testimonials.css";
import test from '../../../../../assets/images/testimonial1.jpg';

const testimonials = [
    {
        id: 1,
        name: "Ahmed Khan",
        role: "CPA Candidate",
        course: "CPA",
        text: "The CPA course on eProExam gave me practical clarity. The structured modules and detailed practice tests helped me gain confidence and truly understand complex topics.",
        image: "https://testingbot.com/free-online-tools/random-avatar/300?u=AhmedKhan_CPA"
    },
    {
        id: 2,
        name: "Sarah Williams",
        role: "CMA Candidate",
        course: "CMA",
        text: "The CMA content was well‑organized and concept‑focused. I could track my progress and pinpoint areas to improve. It made my study sessions truly effective.",
        image: "https://testingbot.com/free-online-tools/random-avatar/300?u=SarahWilliams_CMA"
    },
    {
        id: 3,
        name: "Daniel Roberts",
        role: "CIA Candidate",
        course: "CIA",
        text: "The CIA course helped break down complex auditing concepts into manageable lessons. Practice questions boosted my confidence before the real exam.",
        image: "https://testingbot.com/free-online-tools/random-avatar/300?u=DanielRoberts_CIA"
    },
    {
        id: 4,
        name: "Ayesha Malik",
        role: "CFE Candidate",
        course: "CFE",
        text: "The CFE course was detailed and practical. Real case examples and organized lessons helped me retain information and prepare confidently for the exam.",
        image: "https://testingbot.com/free-online-tools/random-avatar/300?u=AyeshaMalik_CFE"
    },
    {
        id: 5,
        name: "Michael Lee",
        role: "CISA Candidate",
        course: "CISA",
        text: "For CISA, the practice questions and structured lessons were game‑changers. It made studying much more efficient and helped me perform well under exam conditions.",
        image: "https://testingbot.com/free-online-tools/random-avatar/300?u=MichaelLee_CISA"
    },
    {
        id: 6,
        name: "Fatima Zahra",
        role: "CRMA Candidate",
        course: "CRMA",
        text: "The CRMA course explained internal audit concepts clearly and practically. I could go through each topic step by step, and the practice sets boosted my confidence.",
        image: "https://testingbot.com/free-online-tools/random-avatar/300?u=FatimaZahra_CRMA"
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
