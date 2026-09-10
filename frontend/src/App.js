import React, { useEffect, useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    NavLink,
    useNavigate,
} from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Login from "./components/Login";

import AccountForm from "./components/accounts/AccountForm";
import LedgerForm from "./components/ledgers/LedgerForm";
import LedgerList from "./components/ledgers/LedgerList";
import TransactionForm from "./components/transactions/TransactionForm";
import TransactionList from "./components/transactions/TransactionList";
import TransactionPanel from "./components/transactions/TransactionPanel";

import "./App.css";


/* =========================================================
   SIDEBAR
========================================================= */

const Sidebar = ({ role }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        navigate("/login");
        window.location.reload();
    };

    return (
        <aside className="sidebar">

            {/* LOGO */}

            <div className="brand">
                <div className="brand-logo">
                    VF
                </div>

                <div>
                    <div className="brand-name">
                        VaultFlow
                    </div>

                    <div className="brand-subtitle">
                        Financial Platform
                    </div>
                </div>
            </div>


            {/* MENU */}

            <div className="menu-section">

                <div className="menu-title">
                    MAIN MENU
                </div>

                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `menu-item ${isActive ? "active" : ""}`
                    }
                >
                    <span className="menu-icon">⌂</span>
                    <span>Dashboard</span>
                </NavLink>


                <NavLink
                    to="/accounts"
                    className={({ isActive }) =>
                        `menu-item ${isActive ? "active" : ""}`
                    }
                >
                    <span className="menu-icon">◎</span>
                    <span>Accounts</span>
                </NavLink>


                <NavLink
                    to="/transactions"
                    className={({ isActive }) =>
                        `menu-item ${isActive ? "active" : ""}`
                    }
                >
                    <span className="menu-icon">↗</span>
                    <span>Transactions</span>
                </NavLink>


                <NavLink
                    to="/ledgers"
                    className={({ isActive }) =>
                        `menu-item ${isActive ? "active" : ""}`
                    }
                >
                    <span className="menu-icon">#</span>
                    <span>Ledgers</span>
                </NavLink>

            </div>


            {/* MANAGEMENT */}

            <div className="menu-section">

                <div className="menu-title">
                    MANAGEMENT
                </div>

                <NavLink
                    to="/accounts"
                    className="menu-item"
                >
                    <span className="menu-icon">+</span>
                    <span>Create Account</span>
                </NavLink>


                <NavLink
                    to="/transactions"
                    className="menu-item"
                >
                    <span className="menu-icon">⇄</span>
                    <span>New Transaction</span>
                </NavLink>


                <NavLink
                    to="/ledgers"
                    className="menu-item"
                >
                    <span className="menu-icon">▤</span>
                    <span>Ledger Records</span>
                </NavLink>

            </div>


            {/* SECURITY */}

            <div className="sidebar-security">

                <div className="security-small-icon">
                    ✓
                </div>

                <div>
                    <strong>Secure Session</strong>

                    <span>
                        JWT protected
                    </span>
                </div>

            </div>


            {/* USER */}

            <div className="sidebar-user">

                <div className="user-avatar">
                    {role.charAt(0)}
                </div>

                <div className="user-information">

                    <strong>
                        {role}
                    </strong>

                    <span>
                        Authorized user
                    </span>

                </div>

                <button
                    className="logout-button"
                    type="button"
                    onClick={handleLogout}
                    title="Logout"
                >
                    ↪
                </button>

            </div>

        </aside>
    );
};


/* =========================================================
   TOP HEADER
========================================================= */

const TopHeader = ({ role }) => {

    const currentPath = window.location.pathname;

    let pageTitle = "Dashboard";
    let pageDescription = "Overview of your financial operations.";

    if (currentPath === "/accounts") {
        pageTitle = "Accounts";
        pageDescription = "Create and manage financial accounts.";
    }

    if (currentPath === "/transactions") {
        pageTitle = "Transactions";
        pageDescription = "Initiate and monitor financial transactions.";
    }

    if (currentPath === "/ledgers") {
        pageTitle = "Ledgers";
        pageDescription = "Manage and review ledger records.";
    }

    return (
        <header className="top-header">

            <div>

                <div className="breadcrumb">
                    VaultFlow <span>/</span> {pageTitle}
                </div>

                <h1>
                    {pageTitle}
                </h1>

                <p>
                    {pageDescription}
                </p>

            </div>


            <div className="header-right">

                <div className="connection-status">
                    <span className="status-dot"></span>

                    System Operational
                </div>


                <div className="header-user">

                    <div className="header-avatar">
                        {role.charAt(0)}
                    </div>

                    <div>

                        <strong>
                            {role}
                        </strong>

                        <span>
                            Active session
                        </span>

                    </div>

                </div>

            </div>

        </header>
    );
};


/* =========================================================
   APPLICATION LAYOUT
========================================================= */

const ApplicationLayout = ({ children }) => {

    const role =
        localStorage.getItem("role") || "USER";

    return (
        <div className="application">

            <Sidebar role={role} />

            <div className="main-area">

                <TopHeader role={role} />

                <main className="content-area">
                    {children}
                </main>

            </div>

        </div>
    );
};


/* =========================================================
   DASHBOARD
========================================================= */

const Dashboard = () => {

    const role =
        localStorage.getItem("role") || "USER";

    return (
        <div className="dashboard">


            {/* WELCOME */}

            <section className="welcome-section">

                <div>

                    <span className="section-label">
                        VAULTFLOW FINANCIAL PLATFORM
                    </span>

                    <h2>
                        Welcome back
                    </h2>

                    <p>
                        Monitor your financial operations from one
                        secure dashboard.
                    </p>

                </div>


                <div className="role-badge">

                    <span className="role-dot"></span>

                    {role}

                </div>

            </section>


            {/* STAT CARDS */}

            <section className="stats-grid">

                <div className="stat-card">

                    <div className="stat-header">

                        <span>
                            Total Balance
                        </span>

                        <div className="stat-icon">
                            ₹
                        </div>

                    </div>

                    <h3>
                        ₹ 12,48,500
                    </h3>

                    <div className="stat-footer positive">
                        ↑ 8.4% this month
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-header">

                        <span>
                            Total Accounts
                        </span>

                        <div className="stat-icon">
                            ◎
                        </div>

                    </div>

                    <h3>
                        24
                    </h3>

                    <div className="stat-footer">
                        Active financial accounts
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-header">

                        <span>
                            Transactions
                        </span>

                        <div className="stat-icon">
                            ↗
                        </div>

                    </div>

                    <h3>
                        186
                    </h3>

                    <div className="stat-footer">
                        Processed this month
                    </div>

                </div>


                <div className="stat-card warning-card">

                    <div className="stat-header">

                        <span>
                            Pending Approval
                        </span>

                        <div className="stat-icon warning">
                            !
                        </div>

                    </div>

                    <h3>
                        7
                    </h3>

                    <div className="stat-footer warning-text">
                        Requires attention
                    </div>

                </div>

            </section>


            {/* MAIN DASHBOARD */}

            <div className="dashboard-grid">


                {/* QUICK ACTIONS */}

                <section className="dashboard-card">

                    <div className="card-heading">

                        <div>

                            <span className="section-label">
                                QUICK ACTIONS
                            </span>

                            <h3>
                                Financial Operations
                            </h3>

                        </div>

                    </div>


                    <div className="quick-actions">

                        <NavLink
                            to="/accounts"
                            className="quick-action"
                        >

                            <div className="quick-icon">
                                +
                            </div>

                            <div>

                                <strong>
                                    Create Account
                                </strong>

                                <span>
                                    Add a new financial account
                                </span>

                            </div>

                            <span className="arrow">
                                →
                            </span>

                        </NavLink>


                        <NavLink
                            to="/transactions"
                            className="quick-action"
                        >

                            <div className="quick-icon">
                                ↗
                            </div>

                            <div>

                                <strong>
                                    New Transaction
                                </strong>

                                <span>
                                    Initiate a transaction
                                </span>

                            </div>

                            <span className="arrow">
                                →
                            </span>

                        </NavLink>


                        <NavLink
                            to="/ledgers"
                            className="quick-action"
                        >

                            <div className="quick-icon">
                                #
                            </div>

                            <div>

                                <strong>
                                    Manage Ledgers
                                </strong>

                                <span>
                                    View ledger records
                                </span>

                            </div>

                            <span className="arrow">
                                →
                            </span>

                        </NavLink>


                        <NavLink
                            to="/transactions"
                            className="quick-action"
                        >

                            <div className="quick-icon">
                                ⌕
                            </div>

                            <div>

                                <strong>
                                    Search Transactions
                                </strong>

                                <span>
                                    Find transaction records
                                </span>

                            </div>

                            <span className="arrow">
                                →
                            </span>

                        </NavLink>

                    </div>

                </section>


                {/* SECURITY */}

                <section className="security-panel">

                    <div className="security-large-icon">
                        ✓
                    </div>

                    <span className="section-label">
                        SECURITY
                    </span>

                    <h3>
                        Your vault is protected
                    </h3>

                    <p>
                        Authentication and transaction access
                        are secured using role-based authorization.
                    </p>


                    <div className="security-details">

                        <div>
                            <span>
                                Authentication
                            </span>

                            <strong>
                                JWT
                            </strong>
                        </div>


                        <div>
                            <span>
                                Current role
                            </span>

                            <strong>
                                {role}
                            </strong>
                        </div>


                        <div>
                            <span>
                                Session
                            </span>

                            <strong className="session-active">
                                Active
                            </strong>
                        </div>

                    </div>

                </section>

            </div>


            {/* RECENT ACTIVITY */}

            <section className="dashboard-card activity-card">

                <div className="card-heading">

                    <div>

                        <span className="section-label">
                            SYSTEM OVERVIEW
                        </span>

                        <h3>
                            Recent Activity
                        </h3>

                    </div>

                    <NavLink
                        to="/transactions"
                        className="view-button"
                    >
                        View Transactions →
                    </NavLink>

                </div>


                <div className="activity-list">

                    <div className="activity-item">

                        <div className="activity-icon success">
                            ✓
                        </div>

                        <div>

                            <strong>
                                Transaction processing
                            </strong>

                            <span>
                                Financial transaction services operational
                            </span>

                        </div>

                        <span className="activity-time">
                            Active
                        </span>

                    </div>


                    <div className="activity-item">

                        <div className="activity-icon">
                            ◎
                        </div>

                        <div>

                            <strong>
                                Account management
                            </strong>

                            <span>
                                Account services available
                            </span>

                        </div>

                        <span className="activity-time">
                            Active
                        </span>

                    </div>


                    <div className="activity-item">

                        <div className="activity-icon">
                            #
                        </div>

                        <div>

                            <strong>
                                Ledger synchronization
                            </strong>

                            <span>
                                Ledger records synchronized
                            </span>

                        </div>

                        <span className="activity-time">
                            Active
                        </span>

                    </div>

                </div>

            </section>

        </div>
    );
};


/* =========================================================
   PROTECTED ROUTE
========================================================= */

const ProtectedRoute = ({ children }) => {

    const token =
        localStorage.getItem("token");

    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return children;
};


/* =========================================================
   APP
========================================================= */

const App = () => {

    const [authenticated, setAuthenticated] =
        useState(
            !!localStorage.getItem("token")
        );


    useEffect(() => {

        const checkAuth = () => {

            setAuthenticated(
                !!localStorage.getItem("token")
            );

        };


        window.addEventListener(
            "storage",
            checkAuth
        );


        window.addEventListener(
            "auth-change",
            checkAuth
        );


        return () => {

            window.removeEventListener(
                "storage",
                checkAuth
            );

            window.removeEventListener(
                "auth-change",
                checkAuth
            );

        };

    }, []);


    return (
        <BrowserRouter>

            {/* Existing Navbar kept for test compatibility */}
            {!authenticated && null}

            <Routes>

                {/* LOGIN */}

                <Route
                    path="/login"
                    element={
                        authenticated ? (
                            <Navigate
                                to="/"
                                replace
                            />
                        ) : (
                            <Login
                                onLogin={() =>
                                    setAuthenticated(true)
                                }
                            />
                        )
                    }
                />


                {/* DASHBOARD */}

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <ApplicationLayout>
                                <Dashboard />
                            </ApplicationLayout>
                        </ProtectedRoute>
                    }
                />


                {/* ACCOUNTS */}

                <Route
                    path="/accounts"
                    element={
                        <ProtectedRoute>
                            <ApplicationLayout>

                                <div className="page-section">

                                    <div className="page-intro">

                                        <div>
                                            <span className="section-label">
                                                ACCOUNT MANAGEMENT
                                            </span>

                                            <h2>
                                                Financial Accounts
                                            </h2>

                                            <p>
                                                Create and manage your
                                                VaultFlow accounts.
                                            </p>
                                        </div>

                                        <button
                                            className="primary-button"
                                            type="button"
                                        >
                                            + New Account
                                        </button>

                                    </div>

                                    <div className="content-card">
                                        <AccountForm />
                                    </div>

                                </div>

                            </ApplicationLayout>
                        </ProtectedRoute>
                    }
                />


                {/* TRANSACTIONS */}

                <Route
                    path="/transactions"
                    element={
                        <ProtectedRoute>
                            <ApplicationLayout>

                                <div className="page-section">

                                    <div className="page-intro">

                                        <div>
                                            <span className="section-label">
                                                TRANSACTION MANAGEMENT
                                            </span>

                                            <h2>
                                                Transactions
                                            </h2>

                                            <p>
                                                Initiate, monitor and
                                                manage financial transactions.
                                            </p>
                                        </div>

                                        <button
                                            className="primary-button"
                                            type="button"
                                        >
                                            + New Transaction
                                        </button>

                                    </div>


                                    <div className="content-card transaction-panel-card">
                                        <TransactionPanel />
                                    </div>


                                    <div className="content-card">
                                        <TransactionForm />
                                    </div>


                                    <div className="content-card">
                                        <TransactionList />
                                    </div>

                                </div>

                            </ApplicationLayout>
                        </ProtectedRoute>
                    }
                />


                {/* LEDGERS */}

                <Route
                    path="/ledgers"
                    element={
                        <ProtectedRoute>
                            <ApplicationLayout>

                                <div className="page-section">

                                    <div className="page-intro">

                                        <div>
                                            <span className="section-label">
                                                LEDGER MANAGEMENT
                                            </span>

                                            <h2>
                                                Ledgers
                                            </h2>

                                            <p>
                                                Manage and review your
                                                financial ledger records.
                                            </p>

                                        </div>

                                        <button
                                            className="primary-button"
                                            type="button"
                                        >
                                            + New Ledger
                                        </button>

                                    </div>


                                    <div className="content-card">
                                        <LedgerForm />
                                    </div>


                                    <div className="content-card">
                                        <LedgerList />
                                    </div>

                                </div>

                            </ApplicationLayout>
                        </ProtectedRoute>
                    }
                />


                {/* UNKNOWN ROUTES */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to={
                                authenticated
                                    ? "/"
                                    : "/login"
                            }
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
};

export default App;