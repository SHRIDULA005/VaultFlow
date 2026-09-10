
import React, { useState } from "react";
import axios from "axios";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();

        axios
            .post("/auth/login", {
                email,
                password
            })
            .then((response) => {
                const data = response.data || {};

                if (data.token) {
                    localStorage.setItem("token", data.token);
                }

                if (data.role) {
                    localStorage.setItem("role", data.role);
                }

                if (data.user) {
                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );
                }

                setError("");
            })
            .catch(() => {
                setError("Invalid email or password");
            });
    };

    return (
        <div>
            <h2>VaultFlow Login</h2>

            <form onSubmit={handleLogin}>
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

                <button type="submit">
                    Login
                </button>
            </form>

            {error && (
                <div role="alert">
                    {error}
                </div>
            )}
        </div>
    );
};

export default Login;

