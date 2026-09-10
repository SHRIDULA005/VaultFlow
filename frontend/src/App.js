import React, { useEffect, useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation,
    useNavigate,
} from "react-router-dom";

import Login from "./components/Login";

import AccountForm from "./components/accounts/AccountForm";

import LedgerForm from "./components/ledgers/LedgerForm";
import LedgerList from "./components/ledgers/LedgerList";

import TransactionApproval from "./components/transactions/TransactionApproval";
import TransactionForm from "./components/transactions/TransactionForm";
import TransactionList from "./components/transactions/TransactionList";
import TransactionPanel from "./components/transactions/TransactionPanel";

import "./App.css";


/* =========================================================
   PROTECTED ROUTE
   ========================================================= */

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}


/* =========================================================
   LOGIN PAGE
   ========================================================= */

function LoginPage({ onLogin }) {
    const token = localStorage.getItem("token");

    /*
     * If a token already exists, the user is already authenticated.
     */
    if (token) {
        return <Navigate to="/" replace />;
    }

    return <Login onLogin={onLogin} />;
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard() {
    const navigate = useNavigate();

    const role = localStorage.getItem("role") || "USER";

    return (
        <div className="page-container">

            <div className="page-header">

                <div>
                    <span className="page-eyebrow">
                        OVERVIEW
                    </span>

                    <h1>Dashboard</h1>

                    <p className="page-description">
                        Welcome back to VaultFlow. Manage your
                        accounts, transactions and ledgers from one
                        secure workspace.
                    </p>
                </div>

            </div>


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="stats-grid">

                <div className="stat-card">

                    <div className="stat-icon">
                        ₹
                    </div>

                    <div>
                        <p>Total Balance</p>
                        <h2>₹0.00</h2>
                        <span>No account data yet</span>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon">
                        A
                    </div>

                    <div>
                        <p>Accounts</p>
                        <h2>0</h2>
                        <span>Active accounts</span>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon">
                        T
                    </div>

                    <div>
                        <p>Transactions</p>
                        <h2>0</h2>
                        <span>Total transactions</span>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon">
                        L
                    </div>

                    <div>
                        <p>Ledgers</p>
                        <h2>0</h2>
                        <span>Available ledgers</span>
                    </div>

                </div>

            </div>


            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <section className="dashboard-section">

                <div className="section-heading">

                    <div>
                        <h2>Quick Actions</h2>

                        <p>
                            Frequently used VaultFlow operations.
                        </p>
                    </div>

                </div>


                <div className="quick-actions">

                    <button
                        className="quick-action-card"
                        onClick={() =>
                            navigate("/accounts/new")
                        }
                    >
                        <span className="quick-action-icon">
                            +
                        </span>

                        <span>
                            <strong>Create Account</strong>

                            <small>
                                Add a new financial account
                            </small>
                        </span>

                    </button>


                    <button
                        className="quick-action-card"
                        onClick={() =>
                            navigate("/transactions/new")
                        }
                    >
                        <span className="quick-action-icon">
                            ⇄
                        </span>

                        <span>
                            <strong>New Transaction</strong>

                            <small>
                                Record a financial transaction
                            </small>
                        </span>

                    </button>


                    <button
                        className="quick-action-card"
                        onClick={() =>
                            navigate("/ledgers/new")
                        }
                    >
                        <span className="quick-action-icon">
                            +
                        </span>

                        <span>
                            <strong>Create Ledger</strong>

                            <small>
                                Create and manage a ledger
                            </small>
                        </span>

                    </button>

                </div>

            </section>


            {/* =================================================
                RECENT ACTIVITY
            ================================================= */}

            <section className="dashboard-section">

                <div className="section-heading">

                    <div>
                        <h2>Recent Activity</h2>

                        <p>
                            Your latest financial activity will
                            appear here.
                        </p>
                    </div>

                    <button
                        className="text-button"
                        onClick={() =>
                            navigate("/transactions")
                        }
                    >
                        View Transactions →
                    </button>

                </div>


                <div className="empty-dashboard">

                    <div className="empty-icon">
                        ◷
                    </div>

                    <h3>No recent activity</h3>

                    <p>
                        Transactions and account activity will
                        appear here once you start using VaultFlow.
                    </p>

                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate("/transactions/new")
                        }
                    >
                        Create Transaction
                    </button>

                </div>

            </section>


            {/* =================================================
                SECURITY
            ================================================= */}

            <section className="security-card">

                <div>

                    <span className="security-badge">
                        SECURE SESSION
                    </span>

                    <h2>VaultFlow Security</h2>

                    <p>
                        You are currently signed in as{" "}
                        <strong>{role}</strong>.
                        Your authenticated session is protected
                        by the VaultFlow security layer.
                    </p>

                </div>


                <div className="security-status">

                    <span className="status-dot"></span>

                    <span>
                        Authenticated
                    </span>

                </div>

            </section>

        </div>
    );
}


/* =========================================================
   PAGE WRAPPER
   ========================================================= */

function PageWrapper({
    title,
    description,
    children,
}) {
    return (
        <div className="page-container">

            <div className="page-header">

                <div>

                    <span className="page-eyebrow">
                        VAULTFLOW
                    </span>

                    <h1>{title}</h1>

                    {description && (
                        <p className="page-description">
                            {description}
                        </p>
                    )}

                </div>

            </div>


            <div className="content-card">
                {children}
            </div>

        </div>
    );
}


/* =========================================================
   APPLICATION LAYOUT
   ========================================================= */

function ApplicationLayout({ onLogout }) {

    const location = useLocation();
    const navigate = useNavigate();

    const role =
        localStorage.getItem("role") || "USER";


    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        onLogout();

        navigate("/login", {
            replace: true,
        });
    };


    const isActive = (path) => {

        if (path === "/") {
            return location.pathname === "/";
        }

        return location.pathname.startsWith(path);
    };


    const pageTitle = () => {

        if (location.pathname === "/") {
            return "Dashboard";
        }

        if (
            location.pathname.startsWith("/accounts")
        ) {
            return "Accounts";
        }

        if (
            location.pathname.startsWith("/transactions")
        ) {
            return "Transactions";
        }

        if (
            location.pathname.startsWith("/ledgers")
        ) {
            return "Ledgers";
        }

        return "VaultFlow";
    };


    return (
        <div className="app-shell">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="sidebar">

                <div className="brand">

                    <div className="brand-logo">
                        VF
                    </div>

                    <div className="brand-text">

                        <h2>VaultFlow</h2>

                        <span>
                            Financial Management
                        </span>

                    </div>

                </div>


                <nav className="sidebar-nav">

                    <p className="nav-label">
                        MAIN
                    </p>


                    <button
                        className={
                            isActive("/")
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        <span>⌂</span>
                        Dashboard
                    </button>


                    <button
                        className={
                            isActive("/accounts")
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            navigate("/accounts")
                        }
                    >
                        <span>▣</span>
                        Accounts
                    </button>


                    <button
                        className={
                            isActive("/transactions")
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            navigate("/transactions")
                        }
                    >
                        <span>⇄</span>
                        Transactions
                    </button>


                    <button
                        className={
                            isActive("/ledgers")
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            navigate("/ledgers")
                        }
                    >
                        <span>▤</span>
                        Ledgers
                    </button>


                    {role === "TREASURER" && (
                        <>
                            <p className="nav-label nav-label-spaced">
                                MANAGEMENT
                            </p>

                            <button
                                className={
                                    isActive(
                                        "/transactions/approval"
                                    )
                                        ? "nav-item active"
                                        : "nav-item"
                                }
                                onClick={() =>
                                    navigate(
                                        "/transactions/approval"
                                    )
                                }
                            >
                                <span>✓</span>
                                Approvals
                            </button>
                        </>
                    )}

                </nav>


                {/* =================================================
                    SIDEBAR USER
                ================================================= */}

                <div className="sidebar-bottom">

                    <div className="user-card">

                        <div className="user-avatar">
                            {role.charAt(0)}
                        </div>

                        <div className="user-info">

                            <strong>
                                {role}
                            </strong>

                            <span>
                                VaultFlow User
                            </span>

                        </div>

                    </div>


                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="main-content">


                {/* TOP HEADER */}

                <header className="top-header">

                    <div className="mobile-brand">

                        <div className="brand-logo small">
                            VF
                        </div>

                        <strong>
                            VaultFlow
                        </strong>

                    </div>


                    <div className="breadcrumb">

                        <span>
                            VaultFlow
                        </span>

                        <span>
                            /
                        </span>

                        <strong>
                            {pageTitle()}
                        </strong>

                    </div>


                    <div className="header-right">

                        <div className="header-role">

                            <span className="status-dot"></span>

                            {role}

                        </div>


                        <button
                            className="header-logout"
                            onClick={handleLogout}
                            title="Logout"
                        >
                            ↪
                        </button>

                    </div>

                </header>


                {/* PAGE CONTENT */}

                <div className="page-content">

                    <Routes>

                        {/* DASHBOARD */}

                        <Route
                            path="/"
                            element={
                                <Dashboard />
                            }
                        />


                        {/* ACCOUNTS */}

                        <Route
                            path="/accounts"
                            element={
                                <PageWrapper
                                    title="Accounts"
                                    description="View and manage your financial accounts."
                                >
                                    <AccountForm />
                                </PageWrapper>
                            }
                        />


                        <Route
                            path="/accounts/new"
                            element={
                                <PageWrapper
                                    title="Create Account"
                                    description="Create a new financial account."
                                >
                                    <AccountForm />
                                </PageWrapper>
                            }
                        />


                        {/* TRANSACTIONS */}

                        <Route
                            path="/transactions"
                            element={
                                <PageWrapper
                                    title="Transactions"
                                    description="Search and manage financial transactions."
                                >
                                    <TransactionList />
                                </PageWrapper>
                            }
                        />


                        <Route
                            path="/transactions/new"
                            element={
                                <PageWrapper
                                    title="New Transaction"
                                    description="Record a new financial transaction."
                                >
                                    <TransactionForm />
                                </PageWrapper>
                            }
                        />


                        <Route
                            path="/transactions/panel"
                            element={
                                <PageWrapper
                                    title="Transaction Panel"
                                    description="Initiate a new transaction."
                                >
                                    <TransactionPanel />
                                </PageWrapper>
                            }
                        />


                        {/* APPROVAL */}

                        <Route
                            path="/transactions/approval"
                            element={
                                <PageWrapper
                                    title="Transaction Approvals"
                                    description="Review and approve pending transactions."
                                >
                                    <TransactionApproval />
                                </PageWrapper>
                            }
                        />


                        {/* LEDGERS */}

                        <Route
                            path="/ledgers"
                            element={
                                <PageWrapper
                                    title="Ledgers"
                                    description="View and manage your financial ledgers."
                                >
                                    <LedgerList />
                                </PageWrapper>
                            }
                        />


                        <Route
                            path="/ledgers/new"
                            element={
                                <PageWrapper
                                    title="Create Ledger"
                                    description="Create a new financial ledger."
                                >
                                    <LedgerForm />
                                </PageWrapper>
                            }
                        />


                        {/* UNKNOWN ROUTE */}

                        <Route
                            path="*"
                            element={
                                <Navigate
                                    to="/"
                                    replace
                                />
                            }
                        />

                    </Routes>

                </div>

            </main>

        </div>
    );
}


/* =========================================================
   MAIN APP
   ========================================================= */

function App() {

    const [authenticated, setAuthenticated] =
        useState(
            () =>
                Boolean(
                    localStorage.getItem("token")
                )
        );


    useEffect(() => {

        const handleStorageChange = () => {

            setAuthenticated(
                Boolean(
                    localStorage.getItem("token")
                )
            );

        };


        window.addEventListener(
            "storage",
            handleStorageChange
        );


        return () => {

            window.removeEventListener(
                "storage",
                handleStorageChange
            );

        };

    }, []);


    const handleLogin = () => {

        setAuthenticated(true);

    };


    const handleLogout = () => {

        setAuthenticated(false);

    };


    return (
        <BrowserRouter>

            {!authenticated ? (

                <Routes>

                    <Route
                        path="/login"
                        element={
                            <LoginPage
                                onLogin={handleLogin}
                            />
                        }
                    />


                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/login"
                                replace
                            />
                        }
                    />

                </Routes>

            ) : (

                <ProtectedRoute>

                    <ApplicationLayout
                        onLogout={handleLogout}
                    />

                </ProtectedRoute>

            )}

        </BrowserRouter>
    );
}


export default App;