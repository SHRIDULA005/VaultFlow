import React from "react";
import "./Button.css";

const Button = ({
    children,
    variant = "primary",
    type = "button",
    loading = false,
    disabled = false,
    onClick,
    className = "",
    ariaLabel
}) => {
    return (
        <button
            type={type}
            className={`vf-button vf-button-${variant} ${className}`}
            onClick={onClick}
            disabled={disabled || loading}
            aria-label={ariaLabel}
            aria-busy={loading}
        >
            {loading ? (
                <>
                    <span className="button-spinner"></span>
                    Processing...
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;