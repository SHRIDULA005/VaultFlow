import React from "react";
import "./Toast.css";

const Toast = ({ message, type = "success", onClose }) => {
    if (!message) {
        return null;
    }

    return (
        <div
            className={`vf-toast vf-toast-${type}`}
            role="alert"
            aria-live="polite"
        >
            <span className="toast-icon">
                {type === "success" ? "✓" : "✕"}
            </span>

            <span className="toast-message">
                {message}
            </span>

            <button
                type="button"
                className="toast-close"
                onClick={onClose}
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    );
};

export default Toast;