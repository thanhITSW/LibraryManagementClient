import React from 'react';
import '../assets/css/Footer.css';

const Footer = () => {
    const email_contact_1 = process.env.REACT_APP_EMAIL_CONTACT_THANH

    return (
        <footer className="footer">
            <div className="footer-content">
                <p>&copy; Thanh book library.</p>
                <p>Contact us at: {email_contact_1}</p>
            </div>
        </footer>
    );
};

export default Footer;