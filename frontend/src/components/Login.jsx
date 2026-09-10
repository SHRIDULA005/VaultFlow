import React, { useState } from "react";
import axios from "axios";

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = () => {
        axios
            .post("/auth/login", {
                email,
                password
            })
            .then((response) => {

                // Your backend returns the JWT directly as a string
                const token =
                    typeof response.data === "string"
                        ? response.data
                        : response.data.token;

                // Role is supported if backend ever returns an object
                const role =
                    typeof response.data === "object"
                        ? response.data.role
                        : null;

                if (!token) {
                    setError("Invalid email or password");
                    return;
                }

                localStorage.setItem("token", token);

                if (role) {
                    localStorage.setItem("role", role);
                }

                setError("");

                // Tell App that login was successful
                if (onLogin) {
                    onLogin();
                }

                // Move to dashboard
                window.history.pushState({}, "", "/");
                window.dispatchEvent(new Event("popstate"));
            })
            .catch((error) => {
                console.error("Login error:", error);
                setError("Invalid email or password");
            });
    };

    return (
        <div>
            <h2>VaultFlow Login</h2>

            <form>
                <input
                    id="email"
                    type="email"
                    placeholder="Email (auditor@vaultflow.io)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    id="password"
                    type="password"
                    placeholder="Password (Enter your secure account password)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    type="button"
                    onClick={handleLogin}
                >
                    Login
                </button>
            </form>

            {error && <div>{error}</div>}
        </div>
    );
};

export default Login;