import React, { useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import TopHeader from "./components/layout/TopHeader";
import Login from "./components/Login";

import AccountForm from "./components/accounts/AccountForm";

import LedgerForm from "./components/ledgers/LedgerForm";
import LedgerList from "./components/ledgers/LedgerList";

import TransactionForm from "./components/transactions/TransactionForm";
import TransactionList from "./components/transactions/TransactionList";
import TransactionPanel from "./components/transactions/TransactionPanel";

import "./App.css";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const Dashboard = () => {
    return (
        <div className="dashboard">

            <section className="hero-card">

                <div>
                    <span className="hero-label">
                        VAULTFLOW
                    </span>

                    <h2>
                        Secure financial management,
                        made simple.
                    </h2>

                    <p>
                        Monitor accounts, manage transactions,
                        and maintain ledgers from one secure
                        workspace.
                    </p>

                    <div className="hero-actions">
                        <a
                            href="/transactions"
                            className="app-button primary"
                        >
                            + New Transaction
                        </a>

                        <a
                            href="/accounts"
                            className="app-button secondary"
                        >
                            View Accounts
                        </a>
                    </div>
                </div>

                <div className="hero-graphic">
                    <div className="hero-circle">
                        ₹
                    </div>
                </div>

            </section>

            <section className="stats-grid">

                <div className="stat-card">
                    <span>Total Accounts</span>
                    <strong>24</strong>
                    <small>Active accounts</small>
                </div>

                <div className="stat-card">
                    <span>Transactions</span>
                    <strong>128</strong>
                    <small>This month</small>
                </div>

                <div className="stat-card">
                    <span>Pending</span>
                    <strong>7</strong>
                    <small>Require attention</small>
                </div>

                <div className="stat-card">
                    <span>System Status</span>
                    <strong className="online">
                        Online
                    </strong>
                    <small>All services operational</small>
                </div>

            </section>

            <section className="dashboard-grid">

                <div className="content-card">

                    <div className="card-header">
                        <div>
                            <h3>Quick Actions</h3>
                            <p>
                                Frequently used operations
                            </p>
                        </div>
                    </div>

                    <div className="quick-actions">

                        <a href="/accounts">
                            <span>◎</span>
                            <div>
                                <strong>
                                    Create Account
                                </strong>
                                <small>
                                    Add a new financial account
                                </small>
                            </div>
                        </a>

                        <a href="/transactions">
                            <span>↗</span>
                            <div>
                                <strong>
                                    New Transaction
                                </strong>
                                <small>
                                    Initiate a transaction
                                </small>
                            </div>
                        </a>

                        <a href="/ledgers">
                            <span>#</span>
                            <div>
                                <strong>
                                    Create Ledger
                                </strong>
                                <small>
                                    Manage organizational ledger
                                </small>
                            </div>
                        </a>

                    </div>

                </div>

                <div className="content-card">

                    <div className="card-header">
                        <div>
                            <h3>Security Status</h3>
                            <p>
                                Your account security
                            </p>
                        </div>
                    </div>

                    <div className="security-item">
                        <span>✓</span>
                        <div>
                            <strong>JWT Authentication</strong>
                            <small>Enabled</small>
                        </div>
                    </div>

                    <div className="security-item">
                        <span>✓</span>
                        <div>
                            <strong>API Connection</strong>
                            <small>Secure</small>
                        </div>
                    </div>

                    <div className="security-item">
                        <span>✓</span>
                        <div>
                            <strong>Session Protection</strong>
                            <small>Active</small>
                        </div>
                    </div>

                </div>

            </section>

        </div>
    );
};

const PageContainer = ({ children }) => {
    return (
        <div className="page-container">
            {children}
        </div>
    );
};

const AppLayout = ({ children }) => {
    return (
        <div className="app-layout">
            <Sidebar />

            <div className="main-area">
                <TopHeader />

                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

const App = () => {

    const [authenticated, setAuthenticated] =
        useState(!!localStorage.getItem("token"));

    return (
        <BrowserRouter>

            <Routes>

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

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Dashboard />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/accounts"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <PageContainer>
                                    <AccountForm />
                                </PageContainer>
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/transactions"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <PageContainer>

                                    <TransactionPanel />

                                    <TransactionForm />

                                    <TransactionList />

                                </PageContainer>
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/ledgers"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <PageContainer>

                                    <LedgerForm />

                                    <LedgerList />

                                </PageContainer>
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

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