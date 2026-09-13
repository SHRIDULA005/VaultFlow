import React, { useState } from "react";
import axios from "axios";
import "./Login.css";


const getRoleFromToken = (token) => {

    try {

        const parts = token.split(".");

        if (parts.length < 2) {
            return null;
        }

        const base64 = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const padded = base64.padEnd(
            base64.length +
            (4 - (base64.length % 4)) % 4,
            "="
        );

        const payload = JSON.parse(
            atob(padded)
        );

        let role =
            payload.role ||
            payload.roles ||
            payload.authorities ||
            payload.authority;

        if (Array.isArray(role)) {
            role = role[0];
        }

        if (typeof role === "string") {

            role = role.replace(
                /^ROLE_/,
                ""
            );

        }

        return role || null;

    } catch (error) {

        console.error(
            "Unable to read role from JWT:",
            error
        );

        return null;
    }
};


const Login = ({ onLogin }) => {

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    const handleLogin = (event) => {

        event.preventDefault();

        if (loading) {
            return;
        }

        setLoading(true);
        setError("");


        axios
            .post("/auth/login", {
                email,
                password
            })

            .then((response) => {

                const data = response.data;


                const token =
                    typeof data === "string"
                        ? data
                        : data?.token;


                if (!token) {

                    setError(
                        "Invalid email or password"
                    );

                    return;
                }


                localStorage.setItem(
                    "token",
                    token
                );


                let role =
                    typeof data === "object"
                        ? (
                            data.role ||
                            data.user?.role ||
                            data.user?.roles?.[0] ||
                            data.authorities?.[0] ||
                            data.authority
                        )
                        : null;


                if (Array.isArray(role)) {
                    role = role[0];
                }


                if (!role) {

                    role =
                        getRoleFromToken(token);

                }


                if (typeof role === "string") {

                    role = role
                        .replace(
                            /^ROLE_/,
                            ""
                        )
                        .toUpperCase();

                }


                if (role) {

                    localStorage.setItem(
                        "role",
                        role
                    );

                } else {

                    localStorage.removeItem(
                        "role"
                    );

                }


                if (data?.user) {

                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            data.user
                        )
                    );

                }


                if (onLogin) {
                    onLogin();
                }


                window.history.pushState(
                    {},
                    "",
                    "/"
                );

                window.dispatchEvent(
                    new Event("popstate")
                );

            })

            .catch((err) => {

                console.error(
                    "Login error:",
                    err
                );

                setError(
                    "Invalid email or password"
                );

            })

            .finally(() => {

                setLoading(false);

            });

    };


    const handleRegister = () => {

        window.history.pushState(
            {},
            "",
            "/register"
        );

        window.dispatchEvent(
            new Event("popstate")
        );

    };


    return (

        <main className="vf-login-page">


            {/* =====================================================
                BACKGROUND
            ===================================================== */}

            <div
                className="vf-login-grid"
                aria-hidden="true"
            />

            <div
                className="vf-login-glow vf-login-glow-one"
                aria-hidden="true"
            />

            <div
                className="vf-login-glow vf-login-glow-two"
                aria-hidden="true"
            />


            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="vf-login-header">

                <div className="vf-brand">

                    <div className="vf-brand-logo">
                        VF
                    </div>

                    <div className="vf-brand-text">

                        <strong>
                            VaultFlow
                        </strong>

                        <span>
                            FINANCIAL OPERATIONS
                        </span>

                    </div>

                </div>


                <div className="vf-header-status">

                    <span className="vf-status-dot" />

                    SYSTEM SECURE

                </div>

            </header>


            {/* =====================================================
                DESKTOP CONTENT
            ===================================================== */}

            <div className="vf-login-content">


                {/* =================================================
                    LEFT SIDE
                ================================================= */}

                <section className="vf-login-intro">


                    <div className="vf-intro-label">

                        <span />

                        FINANCIAL OPERATIONS PLATFORM

                    </div>


                    <h1>

                        Manage your money.

                        <br />

                        <span>
                            Move with confidence.
                        </span>

                    </h1>


                    <p className="vf-intro-description">

                        VaultFlow brings accounts, transactions,
                        ledgers and audit activity together in
                        one secure workspace.

                    </p>


                    {/* =================================================
                        LIVE FINANCIAL CARD
                    ================================================= */}

                    <div className="vf-financial-card">


                        <div className="vf-card-top">

                            <div>

                                <span className="vf-card-label">
                                    TRANSACTION ACTIVITY
                                </span>

                                <strong>
                                    Live operations
                                </strong>

                            </div>


                            <div className="vf-live-badge">

                                <span />

                                LIVE

                            </div>

                        </div>


                        {/* GRAPH */}

                        <div className="vf-graph">

                            <div className="vf-graph-grid grid-one" />
                            <div className="vf-graph-grid grid-two" />
                            <div className="vf-graph-grid grid-three" />


                            <svg
                                viewBox="0 0 600 150"
                                preserveAspectRatio="none"
                                className="vf-chart"
                            >

                                <defs>

                                    <linearGradient
                                        id="vaultflowChart"
                                        x1="0"
                                        y1="0"
                                        x2="1"
                                        y2="0"
                                    >

                                        <stop
                                            offset="0%"
                                            stopColor="#3b82f6"
                                        />

                                        <stop
                                            offset="100%"
                                            stopColor="#6366f1"
                                        />

                                    </linearGradient>

                                </defs>


                                <path
                                    d="
                                    M0 118
                                    C35 112 48 106 72 110
                                    C96 114 104 91 130 94
                                    C160 98 169 110 196 96
                                    C226 80 242 88 267 72
                                    C293 56 307 82 334 69
                                    C360 56 373 62 397 49
                                    C426 33 443 54 466 42
                                    C495 27 519 33 540 19
                                    C561 7 581 14 600 5
                                    "
                                    fill="none"
                                    stroke="url(#vaultflowChart)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />

                            </svg>


                            <div className="vf-chart-point point-one" />
                            <div className="vf-chart-point point-two" />
                            <div className="vf-chart-point point-three" />
                            <div className="vf-chart-point point-four" />
                            <div className="vf-chart-point point-five" />

                        </div>


                        {/* CARD FOOTER */}

                        <div className="vf-card-stats">

                            <div>

                                <span>
                                    SECURITY
                                </span>

                                <strong>
                                    99.9%
                                </strong>

                            </div>


                            <div>

                                <span>
                                    ACCESS
                                </span>

                                <strong>
                                    ROLE BASED
                                </strong>

                            </div>


                            <div>

                                <span>
                                    AUDIT
                                </span>

                                <strong>
                                    ACTIVE
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        FEATURES
                    ================================================= */}

                    <div className="vf-feature-row">


                        <div className="vf-feature">

                            <div className="vf-feature-icon">
                                ✓
                            </div>

                            <div>

                                <strong>
                                    Secure
                                </strong>

                                <span>
                                    JWT authentication
                                </span>

                            </div>

                        </div>


                        <div className="vf-feature">

                            <div className="vf-feature-icon">
                                ✓
                            </div>

                            <div>

                                <strong>
                                    Role-based
                                </strong>

                                <span>
                                    Controlled access
                                </span>

                            </div>

                        </div>


                        <div className="vf-feature">

                            <div className="vf-feature-icon">
                                ✓
                            </div>

                            <div>

                                <strong>
                                    Auditable
                                </strong>

                                <span>
                                    Activity visibility
                                </span>

                            </div>

                        </div>


                    </div>

                </section>


                {/* =================================================
                    RIGHT LOGIN
                ================================================= */}

                <section className="vf-auth-area">


                    <div className="vf-auth-panel">


                        <div className="vf-auth-header">

                            <div className="vf-auth-label">

                                SECURE ACCESS

                            </div>


                            <h2>
                                Welcome back
                            </h2>


                            <p>
                                Sign in to continue to your
                                VaultFlow workspace.
                            </p>

                        </div>


                        {/* =================================================
                            FORM
                        ================================================= */}

                        <form
                            className="vf-auth-form"
                            onSubmit={handleLogin}
                        >


                            {/* EMAIL */}

                            <div className="vf-field">

                                <label htmlFor="email">
                                    Email Address
                                </label>


                                <div className="vf-input-wrapper">

                                    <span className="vf-input-icon">
                                        @
                                    </span>


                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="Email (auditor@vaultflow.io)"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        autoComplete="email"
                                    />

                                </div>

                            </div>


                            {/* PASSWORD */}

                            <div className="vf-field">

                                <label htmlFor="password">
                                    Password
                                </label>


                                <div className="vf-input-wrapper">

                                    <span className="vf-input-icon">
                                        •
                                    </span>


                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="Password (Enter your secure account password)"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(
                                                event.target.value
                                            )
                                        }
                                        autoComplete="current-password"
                                    />

                                </div>

                            </div>


                            {/* SESSION */}

                            <div className="vf-session">

                                <span>
                                    Protected session
                                </span>


                                <span className="vf-session-secure">

                                    <span className="vf-session-dot" />

                                    JWT secured

                                </span>

                            </div>


                            {/* LOGIN */}

                            <button
                                type="submit"
                                className="vf-login-button"
                                disabled={loading}
                                aria-busy={loading}
                                aria-label={
                                    loading
                                        ? "Login in progress"
                                        : "Login"
                                }
                            >

                                {loading ? (

                                    <>

                                        <span className="vf-spinner" />

                                        Signing in...

                                    </>

                                ) : (

                                    <>

                                        <span>
                                            Login
                                        </span>

                                        <span className="vf-button-arrow">
                                            →
                                        </span>

                                    </>

                                )}

                            </button>


                            {/* ERROR */}

                            {error && (

                                <div
                                    className="vf-login-error"
                                    role="alert"
                                >

                                    <span>
                                        !
                                    </span>

                                    {error}

                                </div>

                            )}

                        </form>


                        {/* =================================================
                            REGISTER
                        ================================================= */}

                        <div className="vf-register">


                            <div className="vf-register-heading">

                                <span>
                                    NEW TO VAULTFLOW?
                                </span>

                            </div>


                            <button
                                type="button"
                                className="vf-register-button"
                                onClick={handleRegister}
                            >

                                <span className="vf-register-plus">
                                    +
                                </span>


                                <span className="vf-register-content">

                                    <strong>
                                        Create an account
                                    </strong>

                                    <small>
                                        Register your profile and access role
                                    </small>

                                </span>


                                <span className="vf-register-arrow">
                                    →
                                </span>

                            </button>

                        </div>


                        {/* =================================================
                            SECURITY
                        ================================================= */}

                        <div className="vf-security">

                            <div className="vf-security-icon">
                                🔒
                            </div>


                            <div className="vf-security-text">

                                <strong>
                                    Secure authentication
                                </strong>

                                <span>
                                    Your session is protected using
                                    JWT-based authentication.
                                </span>

                            </div>


                            <span className="vf-security-badge">
                                SECURE
                            </span>

                        </div>


                    </div>

                </section>

            </div>


            {/* =====================================================
                FOOTER
            ===================================================== */}

            <footer className="vf-login-footer">

                <span>
                    © VaultFlow
                </span>

                <span>
                    Secure Financial Management
                </span>

                <span>
                    •
                </span>

                <span>
                    Enterprise Access
                </span>

            </footer>


        </main>
    );
};


export default Login;