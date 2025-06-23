import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../redux/themeSlice.js';
import './ThemeToggel.css'

const ThemeToggle = () => {
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.theme.theme);

    return (
        <div className="theme-switch" onClick={() => dispatch(toggleTheme())}>
            <div className={`switch-thumb ${theme === 'dark' ? 'switch-thumb-dark' : ''}`}>
                {theme === 'dark' ? '🌙' : '☀️'}
            </div>
        </div>
    );
};
export default ThemeToggle;
