
import React from "react";

const NotificationStack = ({ alerts = [] }) => {
    return (
        <div>
            {alerts.map((alert) => (
                <div
                    key={alert.id}
                    data-testid={`alert-${alert.id}`}
                    role="alert"
                >
                    {alert.message}
                </div>
            ))}
        </div>
    );
};

export default NotificationStack;
