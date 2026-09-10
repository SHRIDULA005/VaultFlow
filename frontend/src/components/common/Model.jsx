import React from "react";
import Button from "./Button";
import "./Modal.css";

const Modal = ({
    open,
    title,
    message,
    onCancel,
    onConfirm,
    confirmText = "Confirm",
    danger = false,
    loading = false
}) => {
    if (!open) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div
                className="modal-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <h2 id="modal-title">
                    {title}
                </h2>

                <p>
                    {message}
                </p>

                <div className="modal-actions">
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant={danger ? "danger" : "primary"}
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Modal;