import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../redux/themeSlice.js';
import './UserThemeToggel.css'

const UserThemeToggle = () => {
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.theme.theme);

    return (
        <div className="user-theme-switch" onClick={() => dispatch(toggleTheme())}>
            <div className={`user-switch-thumb ${theme === 'dark' ? 'user-switch-thumb-dark' : ''}`}>
                {theme === 'dark' ? '🌙' : '☀️'}
            </div>
        </div>
    );
};
export default UserThemeToggle; 
