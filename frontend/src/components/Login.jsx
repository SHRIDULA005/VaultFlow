import React, { useState } from "react";
import axios from "axios";

const Login = () => {
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
                const token = response.data.token;
                const role = response.data.role;

                if (token) {
                    localStorage.setItem("token", token);
                }

                if (role) {
                    localStorage.setItem("role", role);
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
