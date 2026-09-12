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

import { getAccounts } from "./services/accountService";
import { getLedgers } from "./services/ledgerService";
import api from "./services/api";

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

    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [ledgers, setLedgers] = useState([]);
    const [loading, setLoading] = useState(true);

    const role = localStorage.getItem("role") || "USER";

    useEffect(() => {
        let mounted = true;

        const loadDashboardData = async () => {
            try {
                setLoading(true);

                const [
                    accountsResponse,
                    transactionsResponse,
                    ledgersResponse,
                ] = await Promise.all([
                    getAccounts(),

                    /*
                     * IMPORTANT:
                     * Use api instead of normal axios here.
                     * api.js automatically adds:
                     * Authorization: Bearer <JWT>
                     */
                    api
                        .get("/transactions")
                        .then((response) => response.data),

                    getLedgers(),
                ]);

                if (!mounted) {
                    return;
                }

                const accountData = Array.isArray(accountsResponse)
                    ? accountsResponse
                    : accountsResponse?.content || [];

                const transactionData = Array.isArray(
                    transactionsResponse
                )
                    ? transactionsResponse
                    : transactionsResponse?.content || [];

                const ledgerData = Array.isArray(ledgersResponse)
                    ? ledgersResponse
                    : ledgersResponse?.content || [];

                setAccounts(accountData);
                setTransactions(transactionData);
                setLedgers(ledgerData);
            } catch (error) {
                console.error(
                    "Unable to load dashboard data:",
                    error
                );

                if (mounted) {
                    setAccounts([]);
                    setTransactions([]);
                    setLedgers([]);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadDashboardData();

        return () => {
            mounted = false;
        };
    }, []);

    /* =====================================================
       CALCULATE TOTAL BALANCE
    ===================================================== */

    const totalBalance = accounts.reduce(
        (total, account) => {
            const balance =
                account?.balance ??
                account?.currentBalance ??
                account?.accountBalance ??
                0;

            const numericBalance = Number(balance);

            return total + (
                Number.isFinite(numericBalance)
                    ? numericBalance
                    : 0
            );
        },
        0
    );

    /* =====================================================
       RECENT TRANSACTIONS
    ===================================================== */

    const recentTransactions = [...transactions]
        .sort((a, b) => {
            const dateA = new Date(
                a?.createdAt ||
                a?.transactionDate ||
                a?.date ||
                0
            ).getTime();

            const dateB = new Date(
                b?.createdAt ||
                b?.transactionDate ||
                b?.date ||
                0
            ).getTime();

            return dateB - dateA;
        })
        .slice(0, 5);

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
                        accounts, transactions and ledgers from
                        one secure workspace.
                    </p>
                </div>
            </div>


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="stats-grid">

                {/* TOTAL BALANCE */}

                <div className="stat-card">
                    <div className="stat-icon">
                        ₹
                    </div>

                    <div>
                        <p>Total Balance</p>

                        <h2>
                            {loading
                                ? "Loading..."
                                : `₹${totalBalance.toFixed(2)}`}
                        </h2>

                        <span>
                            {loading
                                ? "Loading account data..."
                                : accounts.length > 0
                                    ? `${accounts.length} account${accounts.length !== 1 ? "s" : ""} included`
                                    : "No account data yet"}
                        </span>
                    </div>
                </div>


                {/* ACCOUNTS */}

                <div className="stat-card">
                    <div className="stat-icon">
                        A
                    </div>

                    <div>
                        <p>Accounts</p>

                        <h2>
                            {loading ? "..." : accounts.length}
                        </h2>

                        <span>
                            Active accounts
                        </span>
                    </div>
                </div>


                {/* TRANSACTIONS */}

                <div className="stat-card">
                    <div className="stat-icon">
                        T
                    </div>

                    <div>
                        <p>Transactions</p>

                        <h2>
                            {loading ? "..." : transactions.length}
                        </h2>

                        <span>
                            Total transactions
                        </span>
                    </div>
                </div>


                {/* LEDGERS */}

                <div className="stat-card">
                    <div className="stat-icon">
                        L
                    </div>

                    <div>
                        <p>Ledgers</p>

                        <h2>
                            {loading ? "..." : ledgers.length}
                        </h2>

                        <span>
                            Available ledgers
                        </span>
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
                            navigate("/accounts")
                        }
                        type="button"
                    >
                        <span className="quick-action-icon">
                            +
                        </span>

                        <span>
                            <strong>
                                Create Account
                            </strong>

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
                        type="button"
                    >
                        <span className="quick-action-icon">
                            ⇄
                        </span>

                        <span>
                            <strong>
                                New Transaction
                            </strong>

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
                        type="button"
                    >
                        <span className="quick-action-icon">
                            +
                        </span>

                        <span>
                            <strong>
                                Create Ledger
                            </strong>

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
                            Your latest financial activity
                            will appear here.
                        </p>
                    </div>

                    <button
                        className="text-button"
                        onClick={() =>
                            navigate("/transactions")
                        }
                        type="button"
                    >
                        View Transactions →
                    </button>

                </div>


                {loading ? (

                    <div className="empty-dashboard">

                        <div className="empty-icon">
                            ◷
                        </div>

                        <h3>
                            Loading activity
                        </h3>

                        <p>
                            Loading your latest transactions.
                        </p>

                    </div>

                ) : recentTransactions.length > 0 ? (

                    <div className="transaction-cards">

                        {recentTransactions.map(
                            (transaction, index) => (

                                <div
                                    className="transaction-card"
                                    key={
                                        transaction?.id ??
                                        `transaction-${index}`
                                    }
                                >

                                    <div className="transaction-card-header">

                                        <div>
                                            <span className="transaction-label">
                                                Transaction ID
                                            </span>

                                            <h3>
                                                #
                                                {transaction?.id ??
                                                    "-"}
                                            </h3>
                                        </div>

                                        <span className="transaction-status">
                                            {transaction?.status ||
                                                "PENDING"}
                                        </span>

                                    </div>


                                    <div className="transaction-card-body">

                                        <div className="transaction-info">
                                            <span>
                                                Amount
                                            </span>

                                            <strong>
                                                ₹{" "}
                                                {transaction?.amount ??
                                                    "0"}
                                            </strong>
                                        </div>


                                        <div className="transaction-info">
                                            <span>
                                                Source Account
                                            </span>

                                            <strong>
                                                {transaction?.sourceAccountId ??
                                                    "-"}
                                            </strong>
                                        </div>


                                        <div className="transaction-info">
                                            <span>
                                                Destination Account
                                            </span>

                                            <strong>
                                                {transaction?.targetAccountId ??
                                                    "-"}
                                            </strong>
                                        </div>


                                        <div className="transaction-info">
                                            <span>
                                                Reference ID
                                            </span>

                                            <strong>
                                                {transaction?.referenceId ??
                                                    "-"}
                                            </strong>
                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                ) : (

                    <div className="empty-dashboard">

                        <div className="empty-icon">
                            ◷
                        </div>

                        <h3>
                            No recent activity
                        </h3>

                        <p>
                            Transactions and account activity
                            will appear here once you start
                            using VaultFlow.
                        </p>

                        <button
                            className="primary-button"
                            onClick={() =>
                                navigate("/transactions/new")
                            }
                            type="button"
                        >
                            Create Transaction
                        </button>

                    </div>

                )}

            </section>


            {/* =================================================
                SECURITY
            ================================================= */}

            <section className="security-card">

                <div>

                    <span className="security-badge">
                        SECURE SESSION
                    </span>

                    <h2>
                        VaultFlow Security
                    </h2>

                    <p>
                        You are currently signed in as{" "}
                        <strong>{role}</strong>.
                        Your authenticated session is
                        protected by the VaultFlow security layer.
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

                    <h1>
                        {title}
                    </h1>

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


    /* =====================================================
       LOGOUT
    ===================================================== */

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        onLogout();

        navigate("/login", {
            replace: true,
        });
    };


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    const isActive = (path) => {

        if (path === "/") {
            return location.pathname === "/";
        }

        return location.pathname.startsWith(path);
    };


    /* =====================================================
       PAGE TITLE
    ===================================================== */

    const getPageTitle = () => {

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

                        <h2>
                            VaultFlow
                        </h2>

                        <span>
                            Financial Management
                        </span>

                    </div>

                </div>


                <nav className="sidebar-nav">

                    <p className="nav-label">
                        MAIN
                    </p>


                    {/* DASHBOARD */}

                    <button
                        className={
                            isActive("/")
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            navigate("/")
                        }
                        type="button"
                    >
                        <span>⌂</span>
                        Dashboard
                    </button>


                    {/* ACCOUNTS */}

                    <button
                        className={
                            isActive("/accounts")
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            navigate("/accounts")
                        }
                        type="button"
                    >
                        <span>▣</span>
                        Accounts
                    </button>


                    {/* TRANSACTIONS */}

                    <button
                        className={
                            isActive("/transactions")
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            navigate("/transactions")
                        }
                        type="button"
                    >
                        <span>⇄</span>
                        Transactions
                    </button>


                    {/* LEDGERS */}

                    <button
                        className={
                            isActive("/ledgers")
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            navigate("/ledgers")
                        }
                        type="button"
                    >
                        <span>▤</span>
                        Ledgers
                    </button>


                    {/* APPROVALS */}

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
                                type="button"
                            >
                                <span>✓</span>
                                Approvals
                            </button>
                        </>
                    )}

                </nav>


                {/* =================================================
                    USER AREA
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
                        type="button"
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
                            {getPageTitle()}
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
                            type="button"
                        >
                            ↪
                        </button>

                    </div>

                </header>


                {/* =================================================
                    ROUTES
                ================================================= */}

                <div className="page-content">

                    <Routes>


                        {/* DASHBOARD */}

                        <Route
                            path="/"
                            element={
                                <Dashboard />
                            }
                        />


                        {/* =================================================
                            ACCOUNTS
                        ================================================= */}

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


                        {/* =================================================
                            TRANSACTIONS
                        ================================================= */}

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


                        {/* =================================================
                            APPROVAL
                        ================================================= */}

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


                        {/* =================================================
                            LEDGERS
                        ================================================= */}

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


                        {/* =================================================
                            UNKNOWN
                        ================================================= */}

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
            Boolean(
                localStorage.getItem("token")
            )
        );


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