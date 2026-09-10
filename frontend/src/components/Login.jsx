// import React, { useState } from "react";
// import axios from "axios";

// const Login = () => {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");

//     const handleLogin = () => {
//         axios
//             .post("/auth/login", {
//                 email,
//                 password
//             })
//             .then((response) => {
//                 const token = response.data.token;
//                 const role = response.data.role;

//                 if (token) {
//                     localStorage.setItem("token", token);
//                 }

//                 if (role) {
//                     localStorage.setItem("role", role);
//                 }

//                 setError("");
//             })
//             .catch(() => {
//                 setError("Invalid email or password");
//             });
//     };

//     return (
//         <div>
//             <h2>VaultFlow Login</h2>

//             <form>
//                 <input
//                     id="email"
//                     type="email"
//                     placeholder="Email (auditor@vaultflow.io)"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                 />

//                 <input
//                     id="password"
//                     type="password"
//                     placeholder="Password (Enter your secure account password)"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                 />

//                 <button
//                     type="button"
//                     onClick={handleLogin}
//                 >
//                     Login
//                 </button>
//             </form>

//             {error && <div>{error}</div>}
//         </div>
//     );
// };

// export default Login;
import React, { useState } from "react";
import axios from "axios";

const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const handleLogin = () => {

        setError("");

        axios
            .post("/auth/login", {
                email,
                password
            })
            .then((response) => {

                const token =
                    response.data.token;

                const role =
                    response.data.role;

                if (token) {
                    localStorage.setItem(
                        "token",
                        token
                    );
                }

                if (role) {
                    localStorage.setItem(
                        "role",
                        role
                    );
                }

                /*
                 * Login was successfully verified
                 * by the backend.
                 *
                 * Move to dashboard.
                 */
                if (token) {

                    window.history.pushState(
                        {},
                        "",
                        "/"
                    );

                    window.dispatchEvent(
                        new PopStateEvent("popstate")
                    );

                }

            })
            .catch(() => {

                setError(
                    "Invalid email or password"
                );

            });
    };


    return (

        <div className="login-container">

            <div className="login-brand">

                <div className="login-logo">
                    V
                </div>

                <h1>
                    VaultFlow
                </h1>

                <p>
                    Secure Financial Management
                </p>

            </div>


            <div className="login-card">

                <div className="login-card-heading">

                    <h2>
                        Welcome back
                    </h2>

                    <p>
                        Sign in to access your financial dashboard.
                    </p>

                </div>


                <div className="login-form">

                    <label htmlFor="email">
                        Email
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


                    {error && (

                        <div
                            className="login-error"
                            role="alert"
                        >
                            {error}
                        </div>

                    )}


                    <button
                        type="button"
                        className="login-button"
                        onClick={handleLogin}
                    >
                        Login
                    </button>

                </div>


                <div className="login-security">

                    <span>
                        ✓
                    </span>

                    Secure authentication powered by VaultFlow

                </div>

            </div>


            <p className="login-footer">
                © 2026 VaultFlow · Financial Management Platform
            </p>

        </div>

    );
};

export default Login;