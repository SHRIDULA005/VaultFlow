import React from "react";

const Login = () => {
    return (
        <div>
            <input
                type="email"
                placeholder="Email"
            />

            <input
                type="password"
                placeholder="Password"
            />

            <button type="submit">
                Login
            </button>
        </div>
    );
};

export default Login;