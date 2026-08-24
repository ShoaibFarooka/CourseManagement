import { useSelector } from 'react-redux';
import './App.css'
import { useEffect } from 'react';
import Router from './router/Router.jsx';
import ScrollToTop from './components/ScrollToTop/ScrollToTop.jsx';
import Loader from './components/Loader/Loader.jsx';
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton.jsx';
const App = () => {
  const theme = useSelector((state) => state.theme.theme);
  const { counter } = useSelector((state) => state.loader);
  const loading = counter > 0;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className='app'>
      {loading && <Loader />}
      <ScrollToTop />
      <Router />
      <WhatsAppButton />
    </div>
  )
}

export default App
