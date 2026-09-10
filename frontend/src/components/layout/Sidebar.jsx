import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <aside className="sidebar">

            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    VF
                </div>

                <div>
                    <strong>VaultFlow</strong>
                    <span>Financial Management</span>
                </div>
            </div>

            <div className="sidebar-section">
                <div className="sidebar-heading">
                    MAIN MENU
                </div>

                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <span>⌂</span>
                    Dashboard
                </NavLink>

                <NavLink
                    to="/accounts"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <span>◎</span>
                    Accounts
                </NavLink>

                <NavLink
                    to="/transactions"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <span>↗</span>
                    Transactions
                </NavLink>

                <NavLink
                    to="/ledgers"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <span>#</span>
                    Ledgers
                </NavLink>
            </div>

            <div className="sidebar-section">
                <div className="sidebar-heading">
                    SYSTEM
                </div>

                <NavLink
                    to="/settings"
                    className="sidebar-link"
                >
                    <span>⚙</span>
                    Settings
                </NavLink>
            </div>

            <div className="sidebar-bottom">

                <div className="sidebar-user">
                    <div className="user-avatar">
                        VF
                    </div>

                    <div>
                        <strong>VaultFlow User</strong>
                        <span>
                            {localStorage.getItem("role") || "USER"}
                        </span>
                    </div>
                </div>

                <button
                    className="sidebar-logout"
                    type="button"
                    onClick={logout}
                >
                    ⇥ Logout
                </button>

            </div>

        </aside>
    );
};

export default Sidebar;