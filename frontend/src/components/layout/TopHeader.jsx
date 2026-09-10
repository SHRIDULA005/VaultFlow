import React from "react";
import { useLocation } from "react-router-dom";
import "./TopHeader.css";

const titles = {
    "/": "Dashboard",
    "/accounts": "Accounts",
    "/transactions": "Transactions",
    "/ledgers": "Ledgers",
    "/settings": "Settings"
};

const TopHeader = () => {
    const location = useLocation();

    const title =
        titles[location.pathname] || "VaultFlow";

    return (
        <header className="top-header">

            <div>
                <h1>{title}</h1>
                <p>Manage your financial operations securely.</p>
            </div>

            <div className="header-right">

                <div className="header-status">
                    <span className="status-dot"></span>
                    System Online
                </div>

                <div className="header-user">
                    {localStorage.getItem("role") || "USER"}
                </div>

            </div>

        </header>
    );
};

export default TopHeader;