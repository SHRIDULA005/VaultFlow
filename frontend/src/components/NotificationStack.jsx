import React from "react";
import "./NotificationStack.css";

const NotificationStack = ({ alerts = [] }) => {
    if (!alerts.length) {
        return null;
    }

    return (
        <div
            className="notification-stack"
            aria-label="Notifications"
        >
            {alerts.map((alert) => {
                const type = alert.type || alert.severity || "info";

                return (
                    <div
                        key={alert.id}
                        data-testid={`alert-${alert.id}`}
                        role="alert"
                        className={`notification notification-${type}`}
                    >
                        <div className="notification-icon">
                            {type === "success" && "✓"}
                            {type === "error" && "!"}
                            {type === "warning" && "!"}
                            {type !== "success" &&
                                type !== "error" &&
                                type !== "warning" &&
                                "i"}
                        </div>

                        <div className="notification-content">
                            <div className="notification-title">
                                {type === "success"
                                    ? "Success"
                                    : type === "error"
                                    ? "Error"
                                    : type === "warning"
                                    ? "Warning"
                                    : "Notification"}
                            </div>

                            <div className="notification-message">
                                {alert.message}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default NotificationStack;