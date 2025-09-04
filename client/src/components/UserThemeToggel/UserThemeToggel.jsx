import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../redux/themeSlice.js';
import './UserThemeToggel.css'

const UserThemeToggle = () => {
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.theme.theme);

    return (
        <div className="theme-toggle-wrapper">
            <div className="theme-switch" onClick={() => dispatch(toggleTheme())}>
                <div className={`switch-thumb ${theme === 'dark' ? 'switch-thumb-dark' : ''}`}>
                </div>
            </div>
            <p className="theme-label">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </p>
        </div>
    );
};
export default UserThemeToggle; 
