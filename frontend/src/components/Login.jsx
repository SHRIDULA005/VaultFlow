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
            base64.length + (4 - (base64.length % 4)) % 4,
            "="
        );

        const payload = JSON.parse(atob(padded));

        let role =
            payload.role ||
            payload.roles ||
            payload.authorities ||
            payload.authority;

        if (Array.isArray(role)) {
            role = role[0];
        }

        if (typeof role === "string") {
            role = role.replace(/^ROLE_/, "");
        }

        return role || null;
    } catch (error) {
        console.error("Unable to read role from JWT:", error);
        return null;
    }
};

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = () => {
        setLoading(true);
        setError("");

        axios
            .post("/auth/login", {
                email,
                password,
            })
            .then((response) => {
                const data = response.data;

                const token =
                    typeof data === "string"
                        ? data
                        : data?.token;

                if (!token) {
                    setError("Invalid email or password");
                    return;
                }

                localStorage.setItem("token", token);

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
                    role = getRoleFromToken(token);
                }

                if (typeof role === "string") {
                    role = role
                        .replace(/^ROLE_/, "")
                        .toUpperCase();
                }

                if (role) {
                    localStorage.setItem("role", role);
                } else {
                    localStorage.removeItem("role");
                }

                if (data?.user) {
                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );
                }

                setError("");

                if (onLogin) {
                    onLogin();
                }

                window.history.pushState({}, "", "/");
                window.dispatchEvent(
                    new Event("popstate")
                );
            })
            .catch((err) => {
                console.error("Login error:", err);
                setError("Invalid email or password");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-logo">
                    VF
                </div>

                <h1>VaultFlow</h1>

                <p className="login-subtitle">
                    Secure Financial Management
                </p>

                <div className="login-form">

                    <label htmlFor="email">
                        Email Address
                    </label>

                    <input
                        id="email"
                        type="email"
                        placeholder="Email (auditor@vaultflow.io)"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />

                    <label htmlFor="password">
                        Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        placeholder="Password (Enter your secure account password)"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />

                    <button
                        type="button"
                        className="login-button"
                        onClick={handleLogin}
                        disabled={loading}
                        aria-busy={loading}
                    >
                        {loading ? (
                            <>
                                <span className="login-spinner"></span>
                                Signing in...
                            </>
                        ) : (
                            "Login"
                        )}
                    </button>

                    {error && (
                        <div
                            className="login-error"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                </div>

                <p className="login-footer">
                    Secure access to your VaultFlow account
                </p>

                <div className="login-security">
                    🔒 Protected by JWT authentication
                </div>

            </div>

        </div>
    );
};

export default Login;