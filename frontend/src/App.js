// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
import React, { useState } from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import AccountForm from "./components/accounts/AccountForm";
import LedgerForm from "./components/ledgers/LedgerForm";
import LedgerList from "./components/ledgers/LedgerList";
import TransactionForm from "./components/transactions/TransactionForm";
import TransactionList from "./components/transactions/TransactionList";
import TransactionPanel from "./components/transactions/TransactionPanel";

function App() {
    const [activePage, setActivePage] = useState("dashboard");

    const role = localStorage.getItem("role");
    const isAdmin = role === "ADMIN" || role === "TREASURER";

    const renderPage = () => {
        switch (activePage) {
            case "accounts":
                return (
                    <section className="page-section">
                        <div className="page-heading">
                            <div>
                                <span className="eyebrow">
                                    ACCOUNT MANAGEMENT
                                </span>
                                <h1>Accounts</h1>
                                <p>
                                    Create and manage your financial accounts.
                                </p>
                            </div>
                        </div>

                        <div className="content-grid">
                            <div className="card">
                                <AccountForm />
                            </div>

                            <div className="card info-card">
                                <div className="card-icon">₿</div>
                                <h3>Secure Account Management</h3>
                                <p>
                                    Manage checking, savings and current
                                    accounts from one secure workspace.
                                </p>

                                <div className="mini-stat">
                                    <span>Account security</span>
                                    <strong>Protected</strong>
                                </div>

                                <div className="mini-stat">
                                    <span>Access level</span>
                                    <strong>{role || "USER"}</strong>
                                </div>
                            </div>
                        </div>
                    </section>
                );

            case "ledgers":
                return (
                    <section className="page-section">
                        <div className="page-heading">
                            <div>
                                <span className="eyebrow">
                                    FINANCIAL RECORDS
                                </span>
                                <h1>Ledgers</h1>
                                <p>
                                    View and manage your organization's ledgers.
                                </p>
                            </div>
                        </div>

                        <div className="content-grid">
                            <div className="card">
                                <LedgerForm editMode={true} />
                            </div>

                            <div className="card">
                                <LedgerList />
                            </div>
                        </div>
                    </section>
                );

            case "transactions":
                return (
                    <section className="page-section">
                        <div className="page-heading">
                            <div>
                                <span className="eyebrow">
                                    TRANSACTION CENTER
                                </span>
                                <h1>Transactions</h1>
                                <p>
                                    Monitor, create and search financial
                                    transactions.
                                </p>
                            </div>

                            <div className="heading-action">
                                <TransactionPanel />
                            </div>
                        </div>

                        <div className="card transaction-form-card">
                            <TransactionForm />
                        </div>

                        <div className="card transaction-list-card">
                            <TransactionList />
                        </div>
                    </section>
                );

            case "dashboard":
            default:
                return (
                    <section className="page-section">
                        <div className="page-heading dashboard-heading">
                            <div>
                                <span className="eyebrow">
                                    VAULTFLOW FINANCIAL PLATFORM
                                </span>
                                <h1>Welcome back</h1>
                                <p>
                                    Monitor your financial operations from one
                                    secure dashboard.
                                </p>
                            </div>

                            <div className="status-pill">
                                <span className="status-dot"></span>
                                System Operational
                            </div>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-top">
                                    <span>Total Balance</span>
                                    <span className="stat-icon">₹</span>
                                </div>

                                <h2>₹ 12,48,500</h2>

                                <p className="positive">
                                    ↑ 8.4% this month
                                </p>
                            </div>

                            <div className="stat-card">
                                <div className="stat-top">
                                    <span>Total Accounts</span>
                                    <span className="stat-icon">◉</span>
                                </div>

                                <h2>24</h2>

                                <p>
                                    Active financial accounts
                                </p>
                            </div>

                            <div className="stat-card">
                                <div className="stat-top">
                                    <span>Transactions</span>
                                    <span className="stat-icon">↗</span>
                                </div>

                                <h2>186</h2>

                                <p>
                                    Processed this month
                                </p>
                            </div>

                            <div className="stat-card">
                                <div className="stat-top">
                                    <span>Pending Approval</span>
                                    <span className="stat-icon">!</span>
                                </div>

                                <h2>7</h2>

                                <p className="warning-text">
                                    Requires attention
                                </p>
                            </div>
                        </div>

                        <div className="dashboard-grid">
                            <div className="card quick-actions">
                                <div className="card-header">
                                    <div>
                                        <span className="eyebrow">
                                            QUICK ACTIONS
                                        </span>
                                        <h2>Financial Operations</h2>
                                    </div>
                                </div>

                                <div className="action-grid">
                                    <button
                                        className="action-button"
                                        onClick={() =>
                                            setActivePage("accounts")
                                        }
                                    >
                                        <span className="action-icon">
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
                                        className="action-button"
                                        onClick={() =>
                                            setActivePage("transactions")
                                        }
                                    >
                                        <span className="action-icon">
                                            ↗
                                        </span>
                                        <span>
                                            <strong>New Transaction</strong>
                                            <small>
                                                Initiate a transaction
                                            </small>
                                        </span>
                                    </button>

                                    <button
                                        className="action-button"
                                        onClick={() =>
                                            setActivePage("ledgers")
                                        }
                                    >
                                        <span className="action-icon">
                                            #
                                        </span>
                                        <span>
                                            <strong>Manage Ledgers</strong>
                                            <small>
                                                View ledger records
                                            </small>
                                        </span>
                                    </button>

                                    <button
                                        className="action-button"
                                        onClick={() =>
                                            setActivePage("transactions")
                                        }
                                    >
                                        <span className="action-icon">
                                            ⌕
                                        </span>
                                        <span>
                                            <strong>Search Transactions</strong>
                                            <small>
                                                Find transaction records
                                            </small>
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="card security-card">
                                <div className="security-circle">
                                    ✓
                                </div>

                                <span className="eyebrow">
                                    SECURITY
                                </span>

                                <h2>Your vault is protected</h2>

                                <p>
                                    Authentication and transaction access are
                                    secured using role-based authorization.
                                </p>

                                <div className="security-item">
                                    <span>Current role</span>
                                    <strong>{role || "USER"}</strong>
                                </div>

                                <div className="security-item">
                                    <span>Session</span>
                                    <strong className="session-active">
                                        Active
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div className="card recent-card">
                            <div className="card-header">
                                <div>
                                    <span className="eyebrow">
                                        ACTIVITY
                                    </span>
                                    <h2>Recent Transactions</h2>
                                </div>

                                <button
                                    className="text-button"
                                    onClick={() =>
                                        setActivePage("transactions")
                                    }
                                >
                                    View all →
                                </button>
                            </div>

                            <div className="transaction-table">
                                <div className="table-row table-header">
                                    <span>Transaction</span>
                                    <span>Account</span>
                                    <span>Amount</span>
                                    <span>Status</span>
                                </div>

                                <div className="table-row">
                                    <span>
                                        <strong>TRX-2026-ARC-00441</strong>
                                        <small>Today, 10:42 AM</small>
                                    </span>

                                    <span>ACC-8812</span>

                                    <span className="amount">
                                        ₹50,000
                                    </span>

                                    <span className="badge approved">
                                        Approved
                                    </span>
                                </div>

                                <div className="table-row">
                                    <span>
                                        <strong>TRX-2026-ARC-00438</strong>
                                        <small>Today, 09:18 AM</small>
                                    </span>

                                    <span>ACC-9945</span>

                                    <span className="amount">
                                        ₹12,500
                                    </span>

                                    <span className="badge pending">
                                        Pending
                                    </span>
                                </div>

                                <div className="table-row">
                                    <span>
                                        <strong>TRX-2026-ARC-00432</strong>
                                        <small>Yesterday, 04:31 PM</small>
                                    </span>

                                    <span>ACC-7721</span>

                                    <span className="amount">
                                        ₹8,750
                                    </span>

                                    <span className="badge approved">
                                        Approved
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                );
        }
    };

    return (
        <div className="vf-app">
            <header className="topbar">
                <div className="brand">
                    <div className="brand-mark">V</div>

                    <div>
                        <div className="brand-name">VaultFlow</div>
                        <div className="brand-subtitle">
                            Financial Management
                        </div>
                    </div>
                </div>

                <Navbar isAdmin={isAdmin} />
            </header>

            <div className="app-layout">
                <aside className="sidebar">
                    <div className="sidebar-section">
                        <span className="sidebar-label">
                            MAIN MENU
                        </span>

                        <button
                            className={
                                activePage === "dashboard"
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                            onClick={() =>
                                setActivePage("dashboard")
                            }
                        >
                            <span>⌂</span>
                            Dashboard
                        </button>

                        <button
                            className={
                                activePage === "accounts"
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                            onClick={() =>
                                setActivePage("accounts")
                            }
                        >
                            <span>◉</span>
                            Accounts
                        </button>

                        <button
                            className={
                                activePage === "transactions"
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                            onClick={() =>
                                setActivePage("transactions")
                            }
                        >
                            <span>↗</span>
                            Transactions
                        </button>

                        <button
                            className={
                                activePage === "ledgers"
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                            onClick={() =>
                                setActivePage("ledgers")
                            }
                        >
                            <span>#</span>
                            Ledgers
                        </button>
                    </div>

                    <div className="sidebar-bottom">
                        <div className="sidebar-user">
                            <div className="user-avatar">
                                {role
                                    ? role.charAt(0)
                                    : "U"}
                            </div>

                            <div>
                                <strong>
                                    {role || "User"}
                                </strong>

                                <small>
                                    VaultFlow Member
                                </small>
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="main-content">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
}

export default App;