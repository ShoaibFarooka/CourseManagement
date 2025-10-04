import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "./Testimonials.css";
import test from '../../../../../assets/images/testimonial1.jpg';

const testimonials = [
    { id: 1, name: "John Doe", text: "Aut nihil mollitia deserunt quia sed rem. Quibusdam amet veniam rerum id rerum beatae. Quas rerum iste necessitatibus. At voluptates ad magnam blanditiis excepturi expedita aut. Aut repellat inventore qui minima illum est.", role: "Ceo", image: "https://via.placeholder.com/150" },
    { id: 2, name: "Jane Smith", text: "Amazing experience...", role: "Ceo", image: "https://via.placeholder.com/150" },
    { id: 3, name: "Michael Johnson", text: "User-friendly...", role: "Ceo", image: "https://via.placeholder.com/150" },
    { id: 4, name: "Emily Brown", text: "It changed the way I work...", role: "Ceo", image: "https://via.placeholder.com/150" },
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
