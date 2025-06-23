import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        console.log("Pathname: ", pathname)
        const header = document.querySelector("header");
        const offset = header?.offsetHeight || 80;
        if (pathname === '/home') {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            window.scrollTo({ top: offset, behavior: "smooth" });
        }
    }, [pathname]);

    return null;
};

export default ScrollToTop;