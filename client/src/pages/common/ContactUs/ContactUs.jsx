import React from 'react'
import './ContactUs.css';
import Contact from '../../../assets/images/Contact.png';
import { MdOutlinePhoneInTalk } from "react-icons/md"
import { IoMailSharp } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const ContactUs = () => {


    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        question: ""
    });

    const [error, setError] = useState({
        name: "",
        email: "",
        subject: "",
        question: ""
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateEmail = () => {
        const regex = /^[^\s@]+@[^\s@]+\.(com)$/;
        return regex.test(formData.email);
    };

    const validateData = () => {
        let newErrors = {};
        let hasErrors = false;

        if (formData.name.trim() === "") {
            newErrors.name = "Name is required!";
            hasErrors = true;
        } else {
            newErrors.name = "";
        }

        if (formData.email.trim() === "") {
            newErrors.email = "Email is required!";
            hasErrors = true;
        } else if (!validateEmail(formData.email)) {
            newErrors.email = "Please provide a valid Email!";
            hasErrors = true;
        } else {
            newErrors.email = "";
        }

        if (formData.subject.trim() === "") {
            newErrors.subject = "Subject is required!";
            hasErrors = true;
        } else {
            newErrors.subject = "";
        }

        if (formData.question.trim() === "") {
            newErrors.question = "Question is required!";
            hasErrors = true;
        } else {
            newErrors.question = "";
        }

        setError((prevState) => ({ ...prevState, ...newErrors }));
        return !hasErrors;
    };

    const handleClickSend = (e) => {
        e.preventDefault();
        if (!validateData()) {
            return;
        }
        alert("Form submitted successfully!");
        setFormData({
            name: "",
            email: "",
            subject: "",
            question: ""
        });
    };


    return (
        <>
            <div className='contact-us'>
                <div className='title'>Contact Us</div>
                <div className='sub-title'>Join the millions who passed with Gleim.</div>
            </div>

            <div className='question-h1'> Questions/Comments?</div>

            <div className='wrapper'>

                <div className='box-1'>
                    <div>
                        <img src={Contact} alt='Image' />
                    </div>

                    <div className='content'>
                        <div className='title'>Contact Information</div>
                        <p className='sub-title'>Say something to start a live chat!</p>
                        <div className='contact-info'>
                            <span className='info'>
                                <MdOutlinePhoneInTalk width={24} />
                                <p>+1012 3456 789</p>
                            </span>
                            <span className='info'>
                                <IoMailSharp width={24} />
                                <p> demo@gmail.com</p>
                            </span>
                            <span className='info'>
                                <FaLocationDot width={24} />
                                <p>  132 Dartmouth Street Boston, <br />Massachusetts 02156 United States</p>
                            </span>
                        </div>
                        <div className='social-icons'>
                            <NavLink to={'/'} className='icon'><FaFacebookF width={30} /></NavLink>
                            <NavLink to={'/'} className='icon'><FaXTwitter width={30} /></NavLink>
                            <NavLink to={'/'} className='icon'><FaInstagram width={30} /></NavLink>
                            <NavLink to={'/'} className='icon'><FaWhatsapp width={30} /></NavLink>
                        </div>
                    </div>
                </div>

                <div className='box-2'>

                    <div>
                        <label htmlFor="name">Your Name</label>
                        <input
                            className='input'
                            type="text" name='name'
                            placeholder='Enter Name'
                            value={formData.name}
                            onChange={handleInputChange} />
                        {<error className="name"></error> && <span className='error-text'>{error.name}</span>}
                    </div>
                    <div>
                        <label htmlFor="email">Your Email</label>
                        <input
                            className='input'
                            type="text"
                            name='email'
                            placeholder='Enter Email'
                            value={formData.email}
                            onChange={handleInputChange} />
                        {error.email && <span className='error-text'>{error.email}</span>}
                    </div>
                    <div>
                        <label htmlFor="subject">Subject</label>
                        <input
                            className='input'
                            type="text" name='subject'
                            placeholder='Enter Subject'
                            value={formData.subject}
                            onChange={handleInputChange} />
                        {error.subject && <span className='error-text'>{error.subject}</span>}
                    </div>
                    <div>
                        <label htmlFor="question">Your Question</label>
                        <textarea
                            className='input'
                            name="question"
                            rows="5"
                            cols="40"
                            placeholder="Type your question here..."
                            value={formData.question}
                            onChange={handleInputChange} ></textarea>
                        {error.question && <span className='error-text'>{error.question}</span>}
                    </div>
                    <div className='snd-btn'>
                        <button className='send-btn' onClick={handleClickSend}>Send</button>
                    </div>
                </div>

            </div>
        </>
    )
}

export default ContactUs
