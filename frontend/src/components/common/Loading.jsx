import React from "react";

const Loading = () => {
    return (
        <div
            style={{
                padding: "40px",
                textAlign: "center",
                color: "#64748b"
            }}
            role="status"
            aria-live="polite"
        >
            Loading...
        </div>
    );
};

export default Loading;