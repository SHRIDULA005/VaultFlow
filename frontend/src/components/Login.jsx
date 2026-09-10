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
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label htmlFor="password">
                    Password
                </label>

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

                {error && (
                    <div className="login-error">
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