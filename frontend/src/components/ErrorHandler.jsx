import React from "react";

const ErrorHandler = ({ error }) => {
    return (
        <div role="alert">
            {error}
        </div>
    );
};

export default ErrorHandler;