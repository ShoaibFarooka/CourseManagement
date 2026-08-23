import { useLocation } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import "./WhatsAppButton.css";

const whatsappNumber = "923254698122";

// Auth screens and the study/exam flow, where a floating contact button would get in
// the way. Matched exactly.
//
// The dashboard children are listed one by one on purpose: the Dashboard page itself
// ("/dashboard" and the "/dashboard/dashboard" it redirects to) is the one place in
// this section that DOES show the button, so it can't be excluded as a whole section.
// A new route added under /dashboard will show the button unless it is added here.
const HIDDEN_PATHS = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/otp-verification",
    "/quiz",
    "/progress-report",
    "/dashboard/unit-exams",
    "/dashboard/practice-exams",
    "/dashboard/package-exams",
];

// Whole sections that stay hidden, including any route nested under them.
const HIDDEN_SECTIONS = ["/admin"];

const WhatsAppButton = () => {
    const { pathname } = useLocation();

    // Routes are declared with mixed casing (e.g. "/admin/Courses"), so compare
    // lower-cased and without a trailing slash.
    const path = pathname.toLowerCase().replace(/\/+$/, "") || "/";

    const isHidden =
        HIDDEN_PATHS.includes(path) ||
        HIDDEN_SECTIONS.some(
            section => path === section || path.startsWith(`${section}/`)
        );

    if (isHidden) return null;

    return (
        <a
            className="whatsapp-float"
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            title="Chat with us on WhatsApp"
        >
            <FaWhatsapp />
        </a>
    );
};

export default WhatsAppButton;
