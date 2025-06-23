import React from 'react'
import './Navbar.css'
import { NavLink } from 'react-router-dom'
import ThemeToggle from '../ThemeToggel/ThemeToggel'
import { useState } from 'react'
import del from '../../assets/icons/del.png';
const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className='navbar'>

            <div className='container'>

                <div className='left'>
                    <NavLink className='logo'>
                        <img src={del} alt="Logo" />
                    </NavLink>

                    <div className={`nav-list ${isMobileMenuOpen ? 'open' : ''}`}>
                        {isMobileMenuOpen && (
                            <button className="close-btn" onClick={() => setIsMobileMenuOpen(false)}>
                                ×
                            </button>
                        )
                        }
                        <NavLink to='/admin/dashboard' className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Courses</NavLink>
                        <NavLink to='/admin/questions' className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Questions</NavLink>

                        <div className='mobile-btns'>
                            <ThemeToggle />
                            <button className='btn'>Logout</button>
                        </div>
                    </div>
                </div>

                <div className='right'>
                    <ThemeToggle />
                    <button className='btn'>Logout</button>
                </div>


                <button className="hamburger" onClick={() => setIsMobileMenuOpen(true)}>
                    ☰
                </button>


            </div>



        </div>
    )
}

export default Navbar
