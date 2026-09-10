import React from "react";
import Button from "./Button";

const EmptyState = ({
    title = "No data available",
    message = "There are no records to display.",
    buttonText,
    onClick
}) => {
    return (
        <div className="empty-state">
            <div className="empty-icon">◎</div>

            <h3>{title}</h3>

            <p>{message}</p>

            {buttonText && (
                <Button onClick={onClick}>
                    {buttonText}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;