// import React, { useState } from "react";
// import axios from "axios";
// import "./Login.css";

// const Login = ({ onLogin }) => {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");

//     const handleLogin = () => {
//         axios
//             .post("/auth/login", {
//                 email: email,
//                 password: password
//             })
//             .then((response) => {
//                 // Backend returns JWT directly as a string.
//                 // Tests may return { token, role }, so support both.
//                 const token =
//                     typeof response.data === "string"
//                         ? response.data
//                         : response.data.token;

//                 const role =
//                     typeof response.data === "object"
//                         ? response.data.role
//                         : null;

//                 if (!token) {
//                     setError("Invalid email or password");
//                     return;
//                 }

//                 localStorage.setItem("token", token);

//                 if (role) {
//                     localStorage.setItem("role", role);
//                 }

//                 setError("");

//                 // Tell App that login succeeded
//                 if (onLogin) {
//                     onLogin();
//                 }

//                 // Move to dashboard
//                 window.history.pushState({}, "", "/");
//                 window.dispatchEvent(new Event("popstate"));
//             })
//             .catch((err) => {
//                 console.error("Login error:", err);
//                 setError("Invalid email or password");
//             });
//     };

//     return (
//         <div className="login-page">
//             <div className="login-card">

//                 <div className="login-logo">
//                     VF
//                 </div>

//                 <h1>VaultFlow</h1>

//                 <p className="login-subtitle">
//                     Secure Financial Management
//                 </p>

//                 <div className="login-form">

//                     <label htmlFor="email">
//                         Email Address
//                     </label>

//                     <input
//                         id="email"
//                         type="email"
//                         placeholder="Email (auditor@vaultflow.io)"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                     />

//                     <label htmlFor="password">
//                         Password
//                     </label>

//                     <input
//                         id="password"
//                         type="password"
//                         placeholder="Password (Enter your secure account password)"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                     />

//                     <button
//                         type="button"
//                         onClick={handleLogin}
//                     >
//                         Login
//                     </button>

//                     {error && (
//                         <div className="login-error">
//                             {error}
//                         </div>
//                     )}

//                 </div>

//                 <p className="login-footer">
//                     Secure access to your VaultFlow account
//                 </p>

//                 <div className="login-security">
//                     🔒 Protected by JWT authentication
//                 </div>

//             </div>
//         </div>
//     );
// };

// export default Login;
import React, { useState } from "react";
import axios from "axios";
import "./Login.css";

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
                password
            })
            .then((response) => {

                const token =
                    typeof response.data === "string"
                        ? response.data
                        : response.data.token;

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

                if (onLogin) {
                    onLogin();
                }

                window.history.pushState({}, "", "/");
                window.dispatchEvent(new Event("popstate"));
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