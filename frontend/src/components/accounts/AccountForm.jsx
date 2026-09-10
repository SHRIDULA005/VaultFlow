import React, { useEffect, useState } from "react";
import accountService from "../../services/accountService";


const AccountForm = () => {
    const [accountName, setAccountName] = useState("");
    const [accountType, setAccountType] = useState("Checking");
    const [interestRate, setInterestRate] = useState("");

    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    /* =====================================================
       LOAD ACCOUNTS
    ===================================================== */

    const loadAccounts = async () => {
        try {
            setLoading(true);

            const data = await accountService.getAccounts();

            if (Array.isArray(data)) {
                setAccounts(data);
            } else {
                setAccounts([]);
            }
        } catch (error) {
            console.error("Unable to load accounts:", error);
            setAccounts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAccounts();
    }, []);

    /* =====================================================
       FORM HANDLERS
    ===================================================== */

    const handleAccountNameChange = (e) => {
        setAccountName(e.target.value);
        setSuccessMessage("");
        setErrorMessage("");
    };

    const handleAccountTypeChange = (e) => {
        setAccountType(e.target.value);
        setSuccessMessage("");
        setErrorMessage("");

        if (e.target.value !== "Savings") {
            setInterestRate("");
        }
    };

    /* =====================================================
       CREATE ACCOUNT
    ===================================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSuccessMessage("");
        setErrorMessage("");

        if (!accountName.trim()) {
            setErrorMessage("Please enter an account name.");
            return;
        }

        const accountData = {
            accountName: accountName.trim(),
            accountType,
        };

        if (accountType === "Savings" && interestRate !== "") {
            accountData.interestRate = Number(interestRate);
        }

        try {
            setSaving(true);

            await accountService.createAccount(accountData);

            setSuccessMessage(
                "Account created successfully."
            );

            setAccountName("");
            setAccountType("Checking");
            setInterestRate("");

            await loadAccounts();
        } catch (error) {
            console.error("Unable to create account:", error);

            setErrorMessage(
                "Unable to create account. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    /* =====================================================
       DISPLAY HELPERS
    ===================================================== */

    const getAccountName = (account) => {
        return (
            account.accountName ||
            account.name ||
            "Unnamed Account"
        );
    };

    const getAccountType = (account) => {
        return (
            account.accountType ||
            account.type ||
            "Account"
        );
    };

    const getBalance = (account) => {
        const balance = Number(account.balance || 0);

        return balance.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
        });
    };

    /* =====================================================
       UI
    ===================================================== */

    return (
        <div className="account-page">

            {/* =================================================
                CREATE ACCOUNT
            ================================================= */}

            <section className="account-create-section">

                <div className="account-section-heading">
                    <div>
                        <span className="section-eyebrow">
                            NEW ACCOUNT
                        </span>

                        <h2>Create Account</h2>

                        <p>
                            Add a new financial account to
                            your VaultFlow workspace.
                        </p>
                    </div>
                </div>


                {successMessage && (
                    <div
                        className="account-alert account-success"
                        role="alert"
                    >
                        <span>✓</span>
                        {successMessage}
                    </div>
                )}


                {errorMessage && (
                    <div
                        className="account-alert account-error"
                        role="alert"
                    >
                        <span>!</span>
                        {errorMessage}
                    </div>
                )}


                <form
                    className="account-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-field">

                        <label htmlFor="accountName">
                            Account Name
                        </label>

                        <input
                            id="accountName"
                            type="text"
                            placeholder="Account Name"
                            value={accountName}
                            onChange={handleAccountNameChange}
                        />

                        <div className="field-preview">

                            <span>
                                Account Name Preview
                            </span>

                            <strong
                                data-testid="account-name-preview"
                            >
                                {accountName || "Your account name"}
                            </strong>

                        </div>

                    </div>


                    <div className="form-field">

                        <label htmlFor="accountType">
                            Account Type
                        </label>

                        <select
                            id="accountType"
                            value={accountType}
                            onChange={handleAccountTypeChange}
                        >
                            <option value="Checking">
                                Checking
                            </option>

                            <option value="Savings">
                                Savings
                            </option>

                            <option value="Current">
                                Current
                            </option>
                        </select>

                    </div>


                    {accountType === "Savings" && (
                        <div className="form-field">

                            <label htmlFor="interestRate">
                                Interest Rate
                            </label>

                            <div className="input-with-suffix">

                                <input
                                    id="interestRate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="Interest Rate"
                                    value={interestRate}
                                    onChange={(e) =>
                                        setInterestRate(
                                            e.target.value
                                        )
                                    }
                                />

                                <span>%</span>

                            </div>

                        </div>
                    )}


                    <div className="account-form-actions">

                        <button
                            type="submit"
                            className="account-create-button"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="button-spinner"></span>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <span>+</span>
                                    Create Account
                                </>
                            )}
                        </button>

                    </div>

                </form>

            </section>


            {/* =================================================
                ACCOUNT LIST
            ================================================= */}

            <section className="accounts-list-section">

                <div className="account-section-heading">

                    <div>
                        <span className="section-eyebrow">
                            YOUR FINANCES
                        </span>

                        <h2>Your Accounts</h2>

                        <p>
                            View the financial accounts connected
                            to your VaultFlow workspace.
                        </p>
                    </div>

                    <div className="account-count">
                        {accounts.length}
                        <span>
                            {accounts.length === 1
                                ? " Account"
                                : " Accounts"}
                        </span>
                    </div>

                </div>


                {loading ? (

                    <div className="accounts-state">

                        <div className="loading-spinner"></div>

                        <p>
                            Loading your accounts...
                        </p>

                    </div>

                ) : accounts.length === 0 ? (

                    <div className="accounts-empty">

                        <div className="empty-account-icon">
                            $
                        </div>

                        <h3>
                            No accounts yet
                        </h3>

                        <p>
                            Create your first account above.
                            It will appear here once it is
                            successfully saved.
                        </p>

                    </div>

                ) : (

                    <div className="accounts-grid">

                        {accounts.map((account, index) => (

                            <article
                                className="account-card"
                                key={
                                    account.id ||
                                    account.accountId ||
                                    index
                                }
                            >

                                <div className="account-card-top">

                                    <div className="account-icon">
                                        $
                                    </div>

                                    <span className="account-status">
                                        Active
                                    </span>

                                </div>


                                <div className="account-card-body">

                                    <h3>
                                        {getAccountName(account)}
                                    </h3>

                                    <span className="account-type">
                                        {getAccountType(account)}
                                    </span>

                                </div>


                                <div className="account-card-balance">

                                    <span>
                                        Current Balance
                                    </span>

                                    <strong>
                                        {getBalance(account)}
                                    </strong>

                                </div>


                                {getAccountType(account)
                                    .toLowerCase() ===
                                    "savings" &&
                                    account.interestRate != null && (
                                        <div className="account-interest">

                                            <span>
                                                Interest Rate
                                            </span>

                                            <strong>
                                                {account.interestRate}%
                                            </strong>

                                        </div>
                                    )}

                            </article>

                        ))}

                    </div>

                )}

            </section>

        </div>
    );
};

export default AccountForm;