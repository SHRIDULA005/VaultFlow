import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Login from "./components/Login";

import AccountForm from "./components/accounts/AccountForm";
import LedgerForm from "./components/ledgers/LedgerForm";
import LedgerList from "./components/ledgers/LedgerList";
import TransactionForm from "./components/transactions/TransactionForm";
import TransactionList from "./components/transactions/TransactionList";
import TransactionPanel from "./components/transactions/TransactionPanel";

import "./App.css";

const Dashboard = () => {
    const role = localStorage.getItem("role") || "USER";

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-title">MAIN MENU</div>

                <a className="sidebar-item active" href="/">
                    <span>⌂</span>
                    Dashboard
                </a>

                <a className="sidebar-item" href="/accounts">
                    <span>◎</span>
                    Accounts
                </a>

                <a className="sidebar-item" href="/transactions">
                    <span>↗</span>
                    Transactions
                </a>

                <a className="sidebar-item" href="/ledgers">
                    <span>#</span>
                    Ledgers
                </a>
            </aside>

            <main className="dashboard-content">
                <div className="dashboard-heading">
                    <div>
                        <p className="eyebrow">
                            VAULTFLOW FINANCIAL PLATFORM
                        </p>

                        <h1>Welcome back</h1>

                        <p className="subtitle">
                            Monitor your financial operations from one secure
                            dashboard.
                        </p>
                    </div>

                    <div className="system-status">
                        <span>●</span> System Operational
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-top">
                            <span>Total Balance</span>
                            <div className="stat-icon">₹</div>
                        </div>

                        <h2>₹ 12,48,500</h2>
                        <p className="positive">↑ 8.4% this month</p>
                    </div>

                    <div className="stat-card">
                        <div className="stat-top">
                            <span>Total Accounts</span>
                            <div className="stat-icon">◎</div>
                        </div>

                        <h2>24</h2>
                        <p>Active financial accounts</p>
                    </div>

                    <div className="stat-card">
                        <div className="stat-top">
                            <span>Transactions</span>
                            <div className="stat-icon">↗</div>
                        </div>

                        <h2>186</h2>
                        <p>Processed this month</p>
                    </div>

                    <div className="stat-card">
                        <div className="stat-top">
                            <span>Pending Approval</span>
                            <div className="stat-icon">!</div>
                        </div>

                        <h2>7</h2>
                        <p className="warning-text">Requires attention</p>
                    </div>
                </div>

                <div className="dashboard-lower">
                    <section className="quick-actions card">
                        <p className="eyebrow">QUICK ACTIONS</p>
                        <h2>Financial Operations</h2>

                        <div className="actions-grid">
                            <a href="/accounts" className="action-card">
                                <div className="action-icon">+</div>
                                <div>
                                    <strong>Create Account</strong>
                                    <span>Add a new financial account</span>
                                </div>
                            </a>

                            <a href="/transactions" className="action-card">
                                <div className="action-icon">↗</div>
                                <div>
                                    <strong>New Transaction</strong>
                                    <span>Initiate a transaction</span>
                                </div>
                            </a>

                            <a href="/ledgers" className="action-card">
                                <div className="action-icon">#</div>
                                <div>
                                    <strong>Manage Ledgers</strong>
                                    <span>View ledger records</span>
                                </div>
                            </a>

                            <a
                                href="/transactions"
                                className="action-card"
                            >
                                <div className="action-icon">⌕</div>
                                <div>
                                    <strong>Search Transactions</strong>
                                    <span>Find transaction records</span>
                                </div>
                            </a>
                        </div>
                    </section>

                    <section className="security-card">
                        <div className="security-icon">✓</div>

                        <p className="eyebrow">SECURITY</p>

                        <h2>Your vault is protected</h2>

                        <p>
                            Authentication and transaction access are secured
                            using role-based authorization.
                        </p>

                        <div className="role-row">
                            <span>Current role</span>
                            <strong>{role}</strong>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const App = () => {
    const [authenticated, setAuthenticated] = useState(
        !!localStorage.getItem("token")
    );

    useEffect(() => {
        const checkAuth = () => {
            setAuthenticated(!!localStorage.getItem("token"));
        };

        window.addEventListener("storage", checkAuth);

        return () => {
            window.removeEventListener("storage", checkAuth);
        };
    }, []);

    return (
        <BrowserRouter>
            {authenticated && <Navbar />}

            <Routes>
                <Route
                    path="/login"
                    element={
                        authenticated ? (
                            <Navigate to="/" replace />
                        ) : (
                            <Login
                                onLogin={() => setAuthenticated(true)}
                            />
                        )
                    }
                />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/accounts"
                    element={
                        <ProtectedRoute>
                            <div className="page-container">
                                <AccountForm />
                            </div>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/transactions"
                    element={
                        <ProtectedRoute>
                            <div className="page-container">
                                <TransactionPanel />
                                <TransactionForm />
                                <TransactionList />
                            </div>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/ledgers"
                    element={
                        <ProtectedRoute>
                            <div className="page-container">
                                <LedgerForm />
                                <LedgerList />
                            </div>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to={authenticated ? "/" : "/login"}
                            replace
                        />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export default App;