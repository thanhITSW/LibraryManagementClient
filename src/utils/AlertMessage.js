import { useState, useEffect } from "react";
import '../assets/css/AlertMessage.css';

const AlertMessage = ({ message, type = "success", onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!visible) return null;

    return (
        <div className={`alert-message ${type}`}>
            {message}
        </div>
    );
};

export default AlertMessage;
